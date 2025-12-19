"use client";

import * as React from "react";
import Link from "next/link";
import { Upload, Heart, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExplorerAddress } from "@/lib/api/explorer";
import { CopyableText } from "../ui/copyable-text";
import { TableCard } from "./table-card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getCanopyAccent, canopyIconSvg } from "@/lib/utils/brand";
import { chainsApi } from "@/lib/api/chains";
import type { Chain } from "@/types/chains";

// Format time ago from timestamp (e.g., "204d ago")
const formatTimeAgo = (timestamp: string): string => {
  const now = Date.now();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(seconds / 86400);
  return `${days}d ago`;
};

// Format address (truncate middle)
const formatAddress = (address: string, startChars = 6, endChars = 6): string => {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}…${address.slice(-endChars)}`;
};

// Format CNPY amount
const formatCNPY = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : amount;
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  } else if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toFixed(2);
};

// Format USD amount
const formatUSD = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : amount;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Format timestamp to "1 min ago"
const formatTimeAgoShort = (timestamp: string): string => {
  const now = Date.now();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(seconds / 86400);
  return `${days}d ago`;
};

interface AddressDetailsProps {
  address: string;
}

export function AddressDetails({ address }: AddressDetailsProps) {
  const { data: addressData, isLoading: loading, error: queryError } = useExplorerAddress(address, true, 20);
  
  // States for chain information
  const [chainNames, setChainNames] = React.useState<Record<number, string>>({});
  const [chainColors, setChainColors] = React.useState<Record<number, string>>({});
  const [chainTokens, setChainTokens] = React.useState<Record<number, string>>({}); // token_symbol for each chain

  // Memoize balances and transactions to avoid dependency issues
  const balances = React.useMemo(() => addressData?.balances || [], [addressData?.balances]);
  const transactions = React.useMemo(() => addressData?.transactions || [], [addressData?.transactions]);

  // Fetch chain info for transactions
  React.useEffect(() => {
    const fetchChainInfo = async () => {
      if (!transactions || transactions.length === 0) return;

      const uniqueChainIds = Array.from(
        new Set(transactions.flatMap((chainTxs) => chainTxs.transactions.map(() => chainTxs.chain_id)))
      );

      const names: Record<number, string> = {};
      const colors: Record<number, string> = {};

      await Promise.all(
        uniqueChainIds.map(async (chainId) => {
          try {
            const response = await chainsApi.getChain(chainId.toString()).catch(() => null);
            if (response?.data) {
              const chainData = response.data as Chain;
              names[chainId] = chainData.chain_name || `Chain ${chainId}`;
              colors[chainId] = chainData.brand_color || getCanopyAccent(chainId.toString());
            } else {
              names[chainId] = `Chain ${chainId}`;
              colors[chainId] = getCanopyAccent(chainId.toString());
            }
          } catch (error) {
            console.error(`Failed to fetch chain ${chainId}:`, error);
            names[chainId] = `Chain ${chainId}`;
            colors[chainId] = getCanopyAccent(chainId.toString());
          }
        })
      );

      setChainNames((prev) => ({ ...prev, ...names }));
      setChainColors((prev) => ({ ...prev, ...colors }));
    };

    fetchChainInfo();
  }, [transactions]);

  // Fetch chain info for balances (to get token_symbol)
  React.useEffect(() => {
    const fetchBalanceChainInfo = async () => {
      if (!balances || balances.length === 0) return;

      const names: Record<number, string> = {};
      const colors: Record<number, string> = {};
      const tokens: Record<number, string> = {};

      await Promise.all(
        balances.map(async (balance) => {
          const chainId = balance.chain_id;
          try {
            const response = await chainsApi.getChain(chainId.toString()).catch(() => null);
            if (response?.data) {
              const chainData = response.data as Chain;
              names[chainId] = chainData.chain_name || `Chain ${chainId}`;
              colors[chainId] = chainData.brand_color || getCanopyAccent(chainId.toString());
              tokens[chainId] = chainData.token_symbol || "CNPY";
            } else {
              names[chainId] = `Chain ${chainId}`;
              colors[chainId] = getCanopyAccent(chainId.toString());
              tokens[chainId] = "CNPY";
            }
          } catch (error) {
            console.error(`Failed to fetch chain ${chainId}:`, error);
            names[chainId] = `Chain ${chainId}`;
            colors[chainId] = getCanopyAccent(chainId.toString());
            tokens[chainId] = "CNPY";
          }
        })
      );

      setChainNames((prev) => ({ ...prev, ...names }));
      setChainColors((prev) => ({ ...prev, ...colors }));
      setChainTokens((prev) => ({ ...prev, ...tokens }));
    };

    fetchBalanceChainInfo();
  }, [balances]);

  // Helper functions
  const getChainName = React.useCallback(
    (chainId: number): string => {
      return chainNames[chainId] || `Chain ${chainId}`;
    },
    [chainNames]
  );

  const getChainColor = React.useCallback(
    (chainId: number): string => {
      return chainColors[chainId] || getCanopyAccent(chainId.toString());
    },
    [chainColors]
  );

  const getChainToken = React.useCallback(
    (chainId: number): string => {
      return chainTokens[chainId] || "CNPY";
    },
    [chainTokens]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">Loading account...</span>
      </div>
    );
  }

  if (queryError || !addressData) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-medium text-destructive mb-1">
          {queryError ? "Failed to load account details" : "Account not found"}
        </p>
      </div>
    );
  }

  const summary = addressData.summary;
  
  // Only use real LP positions data
  const lpPositions = addressData.lp_positions || [];

  // Calculate portfolio value in USD (assuming 1 CNPY = 1 USD for now)
  const portfolioValueUSD = parseFloat(summary.total_portfolio_value_fmt || "0");

  // Calculate staked vs free percentages
  const totalValue = summary.total_portfolio_value_cnpy;
  const stakedPercent = totalValue > 0 ? (summary.staked_balance_cnpy / totalValue) * 100 : 0;
  const freePercent = totalValue > 0 ? (summary.liquid_balance_cnpy / totalValue) * 100 : 0;

  // Get account creation date (from first balance or mock)
  const accountCreationDate = balances.length > 0 
    ? balances[0].updated_at 
    : new Date().toISOString();
  const createdAgo = formatTimeAgo(accountCreationDate);

  // Prepare portfolio chart data from balances
  const chartColors = ["#F472B6", "#00a63d", "#38BDF8", "#FBBF24", "#C084FC"];
  const portfolioChartData = balances.map((balance, idx) => {
    const percentage = totalValue > 0 ? (balance.balance / totalValue) * 100 : 0;
    const chainColor = getChainColor(balance.chain_id);
    const chainName = getChainName(balance.chain_id);
    return {
      name: chainName,
      value: percentage,
      color: chainColor || chartColors[idx % chartColors.length],
    };
  });

  // Add "Other" if there are more assets
  if (summary.lp_balance_cnpy > 0 || summary.staked_balance_cnpy > 0) {
    const otherValue = summary.lp_balance_cnpy + summary.staked_balance_cnpy;
    const otherPercent = totalValue > 0 ? (otherValue / totalValue) * 100 : 0;
    if (otherPercent > 0) {
      portfolioChartData.push({
        name: "Other",
        value: otherPercent,
        color: chartColors[portfolioChartData.length % chartColors.length],
      });
    }
  }

  // Prepare token list for Portfolio tab
  const tokenList = balances.map((balance, idx) => {
    const balanceValue = parseFloat(balance.balance_fmt || "0");
    const usdValue = balanceValue; // Assuming 1 CNPY = 1 USD
    const tokenSymbol = getChainToken(balance.chain_id);
    const chainName = getChainName(balance.chain_id);
    const chainColor = getChainColor(balance.chain_id);
    return {
      id: idx + 1,
      chainId: balance.chain_id,
      chainName,
      chainColor,
      token: tokenSymbol,
      balance: balanceValue,
      usdValue,
    };
  });

  // Prepare transactions for TableCard
  const allTransactions = transactions.flatMap((chainTxs) =>
    chainTxs.transactions.map((tx) => ({
      ...tx,
      chain_id: chainTxs.chain_id,
      chain_name: chainTxs.chain_name,
    }))
  );

  const transactionRows = allTransactions.map((tx) => {
    const chainName = getChainName(tx.chain_id);
    const chainColor = getChainColor(tx.chain_id);
    
    return [
    <div key="chain" className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        dangerouslySetInnerHTML={{
          __html: canopyIconSvg(chainColor),
        }}
      />
      <Link
        href={`/chains/${tx.chain_id}/transactions`}
        className="flex flex-col hover:text-primary transition-colors"
      >
        <span className="font-medium text-white text-sm">{chainName}</span>
      </Link>
    </div>,
    <Link
      key="hash"
      href={`/transactions/${encodeURIComponent(tx.tx_hash)}`}
      className="text-sm font-mono text-primary hover:underline"
    >
      {formatAddress(tx.tx_hash, 6, 4)}
    </Link>,
    <Link
      key="height"
      href={`/blocks/${tx.height}`}
      className="text-sm hover:text-primary"
    >
      {tx.height.toLocaleString()}
    </Link>,
    <span key="method" className="text-sm">{tx.type || "Transfer"}</span>,
    <span key="to" className="text-sm font-mono text-muted-foreground">
      {formatAddress(tx.to, 5, 5)}
    </span>,
    <span key="time" className="text-sm text-muted-foreground">
      {formatTimeAgoShort(tx.timestamp)}
    </span>,
    <div key="amount" className="flex flex-col items-end">
      <span className="text-sm text-[#00a63d] font-medium">
        {formatCNPY(tx.amount)} CNPY
      </span>
      {tx.fee > 0 && (
        <span className="text-xs text-muted-foreground">
          {formatCNPY(tx.fee)} CNPY
        </span>
      )}
    </div>,
    ];
  });

  const transactionColumns = [
    { label: "Chain Name" },
    { label: "Hash" },
    { label: "Block Height" },
    { label: "Method" },
    { label: "To" },
    { label: "Time" },
    { label: "Amount" },
  ];

  // Prepare LP positions rows for TableCard
  const lpPositionColumns = [
    { label: "Chain Name" },
    { label: "Pool ID" },
    { label: "Points" },
    { label: "Share %" },
    { label: "Estimated Value" },
    { label: "Height" },
    { label: "Time" },
  ];

  const lpPositionRows = lpPositions.map((lp) => [
    <span key="chain" className="text-sm">{lp.chain_name}</span>,
    <span key="pool" className="text-sm font-mono">{lp.pool_id}</span>,
    <span key="points" className="text-sm">{lp.points.toLocaleString()}</span>,
    <span key="share" className="text-sm">{lp.share_percentage.toFixed(2)}%</span>,
    <span key="value" className="text-sm text-[#00a63d]">
      {lp.estimated_value_fmt || formatCNPY(lp.estimated_value_cnpy)} CNPY
    </span>,
    <span key="height" className="text-sm">{lp.height.toLocaleString()}</span>,
    <span key="time" className="text-sm text-muted-foreground">
      {formatTimeAgoShort(lp.updated_at)}
    </span>,
  ]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/explorer" className="hover:text-white transition-colors">
          Explorer
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white">Account {formatAddress(address, 5, 5)}</span>
      </div>

      {/* Account Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0 bg-white/10 border border-white/20"
            dangerouslySetInnerHTML={{
              __html: canopyIconSvg(getCanopyAccent(address)),
            }}
          />
          <div>
            <h1 className="text-2xl font-bold mb-1">Account</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-mono">
                {formatAddress(address, 5, 5)}
              </span>
              <CopyableText text={address} showFull={false} textClassName="text-sm text-muted-foreground" />
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">created {createdAgo}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Upload className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Portfolio Value */}
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Portfolio Value</p>
          <p className="text-2xl font-bold">${formatUSD(portfolioValueUSD)} USD</p>
        </Card>

        {/* Staked vs Free */}
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Staked vs Free</p>
          <div className="relative h-2 bg-white/10 rounded-full mb-2">
            <div
              className="absolute left-0 top-0 h-full bg-[#00a63d] rounded-full"
              style={{ width: `${stakedPercent}%` }}
            />
            <div
              className="absolute left-0 top-0 h-full bg-white/20 rounded-full"
              style={{ width: `${freePercent}%`, left: `${stakedPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#00a63d]">Staked: {stakedPercent.toFixed(0)}%</span>
            <span className="text-muted-foreground">Free: {freePercent.toFixed(0)}%</span>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="w-fit bg-transparent p-0 h-auto gap-0">
          <TabsTrigger
            value="portfolio"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#00a63d] data-[state=active]:text-white data-[state=active]:bg-transparent rounded-md px-4 py-2"
          >
            Portfolio
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#00a63d] data-[state=active]:text-white data-[state=active]:bg-transparent rounded-md px-4 py-2"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="positions"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#00a63d] data-[state=active]:text-white data-[state=active]:bg-transparent rounded-md px-4 py-2"
          >
            LP Positions
          </TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart */}
            <Card className="p-6">
              <div className="relative h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {portfolioChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0];
                          const name = data.name || "";
                          const value = data.value || 0;
                          const totalValue = portfolioValueUSD;
                          const segmentValue = (value / 100) * totalValue;
                          return (
                            <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-lg">
                              <p className="text-sm font-medium text-white mb-1">{name}</p>
                              <p className="text-xs text-muted-foreground">
                                {value.toFixed(2)}% • ${formatUSD(segmentValue)} USD
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {formatUSD(portfolioValueUSD)}
                    </p>
                    <p className="text-sm text-muted-foreground">USD</p>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="space-y-2">
                {portfolioChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Token List */}
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-sm text-muted-foreground pb-2">#</th>
                      <th className="text-left text-sm text-muted-foreground pb-2">Token</th>
                      <th className="text-left text-sm text-muted-foreground pb-2">Balance</th>
                      <th className="text-right text-sm text-muted-foreground pb-2">USD Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokenList.map((token) => (
                      <tr key={token.id} className="border-b border-border">
                        <td className="py-3 text-sm">{token.id}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                              dangerouslySetInnerHTML={{
                                __html: canopyIconSvg(token.chainColor || getCanopyAccent(token.chainId.toString())),
                              }}
                            />
                            <span className="text-sm font-medium">{token.token}</span>
                          </div>
                        </td>
                        <td className="py-3 text-sm">{formatCNPY(token.balance)} {token.token}</td>
                        <td className="py-3 text-sm text-right">${formatUSD(token.usdValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <TableCard
            title="Transactions"
            columns={transactionColumns}
            rows={transactionRows}
            loading={loading}
            paginate={true}
            pageSize={10}
            totalCount={allTransactions.length}
            searchPlaceholder="Search transactions..."
          />
        </TabsContent>

        {/* LP Positions Tab */}
        <TabsContent value="positions" className="space-y-6">
          <TableCard
            title="LP Positions"
            columns={lpPositionColumns}
            rows={lpPositionRows}
            loading={loading}
            paginate={lpPositions.length > 10}
            pageSize={10}
            totalCount={lpPositions.length}
            searchPlaceholder="Search LP positions..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
