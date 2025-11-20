import { BlockDetails } from "@/components/explorer/block-details";
import { Container } from "@/components/layout/container";
import { notFound } from "next/navigation";

// Force dynamic rendering to ensure params are always fresh
export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface BlockPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BlockPage(props: BlockPageProps) {
  const params = await props.params;
  const blockId = params.id;

  // Validate block ID is a number
  if (!blockId || isNaN(Number(blockId))) {
    notFound();
  }

  return (
    <Container>
      <BlockDetails blockId={blockId} />
    </Container>
  );
}
