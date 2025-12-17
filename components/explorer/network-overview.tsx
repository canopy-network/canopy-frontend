"use client";

import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ExplorerChart } from "./explorer-chart";
import { EXPLORER_NEON_GREEN } from "@/lib/utils/brand";

interface Metric {
  id: string;
  label: string;
  value: string;
  delta: string;
}

interface HistoricDataPoint {
  time: number;
  value: number;
}

interface HistoricData {
  tvl: HistoricDataPoint[];
  volume: HistoricDataPoint[];
  transactions?: HistoricDataPoint[];
}

interface HistoricalStats {
  tvl_history?: HistoricDataPoint[];
  volume_history?: HistoricDataPoint[];
}

interface NetworkOverviewProps {
  metrics: Metric[];
  historicData?: HistoricData;
  historicalStats?: HistoricalStats;
}

export function NetworkOverview({
  metrics,
  historicData,
  historicalStats,
}: NetworkOverviewProps) {
  // Calculate historical statistics
  const calculateStats = (data: HistoricDataPoint[] | undefined) => {
    if (!data || data.length === 0) return null;

    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const latest = values[values.length - 1];

    return { max, min, avg, latest, count: values.length };
  };

  const tvlStats = calculateStats(historicalStats?.tvl_history);
  const volumeStats = calculateStats(historicalStats?.volume_history);

  const formatValue = (value: number) => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };
  return (
    <div className="card-like flex flex-col gap-6 lg:px-4 px-3 py-4">
      {/* Overview Section */}
      <div>
        <div className="flex items-center justify-between mb-3 lg:mb-6 px-3 lg:px-4">
          <h2 className="text-xl lg:text-2xl font-bold text-white">
            Overview
          </h2>
        </div>
        {metrics.length === 0 ? (
          <div className="grid grid-cols-3 gap-3 lg:gap-5 min-h-[324px] items-center justify-center">
            <div className="col-span-full text-center text-muted-foreground">
              Loading network overview...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 lg:gap-5">
            {metrics.map((metric) => {
              // Extract numeric value from delta string (handles both "+0% last 24h" and "+0 this week" formats)
              const deltaMatch = metric.delta.match(/^([+-]?\d+(?:\.\d+)?)/);
              const numericDelta = deltaMatch ? Number(deltaMatch[1]) : 0;
              const isZero = numericDelta === 0;
              const isPositive = numericDelta > 0;

              // Split delta to get the suffix part
              const [valuePart, suffixPartRaw = ""] = metric.delta.split("%");
              const suffixPart = suffixPartRaw.trim() || metric.delta.replace(/^[+-]?\d+(?:\.\d+)?\s*/, "");

              return (
                <div
                  key={metric.id}
                  className="flex h-[120px] flex-col rounded-[16px] justify-between bg-white/5 px-3 lg:px-6 py-3 lg:py-5"
                >
                  <div className="text-xs font-medium uppercase tracking-[0.08em] text-white/70">
                    {metric.label}
                  </div>

                  <div className="flex flex-col lg:mt-auto">
                    <div className="text-xl lg:text-4xl font-semibold leading-[1.1] text-white">
                      {metric.value}
                    </div>
                    <div className="flex items-center text-xs font-medium">
                      {isZero ? (
                        <>
                          <span className="text-white/40 text-xs font-medium">
                            No change in 24h
                          </span>
                        </>
                      ) : (
                        <>
                          {isPositive ? (
                            <ArrowUpRight
                              className="h-4 w-4"
                              style={{ color: EXPLORER_NEON_GREEN }}
                            />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-400" />
                          )}
                          <span
                            className={cn(
                              isPositive
                                ? "text-[--explorer-neon-green]"
                                : "text-red-400",
                              "text-xs font-medium mr-1"
                            )}
                            style={
                              isPositive
                                ? { color: EXPLORER_NEON_GREEN }
                                : undefined
                            }
                          >
                            {metric.delta.includes("%") ? `${valuePart}%` : `${numericDelta > 0 ? "+" : ""}${numericDelta}`}
                          </span>
                          <span className="text-muted-foreground">
                            {suffixPart}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chart Section */}
      <ExplorerChart historicData={historicData} />
    </div>
  );
}
