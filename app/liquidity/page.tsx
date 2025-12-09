"use client";

import { useEffect } from "react";
import LiquidityClient from "@/components/liquidity/liquidity-client";
import { useLiquidityPoolsStore } from "@/lib/stores/liquidity-pools-store";
import tokens from "@/data/tokens.json";

interface LpPosition {
  id: string;
  poolId: string;
  tokenA: string;
  tokenB: string;
  lpTokens: number;
  tokenAAmount: number;
  tokenBAmount: number;
  valueUSD: number;
  earnings: number;
}

interface LpWithdrawing {
  id: string;
  poolId: string;
  tokenA: string;
  tokenB: string;
  lpTokens: number;
  tokenAAmount: number;
  tokenBAmount: number;
  valueUSD: number;
  hoursRemaining: number;
}

interface LpEarnings {
  id: string;
  poolId: string;
  date: string;
  amount: number;
  tokenA: string;
  tokenB: string;
}

export default function LiquidityPage() {
  const { available_pools, fetchPools } = useLiquidityPoolsStore();

  // Fetch pools on mount if not already loaded
  useEffect(() => {
    if (available_pools.length === 0) {
      fetchPools();
    }
  }, [available_pools.length, fetchPools]);

  // In a real app, you would fetch user data from your backend/database
  // For now, we'll use mock data
  const lpPositions: LpPosition[] = [
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
    },
  ];

  const lpWithdrawing: LpWithdrawing[] = [
    {
      id: "withdraw-1",
      poolId: "pool-4",
      tokenA: "CNPY",
      tokenB: "MGC",
      lpTokens: 250,
      tokenAAmount: 150,
      tokenBAmount: 300,
      valueUSD: 450.5,
      hoursRemaining: 12,
    },
  ];

  const lpEarningsHistory: LpEarnings[] = [
    {
      id: "earn-1",
      poolId: "pool-1",
      date: "2024-12-04",
      amount: 45.2,
      tokenA: "CNPY",
      tokenB: "OENS",
    },
    {
      id: "earn-2",
      poolId: "pool-2",
      date: "2024-12-04",
      amount: 32.5,
      tokenA: "CNPY",
      tokenB: "GAME",
    },
    {
      id: "earn-3",
      poolId: "pool-3",
      date: "2024-12-03",
      amount: 58.75,
      tokenA: "CNPY",
      tokenB: "SOCN",
    },
  ];

  const isConnected = true;
  const userTokens = new Set<string>(["OENS", "GAME", "SOCN", "MGC"]);

  return (
    <LiquidityClient
      liquidityPools={available_pools}
      tokens={tokens}
      lpPositions={lpPositions}
      lpWithdrawing={lpWithdrawing}
      lpEarningsHistory={lpEarningsHistory}
      isConnected={isConnected}
      userTokens={userTokens}
    />
  );
}
