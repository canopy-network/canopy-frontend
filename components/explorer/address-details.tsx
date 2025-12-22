"use client";

import * as React from "react";
import Link from "next/link";
import { Upload, Heart } from "lucide-react";
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
import { useState } from "react";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChainId, setSelectedChainId] = useState<string>("0"); // "0" means "All Chains"

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

  // Prepare transactions for TableCard (before early returns to avoid hook order issues)
  const allTransactions = React.useMemo(() =>
    (transactions || []).flatMap((chainTxs) =>
      chainTxs.transactions.map((tx) => ({
        ...tx,
        chain_id: chainTxs.chain_id,
        chain_name: chainTxs.chain_name,
      }))
    ),
    [transactions]
  );

  // Filter transactions based on search query and selected chain
  const filteredTransactions = React.useMemo(() => {
    let filtered = allTransactions;

    // Filter by chain if a specific chain is selected
    if (selectedChainId && selectedChainId !== "0") {
      const chainIdNum = parseInt(selectedChainId, 10);
      filtered = filtered.filter((tx) => tx.chain_id === chainIdNum);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((tx) => {
        const chainName = getChainName(tx.chain_id).toLowerCase();
        const hash = tx.tx_hash?.toLowerCase() || "";
        const type = tx.type?.toLowerCase() || "";
        const to = tx.to?.toLowerCase() || "";
        const from = tx.from?.toLowerCase() || "";
        const height = tx.height?.toString() || "";
        const amount = tx.amount?.toString() || "";

        return (
          chainName.includes(query) ||
          hash.includes(query) ||
          type.includes(query) ||
          to.includes(query) ||
          from.includes(query) ||
          height.includes(query) ||
          amount.includes(query)
        );
      });
    }

    return filtered;
  }, [allTransactions, searchQuery, selectedChainId, getChainName]);

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

  // Calculate portfolio value in USD (use formatted value from API if available)
  const portfolioValueUSD = summary.total_portfolio_value_usd 
    ? summary.total_portfolio_value_usd 
    : parseFloat(summary.total_portfolio_value_fmt || "0");

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
    const usdValue = balance.balance_usd 
      ? balance.balance_usd 
      : parseFloat(balance.balance_usd_fmt?.replace(/,/g, "") || "0") || balanceValue; // Fallback to CNPY value if USD not available
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
      balanceUsdFmt: balance.balance_usd_fmt,
    };
  });

  const transactionRows = filteredTransactions.map((tx) => {
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
            Gas: {formatCNPY(tx.fee)} CNPY
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
              <CopyableText text={address} showFull={false} textClassName="text-sm text-muted-foreground hidden" />
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Portfolio Value */}
        <Card className="px-6">
          <div className="flex flex-col gap-2 justify-center items-start h-full">
            <p className="text-sm text-muted-foreground">Portfolio Value</p>
            <p className="text-2xl font-bold">
              ${summary.total_portfolio_value_usd_fmt || formatUSD(portfolioValueUSD)} USD
            </p>
            {summary.total_portfolio_value_fmt && (
              <p className="text-xs text-muted-foreground mt-1">
                {summary.total_portfolio_value_fmt} CNPY
              </p>
            )}
          </div>
        </Card>

        {/* 24h Change - Only show if we have real data */}
        {summary && summary.portfolio_change_24h_usd_fmt && (
          <Card className="px-6">
            <div className="flex flex-col gap-2 justify-center items-start h-full">
              <p className="text-sm text-muted-foreground mb-2">24h Change</p>
              <p className={`text-2xl font-bold ${
                (summary.portfolio_change_24h_usd || 0) >= 0 
                  ? "text-[#00a63d]" 
                  : "text-red-500"
              }`}>
                {summary.portfolio_change_24h_usd_fmt}
              </p>
              <p className={`text-xs mt-1 ${
                (summary.portfolio_change_24h_percent || 0) >= 0 
                  ? "text-[#00a63d]" 
                  : "text-red-500"
              }`}>
                {(summary.portfolio_change_24h_percent || 0) >= 0 ? "↑" : "↓"}
                {summary.portfolio_change_24h_percent_fmt || "0.00%"} last 24h
              </p>
            </div>
          </Card>
        )}

        {/* Staked vs Free */}
        <Card className="px-6 py-0">
          <div className="flex flex-col justify-center h-full gap-2">
            <p className="text-sm text-muted-foreground mb-2">Staked vs Free</p>
            <div className="relative flex flex-col h-2 bg-white/10 rounded-full mb-2">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* Donut Chart - Right side (4/12) */}
            <div className="lg:col-span-4">
              <Card className="p-3">
                <div className="relative h-56">
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
                              <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-lg z-999">
                                <p className="text-sm font-medium text-white mb-1">{name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {value.toFixed(2)}% • ${formatUSD(segmentValue)} USD
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                        wrapperStyle={{ zIndex: 9999 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {summary.total_portfolio_value_usd_fmt || formatUSD(portfolioValueUSD)}
                      </p>
                      <p className="text-sm text-muted-foreground">USD</p>
                    </div>
                  </div>
                </div>
                {/* Legend */}
                <div className="space-y-2 border border-white/10 p-4 rounded-lg">
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
            </div>

            {/* Token List Table - Left side (8/12) */}
            <div className="lg:col-span-8 h-full">
              <TableCard
                columns={[
                  { label: "#", width: "w-12" },
                  { label: "Token", width: "w-48" },
                  { label: "Balance", width: "w-32" },
                  { label: "USD Value", width: "w-32" },
                ]}
                live={false}
                rows={tokenList.map((token, idx) => [
                  <div key="index" className="text-sm text-muted-foreground flex items-center justify-start">
                    <div className="flex items-center justify-center bg-white/10 rounded-full h-8 w-8">
                      <span className="text-sm text-muted-foreground">
                        {idx + 1}
                      </span>
                    </div>
                  </div>,
                  <div key="token" className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      dangerouslySetInnerHTML={{
                        __html: canopyIconSvg(token.chainColor || getCanopyAccent(token.chainId.toString())),
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{token.token}</span>
                      <span className="text-xs text-muted-foreground">{token.chainName}</span>
                    </div>
                  </div>,
                  <span key="balance" className="text-sm text-white">
                    {formatCNPY(token.balance)} {token.token}
                  </span>,
                  <span key="usd" className="text-sm text-white text-right">
                    ${token.balanceUsdFmt || formatUSD(token.usdValue)}
                  </span>,
                ])}
                loading={loading}
                paginate={false}
                spacing={3}
                className="gap-2 lg:gap-6"
              />
            </div>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <TableCard
            title="Transactions"
            columns={transactionColumns}
            rows={transactionRows}
            loading={loading}
            paginate={false}
            live={false}
            pageSize={10}
            spacing={3}
            totalCount={filteredTransactions.length}
            searchPlaceholder="Search transactions..."
            searchValue={searchQuery}
            onSearch={setSearchQuery}
            showCSVButton={true}
            showChainSelect={true}
            chainSelectValue={selectedChainId}
            onChainSelectChange={setSelectedChainId}
            onCSVExport={() => {
              const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(filteredTransactions.map((tx) => [tx.chain_name, tx.tx_hash, tx.height, tx.type, tx.to, tx.timestamp, tx.amount, tx.fee].join(",")).join("\n"));
              const link = document.createElement("a");
              link.setAttribute("href", csvContent);
              link.setAttribute("download", "transactions.csv");
              link.click();
            }}
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
