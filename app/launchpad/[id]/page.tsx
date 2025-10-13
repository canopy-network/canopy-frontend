import { ChainDetails } from "@/components/chain/chain-details";
import { convertToChainWithUI } from "@/lib/utils/chain-converter";
import { notFound } from "next/navigation";
import axios from "axios";

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

    const response = await axios.get<ApiResponse>(requestUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 second timeout
    });

    let chainData;
    let virtualPool = null;

    console.log("Response Status:", response.status);
    if (!response.data.data) {
      console.error("API returned no chain data:", {
        responseData: response.data,
        chainId: chainId,
      });
      notFound();
    }

    chainData = response.data.data;

    //TODO: We need to get rid of the ChainWithUI converter and just use the Chain type for all components

    // Convert to ChainWithUI format
    const chainWithUI = convertToChainWithUI(chainData, virtualPool);

    return <ChainDetails chain={chainWithUI} virtualPool={virtualPool} />;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Axios-specific error
      console.error("Error fetching chain data:", {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        chainId: params?.id || "unknown",
        rawParamsId: params?.id,
        apiUrl: (process.env.NEXT_PUBLIC_API_URL || "").trim(),
        requestUrl: error.config?.url,
      });
    } else {
      // Generic error
      console.error("Error fetching chain data:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        chainId: params?.id || "unknown",
        rawParamsId: params?.id,
        apiUrl: (process.env.NEXT_PUBLIC_API_URL || "").trim(),
      });
    }
    notFound();
  }
}
