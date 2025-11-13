import { AddLiquidityForm } from "@/components/amm/add-liquidity-form";

interface AddLiquidityPageProps {
  params: {
    id: string;
  };
}

export default function AddLiquidityPage({ params }: AddLiquidityPageProps) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add Liquidity</h1>
      </div>
      <div className="max-w-2xl mx-auto">
        <AddLiquidityForm poolId={params.id} />
      </div>
    </div>
  );
}
