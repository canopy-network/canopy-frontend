"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, Box, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { LiveStatusComponent } from "./live-status-component";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Validator {
  name: string;
  address: string;
  stake: string;
  apr: string;
  uptime: number;
  uptimeTrend?: number[]; // Array of uptime values for sparkline (7 or 30 data points)
  commissionRate?: number; // Commission rate percentage
  commissionChange?: number; // Change in commission rate (positive = increased, negative = decreased)
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

// Commission rate with change indicator
function CommissionRate({ rate, change }: { rate: number; change?: number }) {
  const hasChange = change !== undefined && change !== 0;
  const isIncrease = change && change > 0;

  return (
    <div className="inline-flex items-center gap-1">
      <span className="font-medium">{rate.toFixed(1)}%</span>
      {hasChange && (
        <span className={isIncrease ? "text-red-500" : "text-green-500"}>
          {isIncrease ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
        </span>
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
    if (status === "healthy") return "text-green-500";
    if (status === "warning") return "text-yellow-500";
    return "text-red-500";
  };

  const getStrokeColor = (status: "healthy" | "warning" | "at_risk") => {
    if (status === "healthy") return "stroke-green-500";
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
      color: "bg-green-500",
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
    if (uptime >= 99) return "bg-green-500/10 text-green-500";
    if (uptime >= 97) return "bg-yellow-500/10 text-yellow-500";
    return "bg-red-500/10 text-red-500";
  };

  // Get text color for sparkline
  const getUptimeTextColor = (uptime: number) => {
    if (uptime >= 99) return "text-green-500";
    if (uptime >= 97) return "text-yellow-500";
    return "text-red-500";
  };
  return (
    <div className="card-like p-4">
      <div className="flex items-center justify-between leading-none mb-4 lg:pl-3">
        <h2 className="text-xl font-bold text-white">Top Validators</h2>
        <div className="flex items-center gap-4">
          <LiveStatusComponent />
          <div className="flex items-center gap-2 text-muted-foreground text-sm bg-white/[0.05] rounded-lg px-4 py-2">
            <Box className="w-4 h-4" />
            <span>Latest update 44 secs ago</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {validators.map((validator, index) => (
          <div
            key={validator.address}
            className="rounded-xl px-4 py-3 bg-background hover:bg-background/75 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-medium">
                  {index + 1}
                </div>
                <div className="flex  flex-col">
                  <h4 className="text-base font-medium capitalize">
                    {validator.name}
                  </h4>

                  {validator.chains && validator.chains.length > 0 && (
                    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{validator.chains[0]}</span>
                      {validator.chains.length > 1 && (
                        <span className="px-1.5 py-0.5 bg-muted rounded-lg text-xs font-medium">
                          +{validator.chains.length - 1}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-medium">{validator.stake}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Stake
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{validator.apr}</div>
                  <div className="text-xs text-muted-foreground mt-1">APR</div>
                </div>
                {validator.commissionRate !== undefined && (
                  <div className="text-right">
                    <div className="font-medium">
                      <CommissionRate
                        rate={validator.commissionRate}
                        change={validator.commissionChange}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Commission
                    </div>
                  </div>
                )}
                <div className="text-right">
                  <span
                    className={`inline-flex items-center justify-end gap-1 px-1 rounded-md font-medium ${getUptimeColor(
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
                  <div
                    className={`rounded-md text-xs font-medium w-fit mt-1 ml-auto  text-muted-foreground`}
                  >
                    Uptime (Last 7d)
                  </div>
                </div>

                {/* Health/Status Indicator */}
                {validator.status && (
                  <HealthBadge
                    status={validator.status}
                    message={validator.statusMessage}
                    score={validator.healthScore}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
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
  );
}
