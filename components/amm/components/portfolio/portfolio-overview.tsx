"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Lock, Users2 } from "lucide-react";
import { PortfolioOverviewResponse } from "../types/api/portfolio";

interface PortfolioOverviewProps {
  data: PortfolioOverviewResponse;
}

export function PortfolioOverview({ data }: PortfolioOverviewProps) {
  const formatUSD = (value: string | undefined) => {
    if (!value) return "N/A";
    const numValue = parseFloat(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  const isPnLPositive = data.performance.total_pnl_percentage >= 0;
  const PnLIcon = isPnLPositive ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">
                {formatUSD(data.total_value_usd)}
              </p>
              <p className="text-xs text-muted-foreground">
                {parseFloat(data.total_value_cnpy).toLocaleString()} CNPY
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total P&L</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">
                  {formatUSD(data.performance.total_pnl_usd)}
                </p>
              </div>
              <div
                className={`flex items-center gap-1 text-xs ${isPnLPositive ? "text-green-500" : "text-red-500"}`}
              >
                <PnLIcon className="h-3 w-3" />
                <span>
                  {isPnLPositive ? "+" : ""}
                  {data.performance.total_pnl_percentage.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Accounts</p>
              <p className="text-2xl font-bold">{data.accounts.length}</p>
              <p className="text-xs text-muted-foreground">
                {data.allocation.by_chain.length} chains
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium">
                {new Date(data.last_updated).toLocaleTimeString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(data.last_updated).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Asset Allocation</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full p-2 bg-blue-500/10">
                      <Wallet className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Liquid</p>
                      <p className="text-xs text-muted-foreground">
                        {formatUSD(data.allocation.by_type.liquid.value_usd)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {data.allocation.by_type.liquid.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full p-2 bg-purple-500/10">
                      <Lock className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Staked</p>
                      <p className="text-xs text-muted-foreground">
                        {formatUSD(data.allocation.by_type.staked.value_usd)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {data.allocation.by_type.staked.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full p-2 bg-orange-500/10">
                      <Users2 className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Delegated</p>
                      <p className="text-xs text-muted-foreground">
                        {formatUSD(data.allocation.by_type.delegated.value_usd)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {data.allocation.by_type.delegated.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Chain Distribution</h4>
              <div className="space-y-3">
                {data.allocation.by_chain.map((chain) => (
                  <div key={chain.chain_id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{chain.chain_name}</p>
                      <p className="text-sm font-medium">
                        {chain.percentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {formatUSD(chain.total_value_usd)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {parseFloat(chain.total_value_cnpy).toLocaleString()} CNPY
                      </p>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${chain.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
