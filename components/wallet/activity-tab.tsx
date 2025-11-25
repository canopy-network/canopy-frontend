"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, ArrowUpRight, ArrowDownLeft, X } from "lucide-react";
import { formatTokenAmount } from "@/lib/utils/denomination";
import type { WalletTransaction } from "@/types/wallet";
import { format } from "date-fns";

interface ActivityTabProps {
  transactions: WalletTransaction[];
  compact?: boolean;
}

export function ActivityTab({ transactions, compact = false }: ActivityTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const transactionTypes = ["send", "receive", "stake", "unstake", "swap"];
  const statusTypes = ["completed", "pending", "failed"];

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      !searchQuery ||
      tx.txHash?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(tx.type);

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(tx.status);

    return matchesSearch && matchesType && matchesStatus;
  });

  const hasActiveFilters = selectedTypes.length > 0 || selectedStatuses.length > 0;

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />;
      case "receive":
        return <ArrowDownLeft className="h-3 w-3 sm:h-4 sm:w-4" />;
      default:
        return <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "send":
        return "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400";
      case "receive":
        return "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
    }
  };

  const content = (
    <div className="space-y-3 sm:space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm sm:text-base h-10 sm:h-11"
          />
        </div>

        <div className="flex gap-2">
          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm h-10 sm:h-11">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Type</span>
                {selectedTypes.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {selectedTypes.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {transactionTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    setSelectedTypes(
                      checked
                        ? [...selectedTypes, type]
                        : selectedTypes.filter((t) => t !== type)
                    );
                  }}
                >
                  <span className="capitalize">{type}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm h-10 sm:h-11">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Status</span>
                {selectedStatuses.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {selectedStatuses.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {statusTypes.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={(checked) => {
                    setSelectedStatuses(
                      checked
                        ? [...selectedStatuses, status]
                        : selectedStatuses.filter((s) => s !== status)
                    );
                  }}
                >
                  <span className="capitalize">{status}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={resetFilters} className="h-10 w-10 sm:h-11 sm:w-11">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Card className="p-2 px-2">
          <CardContent className="text-center py-8 sm:py-12 px-4">
            <ArrowUpRight className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              {hasActiveFilters || searchQuery
                ? "No transactions found"
                : "No activity yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters || searchQuery
                ? "Try adjusting your filters or search"
                : "Your transaction history will appear here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredTransactions.map((tx) => (
            <Card key={tx.id} className="hover:bg-muted/30 transition-colors cursor-pointer px-2 py-2">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Details */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div
                      className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${getTransactionColor(
                        tx.type
                      )}`}
                    >
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium capitalize text-sm sm:text-base">{tx.type}</p>
                        <Badge variant={tx.status === "completed" ? "default" : "secondary"} className="text-xs">
                          {tx.status}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {tx.type === "send"
                          ? tx.to
                            ? `To ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`
                            : "Sent"
                          : tx.from
                            ? `From ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`
                            : "Received"}
                      </p>
                    </div>
                  </div>

                  {/* Amount and Date - Stacked on mobile, side by side on desktop */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                    {/* Amount */}
                    <div className="text-left sm:text-right">
                      <p className="font-medium text-sm sm:text-base">
                        {formatTokenAmount(tx.amount)} {tx.token}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">$0.00</p>
                    </div>

                    {/* Date */}
                    <div className="text-right sm:min-w-[100px]">
                      <p className="text-xs sm:text-sm text-muted-foreground">{tx.timestamp}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  if (compact) {
    return content;
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Transaction Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">{content}</CardContent>
    </Card>
  );
}
