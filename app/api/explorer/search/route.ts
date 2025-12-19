import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * GET /api/explorer/search
 * 
 * Search explorer entities by hash/address/height. Returns matching blocks,
 * transactions, or addresses based on the query.
 * 
 * Query Parameters:
 * - q (string, required) - Search query (transaction hash, block hash, address, or block height)
 * - chain_id (uint64, optional) - Chain ID to filter search results
 * - limit (integer, optional) - Number of results per page (default: 20, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    // Construct backend URL
    const backendUrl = `${API_BASE_URL}/api/v1/explorer/search${queryString ? `?${queryString}` : ""
      }`;

    // Forward request to backend
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: {
            code: "BACKEND_ERROR",
            message: errorText || `Backend returned ${response.status}`,
          },
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API /api/explorer/search] Error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

