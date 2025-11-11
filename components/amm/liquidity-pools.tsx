"use client";

import { useState } from "react";
import { LiquidityPoolTable } from "./components/liquidity-pool-table";
import { PoolFilters } from "./components/pool-filters";
import { mockPools } from "./mock/pool-data";
import {
  PoolFilters as PoolFiltersType,
  DEFAULT_POOL_FILTERS,
} from "./types/amm/filters";

export function LiquidityPools() {
  const [filters, setFilters] = useState<PoolFiltersType>(DEFAULT_POOL_FILTERS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Liquidity Pools</h2>
        <PoolFilters filters={filters} onFiltersChange={setFilters} />
      </div>
      <LiquidityPoolTable data={mockPools} filters={filters} />
    </div>
  );
}
