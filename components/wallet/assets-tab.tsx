"use client";

import { useState } from "react";
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
import { Search, ArrowUpDown, Coins } from "lucide-react";
import {formatBalanceWithCommas, formatTokenAmount} from "@/lib/utils/denomination";
import type { TokenBalance } from "@/types/wallet";
import { AssetItem } from "./asset-item";

interface AssetsTabProps {
  tokens: TokenBalance[];
  totalBalance: string;
  totalUSDValue: string;
}

export function AssetsTab({ tokens, totalBalance, totalUSDValue }: AssetsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<"chain" | "amount" | "price">("amount");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Filter tokens based on search
  const filteredTokens = tokens.filter((token) =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort tokens
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    let comparison = 0;

    switch (sortColumn) {
      case "chain":
        comparison = a.name.localeCompare(b.name);
        break;
      case "amount":
        comparison = parseFloat(a.balance) - parseFloat(b.balance);
        break;
      case "price":
        // Default sort by balance since we don't have price data yet
        comparison = parseFloat(a.balance) - parseFloat(b.balance);
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Portfolio Value Chart */}
      <Card className="p-2 px-2">
        <CardHeader className="p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">Estimated Balance</p>
          <CardTitle className="text-2xl sm:text-3xl lg:text-4xl break-all">{formatBalanceWithCommas(totalBalance)} CNPY</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">{totalUSDValue}</p>
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
                    <TableRow key={token.symbol} className="cursor-pointer hover:bg-muted/30">
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
                          {formatTokenAmount(token.balance)} {token.symbol}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="text-sm text-muted-foreground">--</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-medium">$0.00</p>
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
              <Card key={token.symbol} className="cursor-pointer hover:bg-muted/30 transition-colors p-2 px-2">
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
      <div className="space-y-2 sm:space-y-3">
        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground px-1">Detailed View</h3>
        {sortedTokens.map((token) => (
          <AssetItem key={token.symbol} token={token} />
        ))}
      </div>
    </div>
  );
}
