import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

/**
 * @fileoverview Store Chain Data API
 *
 * This endpoint stores chain data (ticker, chain_name, token_name) in DynamoDB
 * when a chain is successfully launched on the launchpad.
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
const TABLE_NAME = TABLE_ARN ? getTableNameFromArn(TABLE_ARN) : "";

interface ChainItem {
  ticker: string;
  chain_name: string;
  token_name: string;
  updated_at: string;
}

/**
 * POST handler - Store chain data in DynamoDB
 *
 * Request body:
 * {
 *   ticker: string (required),
 *   chain_name: string (required),
 *   token_name: string (optional, will use chain_name if empty/null)
 * }
 *
 * Returns:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { ticker, chain_name, token_name } = body;

    // Validate required fields
    if (!ticker) {
      return NextResponse.json(
        {
          success: false,
          error: "ticker is required",
        },
        { status: 400 }
      );
    }

    if (!chain_name) {
      return NextResponse.json(
        {
          success: false,
          error: "chain_name is required",
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

    // Use chain_name as fallback if token_name is empty or null
    const tokenName = token_name?.trim() || chain_name;

    // Create item for DynamoDB
    const item: ChainItem = {
      ticker: String(ticker),
      chain_name: String(chain_name),
      token_name: String(tokenName),
      updated_at: new Date().toISOString(),
    };

    // Store in DynamoDB
    const command = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item),
    });

    await dynamoClient.send(command);

    return NextResponse.json(
      {
        success: true,
        message: "Chain data stored successfully",
        data: {
          ticker: item.ticker,
          chain_name: item.chain_name,
          token_name: item.token_name,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error storing chain data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        error: "Failed to store chain data",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
