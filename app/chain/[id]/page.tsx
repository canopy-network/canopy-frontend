import { ChainDetails } from "@/components/chain/chain-details";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { chainsApi } from "@/lib/api";
import { Chain } from "@/types/chains";

// Force dynamic rendering to ensure params are always fresh
export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface ChainPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChainPage(props: ChainPageProps) {
  try {
    // Await params as per Next.js 15 requirements
    const params = await props.params;

    // Decode the chain ID in case it's URL encoded
    const chainId = decodeURIComponent(params.id);

    console.log("Chain ID from params (raw):", params.id);
    console.log("Chain ID from params (decoded):", chainId);
    console.log("Server-side fetch starting at:", new Date().toISOString());

    // Fetch chain with all related data using include parameter
    const response = await chainsApi.getChain(chainId, {
      include: "creator,template,assets,virtual_pool,repository,social_links",
    });

    console.log("Response received at:", new Date().toISOString());

    if (!response.data) {
      console.error("API returned no chain data:", {
        responseData: response,
        chainId: chainId,
      });
      notFound();
    }

    console.log("DEEP: Chain Page - [response.data]", response.data);

    // Extract branding and media from assets
    const branding = response.data.assets?.find(
      (asset) => asset.asset_type === "logo"
    )?.file_url;

    const media = response.data.assets
      ?.filter((asset: any) =>
        ["media", "screenshot", "banner"].includes(asset.asset_type)
      )
      ?.map((asset) => asset.file_url);

    console.log(`DEEP: Chain Page - media:`, media);

    // Augment chain data with computed branding and media
    const chain = {
      ...response.data,
      branding,
      media,
    } as Chain;

    return (
      <Container type="boxed">
        <ChainDetails chain={chain} />
      </Container>
    );
  } catch (error) {
    console.error("Error in page component:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    notFound();
  }
}
