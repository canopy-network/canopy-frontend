import { ChainDetailsHeader } from "@/components/chain/chain-details-header";
import { TransactionsExplorer } from "@/components/transactions/transactions-explorer";
import { chainsApi } from "@/lib/api";
import { ChainExtended } from "@/types/chains";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface ChainTransactionsPageProps {
  params: Promise<{
    id: string;
  }>;
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
