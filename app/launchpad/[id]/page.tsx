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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chains/${params.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Add cache control for better performance
        next: { revalidate: 60 }, // Revalidate every 60 seconds
      }
    );

    let chainData;
    let virtualPool = null;

    if (!response.ok) {
      console.error(`Failed to fetch chain data: ${response.status}`);
      notFound();
    }

    const data: ApiResponse = await response.json();

    if (!data.data) {
      console.error("API returned no chain data");
      notFound();
    }

    chainData = data.data;

    //TODO: We need to get rid of the ChainWithUI converter and just use the Chain type for all components

    // Convert to ChainWithUI format
    const chainWithUI = convertToChainWithUI(chainData, virtualPool);

    return <ChainDetails chain={chainWithUI} virtualPool={virtualPool} />;
  } catch (error) {
    console.error("Error fetching chain data:", error);
    notFound();
  }
}
