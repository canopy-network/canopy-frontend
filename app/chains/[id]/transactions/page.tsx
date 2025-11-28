import { ChainDetailsHeader } from "@/components/chain/chain-details-header";
import { TransactionsExplorer } from "@/components/transactions/transactions-explorer";
import { chainsApi } from "@/lib/api";
import { ChainExtended } from "@/types/chains";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface ChainTransactionsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(
  props: ChainTransactionsPageProps
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

    const title = `${chain.chain_name} - Transactions | Canopy`;
    const description = `View transactions for ${chain.chain_name} (${chain.token_symbol}) on Canopy`;

    return {
      title,
      description,
      openGraph: {
        title: `${chain.chain_name} - Transactions`,
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
        title: `${chain.chain_name} - Transactions`,
        description,
        images: ogImage ? [ogImage] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Transactions | Canopy",
      description: "View chain transactions on Canopy",
    };
  }
}

export default async function ChainTransactionsPage(
  props: ChainTransactionsPageProps
) {
  const params = await props.params;
  const chainId = decodeURIComponent(params.id);

  const response = await chainsApi.getChain(chainId, {
    include:
      "creator,template,assets,holders,graduation,repository,social_links,graduated_pool,virtual_pool",
  });

  if (!response.data) {
    notFound();
  }

  const branding = response.data.assets?.find(
    (asset) => asset.asset_type === "logo"
  )?.file_url;

  const media = response.data.assets
    ?.filter((asset) =>
      ["media", "screenshot", "banner"].includes(asset.asset_type)
    )
    ?.map((asset) => asset.file_url);

  const chain: ChainExtended = {
    ...response.data,
    branding,
    media,
  } as ChainExtended;

  return (
    <TransactionsExplorer
      chainContext={{ id: chain.id, name: chain.chain_name }}
      hideChainColumn
    >
      <ChainDetailsHeader chain={chain} accolades={[]} />
    </TransactionsExplorer>
  );
}
