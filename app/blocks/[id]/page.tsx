import { BlockDetails } from "@/components/explorer/block-details";
import { Container } from "@/components/layout/container";
import { notFound } from "next/navigation";
import { getExplorerBlock } from "@/lib/api/explorer";
import type { Metadata } from "next";

// Force dynamic rendering to ensure params are always fresh
export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface BlockPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(
  props: BlockPageProps
): Promise<Metadata> {
  try {
    const params = await props.params;
    const blockId = params.id;

    // Validate block ID is a number
    if (!blockId || isNaN(Number(blockId))) {
      return {
        title: "Block Not Found | Canopy",
        description: "The requested block could not be found.",
      };
    }

    const blockHeight = Number(blockId);

    // Try to fetch block data for more detailed metadata
    try {
      const block = await getExplorerBlock(blockHeight);

      const title = `${blockId} | Blocks | Canopy`;
      const description = `Block ${blockId} on chain ${
        block.chain_id
      }. Height: ${block.height}, Hash: ${block.hash.slice(
        0,
        16
      )}..., Transactions: ${block.num_txs}, Events: ${block.num_events}`;

      return {
        title,
        description,
        openGraph: {
          title: `Block ${blockId}`,
          description,
          type: "website",
          siteName: "Canopy",
        },
        twitter: {
          card: "summary",
          title: `Block ${blockId}`,
          description,
        },
      };
    } catch (error) {
      // If block fetch fails, still provide basic metadata
      console.error("Error fetching block for metadata:", error);
      const title = `${blockId} | Blocks | Canopy`;
      return {
        title,
        description: `View details for block ${blockId} on Canopy`,
        openGraph: {
          title: `Block ${blockId}`,
          description: `View details for block ${blockId} on Canopy`,
          type: "website",
          siteName: "Canopy",
        },
        twitter: {
          card: "summary",
          title: `Block ${blockId}`,
          description: `View details for block ${blockId} on Canopy`,
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Blocks | Canopy",
      description: "View block details on Canopy",
    };
  }
}

export default async function BlockPage(props: BlockPageProps) {
  const params = await props.params;
  const blockId = params.id;

  // Validate block ID is a number
  if (!blockId || isNaN(Number(blockId))) {
    notFound();
  }

  return (
    <Container type="boxed" className="space-y-6 xl:px-0">
      <BlockDetails blockId={blockId} />
    </Container>
  );
}
