import { ChainDetails } from "@/components/chain/chain-details";
import { convertToChainWithUI } from "@/lib/utils/chain-converter";
import { notFound } from "next/navigation";

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
    // Fetch chain data from our API route
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").trim();

    const requestUrl = `${apiUrl}/api/v1/chains/${params.id}`;
    console.log("Requesting URL:", requestUrl);
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add cache control for better performance
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    let chainData;
    let virtualPool = null;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch chain data:`, {
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
        chainId: params.id,
      });
      notFound();
    }

    chainData = data.data;

    //TODO: We need to get rid of the ChainWithUI converter and just use the Chain type for all components

    // Convert to ChainWithUI format
    const chainWithUI = convertToChainWithUI(chainData, virtualPool);

    return <ChainDetails chain={chainWithUI} virtualPool={virtualPool} />;
  } catch (error) {
    console.error("Error fetching chain data:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      chainId: params.id,
      apiUrl: (process.env.NEXT_PUBLIC_API_URL || "").trim(),
    });
    notFound();
  }
}
