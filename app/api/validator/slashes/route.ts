import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * GET /api/validator/slashes
 * 
 * Returns slash history for validators grouped by source chain.
 * 
 * Query Parameters:
 * - addresses (string, optional) - Validator/wallet addresses (comma-separated or repeated)
 * - address (string, optional) - Single address filter (convenience)
 * - chain_ids (string, optional) - Filters by source chain DB (aliases: chain_id, chainId, source_chain_id, source_chain_ids)
 * - start_date (string, optional) - ISO 8601 lower bound
 * - end_date (string, optional) - ISO 8601 upper bound
 * - page (integer, optional) - Page number (default: 1)
 * - limit (integer, optional) - Results per page (default: 50)
 * - sort (string, optional) - asc or desc (default: desc)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Build query parameters
    const queryParams: string[] = [];
    
    // Handle addresses (can be comma-separated or repeated)
    const addresses = searchParams.getAll("addresses");
    const address = searchParams.get("address");
    
    if (address) {
      queryParams.push(`address=${encodeURIComponent(address)}`);
    } else if (addresses.length > 0) {
      // If multiple addresses, join them with comma
      queryParams.push(`addresses=${encodeURIComponent(addresses.join(","))}`);
    }
    
    // Handle chain_ids (supports multiple aliases)
    const chainIds = searchParams.get("chain_ids") || 
                     searchParams.get("chain_id") || 
                     searchParams.get("chainId") || 
                     searchParams.get("source_chain_id") || 
                     searchParams.get("source_chain_ids");
    
    if (chainIds) {
      queryParams.push(`chain_ids=${encodeURIComponent(chainIds)}`);
    }
    
    // Handle date range
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    
    if (startDate) {
      queryParams.push(`start_date=${encodeURIComponent(startDate)}`);
    }
    if (endDate) {
      queryParams.push(`end_date=${encodeURIComponent(endDate)}`);
    }
    
    // Handle pagination
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const sort = searchParams.get("sort");
    
    if (page) {
      queryParams.push(`page=${page}`);
    }
    if (limit) {
      queryParams.push(`limit=${limit}`);
    }
    if (sort) {
      queryParams.push(`sort=${sort}`);
    }
    
    // Construct backend URL
    const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
    const backendUrl = `${API_BASE_URL}/api/v1/validator/slashes${queryString}`;

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
    console.error("[API /api/validator/slashes] Error:", error);
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

