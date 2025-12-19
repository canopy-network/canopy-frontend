import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * GET /api/explorer/overview
 * 
 * Returns network-wide statistics overview including TVL, volume, active chains,
 * validators, holders, and transaction metrics with 24-hour change indicators.
 * 
 * Query parameters:
 * - chain_id: number (optional) - Chain ID to filter overview data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get("chain_id");
    
    // Construct backend URL with chain_id if provided
    let backendUrl = `${API_BASE_URL}/api/v1/explorer/overview`;
    if (chainId) {
      backendUrl += `?chain_id=${chainId}`;
    }

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
    console.error("[API /api/explorer/overview] Error:", error);
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

