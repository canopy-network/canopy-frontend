import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * GET /api/validators/[address]
 * 
 * Returns detailed information for a specific validator, including performance
 * metrics, slashing history, and cross-chain status.
 * 
 * Path Parameters:
 * - address (string) - Validator's address (40-character hex string)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> | { address: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { address } = resolvedParams;

    // Construct backend URL
    const backendUrl = `${API_BASE_URL}/api/v1/validators/${address}`;

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
            code: response.status === 404 ? "NOT_FOUND" : "BACKEND_ERROR",
            message: errorText || `Backend returned ${response.status}`,
          },
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const resolvedParams = params instanceof Promise ? await params : params;
    console.error(`[API /api/validators/${resolvedParams.address}] Error:`, error);
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

