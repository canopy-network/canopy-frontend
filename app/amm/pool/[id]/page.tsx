import { PoolDetail } from "@/components/amm/pool-detail";

interface PoolPageProps {
  params: {
    id: string;
  };
}

export default function PoolPage({ params }: PoolPageProps) {
  return <PoolDetail poolId={params.id} />;
}
