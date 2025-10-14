import { ChainDetails } from "@/components/chain/chain-details";
import { convertToChainWithUI } from "@/lib/utils/chain-converter";
import { notFound } from "next/navigation";

// Force dynamic rendering to ensure params are always fresh
export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface ChainPageProps {
  params: {
    id: string;
  };
}

interface ApiResponse {
  data: any; // The chain data is directly in the data property
}

export default async function ChainPage({ params }: ChainPageProps) {
  try {
    // Decode the chain ID in case it's URL encoded
    const chainId = decodeURIComponent(params.id);

    console.log("Chain ID from params (raw):", params.id);
    console.log("Chain ID from params (decoded):", chainId);

    // Fetch chain data from our API route
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").trim();

    const requestUrl = `${apiUrl}/api/v1/chains/${chainId}`;
    console.log("Requesting URL:", requestUrl);
    console.log("Chain ID being sent:", chainId);
    console.log("Server-side fetch starting at:", new Date().toISOString());

    // Use Next.js native fetch with proper timeout and error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let chainData;
    let virtualPool = null;

    try {
      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        // Next.js fetch options
        cache: "no-store", // Don't cache during development/testing
      });

      clearTimeout(timeoutId);

      console.log("Response received at:", new Date().toISOString());
      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API request failed:", {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          body: errorText,
        });
        notFound();
      }

      const data: ApiResponse = await response.json();

      if (!data.data) {
        console.error("API returned no chain data:", {
          responseData: data,
          chainId: chainId,
        });
        notFound();
      }

      chainData = data.data;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("Request timed out after 30 seconds:", {
          requestUrl,
          chainId,
        });
      } else {
        console.error("Fetch error:", {
          error: fetchError,
          message:
            fetchError instanceof Error ? fetchError.message : "Unknown error",
          requestUrl,
          chainId,
        });
      }
      throw fetchError;
    }

    //TODO: We need to get rid of the ChainWithUI converter and just use the Chain type for all components

    // Convert to ChainWithUI format
    const chainWithUI = convertToChainWithUI(chainData, virtualPool);

    return <ChainDetails chain={chainWithUI} virtualPool={virtualPool} />;
  } catch (error) {
    console.error("Outer catch - Error in page component:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      chainId: params?.id || "unknown",
      rawParamsId: params?.id,
      apiUrl: (process.env.NEXT_PUBLIC_API_URL || "").trim(),
    });
    notFound();
  }
}
