import { NextRequest, NextResponse } from "next/server";
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

/**
 * @fileoverview Chain Favorite (Like/Dislike) API
 *
 * This endpoint handles user preferences (like/dislike) for chains.
 * Users must be authenticated and can only manage their own preferences.
 *
 * Security:
 * - Validates user authentication via cookies
 * - Prevents users from acting on behalf of others
 * - All operations require matching authenticated user_id
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
  // ARN format: arn:aws:dynamodb:region:account-id:table/table-name
  const parts = arn.split("/");
  return parts[parts.length - 1];
}

const TABLE_ARN = process.env.FAVORITED_CHAINS_TABLE_ARN || "";
const TABLE_NAME = TABLE_ARN ? getTableNameFromArn(TABLE_ARN) : "";

type PreferenceType = "like" | "dislike";

interface FavoriteItem {
  user_id: string;
  chain_id: string;
  preference: PreferenceType;
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
 * GET handler - Retrieve user's preference for a chain
 *
 * Query parameters:
 * - chain_id: string (required)
 *
 * Returns:
 * {
 *   success: boolean,
 *   preference: "like" | "dislike" | null,
 *   created_at?: string,
 *   updated_at?: string
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

    // Get chain_id from query parameters
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get("chain_id");

    if (!chainId) {
      return NextResponse.json(
        {
          success: false,
          error: "chain_id is required",
        },
        { status: 400 }
      );
    }

    // Ensure chain_id is a string (DynamoDB requires string type)
    const chainIdString = String(chainId);

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

    // Query DynamoDB
    const command = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        user_id: authenticatedUserId,
        chain_id: chainIdString,
      }),
    });

    const result = await dynamoClient.send(command);

    if (!result.Item) {
      return NextResponse.json(
        {
          success: true,
          preference: null,
        },
        { status: 200 }
      );
    }

    const item = unmarshall(result.Item) as FavoriteItem;

    return NextResponse.json(
      {
        success: true,
        preference: item.preference,
        created_at: item.created_at,
        updated_at: item.updated_at,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error retrieving chain preference:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve preference",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Set or update user's preference for a chain
 *
 * Request body:
 * {
 *   user_id: string (required),
 *   chain_id: string (required),
 *   preference: "like" | "dislike" (required)
 * }
 *
 * Security: The user_id in the request must match the authenticated user
 *
 * Returns:
 * {
 *   success: boolean,
 *   message: string,
 *   preference: "like" | "dislike"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authenticatedUserId = getAuthenticatedUserId(request);

    if (!authenticatedUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please log in to favorite chains.",
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { user_id, chain_id, preference } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        {
          success: false,
          error: "user_id is required",
        },
        { status: 400 }
      );
    }

    if (!chain_id) {
      return NextResponse.json(
        {
          success: false,
          error: "chain_id is required",
        },
        { status: 400 }
      );
    }

    // Ensure chain_id is a string (DynamoDB requires string type)
    const chainIdString = String(chain_id);

    if (!preference || !["like", "dislike"].includes(preference)) {
      return NextResponse.json(
        {
          success: false,
          error: 'preference must be either "like" or "dislike"',
        },
        { status: 400 }
      );
    }

    // SECURITY: Verify the user_id matches the authenticated user
    if (user_id !== authenticatedUserId) {
      console.warn(
        `Security violation: User ${authenticatedUserId} attempted to favorite chain on behalf of user ${user_id}`
      );
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: You can only manage your own chain preferences",
        },
        { status: 403 }
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

    // Create or update item in DynamoDB
    const now = new Date().toISOString();
    const item: FavoriteItem = {
      user_id: authenticatedUserId,
      chain_id: chainIdString,
      preference,
      created_at: now,
      updated_at: now,
    };

    const command = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item),
    });

    await dynamoClient.send(command);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully ${preference}d chain`,
        preference,
        chain_id: chainIdString,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error setting chain preference:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to set preference",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - Remove user's preference for a chain
 *
 * Request body:
 * {
 *   user_id: string (required),
 *   chain_id: string (required)
 * }
 *
 * Security: The user_id in the request must match the authenticated user
 *
 * Returns:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
export async function DELETE(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { user_id, chain_id } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        {
          success: false,
          error: "user_id is required",
        },
        { status: 400 }
      );
    }

    if (!chain_id) {
      return NextResponse.json(
        {
          success: false,
          error: "chain_id is required",
        },
        { status: 400 }
      );
    }

    // Ensure chain_id is a string (DynamoDB requires string type)
    const chainIdString = String(chain_id);

    // SECURITY: Verify the user_id matches the authenticated user
    if (user_id !== authenticatedUserId) {
      console.warn(
        `Security violation: User ${authenticatedUserId} attempted to delete preference on behalf of user ${user_id}`
      );
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: You can only manage your own preferences",
        },
        { status: 403 }
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

    // Delete item from DynamoDB
    const command = new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        user_id: authenticatedUserId,
        chain_id: chainIdString,
      }),
    });

    await dynamoClient.send(command);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully removed chain preference",
        chain_id: chainIdString,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting chain preference:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete preference",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
