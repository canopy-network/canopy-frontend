"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Droplets, Users, DollarSign } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: LucideIcon;
  iconColor?: string;
}

function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-primary",
}: MetricCardProps) {
  const isPositive = change >= 0;
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold">{value}</h3>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <div
                className={`flex items-center gap-0.5 ${isPositive ? "text-green-500" : "text-red-500"}`}
              >
                <ChangeIcon className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {isPositive ? "+" : ""}
                  {change.toFixed(2)}%
                </span>
              </div>
              <span className="text-muted-foreground">{changeLabel}</span>
            </div>
          </div>
          <div className={`rounded-full p-3 ${iconColor} bg-primary/10`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricsOverviewProps {
  tvl: number;
  tvlChange: number;
  volume24h: number;
  volumeChange: number;
  totalPools: number;
  poolsChange: number;
  totalLPs: number;
  lpsChange: number;
}

export function MetricsOverview({
  tvl,
  tvlChange,
  volume24h,
  volumeChange,
  totalPools,
  poolsChange,
  totalLPs,
  lpsChange,
}: MetricsOverviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Value Locked"
        value={formatCurrency(tvl)}
        change={tvlChange}
        changeLabel="vs last month"
        icon={DollarSign}
        iconColor="text-green-500"
      />
      <MetricCard
        title="24h Volume"
        value={formatCurrency(volume24h)}
        change={volumeChange}
        changeLabel="vs yesterday"
        icon={TrendingUp}
        iconColor="text-blue-500"
      />
      <MetricCard
        title="Active Pools"
        value={totalPools.toString()}
        change={poolsChange}
        changeLabel="vs last month"
        icon={Droplets}
        iconColor="text-purple-500"
      />
      <MetricCard
        title="Liquidity Providers"
        value={totalLPs.toLocaleString()}
        change={lpsChange}
        changeLabel="vs last month"
        icon={Users}
        iconColor="text-orange-500"
      />
    </div>
  );
}
