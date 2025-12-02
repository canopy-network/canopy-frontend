"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowUpDown, Coins, Loader2 } from "lucide-react";
import { formatBalanceWithCommas, formatTokenAmount } from "@/lib/utils/denomination";
import { usePortfolio } from "@/lib/hooks/use-portfolio";
import { AssetItem } from "./asset-item";
import { Skeleton } from "@/components/ui/skeleton";

interface AssetsTabProps {
  addresses: string[];
}

export function AssetsTab({ addresses }: AssetsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<"chain" | "amount" | "price">("amount");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch portfolio data from backend
  const {
    overview,
    balances,
    isLoading,
    isError,
    error,
    refetchAll,
  } = usePortfolio(addresses, {
    enabled: addresses.length > 0,
    refetchInterval: 60000, // Refresh every minute
  });

  // Transform backend data to token format for compatibility
  const tokens = useMemo(() => {
    if (!balances?.balances) return [];

    return balances.balances.map((balance) => ({
      symbol: balance.token_symbol,
      name: balance.chain_name,
      balance: balance.liquid_balance,
      usdValue: balance.balance_usd ? `$${parseFloat(balance.balance_usd).toFixed(2)}` : undefined,
      chainId: balance.chain_id,
      // Additional data for detailed view
      stakedBalance: balance.staked_balance,
      delegatedBalance: balance.delegated_balance,
      lpPositions: balance.lp_positions,
    }));
  }, [balances]);

  // Filter tokens based on search
  const filteredTokens = useMemo(() => {
    return tokens.filter((token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tokens, searchQuery]);

  // Sort tokens
  const sortedTokens = useMemo(() => {
    return [...filteredTokens].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case "chain":
          comparison = a.name.localeCompare(b.name);
          break;
        case "amount":
          comparison = parseFloat(a.balance) - parseFloat(b.balance);
          break;
        case "price":
          const priceA = a.usdValue ? parseFloat(a.usdValue.replace('$', '')) : 0;
          const priceB = b.usdValue ? parseFloat(b.usdValue.replace('$', '')) : 0;
          comparison = priceA - priceB;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredTokens, sortColumn, sortDirection]);

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // Format total balance from backend
  const totalBalance = overview?.total_value_cnpy
    ? (parseFloat(overview.total_value_cnpy) / 1_000_000).toFixed(2)
    : "0.00";

  const totalUSDValue = overview?.total_value_usd
    ? `≈ $${parseFloat(overview.total_value_usd).toFixed(2)}`
    : "≈ $0.00";

  const change24h = overview?.performance?.total_pnl_percentage ?? 0;

  // Loading state
  if (isLoading && addresses.length > 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="p-2 px-2">
          <CardHeader className="p-4 sm:p-6">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
        </Card>
        <Skeleton className="h-11 w-full" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
          <p className="text-sm text-destructive mb-2">Error loading portfolio</p>
          <p className="text-xs text-muted-foreground mb-4">
            {error?.message || "Failed to fetch portfolio data"}
          </p>
          <button
            onClick={() => refetchAll()}
            className="text-xs text-primary hover:underline"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  // Empty state (no addresses)
  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
          <Coins className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
            No wallet connected
          </p>
          <p className="text-xs text-muted-foreground">
            Connect a wallet to view your assets
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Portfolio Value Chart */}
      <Card className="p-2 px-2">
        <CardHeader className="p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">Estimated Balance</p>
          <CardTitle className="text-2xl sm:text-3xl lg:text-4xl break-all">
            {/*TODO: This balance should be returning from the backend as micro*/}
            {Number(totalBalance).toLocaleString()} CNPY
          </CardTitle>
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm text-muted-foreground">{totalUSDValue}</p>
            {change24h !== 0 && (
              <span className={`text-xs ${change24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change24h > 0 ? '+' : ''}{change24h.toFixed(2)}%
              </span>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by chain name or symbol..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 text-sm sm:text-base h-10 sm:h-11"
        />
      </div>

      {/* Assets Table - Desktop */}
      {sortedTokens.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
            <Coins className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              {searchQuery ? "No assets found" : "No assets yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? "Try a different search term"
                : "Get started by receiving tokens to your wallet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden md:block p-2 px-2">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("chain")}
                    >
                      <div className="flex items-center gap-2">
                        Chain
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 text-right"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        Amount
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">24H Change</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 text-right"
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        Price
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTokens.map((token) => (
                    <TableRow key={`${token.chainId}-${token.symbol}`} className="cursor-pointer hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary">
                              {token.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{token.symbol}</p>
                            <p className="text-sm text-muted-foreground truncate">{token.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-medium">{token.usdValue || "$0.00"}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatBalanceWithCommas(token.balance)} {token.symbol}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="text-sm text-muted-foreground">--</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-medium">{token.usdValue || "$0.00"}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {sortedTokens.map((token) => (
              <Card key={`${token.chainId}-${token.symbol}`} className="cursor-pointer hover:bg-muted/30 transition-colors p-2 px-2">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {token.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate text-sm">{token.symbol}</p>
                        <p className="text-xs text-muted-foreground truncate">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-sm">{token.usdValue || "$0.00"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTokenAmount(token.balance)} {token.symbol}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Assets with Distribution (Original Design) */}
      {sortedTokens.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground px-1">Detailed View</h3>
          {sortedTokens.map((token) => (
            <AssetItem
              key={`${token.chainId}-${token.symbol}`}
              token={{
                symbol: token.symbol,
                name: token.name,
                balance: token.balance,
                usdValue: token.usdValue,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
