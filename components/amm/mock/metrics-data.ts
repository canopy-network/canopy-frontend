import {
  PoolGrowthHistory,
  PoolGrowthPoint,
  TimeGranularity,
  LiquidityMetrics,
  PoolDistribution,
  LPCountMetrics,
  FeeAPYMetrics,
  LiquidityUtilization,
} from "../types/api/metrics";

const generateGrowthPoints = (days: number): PoolGrowthPoint[] => {
  const points: PoolGrowthPoint[] = [];
  const now = new Date();
  let baseTVL = 5000000;
  let baseLPCount = 150;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const randomGrowth = 1 + (Math.random() - 0.3) * 0.1;
    baseTVL *= randomGrowth;
    baseLPCount += Math.floor((Math.random() - 0.3) * 5);

    points.push({
      timestamp: date.toISOString(),
      tvl: Math.floor(baseTVL),
      tvl_usd: baseTVL,
      total_points: Math.floor(baseTVL * 0.1),
      lp_count: Math.max(100, baseLPCount),
      growth_pct: i === days ? 0 : (randomGrowth - 1) * 100,
    });
  }

  return points;
};

export const mockPoolGrowthHistory7d: PoolGrowthHistory = {
  chain_id: null,
  pool_id: null,
  period: {
    start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date().toISOString(),
  },
  granularity: TimeGranularity.Day,
  data_points: generateGrowthPoints(7),
  growth_rate_pct: 12.5,
  updated_at: new Date().toISOString(),
};

export const mockPoolGrowthHistory30d: PoolGrowthHistory = {
  chain_id: null,
  pool_id: null,
  period: {
    start_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date().toISOString(),
  },
  granularity: TimeGranularity.Day,
  data_points: generateGrowthPoints(30),
  growth_rate_pct: 45.8,
  updated_at: new Date().toISOString(),
};

export const mockPoolGrowthHistory90d: PoolGrowthHistory = {
  chain_id: null,
  pool_id: null,
  period: {
    start_time: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date().toISOString(),
  },
  granularity: TimeGranularity.Day,
  data_points: generateGrowthPoints(90),
  growth_rate_pct: 128.3,
  updated_at: new Date().toISOString(),
};

export const mockOverviewMetrics = {
  tvl: 18500000,
  tvlChange: 45.8,
  volume24h: 3200000,
  volumeChange: 12.3,
  totalPools: 8,
  poolsChange: 14.3,
  totalLPs: 342,
  lpsChange: 28.5,
};
