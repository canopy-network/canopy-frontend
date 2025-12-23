import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * GET /api/explorer/historical
 * 
 * Returns historical data for TVL, volume, validators, and transactions
 * for a specific chain within a time range and interval.
 * 
 * Query parameters:
 * - chain_id: number (required) - Chain ID to get historical data for
 * - range: string (required) - Time range (e.g., "1d", "7d", "30d")
 * - interval: string (required) - Data interval (e.g., "5m", "1h", "1d")
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get("chain_id");
    const range = searchParams.get("range");
    const interval = searchParams.get("interval");

    // Validate required parameters (chain_id can be 0 for "all chains")
    if (!range || !interval) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_PARAMETERS",
            message: "range and interval are required",
          },
        },
        { status: 400 }
      );
    }

    // Construct backend URL
    // If chain_id is not provided, don't include it (backend will return data for all chains)
    let backendUrl = `${API_BASE_URL}/api/v1/explorer/historical?range=${range}&interval=${interval}`;
    if (chainId && chainId !== "0") {
      backendUrl += `&chain_id=${chainId}`;
    }
    // If chainId is null/undefined or "0", don't include chain_id parameter

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
    console.error("[API /api/explorer/historical] Error:", error);
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

