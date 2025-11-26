"use client";

import { useState, useEffect, useMemo } from "react";
import { LiquidityPoolTable } from "./components/pools/liquidity-pool-table";
import { PoolFilters } from "./components/pools/pool-filters";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  PoolFilters as PoolFiltersType,
  DEFAULT_POOL_FILTERS,
} from "./types/amm/filters";
import { useVirtualPoolsStore } from "@/lib/stores/virtual-pools-store";
import { transformPools } from "./utils/pool-transformer";

export function LiquidityPools() {
  const [filters, setFilters] = useState<PoolFiltersType>(DEFAULT_POOL_FILTERS);
  const { virtualPools, pagination, isLoading, error, fetchVirtualPools } =
    useVirtualPoolsStore();

  const liquidityPools = useMemo(() => {
    return transformPools(virtualPools, [], 1);
  }, [virtualPools]);

  useEffect(() => {
    if (pagination?.total) {
      fetchVirtualPools({ limit: pagination.total });
    } else {
      fetchVirtualPools({ limit: 100 });
    }
  }, [fetchVirtualPools, pagination?.total]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Liquidity Pools</h2>
          <PoolFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading virtual pools...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        ) : (
          <LiquidityPoolTable data={liquidityPools} filters={filters} />
        )}
      </CardContent>
    </Card>
  );
}
