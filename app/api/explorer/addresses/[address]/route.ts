import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "";

/**
 * GET /api/explorer/addresses/[address]
 * 
 * Returns comprehensive address information including balances across all chains,
 * recent transactions, and chain-specific details.
 * 
 * Path Parameters:
 * - address (string) - Address to lookup (40-character hex string)
 * 
 * Query Parameters:
 * - include_transactions (boolean, optional) - Whether to include recent transactions
 * - transaction_limit (integer, optional) - Max transactions per chain (default: 10)
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
        const queryString = searchParams.toString();

        // Construct backend URL
        const backendUrl = `${API_BASE_URL}/api/v1/explorer/addresses/${address}${queryString ? `?${queryString}` : ""
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
            `[API /api/explorer/addresses/${resolvedParams.address}] Error:`,
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

