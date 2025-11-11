"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AMMMetricsChart } from "./amm-metrics-chart";
import { ChartMetric } from "../types/amm/chart";
import {
  mockPoolGrowthHistory7d,
  mockPoolGrowthHistory30d,
  mockPoolGrowthHistory90d,
} from "../mock/metrics-data";
import { PoolGrowthHistory } from "../types/api/metrics";

const TIMEFRAMES = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
] as const;

type TimeframeValue = (typeof TIMEFRAMES)[number]["value"];

const METRICS = [
  { label: "TVL", value: ChartMetric.TVL },
  { label: "LP Count", value: ChartMetric.LPCount },
] as const;

const TIMEFRAME_DATA: Record<TimeframeValue, PoolGrowthHistory> = {
  "7d": mockPoolGrowthHistory7d,
  "30d": mockPoolGrowthHistory30d,
  "90d": mockPoolGrowthHistory90d,
};

export function EcosystemMetrics() {
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>(
    ChartMetric.TVL,
  );
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TimeframeValue>("30d");

  const currentData = TIMEFRAME_DATA[selectedTimeframe];
  const latestPoint =
    currentData.data_points[currentData.data_points.length - 1];

  const formatValue = (metric: ChartMetric, value: number) => {
    switch (metric) {
      case ChartMetric.TVL:
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          notation: "compact",
          maximumFractionDigits: 2,
        }).format(value);
      case ChartMetric.LPCount:
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getMetricLabel = (metric: ChartMetric) => {
    switch (metric) {
      case ChartMetric.TVL:
        return "Total Value Locked";
      case ChartMetric.LPCount:
        return "Liquidity Providers";
      default:
        return "Metric";
    }
  };

  const getCurrentValue = () => {
    switch (selectedMetric) {
      case ChartMetric.TVL:
        return latestPoint.tvl_usd;
      case ChartMetric.LPCount:
        return latestPoint.lp_count;
      default:
        return 0;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {getMetricLabel(selectedMetric)}
            </CardTitle>
            <div className="text-3xl font-bold mt-2">
              {formatValue(selectedMetric, getCurrentValue())}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-sm ${currentData.growth_rate_pct >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {currentData.growth_rate_pct >= 0 ? "+" : ""}
                {currentData.growth_rate_pct.toFixed(2)}%
              </span>
              <span className="text-sm text-muted-foreground">
                {selectedTimeframe.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {METRICS.map((metric) => (
                <Button
                  key={metric.value}
                  variant={
                    selectedMetric === metric.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedMetric(metric.value)}
                >
                  {metric.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-1">
              {TIMEFRAMES.map((timeframe) => (
                <Button
                  key={timeframe.value}
                  variant={
                    selectedTimeframe === timeframe.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe.value)}
                >
                  {timeframe.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AMMMetricsChart
          data={currentData.data_points}
          metric={selectedMetric}
        />
      </CardContent>
    </Card>
  );
}
