import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * GET /api/explorer/blocks/[height]
 * 
 * Returns detailed information about a specific block including comprehensive 
 * transaction and event counters.
 * 
 * Path Parameters:
 * - height (uint64) - Block height to retrieve
 * 
 * Query Parameters:
 * - chain_id (uint64, optional) - Chain ID (default: 1 for root chain)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ height: string }> | { height: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 13+ vs 14+)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { height } = resolvedParams;

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    // Construct backend URL
    const backendUrl = `${API_BASE_URL}/api/v1/explorer/blocks/${height}${
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
    console.error(`[API /api/explorer/blocks/${resolvedParams.height}] Error:`, error);
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

