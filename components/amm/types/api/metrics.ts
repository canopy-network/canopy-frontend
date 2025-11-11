export enum TimeGranularity {
  Block = "block",
  Minute = "minute",
  Hour = "hour",
  Day = "day",
  Week = "week",
  Month = "month",
}

export interface MetricsTimeRange {
  start_time?: string;
  end_time?: string;
}

export interface PoolGrowthPoint {
  timestamp: string;
  height?: number;
  tvl: number;
  tvl_usd: number;
  total_points: number;
  lp_count: number;
  growth_pct?: number;
}

export interface PoolGrowthHistory {
  chain_id?: string | null;
  pool_id?: number | null;
  period: MetricsTimeRange;
  granularity: TimeGranularity;
  data_points: PoolGrowthPoint[];
  growth_rate_pct: number;
  updated_at: string;
}

export interface PoolDistributionItem {
  pool_id: number;
  chain_id: number;
  tvl_usd: number;
  tvl_cnpy: number;
  share_pct: number;
  lp_count: number;
  rank: number;
}

export interface PoolDistribution {
  chain_id?: string | null;
  total_pools: number;
  total_tvl_usd: number;
  total_tvl_cnpy: number;
  top_pools: PoolDistributionItem[];
  concentration_index: number;
  top_10_share_pct: number;
  updated_at: string;
}

export interface PoolLPCount {
  pool_id: number;
  chain_id: number;
  lp_count: number;
}

export interface LPCountMetrics {
  chain_id?: string | null;
  period: MetricsTimeRange;
  total_lps: number;
  new_lps: number;
  active_lps: number;
  churned_lps: number;
  by_pool?: PoolLPCount[];
  updated_at: string;
}

export interface PoolFeeAPY {
  pool_id: number;
  chain_id: number;
  annualized_apy: number;
  tvl_usd: number;
}

export interface FeeAPYMetrics {
  chain_id?: string | null;
  pool_id?: number | null;
  period: MetricsTimeRange;
  annualized_apy: number;
  tvl_usd: number;
  daily_volume_usd: number;
  estimated_daily_fees_usd: number;
  fee_rate: number;
  by_pool?: PoolFeeAPY[];
  updated_at: string;
}

export interface PoolUtilization {
  pool_id: number;
  chain_id: number;
  tvl_usd: number;
  daily_volume_usd: number;
  utilization_ratio: number;
}

export interface LiquidityUtilization {
  chain_id?: string | null;
  pool_id?: number | null;
  period: MetricsTimeRange;
  tvl_usd: number;
  daily_volume_usd: number;
  utilization_ratio: number;
  annualized_utilization: number;
  by_pool?: PoolUtilization[];
  updated_at: string;
}

export interface LiquidityMetrics {
  chain_id?: string | null;
  pool_id?: number | null;
  period: MetricsTimeRange;
  updated_at: string;
  pool_growth: PoolGrowthHistory;
  pool_distribution: PoolDistribution;
  lp_count: LPCountMetrics;
  fee_apy: FeeAPYMetrics;
  utilization: LiquidityUtilization;
}
