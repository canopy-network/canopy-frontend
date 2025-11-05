import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

/**
 * @fileoverview List Liked Chains API
 *
 * This endpoint returns all chains that a user has liked.
 * Users can only query their own liked chains for security.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2025-11-05
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

const TABLE_ARN = process.env.FAVORITED_CHAINS_TABLE_ARN || "";
const TABLE_NAME = TABLE_ARN ? getTableNameFromArn(TABLE_ARN) : "";

interface FavoriteItem {
  user_id: string;
  chain_id: string;
  preference: "like" | "dislike";
  created_at: string;
  updated_at: string;
}

/**
 * Validates user authentication from cookies
 * Returns the authenticated user_id or null if not authenticated
 */
function getAuthenticatedUserId(request: NextRequest): string | null {
  const authCookie = request.cookies.get("canopy_auth");
  const userIdCookie = request.cookies.get("canopy_user_id");

  if (authCookie?.value === "true" && userIdCookie?.value) {
    return userIdCookie.value;
  }

  return null;
}

/**
 * GET handler - List all liked chains for a user
 *
 * Query parameters:
 * - user_id: string (required) - Must match authenticated user
 * - preference: "like" | "dislike" | "all" (optional, defaults to "like")
 *
 * Returns:
 * {
 *   success: boolean,
 *   chains: Array<{
 *     chain_id: string,
 *     preference: "like" | "dislike",
 *     created_at: string,
 *     updated_at: string
 *   }>,
 *   count: number
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authenticatedUserId = getAuthenticatedUserId(request);

    if (!authenticatedUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Get parameters from query
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("user_id");
    const preferenceFilter = searchParams.get("preference") || "like";

    // Validate user_id parameter
    if (!requestedUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "user_id is required",
        },
        { status: 400 }
      );
    }

    // SECURITY: Verify the requested user_id matches the authenticated user
    if (requestedUserId !== authenticatedUserId) {
      console.warn(
        `Security violation: User ${authenticatedUserId} attempted to query liked chains for user ${requestedUserId}`
      );
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: You can only view your own liked chains",
        },
        { status: 403 }
      );
    }

    // Validate preference filter
    if (!["like", "dislike", "all"].includes(preferenceFilter)) {
      return NextResponse.json(
        {
          success: false,
          error: 'preference must be "like", "dislike", or "all"',
        },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (!TABLE_NAME) {
      console.error("Missing FAVORITED_CHAINS_TABLE_ARN environment variable");
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error",
        },
        { status: 500 }
      );
    }

    // Build the query to get all chains for this user
    const queryCommand = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "user_id = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: authenticatedUserId },
      },
    });

    const result = await dynamoClient.send(queryCommand);

    if (!result.Items || result.Items.length === 0) {
      return NextResponse.json(
        {
          success: true,
          chains: [],
          count: 0,
        },
        { status: 200 }
      );
    }

    // Unmarshal and filter items
    let items = result.Items.map((item) => unmarshall(item) as FavoriteItem);

    // Apply preference filter if not "all"
    if (preferenceFilter !== "all") {
      items = items.filter((item) => item.preference === preferenceFilter);
    }

    // Transform to response format
    const chains = items.map((item) => ({
      chain_id: item.chain_id,
      preference: item.preference,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    // Sort by updated_at (most recent first)
    chains.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return NextResponse.json(
      {
        success: true,
        chains,
        count: chains.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error listing liked chains:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve liked chains",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
