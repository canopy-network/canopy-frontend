"use client";
import { LiquidityPools } from "./liquidity-pools";
import { MetricCard } from "./components/metrics-overview";
import { EcosystemMetrics } from "./components/ecosystem-metrics";
import { PortfolioOverview } from "./components/portfolio-overview";
import { mockOverviewMetrics } from "./mock/metrics-data";
import { mockPortfolioOverview } from "./mock/portfolio-data";
import { DollarSign, TrendingUp, Droplets, Users } from "lucide-react";
import { formatCurrency } from "./utils/currency";

export function AMMDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col lg:flex-row gap-6 lg:items-stretch">
        <div className="flex flex-col gap-4 lg:w-[40%] lg:shrink-0">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 min-w-0">
              <MetricCard
                title="Total Value Locked"
                value={formatCurrency(mockOverviewMetrics.tvl)}
                change={mockOverviewMetrics.tvlChange}
                changeLabel="vs last month"
                icon={DollarSign}
                iconColor="text-green-500"
              />
            </div>
            <div className="flex-1 min-w-0">
              <MetricCard
                title="24h Volume"
                value={formatCurrency(mockOverviewMetrics.volume24h)}
                change={mockOverviewMetrics.volumeChange}
                changeLabel="vs yesterday"
                icon={TrendingUp}
                iconColor="text-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 min-w-0">
              <MetricCard
                title="Active Pools"
                value={mockOverviewMetrics.totalPools.toString()}
                change={mockOverviewMetrics.poolsChange}
                changeLabel="vs last month"
                icon={Droplets}
                iconColor="text-purple-500"
              />
            </div>
            <div className="flex-1 min-w-0">
              <MetricCard
                title="Liquidity Providers"
                value={mockOverviewMetrics.totalLPs.toLocaleString()}
                change={mockOverviewMetrics.lpsChange}
                changeLabel="vs last month"
                icon={Users}
                iconColor="text-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 lg:w-[60%] h-full">
          <EcosystemMetrics />
        </div>
      </div>

      <div className="mb-8">
        <PortfolioOverview data={mockPortfolioOverview} />
      </div>

      <LiquidityPools />
    </div>
  );
}
