import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

/**
 * @fileoverview Validate Chain Data API
 *
 * This endpoint validates if a chain_name, token_name, or ticker exists in DynamoDB.
 * Used to check for uniqueness before creating a new chain.
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
 * GET handler - Validate if chain_name, token_name, or ticker exists
 *
 * Query parameters:
 * - field: string (required) - The field to validate: "chain_name", "token_name", or "ticker"
 * - value: string (required) - The value to validate
 *
 * Returns:
 * {
 *   success: boolean,
 *   available: boolean,  // true if the value is available (doesn't exist), false if it exists
 *   field: string,       // The field that was validated
 *   value: string,       // The value that was validated
 *   message?: string     // Optional message
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field");
    const value = searchParams.get("value");

    // Validate that both field and value are provided
    if (!field || !value) {
      return NextResponse.json(
        {
          success: false,
          error: "Both 'field' and 'value' parameters are required",
        },
        { status: 400 }
      );
    }

    // Validate that field is one of the allowed values
    const allowedFields = ["chain_name", "token_name", "ticker"];
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        {
          success: false,
          error: `Field must be one of: ${allowedFields.join(", ")}`,
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

    // Scan the table (Note: For large tables, consider using GSI with Query instead)
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const result = await dynamoClient.send(command);
    const items = (result.Items || []).map((item) =>
      unmarshall(item)
    ) as ChainItem[];

    // Check for matches - only check the specific field requested
    let exists = false;

    for (const item of items) {
      if (field === "chain_name" && item.chain_name === value) {
        exists = true;
        break;
      }

      if (
        field === "token_name" &&
        item.token_name &&
        item.token_name === value
      ) {
        exists = true;
        break;
      }

      if (field === "ticker" && item.ticker === value) {
        exists = true;
        break;
      }
    }

    // available is the inverse of exists - if it exists, it's not available
    const available = !exists;

    return NextResponse.json(
      {
        success: true,
        available,
        field,
        value,
        message: available
          ? `${field.replace("_", " ")} is available`
          : `${field.replace("_", " ")} already exists`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error validating chain data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        error: "Failed to validate chain data",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
