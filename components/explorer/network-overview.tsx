"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { ExplorerChart } from "./explorer-chart";

interface Metric {
  id: string;
  label: string;
  value: string;
  delta: string;
}

interface NetworkOverviewProps {
  metrics: Metric[];
}

export function NetworkOverview({ metrics }: NetworkOverviewProps) {
  return (
    <div className="card-like flex flex-col gap-6  px-4 py-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 lg:gap-8">
        <div>
          <div className="flex items-center justify-between mb-7 px-4">
            <h2 className="text-2xl font-bold text-white">Network Overview</h2>
            <Button
              variant="ghost"
              size="sm"
              className="border border-emerald-500/70 bg-black/20 text-emerald-300 hover:bg-emerald-500/10 gap-2 px-5 lg:hidden"
            >
              <TrendingUp className="w-4 h-4 text-green-500" />
              All Chains
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:gap-5 md:grid-cols-2 xl:grid-cols-3 min-h-[324px]">
            {metrics.map((metric) => {
              const [valuePart, suffixPartRaw = ""] = metric.delta.split("%");
              const numericDelta = Number(valuePart);
              const isPositive = numericDelta >= 0;
              const suffixPart = suffixPartRaw.trim();

              return (
                <div
                  key={metric.id}
                  className="flex h-[120px] flex-col  rounded-[16px] justify-between bg-white/[0.05] px-6 py-5 h-full"
                >
                  <div className="text-[13px] font-medium uppercase tracking-[0.08em] text-white/70">
                    {metric.label}
                  </div>

                  <div className="flex flex-col  mt-auto">
                    <div className="text-4xl font-semibold leading-[1.1] text-white">
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
        <ExplorerChart />
      </div>
    </div>
  );
}
