"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Plus, ArrowDownToLine } from "lucide-react";

export default function LpSummaryPanel({
  lpPositions = [],
  pools = [],
  portfolioData,
  onAddLiquidity,
  onViewHistory,
}) {
  // Use portfolio API data if available, otherwise fallback to calculated values
  const totalValue = portfolioData?.total_value_cnpy
    ? parseFloat(portfolioData.total_value_cnpy)
    : lpPositions.reduce((sum, p) => sum + p.valueUSD, 0);

  // Calculate total fees earned from P&L percentage
  // Fees earned = total value * (P&L percentage / 100)
  const pnlPercentage = portfolioData?.performance?.total_pnl_percentage || 0;
  const totalEarnings = totalValue * (pnlPercentage / 100);

  // Net APY is the total P&L percentage
  const netApy = pnlPercentage;

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        {/* Metrics */}
        <div className="space-y-6">
          {/* Total LP Value */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm text-muted-foreground">
                Total LP Value
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total value of all your LP positions</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold tracking-tight">
                {formatCurrency(totalValue)}
              </span>
              <span className="text-lg text-muted-foreground">
                CNPY{" "}
                {totalValue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Secondary Metrics Row */}
          <div className="flex items-center gap-8">
            {/* Total Fees Earned */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm text-muted-foreground">
                  Fees Earned
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total trading fees earned from providing liquidity</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span
                className={`text-xl font-semibold ${
                  totalEarnings >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {totalEarnings >= 0 ? "+" : ""}$
                {totalEarnings.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* Net APY */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm text-muted-foreground">Net APY</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Weighted average APY across all positions</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span
                className={`text-xl font-semibold ${
                  netApy >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {netApy >= 0 ? "+" : ""}
                {netApy.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button className="gap-2" onClick={onAddLiquidity}>
            <Plus className="w-4 h-4" />
            Add Liquidity
          </Button>
          <Button variant="outline" className="gap-2" onClick={onViewHistory}>
            <ArrowDownToLine className="w-4 h-4" />
            History
          </Button>
        </div>
      </div>
      <span>
        Right now the fees earned and net APY performance is 0 so we will have
        to use dummy data for now
      </span>
    </Card>
  );
}
