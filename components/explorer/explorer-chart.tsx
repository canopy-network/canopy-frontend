"use client";

import { useState } from "react";
import { ChainDetailChart } from "@/components/charts/chain-detail-chart";
import { TimeframeButton, TimeframeButtonLayout } from "@/components/charts/timeframe-button";

// Only show timeframes supported by the backend: 1h, 1d, 7d, 1m
const timeframes = ["1H", "1D", "1W", "1M"];

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
  selectedTimeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
  isLoadingHistorical?: boolean;
}

const chartMetricConfig = {
  tvl: { label: "TVL", color: "#9ca3af" }, // Gray line for chart
  volume: { label: "Volume", color: "#9ca3af" },
  transactions: { label: "Transactions", color: "#9ca3af" },
};

export function ExplorerChart({
  historicData,
  selectedTimeframe: externalTimeframe,
  onTimeframeChange,
  isLoadingHistorical = false,
}: ExplorerChartProps) {
  const [chartMetric, setChartMetric] = useState<"tvl" | "volume" | "transactions">("tvl");
  const [internalTimeframe, setInternalTimeframe] = useState("1D");

  // Use external timeframe if provided, otherwise use internal state
  const selectedTimeframe = externalTimeframe ?? internalTimeframe;
  const setSelectedTimeframe = (timeframe: string) => {
    if (onTimeframeChange) {
      onTimeframeChange(timeframe);
    } else {
      setInternalTimeframe(timeframe);
    }
  };

  // Only use real historic data - no mockup data
  const currentData = historicData?.[chartMetric];
  const hasData = currentData && Array.isArray(currentData) && currentData.length > 0;

  // Ensure data is in correct format (time as number, value as number)
  const formattedData = hasData
    ? currentData.map((point) => ({
        time: typeof point.time === "number" ? point.time : parseInt(String(point.time)),
        value: typeof point.value === "number" ? point.value : parseFloat(String(point.value)),
      }))
    : null;

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
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                  active ? "border border-green-500  text-green-500" : "bg-white/5 text-gray-400 hover:text-white"
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
              loadingChart={isLoadingHistorical}
            >
              {tf}
            </TimeframeButton>
          ))}
        </TimeframeButtonLayout>
        <div className="h-full pt-12 p-3 lg:px-4 relative">
          {isLoadingHistorical ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a63d] mb-3"></div>
                <p className="text-sm font-medium mb-1">Loading historical data...</p>
                <p className="text-xs text-muted-foreground">
                  Fetching {chartMetricConfig[chartMetric].label} data for {selectedTimeframe}
                </p>
              </div>
            </div>
          ) : hasData && formattedData ? (
            <ChainDetailChart
              height={324 - 64}
              data={formattedData}
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
