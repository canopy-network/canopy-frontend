"use client";

import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ExplorerChart } from "./explorer-chart";

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
}

interface NetworkOverviewProps {
  metrics: Metric[];
  historicData?: HistoricData;
}

export function NetworkOverview({
  metrics,
  historicData,
}: NetworkOverviewProps) {
  return (
    <div className="card-like flex flex-col gap-6  lg:px-4 px-3 py-4">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 lg:gap-8">
        <div>
          <div className="flex items-center justify-between mb-3 lg:mb-6 px-3 lg:px-4">
            <h2 className="text-xl lg:text-2xl font-bold text-white">
              Network Overview
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:gap-5 md:grid-cols-2 xl:grid-cols-3 min-h-[324px]">
            {metrics.map((metric) => {
              const [valuePart, suffixPartRaw = ""] = metric.delta.split("%");
              const numericDelta = Number(valuePart);
              const isPositive = numericDelta >= 0;
              const suffixPart = suffixPartRaw.trim();

              return (
                <div
                  key={metric.id}
                  className="flex lg:h-[120px] flex-col  rounded-[16px] justify-between bg-white/[0.05] px-3 lg:px-6 py-3 lg:py-5 h-full"
                >
                  <div className="text-xs font-medium uppercase tracking-[0.08em] text-white/70">
                    {metric.label}
                  </div>

                  <div className="flex flex-col  lg:mt-auto">
                    <div className="text-xl lg:text-4xl font-semibold leading-[1.1] text-white">
                      {metric.value}
                    </div>
                    <div className="flex items-center text-xs font-medium">
                      {isPositive ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-400" />
                      )}
                      <span
                        className={cn(
                          isPositive ? "text-emerald-400" : "text-red-400",
                          "text-xs font-medium mr-1"
                        )}
                      >
                        {`${valuePart}%`}
                      </span>
                      <span className="text-muted-foreground">
                        {suffixPart}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <ExplorerChart historicData={historicData} />
      </div>
    </div>
  );
}
