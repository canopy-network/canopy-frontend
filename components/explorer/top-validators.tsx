"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { LiveStatusComponent } from "./live-status-component";
import { LatestUpdated } from "./latest-updated";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface Validator {
  name: string;
  address: string;
  stake: string;
  apr: string;
  uptime: number;
  uptimeTrend?: number[]; // Array of uptime values for sparkline (7 or 30 data points)
  healthScore?: number; // Performance score 0-100
  status?: "healthy" | "warning" | "at_risk"; // Health status
  statusMessage?: string; // Tooltip message
  chains?: string[]; // Array of chain names the validator is staking for
}

interface TopValidatorsProps {
  validators: Validator[];
}

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

// Radial progress ring component
function RadialProgress({
  score,
  status,
}: {
  score: number;
  status?: "healthy" | "warning" | "at_risk";
}) {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Use status if provided, otherwise determine from score
  const getStatusFromScore = (
    score: number
  ): "healthy" | "warning" | "at_risk" => {
    if (score >= 100) return "healthy";
    if (score >= 60) return "warning";
    return "at_risk";
  };

  const effectiveStatus = status || getStatusFromScore(score);

  const getColor = (status: "healthy" | "warning" | "at_risk") => {
    if (status === "healthy") return "text-[#7cff9d]";
    if (status === "warning") return "text-yellow-500";
    return "text-red-500";
  };

  const getStrokeColor = (status: "healthy" | "warning" | "at_risk") => {
    if (status === "healthy") return "stroke-[#36d26a]";
    if (status === "warning") return "stroke-yellow-500";
    return "stroke-red-500";
  };

  return (
    <div className="relative w-8 h-8">
      <svg className="transform -rotate-90 w-8 h-8">
        {/* Background circle */}
        <circle
          cx="16"
          cy="16"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx="16"
          cy="16"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={getStrokeColor(effectiveStatus)}
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`text-[10px] font-medium ${getColor(effectiveStatus)}`}
        >
          {Math.round(score)}
        </span>
      </div>
    </div>
  );
}

// Health status badge
function HealthBadge({
  status,
  message,
  score,
}: {
  status: "healthy" | "warning" | "at_risk";
  message?: string;
  score?: number;
}) {
  const statusConfig = {
    healthy: {
      color: "bg-[#36d26a]",
      label: "Healthy",
      defaultMessage: "Healthy — no missed blocks in the last 24h",
    },
    warning: {
      color: "bg-yellow-500",
      label: "Warning",
      defaultMessage: "Warning — some missed blocks detected",
    },
    at_risk: {
      color: "bg-red-500",
      label: "At Risk",
      defaultMessage: "At risk — multiple missed blocks or slashing detected",
    },
  };

  const config = statusConfig[status];
  const tooltipMessage = message || config.defaultMessage;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            {/* Pulse dot */}
            <div className="relative">
              <div
                className={`w-2 h-2 rounded-full ${config.color} animate-pulse`}
              />
              <div
                className={`absolute inset-0 w-2 h-2 rounded-full ${config.color} opacity-75 animate-ping`}
              />
            </div>
            {/* Radial progress if score provided */}
            {score !== undefined && (
              <RadialProgress score={score} status={status} />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="font-medium">{config.label}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {tooltipMessage}
          </div>
          {score !== undefined && (
            <div className="text-xs text-muted-foreground mt-1">
              Performance score: {Math.round(score)}/100
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function TopValidators({ validators }: TopValidatorsProps) {
  // Determine uptime color based on percentage
  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99)
      return "bg-[#36d26a]/10 text-[#7cff9d] border border-[#36d26a]/50";
    if (uptime >= 97) return "bg-yellow-500/10 text-yellow-500";
    return "bg-red-500/10 text-red-500";
  };

  // Get text color for sparkline
  const getUptimeTextColor = (uptime: number) => {
    if (uptime >= 99) return "text-[#7cff9d]";
    if (uptime >= 97) return "text-yellow-500";
    return "text-red-500";
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
              <TableHead className="pl-0 lg:pl-4">Chain</TableHead>
              <TableHead className="pl-0 lg:pl-4">Stake</TableHead>
              <TableHead className="pl-0 lg:pl-4">APR</TableHead>
              <TableHead className="pl-0 lg:pl-4">Uptime</TableHead>
              <TableHead className="pl-0 lg:pl-4 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validators.map((validator, index) => (
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
                          __html: canopyIconSvg(getCanopyAccent(validator.name)),
                        }}
                      />
                      {validator.status && (
                        <div
                          className={cn(
                            "absolute -inset-1 rounded-full border-2 animate-pulse opacity-60",
                            validator.status === "healthy"
                              ? "border-[#36d26a]"
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
                    <span
                      className="w-8 h-8 inline-flex items-center justify-center border-2 border-background rounded-full bg-muted"
                      dangerouslySetInnerHTML={{
                        __html: canopyIconSvg(
                          getCanopyAccent(
                            validator.chains?.[0] || validator.name
                          )
                        ),
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {validator.chains?.[0] || "—"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="pl-0 lg:pl-4">
                  <div className="font-medium">{validator.stake}</div>
                </TableCell>
                <TableCell className="pl-0 lg:pl-4">
                  <div className="font-medium">{validator.apr}</div>
                </TableCell>
                <TableCell className="pl-0 lg:pl-4">
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
                  {validator.status && (
                    <HealthBadge
                      status={validator.status}
                      message={validator.statusMessage}
                      score={validator.healthScore}
                    />
                  )}
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
