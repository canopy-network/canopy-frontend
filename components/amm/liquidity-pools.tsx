"use client";

import { useState } from "react";
import { LiquidityPoolTable } from "./components/liquidity-pool-table";
import { PoolFilters } from "./components/pool-filters";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { mockPools } from "./mock/pool-data";
import {
  PoolFilters as PoolFiltersType,
  DEFAULT_POOL_FILTERS,
} from "./types/amm/filters";

export function LiquidityPools() {
  const [filters, setFilters] = useState<PoolFiltersType>(DEFAULT_POOL_FILTERS);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Liquidity Pools</h2>
          <PoolFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </CardHeader>
      <CardContent>
        <LiquidityPoolTable data={mockPools} filters={filters} />
      </CardContent>
    </Card>
  );
}
