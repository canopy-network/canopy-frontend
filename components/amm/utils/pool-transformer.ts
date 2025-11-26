import type { VirtualPool, GraduatedPool } from "../types/api/pool";
import type { LiquidityPool } from "../types/amm/pool";
import { PoolType } from "../types/amm/pool";

// Helper to format numbers as currency strings
const formatUSD = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// const formatCompact = (value: number): string => {
//   return new Intl.NumberFormat('en-US', {
//     notation: 'compact',
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(value);
// };

// Calculate TVL from reserves
const calculateTVL = (
  cnpyReserve: number,
  tokenReserve: number,
  cnpyPriceUSD: number = 1,
  tokenPriceUSD?: number,
): number => {
  const cnpyValue = cnpyReserve * cnpyPriceUSD;

  // If token price is provided, calculate accurate TVL
  if (tokenPriceUSD !== undefined) {
    const tokenValue = tokenReserve * tokenPriceUSD;
    return cnpyValue + tokenValue;
  }

  // Otherwise, assume equal value on both sides (CNPY value * 2)
  return cnpyValue * 2;
};

// Transform VirtualPool to LiquidityPool
export const transformVirtualPool = (
  pool: VirtualPool,
  tokenSymbol?: string,
  tokenIcon: string = "/default-token.png",
  cnpyPriceUSD: number = 1,
  tokenPriceUSD?: number,
): LiquidityPool => {
  const tvlUSD = calculateTVL(
    pool.cnpy_reserve,
    pool.token_reserve,
    cnpyPriceUSD,
    tokenPriceUSD,
  );
  const volume24hUSD = (pool.volume_24h_cnpy ?? 0) * cnpyPriceUSD;

  // Calculate graduation progress if available
  const graduationProgress =
    pool.graduation_progress && pool.graduation_progress.length > 0
      ? pool.graduation_progress[pool.graduation_progress.length - 1]
          .progress_percentage
      : undefined;

  // Use chain_id as token symbol if not provided
  const symbol = tokenSymbol ?? `CHAIN-${pool.chain_id}`;

  return {
    id: pool.id,
    type: PoolType.Virtual,
    chainId: pool.chain_id,
    pair: `${symbol}/CNPY`,
    tokenSymbol: symbol,
    baseToken: {
      symbol: symbol,
      icon: tokenIcon,
    },
    quoteToken: {
      symbol: "CNPY",
      icon: "/cnpy-icon.png", // Update with actual path
    },
    tvl: formatUSD(tvlUSD),
    volume24h: formatUSD(volume24hUSD),
    totalVolume: formatUSD(pool.total_volume_cnpy * cnpyPriceUSD),
    currentPrice: pool.current_price_cnpy.toString(),
    currentPriceUsd: (pool.current_price_cnpy * cnpyPriceUSD).toFixed(6),
    priceChange24h: pool.price_24h_change_percent ?? undefined,
    cnpyReserve: pool.cnpy_reserve,
    tokenReserve: pool.token_reserve,
    graduationProgress,
    isActive: pool.is_active,
    createdAt: pool.created_at,
    updatedAt: pool.updated_at,
  };
};

// Transform GraduatedPool to LiquidityPool
export const transformGraduatedPool = (
  pool: GraduatedPool,
  tokenSymbol?: string,
  tokenIcon: string = "/default-token.png",
  cnpyPriceUSD: number = 1,
  tokenPriceUSD?: number,
): LiquidityPool => {
  const tvlUSD = calculateTVL(
    pool.cnpy_reserve,
    pool.token_reserve,
    cnpyPriceUSD,
    tokenPriceUSD,
  );

  // Use chain_id as token symbol if not provided
  const symbol = tokenSymbol ?? `CHAIN-${pool.chain_id}`;

  return {
    id: pool.id,
    type: PoolType.Graduated,
    chainId: pool.chain_id,
    pair: `${symbol}/CNPY`,
    tokenSymbol: symbol,
    baseToken: {
      symbol: symbol,
      icon: tokenIcon,
    },
    quoteToken: {
      symbol: "CNPY",
      icon: "/cnpy-icon.png", // Update with actual path
    },
    tvl: formatUSD(tvlUSD),
    volume24h: "$0.00", // Not available for graduated pools
    totalVolume: formatUSD(pool.total_volume_cnpy * cnpyPriceUSD),
    currentPrice: pool.current_price_cnpy.toString(),
    currentPriceUsd: (pool.current_price_cnpy * cnpyPriceUSD).toFixed(6),
    cnpyReserve: pool.cnpy_reserve,
    tokenReserve: pool.token_reserve,
    isActive: pool.is_active,
    createdAt: pool.created_at,
    updatedAt: pool.updated_at,
  };
};

// Transform array of pools
export const transformPools = (
  virtualPools: VirtualPool[] = [],
  graduatedPools: GraduatedPool[] = [],
  cnpyPriceUSD: number = 1,
): LiquidityPool[] => {
  const virtual = virtualPools.map((pool) =>
    transformVirtualPool(pool, undefined, "/default-token.png", cnpyPriceUSD),
  );

  const graduated = graduatedPools.map((pool) =>
    transformGraduatedPool(pool, undefined, "/default-token.png", cnpyPriceUSD),
  );

  return [...virtual, ...graduated];
};
