import { ChainDetails } from "@/components/chain/chain-details";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { chainsApi } from "@/lib/api";
import { ChainExtended, Accolade } from "@/types/chains";
import { ChainDetailsHeader } from "@/components/chain/chain-details-header";
import { WalletContent } from "@/components/wallet/wallet-content";
import { ChainSuccessBanner } from "@/components/chain/chain-success-banner";
import { ChainLaunchCountdown } from "@/components/chain/chain-launch-countdown";
import { filterAccoladesByCategory } from "@/lib/utils/chain-ui-helpers";
import type { Metadata } from "next";
import ReportProblemButton from "@/components/miscellaneous/report-problem-button";

// Force dynamic rendering to ensure params are always fresh
export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface ChainPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(
  props: ChainPageProps
): Promise<Metadata> {
  try {
    const params = await props.params;
    const chainId = decodeURIComponent(params.id);

    // Fetch chain data for metadata
    const response = await chainsApi.getChain(chainId, {
      include: "assets",
    });

    if (!response.data) {
      return {
        title: "Chain Not Found | Canopy",
        description: "The requested chain could not be found.",
      };
    }

    const chain = response.data;

    // Extract branding/logo for og:image
    const branding = chain.assets?.find(
      (asset) => asset.asset_type === "logo"
    )?.file_url;

    // Use banner or screenshot as fallback for og:image
    const banner =
      chain.assets?.find((asset) => asset.asset_type === "banner")?.file_url ||
      chain.assets?.find((asset) => asset.asset_type === "screenshot")
        ?.file_url;

    const ogImage = branding || banner || undefined;

    // Truncate description if too long (max 160 chars for SEO)
    const description = chain.chain_description
      ? chain.chain_description.length > 160
        ? chain.chain_description.substring(0, 157) + "..."
        : chain.chain_description
      : `Discover ${chain.chain_name} (${chain.token_symbol}) on Canopy - a blockchain ecosystem for launching and participating in new chains.`;

    const title = `${chain.chain_name} (${chain.token_symbol}) | Canopy`;

    return {
      title,
      description,
      openGraph: {
        title: chain.chain_name,
        description,
        images: ogImage
          ? [
              {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: `${chain.chain_name} logo`,
              },
            ]
          : [],
        type: "website",
        siteName: "Canopy",
      },
      twitter: {
        card: "summary_large_image",
        title: chain.chain_name,
        description,
        images: ogImage ? [ogImage] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Chain | Canopy",
      description: "Discover blockchain chains on Canopy",
    };
  }
}

export default async function ChainPage(props: ChainPageProps) {
  try {
    const params = await props.params;
    const chainId = decodeURIComponent(params.id);

    // Fetch chain data with all required includes
    const response = await chainsApi.getChain(chainId, {
      include:
        "creator,template,assets,holders,graduation,repository,social_links,graduated_pool,virtual_pool,accolades",
    });

    if (!response.data) {
      console.error("API returned no chain data:", {
        responseData: response,
        chainId: chainId,
      });
      notFound();
    }

    // Extract branding and media from assets
    const branding = response.data.assets?.find(
      (asset) => asset.asset_type === "logo"
    )?.file_url;

    const media = response.data.assets
      ?.filter((asset) =>
        ["media", "screenshot", "banner"].includes(asset.asset_type)
      )
      ?.map((asset) => asset.file_url);

    // Augment chain data with computed branding and media
    const chain: ChainExtended = {
      ...response.data,
      branding,
      media,
    } as ChainExtended;

    // Extract accolades from the chain response (included via include parameter)
    const allAccolades: Accolade[] = (response.data as any).accolades || [];
    const filteredAccolades = filterAccoladesByCategory(allAccolades);

    console.log("[allAccolades]", allAccolades);
    console.log("[filteredAccolades]", filteredAccolades);

    return (
      <Container type="boxed" className="">
        <div className="w-full max-w-7xl mx-auto lg:flex gap-4">
          {/* Main Content */}
          <main id="chain-details" className="flex-1 min-w-0">
            <ChainSuccessBanner />
            <ChainDetailsHeader chain={chain} accolades={filteredAccolades} />
            <ChainDetails chain={chain} accolades={allAccolades} />
            <div className="py-8">
              <ReportProblemButton chainData={chain} />
            </div>
          </main>

          <aside className="w-[352px] flex-shrink-0 h-fit lg:block hidden">
            {chain.status === "draft" ? (
              <ChainLaunchCountdown
                publicationDate={chain.scheduled_launch_time}
                chainId={chain.id}
              />
            ) : (
              <div className="card p-4">
                <WalletContent showBalance={false} />
              </div>
            )}
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
