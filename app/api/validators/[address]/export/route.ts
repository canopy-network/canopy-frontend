import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * GET /api/validators/[address]/export
 * 
 * Exports validator data in JSON or CSV format for external analysis or reporting.
 * 
 * Path Parameters:
 * - address (string) - Validator's address (40-character hex string)
 * 
 * Query Parameters:
 * - format (string, optional) - Export format: "json" or "csv" (default: "json")
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> | { address: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { address } = resolvedParams;

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "json";
    const queryString = searchParams.toString();

    // Construct backend URL
    const backendUrl = `${API_BASE_URL}/api/v1/validators/${address}/export${
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

    // Handle CSV format - preserve Content-Type and headers from backend
    if (format === "csv") {
      const csvData = await response.text();
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=validator_export.csv",
        },
      });
    }

    // Handle JSON format
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const resolvedParams = params instanceof Promise ? await params : params;
    console.error(
      `[API /api/validators/${resolvedParams.address}/export] Error:`,
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

