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

    let chain: ChainExtended | null = null;

    // Try to fetch using getChainDetails first
    try {
      const detailsResponse = await chainsApi.getChainDetails(chainId);

      if (detailsResponse.data) {
        console.log(
          "DEEP: Chain Page - getChainDetails data:",
          detailsResponse.data
        );

        // Transform ChainDetails to ChainExtended format
        // ChainDetails uses chain_id while Chain uses id
        const details = detailsResponse.data;
        chain = {
          id: details.chain_id,
          chain_id: details.chain_id,
          chain_name: details.chain_name,
          token_symbol: details.token_symbol,
          token_name: details.token_name || "",
          chain_description: details.chain_description,
          status: details.status,
          actual_launch_time: details.actual_launch_time,
          created_at: details.created_at,
          graduation: details.graduation,
          pool: details.pool || undefined,
          virtual_pool: details.pool || undefined,
          social_links: details.social_links,
          repository: details.repository || undefined,
          // These fields would need to be provided by getChain if needed
          template_id: "",
          consensus_mechanism: "",
          token_total_supply: 0,
          graduation_threshold: details.graduation.threshold_cnpy,
          creation_fee_cnpy: 0,
          initial_cnpy_reserve: 0,
          initial_token_supply: 0,
          bonding_curve_slope: 0,
          scheduled_launch_time: "",
          creator_initial_purchase_cnpy: 0,
          is_graduated: details.status === "graduated",
          graduation_time: null,
          genesis_hash: null,
          validator_min_stake: 0,
          created_by: "",
          updated_at: details.created_at,
        } as ChainExtended;
      }
    } catch (detailsError) {
      console.log(
        "getChainDetails failed, falling back to getChain:",
        detailsError
      );
    }

    // Fallback to getChain if getChainDetails failed or returned non-200
    if (!chain) {
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
      chain = {
        ...response.data,
        branding,
        media,
      } as ChainExtended;
    }

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
