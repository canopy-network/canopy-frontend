"use client";

import { useState } from "react";
import { ChainDetailChart } from "@/components/charts/chain-detail-chart";
import {
  TimeframeButton,
  TimeframeButtonLayout,
} from "@/components/charts/timeframe-button";

const timeframes = ["1H", "1D", "1W", "1M", "1Y", "ALL"];

interface HistoricDataPoint {
  time: number;
  value: number;
}

interface HistoricData {
  tvl: HistoricDataPoint[];
  volume: HistoricDataPoint[];
  transactions?: HistoricDataPoint[];
}

interface ExplorerChartProps {
  historicData?: HistoricData;
}

const chartMetricConfig = {
  tvl: { label: "TVL", color: "#00a63d" },
  volume: { label: "Volume", color: "#00a63d" },
  transactions: { label: "Transactions", color: "#00a63d" },
};

export function ExplorerChart({ historicData }: ExplorerChartProps) {
  const [chartMetric, setChartMetric] = useState<"tvl" | "volume" | "transactions">("tvl");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  // Only use real historic data - no mockup data
  const hasData = historicData && historicData[chartMetric] && historicData[chartMetric].length > 0;

  return (
    <div className="" id="network-overview-chart">
      <div className="flex items-center justify-between lg:mb-6 mb-3">
        <div className="flex items-center gap-3">
          {(["tvl", "volume", "transactions"] as const).map((metric) => {
            const active = chartMetric === metric;
            return (
              <button
                key={metric}
                onClick={() => setChartMetric(metric)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "bg-[#00a63d]/10 text-white border border-[#00a63d] shadow-[0_8px_30px_rgba(0,166,61,0.35)]"
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
          {hasData && historicData && historicData[chartMetric] ? (
            <ChainDetailChart
              height={324 - 64}
              data={historicData[chartMetric]}
              timeframe={selectedTimeframe}
              lineColor={chartMetricConfig[chartMetric].color}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-sm font-medium mb-1">Historical data not available</p>
                <p className="text-xs text-muted-foreground">
                  Historical {chartMetricConfig[chartMetric].label} data is not currently available from the API.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
