import PoolDetailClient from "@/components/liquidity/pool-detail-client";
import liquidityPools from "@/data/liquidity-pools.json";
import tokens from "@/data/tokens.json";
import { notFound } from "next/navigation";

interface PoolDetailPageProps {
  params: Promise<{
    tokenPair: string;
  }>;
}

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

// This is a server component by default in Next.js App Router
export default async function PoolDetailPage({ params }: PoolDetailPageProps) {
  const { tokenPair } = await params;

  // Parse the token pair (format: tokenb-tokena, e.g., "hlth-cnpy")
  const [tokenB, tokenA] = tokenPair.split("-").map((t) => t.toUpperCase());

  // Find the pool
  const pool = liquidityPools.find(
    (p) => p.tokenB === tokenB && p.tokenA === tokenA
  );

  // If pool not found, show 404
  if (!pool) {
    notFound();
  }

  return (
    <PoolDetailClient
      pool={pool}
      tokens={tokens}
      lpPositions={mockLpPositions}
    />
  );
}
