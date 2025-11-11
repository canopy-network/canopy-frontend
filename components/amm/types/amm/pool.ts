export interface PoolToken {
  symbol: string;
  icon: string;
}

export interface Pool {
  id: string;
  pair: string;
  baseToken: PoolToken;
  quoteToken: PoolToken;
  tvl: string;
  volume24h: string;
  apr: number;
  fees24h: string;
  lpTokens: string;
  utilization: number;
  myLiquidity?: string;
}

export enum PoolType {
  Virtual = 'virtual',
  Graduated = 'graduated',
}

// Unified pool type for displaying both virtual and graduated pools
export interface LiquidityPool {
  id: string;
  type: PoolType;
  chainId: number;

  // Pair info
  pair: string; // e.g., "TOKEN/CNPY"
  tokenSymbol?: string;
  baseToken: PoolToken;
  quoteToken: PoolToken;

  // Liquidity & Volume
  tvl: string; // Total Value Locked (USD)
  volume24h: string;
  volume7d?: string;
  volume30d?: string;
  totalVolume: string;

  // Price & Changes
  currentPrice: string; // Price in CNPY
  currentPriceUsd?: string;
  priceChange24h?: number; // Percentage

  // APR/Fees
  apr?: number;
  apy?: number;
  fees24h?: string;

  // Reserves
  cnpyReserve: number;
  tokenReserve: number;

  // Virtual pool specific
  graduationProgress?: number; // Percentage (0-100)

  // Status
  isActive: boolean;

  // User specific
  myLiquidity?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
