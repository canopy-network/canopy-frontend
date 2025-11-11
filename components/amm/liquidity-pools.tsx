"use client";

import { LiquidityPoolTable } from "./components/liquidity-pool-table";
import { mockPools } from "./mock/pool-data";

export function LiquidityPools() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Liquidity Pools</h2>
      </div>
      <LiquidityPoolTable data={mockPools} />
    </div>
  );
}
