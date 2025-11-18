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
import { formatTokenAmount } from "@/lib/utils/denomination";
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
    <div className="space-y-6">
      {/* Portfolio Value Chart */}
      <Card>
        <CardHeader>
          <p className="text-sm text-muted-foreground">Estimated Balance</p>
          <CardTitle className="text-4xl">{formatTokenAmount(totalBalance)} CNPY</CardTitle>
          <p className="text-sm text-muted-foreground">{totalUSDValue}</p>
        </CardHeader>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by chain name or symbol..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Assets Table */}
      {sortedTokens.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground mb-2">
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
        <Card>
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
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {token.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{token.symbol}</p>
                        <p className="text-sm text-muted-foreground">{token.name}</p>
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
        </Card>
      )}

      {/* Assets with Distribution (Original Design) */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Detailed View</h3>
        {sortedTokens.map((token) => (
          <AssetItem key={token.symbol} token={token} />
        ))}
      </div>
    </div>
  );
}
