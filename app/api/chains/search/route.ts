import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

/**
 * @fileoverview Search Chains API
 *
 * This endpoint searches for chains in DynamoDB by id, chain_name, token_name, or ticker.
 * If query starts with "$", it searches by ticker only.
 * Returns up to 10 matching results.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 */

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
});

// Extract table name from ARN
function getTableNameFromArn(arn: string): string {
  const parts = arn.split("/");
  return parts[parts.length - 1];
}

const TABLE_ARN =
  process.env.CHAINS_LIST_TABLE_ARN ||
  "arn:aws:dynamodb:us-east-1:027924002187:table/canopy-network-chains-list";
const TABLE_NAME = getTableNameFromArn(TABLE_ARN);

interface ChainItem {
  id: number;
  ticker: string;
  chain_name: string;
  token_name: string;
  updated_at: string;
}

/**
 * GET handler - Search chains by id, chain_name, token_name, or ticker
 *
 * Query parameters:
 * - q: string (required) - Search query
 *   - If starts with "$", searches by ticker only
 *   - If numeric, searches by id
 *   - Otherwise, searches by chain_name, token_name, or ticker
 *
 * Returns:
 * {
 *   success: boolean,
 *   chains: ChainItem[],
 *   count: number
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Get search query from query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    // Validate that query is provided
    if (!query || query.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Query parameter 'q' is required",
        },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (!TABLE_NAME) {
      console.error("Missing CHAINS_LIST_TABLE_ARN environment variable");
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error",
        },
        { status: 500 }
      );
    }

    let searchQuery = query.trim();
    const isTickerSearch = searchQuery.startsWith("$");

    // If it's a ticker search, remove the "$" prefix
    if (isTickerSearch) {
      searchQuery = searchQuery.slice(1).trim();
      if (searchQuery === "") {
        return NextResponse.json(
          {
            success: false,
            error: "Query parameter 'q' cannot be just '$'",
          },
          { status: 400 }
        );
      }
    }

    const isNumeric = /^\d+$/.test(searchQuery);
    const numericId = isNumeric ? parseInt(searchQuery, 10) : null;
    const queryLower = searchQuery.toLowerCase();

    // Build filter expression
    // For numeric IDs, we can filter by ID in DynamoDB (efficient)
    // For text searches, we'll scan more items and filter in memory with case-insensitive matching
    let filterExpression: string | undefined;
    let expressionAttributeValues: Record<
      string,
      { N: string } | { S: string }
    > = {};

    if (numericId !== null) {
      // Search by id (exact match) - this is efficient in DynamoDB
      filterExpression = "id = :id";
      expressionAttributeValues = {
        ":id": { N: numericId.toString() },
      };
    }
    // For text searches, we'll scan without filter and do case-insensitive filtering in memory

    // Scan the table with filter (if numeric ID) or without (for text search)
    // Scan more items for text search to ensure we get good results after case-insensitive filtering
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      ...(filterExpression && {
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
      }),
      Limit: numericId !== null ? 10 : 200, // Scan more items for text search
    });

    const result = await dynamoClient.send(command);
    let items = (result.Items || []).map((item) =>
      unmarshall(item)
    ) as ChainItem[];

    // Apply case-insensitive filtering in memory
    if (isTickerSearch) {
      // Search only by ticker (case-insensitive)
      items = items.filter((item) =>
        item.ticker?.toLowerCase().includes(queryLower)
      );
    } else if (numericId !== null) {
      // For numeric searches, check id, chain_name, token_name, or ticker
      items = items.filter(
        (item) =>
          item.id === numericId ||
          item.chain_name.toLowerCase().includes(queryLower) ||
          item.token_name?.toLowerCase().includes(queryLower) ||
          item.ticker?.toLowerCase().includes(queryLower)
      );
    } else {
      // For text searches, filter by chain_name, token_name, or ticker (case-insensitive)
      items = items.filter(
        (item) =>
          item.chain_name.toLowerCase().includes(queryLower) ||
          item.token_name?.toLowerCase().includes(queryLower) ||
          item.ticker?.toLowerCase().includes(queryLower)
      );
    }

    // Limit to 10 results after filtering
    items = items.slice(0, 10);

    // Sort results: exact id matches first, then by relevance (chain_name, token_name, or ticker)
    items.sort((a, b) => {
      // Exact id match gets highest priority
      if (numericId !== null) {
        if (a.id === numericId && b.id !== numericId) return -1;
        if (a.id !== numericId && b.id === numericId) return 1;
      }

      // For ticker searches, prioritize ticker matches
      if (isTickerSearch) {
        const aTickerLower = a.ticker?.toLowerCase() || "";
        const bTickerLower = b.ticker?.toLowerCase() || "";

        const aStartsWith = aTickerLower.startsWith(queryLower);
        const bStartsWith = bTickerLower.startsWith(queryLower);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        return aTickerLower.localeCompare(bTickerLower);
      }

      // For other searches, prioritize chain_name, then token_name, then ticker
      const aNameLower = a.chain_name.toLowerCase();
      const bNameLower = b.chain_name.toLowerCase();
      const aTokenLower = a.token_name?.toLowerCase() || "";
      const bTokenLower = b.token_name?.toLowerCase() || "";
      const aTickerLower = a.ticker?.toLowerCase() || "";
      const bTickerLower = b.ticker?.toLowerCase() || "";

      // Check if any field starts with query
      const aStartsWith =
        aNameLower.startsWith(queryLower) ||
        aTokenLower.startsWith(queryLower) ||
        aTickerLower.startsWith(queryLower);
      const bStartsWith =
        bNameLower.startsWith(queryLower) ||
        bTokenLower.startsWith(queryLower) ||
        bTickerLower.startsWith(queryLower);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Prioritize chain_name matches, then token_name, then ticker
      const aChainStarts = aNameLower.startsWith(queryLower);
      const bChainStarts = bNameLower.startsWith(queryLower);
      if (aChainStarts && !bChainStarts) return -1;
      if (!aChainStarts && bChainStarts) return 1;

      // Finally, sort alphabetically by chain_name
      return a.chain_name.localeCompare(b.chain_name);
    });

    return NextResponse.json(
      {
        success: true,
        chains: items,
        count: items.length,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error searching chains:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search chains",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
