import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * GET /api/explorer/transactions
 * 
 * Returns a paginated list of recent transactions. Supports filtering by chain,
 * message type, signer, and counterparty.
 * 
 * Query Parameters:
 * - chain_id (uint64, optional) - Filter by specific chain ID (default: 1 for root chain)
 * - message_type (string, optional) - Filter by transaction message type (e.g., "send", "dexLimitOrder", "stake")
 * - signer (string, optional) - Filter by transaction signer address (40-char hex)
 * - counterparty (string, optional) - Filter by counterparty address (40-char hex)
 * - limit (integer, optional) - Number of transactions per page (default: 20, max: 100)
 * - cursor (uint64, optional) - Pagination cursor (block height) for next page
 * - sort (string, optional) - Sort order: "asc" or "desc" (default: "desc")
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    // Construct backend URL
    const backendUrl = `${API_BASE_URL}/api/v1/explorer/transactions${
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
    console.error("[API /api/explorer/transactions] Error:", error);
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

