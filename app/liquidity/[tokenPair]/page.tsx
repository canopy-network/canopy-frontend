"use client";

import { useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import PoolDetailClient from "@/components/liquidity/pool-detail-client";
import { useLiquidityPoolsStore } from "@/lib/stores/liquidity-pools-store";
import tokens from "@/data/tokens.json";

// Mock LP positions data - in a real app, this would come from your backend
const mockLpPositions = [
  {
    id: "pos-1",
    poolId: "pool-1",
    tokenA: "CNPY",
    tokenB: "OENS",
    lpTokens: 500,
    tokenAAmount: 1200,
    tokenBAmount: 2400,
    valueUSD: 2800.9,
    earnings: 300.9,
    share: 2.5,
  },
  {
    id: "pos-2",
    poolId: "pool-2",
    tokenA: "CNPY",
    tokenB: "GAME",
    lpTokens: 350,
    tokenAAmount: 800,
    tokenBAmount: 1600,
    valueUSD: 1850.5,
    earnings: 200.5,
    share: 1.8,
  },
  {
    id: "pos-3",
    poolId: "pool-3",
    tokenA: "CNPY",
    tokenB: "SOCN",
    lpTokens: 600,
    tokenAAmount: 1400,
    tokenBAmount: 2800,
    valueUSD: 3200.0,
    earnings: 400.0,
    share: 3.2,
  },
];

export default function PoolDetailPage() {
  const params = useParams();
  const { available_pools, fetchPools } = useLiquidityPoolsStore();
  const tokenPair = params.tokenPair as string;

  // Fetch pools on mount if not already loaded
  useEffect(() => {
    if (available_pools.length === 0) {
      fetchPools();
    }
  }, [available_pools.length, fetchPools]);

  // Parse the token pair (format: tokenb-tokena, e.g., "hlth-cnpy")
  const [tokenB, tokenA] = tokenPair.split("-").map((t) => t.toUpperCase());

  // Find the pool
  const pool = available_pools.find(
    (p) => p.tokenB === tokenB && p.tokenA === tokenA
  );

  // If pool not found and we've already loaded pools, show 404
  if (!pool && available_pools.length > 0) {
    notFound();
  }

  // Show loading state while pools are being fetched
  if (!pool) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading pool...</div>
      </div>
    );
  }

  return (
    <PoolDetailClient
      pool={pool}
      tokens={tokens}
      lpPositions={mockLpPositions}
    />
  );
}
