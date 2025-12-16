import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * GET /api/explorer/transactions/[hash]
 * 
 * Returns detailed information for a specific transaction including all message
 * fields and metadata.
 * 
 * Path Parameters:
 * - hash (string) - Transaction hash (64-character hex string)
 * 
 * Query Parameters:
 * - chain_id (uint64, optional) - Chain ID (default: 1 for root chain)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> | { hash: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { hash } = resolvedParams;

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    // Construct backend URL
    const backendUrl = `${API_BASE_URL}/api/v1/explorer/transactions/${hash}${
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
    console.error(
      `[API /api/explorer/transactions/${resolvedParams.hash}] Error:`,
      error
    );
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

