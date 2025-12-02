"use client";

import { useState } from "react";
import { ChainDetailChart } from "@/components/charts/chain-detail-chart";
import {
  TimeframeButton,
  TimeframeButtonLayout,
} from "@/components/charts/timeframe-button";

const timeframes = ["1H", "1D", "1W", "1M", "1Y", "ALL"];

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

interface HistoricDataPoint {
  time: number;
  value: number;
}

interface HistoricData {
  tvl: HistoricDataPoint[];
  volume: HistoricDataPoint[];
}

interface ExplorerChartProps {
  historicData?: HistoricData;
}

const buildSampleSeries = (base: number, amplitude: number) => {
  const now = Math.floor(Date.now() / 1000);
  return Array.from({ length: 48 }, (_, index) => {
    const time = now - (48 - index) * 30 * 60;
    const noise =
      Math.sin(index / 3) * amplitude + Math.random() * amplitude * 0.4;
    return {
      time,
      value: Math.max(base + noise, 0),
    };
  });
};

const defaultChartData = {
  tvl: buildSampleSeries(45_000_000, 1_500_000),
  volume: buildSampleSeries(8_500_000, 600_000),
};

const chartMetricConfig = {
  tvl: { label: "TVL (Overtime)", color: "#b4f5c5" },
  volume: { label: "Volume", color: "#7dd3fc" },
};

export function ExplorerChart({ historicData }: ExplorerChartProps) {
  const [chartMetric, setChartMetric] = useState<"tvl" | "volume">("tvl");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  // Use historic data if provided, otherwise use default sample data
  const chartData = historicData || defaultChartData;
  const latestPoint = chartData[chartMetric][chartData[chartMetric].length - 1];

  return (
    <div className="" id="network-overview-chart">
      <div className="flex items-center justify-between lg:mb-6 mb-3 ">
        <div className="flex items-center gap-3">
          {(["tvl", "volume"] as const).map((metric) => {
            const active = chartMetric === metric;
            return (
              <button
                key={metric}
                onClick={() => setChartMetric(metric)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "bg-emerald-500/10 text-white border border-emerald-400/50 shadow-[0_8px_30px_rgba(16,185,129,0.3)]"
                    : "bg-[#111] text-gray-400 hover:text-white"
                }`}
              >
                {chartMetricConfig[metric].label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border text-card-foreground shadow relative h-[324px] bg-muted/40">
        <TimeframeButtonLayout>
          {timeframes.map((tf) => (
            <TimeframeButton
              key={tf}
              timeframe={tf}
              selectedTimeframe={selectedTimeframe}
              setSelectedTimeframe={setSelectedTimeframe}
              loadingChart={false}
            >
              {tf}
            </TimeframeButton>
          ))}
        </TimeframeButtonLayout>
        <div className="h-full pt-12 p-3 lg:px-4">
          <ChainDetailChart
            height={324 - 64}
            data={chartData[chartMetric]}
            timeframe={selectedTimeframe}
            lineColor={chartMetricConfig[chartMetric].color}
          />
        </div>
      </div>
    </div>
  );
}
