import { PoolDetail } from "@/components/amm/pool-detail";

interface PoolPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PoolPage({ params }: PoolPageProps) {
  const { id } = await params;
  return <PoolDetail poolId={id} />;
}
