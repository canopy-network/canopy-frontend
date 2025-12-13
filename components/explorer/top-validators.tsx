"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { LatestUpdated } from "./latest-updated";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { canopyIconSvg, getCanopyAccent } from "@/lib/utils/brand";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface Validator {
  name: string;
  address: string;
  stake?: string;
  apr?: string;
  apy?: number;
  votingPower?: number;
  uptime: number;
  uptimeTrend?: number[]; // Array of uptime values for sparkline (7 or 30 data points)
  healthScore?: number; // Performance score 0-100
  status?: "healthy" | "warning" | "at_risk"; // Health status
  statusMessage?: string; // Tooltip message
  chains?: string[]; // Array of chain names the validator is staking for
  originalStatus?: string; // Backend status (active/inactive/unstaking/paused)
}

interface TopValidatorsProps {
  validators: Validator[];
}

type AggregatedValidator = Validator & {
  chainCount: number;
  totalVotingPower: number;
  totalApy: number;
  entries: number;
  votingPowerAvg: number;
  apyAvg: number;
  totalUptime: number;
  uptimeAvg: number;
  rawStatus?: string;
};

// Simple trend arrow component
function UptimeTrend({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;

  // Determine trend direction
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const isUpward = lastValue > firstValue;

  return (
    <div className={color}>
      {isUpward ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
    </div>
  );
}

export function TopValidators({ validators }: TopValidatorsProps) {
  // Determine uptime color based on percentage
  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99)
      return "bg-[#00a63d]/10 text-[#00a63d] border border-[#00a63d]/50";
    if (uptime >= 97) return "bg-yellow-500/10 text-yellow-500";
    return "bg-red-500/10 text-red-500";
  };

  // Get text color for sparkline
  const getUptimeTextColor = (uptime: number) => {
    if (uptime >= 99) return "text-[#00a63d]";
    if (uptime >= 97) return "text-yellow-500";
    return "text-red-500";
  };

  const formatVotingPower = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return "0%";
    }
    return `${value.toFixed(2)}%`;
  };

  const formatApy = (apy?: number) => {
    if (apy === undefined || apy === null || Number.isNaN(apy)) return "N/A";
    return `${apy.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}%`;
  };

  const mergeStatus = (
    current?: string,
    next?: string
  ) => {
    if (!current) return next;
    if (!next) return current;

    // Higher score wins
    const priority: Record<string, number> = {
      inactive: 0,
      paused: 1,
      unstaking: 2,
      active: 3,
      healthy: 3, // fallback
      warning: 2,
      at_risk: 1,
    };

    const currentScore = priority[current.toLowerCase()] ?? 0;
    const nextScore = priority[next.toLowerCase()] ?? 0;

    return nextScore > currentScore ? next : current;
  };

  const aggregatedValidators = useMemo(() => {
    const byAddress = new Map<string, AggregatedValidator>();

    validators.forEach((validator) => {
      const chains =
        validator.chains && validator.chains.length > 0
          ? validator.chains
          : [validator.name];
      const votingPower = Number(validator.votingPower ?? 0);
      const apy = Number(validator.apy ?? 0);
      const uptimeValue = Number(validator.uptime ?? 0);
      const statusValue = validator.originalStatus || validator.status;
      const existing = byAddress.get(validator.address);

      if (existing) {
        const mergedChains = Array.from(
          new Set([...(existing.chains || []), ...chains])
        );

        existing.chains = mergedChains;
        existing.chainCount = mergedChains.length;
        existing.totalVotingPower += votingPower;
        existing.totalApy += apy;
        existing.entries += 1;
        existing.totalUptime += uptimeValue;
        existing.rawStatus = mergeStatus(existing.rawStatus, statusValue);
      } else {
        byAddress.set(validator.address, {
          ...validator,
          chains,
          chainCount: chains.length,
          totalVotingPower: votingPower,
          totalApy: apy,
          entries: 1,
          votingPowerAvg: votingPower,
          apyAvg: apy,
          totalUptime: uptimeValue,
          uptimeAvg: uptimeValue,
          rawStatus: statusValue,
        });
      }
    });

    return Array.from(byAddress.values())
      .map((validator) => ({
        ...validator,
        votingPowerAvg:
          validator.entries > 0
            ? validator.totalVotingPower / validator.entries
            : 0,
        apyAvg:
          validator.entries > 0 ? validator.totalApy / validator.entries : 0,
        uptimeAvg:
          validator.entries > 0 ? validator.totalUptime / validator.entries : 0,
        uptime:
          validator.entries > 0 ? validator.totalUptime / validator.entries : 0,
      }))
      .sort((a, b) => b.votingPowerAvg - a.votingPowerAvg);
  }, [validators]);

  const getChainAvatars = (
    chains: string[] | undefined,
    fallback: string,
    limit = 2
  ) => {
    if (!chains || chains.length === 0) return [fallback];
    return chains.slice(0, limit);
  };

  const getStatusAppearance = (status?: string) => {
    const normalized = (status || "").toLowerCase();
    if (normalized === "active") {
      return {
        classes:
          "bg-[#00a63d]/15 text-[#00a63d] border border-[#00a63d]/50",
        label: "active",
      };
    }
    if (normalized === "inactive") {
      return {
        classes: "bg-red-500/15 text-red-500 border border-red-500/50",
        label: "inactive",
      };
    }
    return {
      classes:
        "bg-yellow-500/15 text-yellow-500 border border-yellow-500/50",
      label: status || "unknown",
    };
  };

  return (
    <div className="card-like p-4">
      <div className="flex items-center justify-between leading-none mb-4 lg:pl-3">
        <h2 className="lg:text-xl text-lg font-bold text-white">
          Top Validators
        </h2>
        <LatestUpdated timeAgo="44 secs ago" />
      </div>

      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow appearance="plain">
              <TableHead className="pl-0 lg:pl-4">Rank</TableHead>
              <TableHead className="pl-0 lg:pl-4">Validator</TableHead>
              <TableHead className="pl-0 lg:pl-4">Chains</TableHead>
              <TableHead className="pl-0 lg:pl-4 text-right">
                Voting Power
              </TableHead>
              <TableHead className="pl-0 lg:pl-4 text-right">APY</TableHead>
              <TableHead className="pl-0 lg:pl-4 text-right">Uptime</TableHead>
              <TableHead className="pl-0 lg:pl-4 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aggregatedValidators.map((validator, index) => (
              <TableRow key={validator.address} appearance="plain">
                <TableCell className="pl-0 lg:pl-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 font-medium">
                    {index + 1}
                  </div>
                </TableCell>
                <TableCell className="pl-0 lg:pl-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span
                        className="w-10 h-10 inline-flex items-center justify-center border-2 border-background rounded-full bg-muted"
                        dangerouslySetInnerHTML={{
                          __html: canopyIconSvg(
                            getCanopyAccent(validator.name)
                          ),
                        }}
                      />
                      {validator.status && (
                        <div
                          className={cn(
                            "absolute -inset-1 rounded-full border-2 animate-pulse opacity-60",
                            validator.status === "healthy"
                              ? "border-[#00a63d]"
                              : validator.status === "warning"
                              ? "border-yellow-400/70"
                              : "border-red-500/70"
                          )}
                        />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{validator.name}</span>
                      <span className="text-xs text-muted-foreground font-mono truncate max-w-[220px]">
                        {validator.address}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="pl-0 lg:pl-4">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {getChainAvatars(validator.chains, validator.address).map(
                        (chain, chainIndex) => (
                          <span
                            key={`${validator.address}-${chain}-${chainIndex}`}
                            className="w-6 h-6 inline-flex items-center justify-center border-2 border-background rounded-full bg-muted"
                            dangerouslySetInnerHTML={{
                              __html: canopyIconSvg(
                                getCanopyAccent(`${chain}-${chainIndex}`)
                              ),
                            }}
                          />
                        )
                      )}
                    </div>
                    <span className="text-sm whitespace-nowrap">
                      +{validator.chainCount}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="pl-0 lg:pl-4 text-right">
                  <div className="font-medium inline-flex">
                    {formatVotingPower(validator.votingPowerAvg)}
                  </div>
                </TableCell>
                <TableCell className="pl-0 lg:pl-4 text-right">
                  <div className="font-medium inline-flex">
                    {formatApy(validator.apyAvg)}
                  </div>
                </TableCell>
                <TableCell className="pl-0 lg:pl-4 text-right">
                  <span
                    className={`inline-flex items-center justify-end gap-1 px-2 py-1 rounded-md font-medium ${getUptimeColor(
                      validator.uptime
                    )}`}
                  >
                    {validator.uptime.toFixed(1)}%
                    {validator.uptimeTrend && (
                      <UptimeTrend
                        data={validator.uptimeTrend}
                        color={getUptimeTextColor(validator.uptime)}
                      />
                    )}
                  </span>
                </TableCell>
                <TableCell className="pl-0 lg:pl-4 text-right">
                  {(() => {
                    const appearance = getStatusAppearance(
                      validator.rawStatus
                    );
                    return (
                      <span
                        className={cn(
                          "inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium",
                          appearance.classes
                        )}
                      >
                        {appearance.label}
                      </span>
                    );
                  })()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <Link href="/validators">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              View All Validators
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
