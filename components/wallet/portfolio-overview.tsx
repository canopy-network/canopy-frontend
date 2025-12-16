"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { portfolioApi } from "@/lib/api/portfolio";
import type { PortfolioOverviewResponse, PortfolioPerformanceResponse } from "@/types/wallet";

interface PortfolioOverviewProps {
  addresses: string[];
}

export function PortfolioOverview({ addresses }: PortfolioOverviewProps) {
  const [overview, setOverview] = useState<PortfolioOverviewResponse | null>(null);
  const [performance, setPerformance] = useState<PortfolioPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (addresses.length === 0) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewData, perfData] = await Promise.all([
          portfolioApi.getPortfolioOverview({ addresses }),
          portfolioApi.getPortfolioPerformance({ addresses, period: "7d" })
        ]);

        setOverview(overviewData);
        setPerformance(perfData);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch portfolio data:", err);
        setError(err.message || "Failed to load portfolio data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [addresses.join(",")]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted/50 animate-pulse rounded-lg" />
        <div className="h-20 bg-muted/50 animate-pulse rounded-lg" />
        <div className="h-64 bg-muted/50 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive mb-2">Error loading portfolio</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!overview || !performance) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No portfolio data available</p>
        </CardContent>
      </Card>
    );
  }

  // Format numbers
  const formatCNPY = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num / 1000000);
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(2);
  };

  const accountTotals = overview.accounts.reduce(
    (acc, account) => {
      const liquid = parseFloat(account.balance ?? account.available_balance ?? "0");
      const staked = parseFloat(account.staked_balance ?? "0");
      const delegated = parseFloat(account.delegated_balance ?? "0");
      const chainId = account.chain_id;
      const chainKey = Number(chainId);

      const totalForAccount = liquid + staked + delegated;
      acc.total += totalForAccount;
      acc.staked += staked + delegated;
      acc.liquid += liquid;

      if (!acc.byChain.has(chainKey)) {
        acc.byChain.set(chainKey, {
          chain_id: chainId,
          chain_name: account.chain_name || `Chain ${chainId}`,
          token_symbol: account.token_symbol,
          total: 0,
          staked: 0,
          liquid: 0,
        });
      }
      const chainEntry = acc.byChain.get(chainKey)!;
      chainEntry.total += totalForAccount;
      chainEntry.staked += staked + delegated;
      chainEntry.liquid += liquid;

      return acc;
    },
    {
      total: 0,
      staked: 0,
      liquid: 0,
      byChain: new Map<number, { chain_id: number; chain_name: string; token_symbol: string; total: number; staked: number; liquid: number }>(),
    }
  );

  const totalValue = formatCNPY(accountTotals.total);
  const pnlValue = formatCNPY(performance.total_pnl_cnpy);
  const pnlPercentage = overview.performance.total_pnl_percentage || 0;
  const isPositivePnL = overview.performance.total_pnl_percentage >= 0;

  return (
    <div className="space-y-4">
      {/* Hero - Total Balance & P&L */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Total Portfolio Value</div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold">{totalValue}</div>
                <div className="text-lg text-muted-foreground">CNPY</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-1">7-Day P&L</div>
              <div className="flex items-center justify-end gap-1.5">
                <div className={cn(
                  "text-xl font-semibold",
                  isPositivePnL ? "text-green-500" : "text-red-500"
                )}>
                  {isPositivePnL ? "+" : ""}{pnlValue}
                </div>
                {isPositivePnL ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className={cn("text-xs text-muted-foreground mt-1", isPositivePnL ? "text-green-500" : "text-red-500")}>
                {isPositivePnL ? "+" : ""}{formatPercentage(pnlPercentage)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics - Unified */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            {/* APY & Yield Earnings */}
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-3xl font-bold text-green-500">
                  {overview.yield.blended_apy}%
                </div>
                <div className="text-xs text-muted-foreground">APY</div>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCNPY(performance.yield_earnings.total_yield_cnpy)} CNPY earned
              </div>
            </div>

            {/* Staked vs Liquid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">
                  {formatCNPY(accountTotals.staked)} CNPY
                </div>
                <div className="text-sm font-medium">
                  {formatCNPY(accountTotals.liquid)} CNPY
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                <div
                  className="bg-primary"
                  style={{ width: `${accountTotals.total ? (accountTotals.staked / accountTotals.total) * 100 : 0}%` }}
                />
                <div
                  className="bg-blue-500"
                  style={{ width: `${accountTotals.total ? (accountTotals.liquid / accountTotals.total) * 100 : 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="text-xs text-muted-foreground">
                  {formatPercentage(accountTotals.total ? (accountTotals.staked / accountTotals.total) * 100 : 0)}% Staked
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPercentage(accountTotals.total ? (accountTotals.liquid / accountTotals.total) * 100 : 0)}% Liquid
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Distribution - Unified Assets & Chains */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Portfolio Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from(accountTotals.byChain.values()).map((chain) => {
            const chainAccounts = overview.accounts.filter(acc => acc.chain_id === chain.chain_id);
            const chainPercentage = accountTotals.total ? (chain.total / accountTotals.total) * 100 : 0;

            return (
              <div key={chain.chain_id} className="space-y-2">
                {/* Chain Summary Row */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold",
                      chain.chain_id === 1 ? "bg-primary/20 text-primary" : "bg-blue-500/20 text-blue-500"
                    )}>
                      {chain.token_symbol.slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{chain.chain_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {chainAccounts.length} {chainAccounts.length === 1 ? 'account' : 'accounts'}
                        {chain.staked > 0 && ` · ${formatCNPY(chain.staked)} staked`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCNPY(chain.total)} CNPY
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPercentage(chainPercentage)}% of portfolio
                      </div>
                    </div>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          chain.chain_id === 1 ? "bg-primary" : "bg-blue-500"
                        )}
                        style={{ width: `${chainPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Account Details - Nested */}
                {chainAccounts.length > 1 && (
                  <div className="pl-14 space-y-1">
                    {chainAccounts.map((account) => (
                      <div
                        key={account.address}
                        className="flex items-center justify-between py-1.5 text-sm"
                      >
                        <div className="text-muted-foreground truncate">
                          {account.address.slice(0, 8)}...{account.address.slice(-6)}
                        </div>
                        <div className="text-right">
                          <span className="font-medium">
                            {formatCNPY(account.balance)} {account.token_symbol}
                          </span>
                          {parseFloat(account.staked_balance) + parseFloat(account.delegated_balance)> 0 && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({formatCNPY(parseFloat(account.staked_balance) + parseFloat(account.delegated_balance))} staked)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
