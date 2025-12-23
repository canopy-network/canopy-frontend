import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * GET /api/validator/rewards
 * 
 * Returns rewards history for validators grouped by chain.
 * 
 * Query Parameters:
 * - chain_id (number, optional) - Chain ID to filter rewards
 * - addresses (string, required) - JSON array of validator addresses (e.g., ["addr1","addr2"])
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get("chain_id");
    const addressesParam = searchParams.get("addresses");

    if (!addressesParam) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_PARAMETERS",
            message: "addresses parameter is required",
          },
        },
        { status: 400 }
      );
    }

    // Parse addresses array from JSON string
    let addresses: string[];
    try {
      addresses = JSON.parse(addressesParam);
      if (!Array.isArray(addresses)) {
        throw new Error("addresses must be an array");
      }
    } catch (error) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_PARAMETERS",
            message: "addresses must be a valid JSON array",
          },
        },
        { status: 400 }
      );
    }

    // Construct backend URL
    let backendUrl = `${API_BASE_URL}/api/v1/validator/rewards?addresses=${encodeURIComponent(addressesParam)}`;
    if (chainId) {
      backendUrl += `&chain_id=${chainId}`;
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
    console.error("[API /api/validator/rewards] Error:", error);
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

