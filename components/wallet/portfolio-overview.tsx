"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Coins, PieChart, Percent } from "lucide-react";
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
      console.log("PortfolioOverview: No addresses provided");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("PortfolioOverview: Fetching data for addresses:", addresses);

        // Fetch overview and performance in parallel
        const [overviewData, perfData] = await Promise.all([
          portfolioApi.getPortfolioOverview({ addresses }),
          portfolioApi.getPortfolioPerformance({ addresses, period: "7d" })
        ]);

        console.log("Overview data:", overviewData);
        console.log("Performance data:", perfData);

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
        <div className="h-48 bg-muted/50 animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive mb-2">Error loading portfolio</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-4">Check the console for more details</p>
        </CardContent>
      </Card>
    );
  }

  if (!overview || !performance) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-2">No portfolio data available</p>
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
    }).format(num / 1000000); // Convert to millions for display
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(2);
  };

  const totalValue = formatCNPY(overview.total_value_cnpy);
  const pnlValue = formatCNPY(performance.total_pnl_cnpy);
  const pnlPercentage = performance.total_pnl_percentage || 0;
  const isPositivePnL = parseFloat(performance.total_pnl_cnpy) >= 0;

  return (
    <div className="space-y-6">
      {/* Hero Section - Total Balance & PnL */}
      <Card className="border-2 bg-gradient-to-br from-background to-muted/20">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Total Balance */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">Total Portfolio Value</div>
              <div className="flex items-baseline gap-2">
                <div className="text-5xl font-bold tracking-tight">{totalValue}</div>
                <div className="text-2xl text-muted-foreground font-medium">CNPY</div>
              </div>
            </div>

            {/* PnL Section */}
            <div className="flex items-center gap-6 pt-4 border-t">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">7-Day P&L</div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "text-2xl font-semibold",
                    isPositivePnL ? "text-green-500" : "text-red-500"
                  )}>
                    {isPositivePnL ? "+" : ""}{pnlValue} CNPY
                  </div>
                  {isPositivePnL ? (
                    <ArrowUpRight className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>

              {pnlPercentage !== 0 && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">Change</div>
                  <div className={cn(
                    "text-2xl font-semibold",
                    isPositivePnL ? "text-green-500" : "text-red-500"
                  )}>
                    {isPositivePnL ? "+" : ""}{formatPercentage(pnlPercentage)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2  gap-3 sm:gap-4">
        {/* Yield Earnings */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Yield APY</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-2xl sm:text-3xl font-bold text-green-500 truncate">
              {overview.yield.blended_apy}%
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {formatCNPY(performance.yield_earnings.total_yield_cnpy)} CNPY earned
            </div>
          </CardContent>
        </Card>

        {/* Staked Balance */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Staked</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-2xl sm:text-3xl font-bold truncate">
              {formatCNPY(overview.allocation.by_type.staked.value_cnpy)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {formatPercentage(overview.allocation.by_type.staked.percentage)}% of portfolio
            </div>
          </CardContent>
        </Card>

        {/* Liquid Balance */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <PieChart className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Liquid</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-2xl sm:text-3xl font-bold truncate">
              {formatCNPY(overview.allocation.by_type.liquid.value_cnpy)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {formatPercentage(overview.allocation.by_type.liquid.percentage)}% of portfolio
            </div>
          </CardContent>
        </Card>

        {/* Net Flow */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Net Flow (7d)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-2xl sm:text-3xl font-bold truncate">
              {formatCNPY(performance.transactions_summary.net_flow_cnpy)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              In: {formatCNPY(performance.transactions_summary.total_inflows_cnpy)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chain Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assets by Chain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overview.allocation.by_chain.map((chain: any) => (
              <div key={chain.chain_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                      chain.chain_id === 1 ? "bg-primary/20 text-primary" : "bg-blue-500/20 text-blue-500"
                    )}>
                      {chain.token_symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold">{chain.chain_name}</div>
                      <div className="text-sm text-muted-foreground">{chain.token_symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCNPY(chain.total_value_cnpy)} CNPY</div>
                    <div className="text-sm text-muted-foreground">
                      {formatPercentage(chain.percentage)}%
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      chain.chain_id === 1 ? "bg-primary" : "bg-blue-500"
                    )}
                    style={{ width: `${chain.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overview.accounts.map((account: any) => (
              <div
                key={`${account.chain_id}-${account.address}`}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    account.chain_id === 1 ? "bg-primary/20 text-primary" : "bg-blue-500/20 text-blue-500"
                  )}>
                    {account.token_symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{account.chain_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {formatCNPY(account.balance)} {account.token_symbol}
                  </div>
                  {parseFloat(account.staked_balance) > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {formatCNPY(account.staked_balance)} staked
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}