"use client";
import { LiquidityPools } from "./liquidity-pools";
import { MetricsOverview } from "./components/metrics-overview";
import { mockOverviewMetrics } from "./mock/metrics-data";

export function AMMDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">AMM Hub</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Universal liquidity with CNPY hub pools. Trade, provide liquidity, and
          earn fees across all chains.
        </p>
      </div>

      <div className="mb-8">
        <MetricsOverview
          tvl={mockOverviewMetrics.tvl}
          tvlChange={mockOverviewMetrics.tvlChange}
          volume24h={mockOverviewMetrics.volume24h}
          volumeChange={mockOverviewMetrics.volumeChange}
          totalPools={mockOverviewMetrics.totalPools}
          poolsChange={mockOverviewMetrics.poolsChange}
          totalLPs={mockOverviewMetrics.totalLPs}
          lpsChange={mockOverviewMetrics.lpsChange}
        />
      </div>

      <LiquidityPools />
    </div>
  );
}
