import { ChainDetails } from "@/components/chain/chain-details";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { chainsApi } from "@/lib/api";
import { ChainExtended } from "@/types/chains";
import { ChainDetailsHeader } from "@/components/chain/chain-details-header";
import { WalletContent } from "@/components/wallet/wallet-content";

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

    // Fetch chain data with all required includes
    const response = await chainsApi.getChain(chainId, {
      include:
        "creator,template,assets,holders,graduation,repository,social_links,graduated_pool,virtual_pool",
    });

    console.log("Response received at:", new Date().toISOString());

    if (!response.data) {
      console.error("API returned no chain data:", {
        responseData: response,
        chainId: chainId,
      });
      notFound();
    }

    console.log("DEEP: Chain Page - getChain data:", response.data);

    // Extract branding and media from assets
    const branding = response.data.assets?.find(
      (asset) => asset.asset_type === "logo"
    )?.file_url;

    const media = response.data.assets
      ?.filter((asset) =>
        ["media", "screenshot", "banner"].includes(asset.asset_type)
      )
      ?.map((asset) => asset.file_url);

    console.log(`DEEP: Chain Page - media:`, media);

    // Augment chain data with computed branding and media
    const chain: ChainExtended = {
      ...response.data,
      branding,
      media,
    } as ChainExtended;

    return (
      <Container type="boxed" className="">
        <div className="w-full max-w-7xl mx-auto lg:flex gap-4">
          {/* Main Content */}
          <main id="chain-details" className="flex-1 min-w-0">
            <ChainDetailsHeader chain={chain} />
            <ChainDetails chain={chain} />
          </main>

          <aside className="w-[352px] flex-shrink-0 card h-fit p-4 lg:block hidden">
            <WalletContent showBalance={false} />
          </aside>
        </div>
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
