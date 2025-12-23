import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * GET /api/validators
 * 
 * Returns a list of validators with filtering, sorting, and pagination support.
 * Aggregates validators across all chains.
 * 
 * Query Parameters:
 * - chain_ids (string, optional) - Comma-separated chain IDs to filter (e.g., "1,2,3")
 * - status (string, optional) - Filter by status: "active", "paused", or "unstaking"
 * - min_stake (uint64, optional) - Minimum staked amount in uCNPY
 * - delegate (boolean, optional) - Filter by delegation acceptance (true/false)
 * - limit (integer, optional) - Results per page (range: 1-1000, default: 50)
 * - offset (uint64, optional) - Pagination offset (default: 0)
 * - order_by (string, optional) - Sort field (e.g., "staked_amount", "uptime_percentage", default: "staked_amount")
 * - desc (boolean, optional) - Sort descending (true) or ascending (false), default: true
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    // Construct backend URL
    const backendUrl = `${API_BASE_URL}/api/v1/validators${
      queryString ? `?${queryString}` : ""
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
    console.error("[API /api/validators] Error:", error);
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

