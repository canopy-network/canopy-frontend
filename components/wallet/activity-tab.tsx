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
        return <ArrowUpRight className="h-4 w-4" />;
      case "receive":
        return <ArrowDownLeft className="h-4 w-4" />;
      default:
        return <ArrowUpRight className="h-4 w-4" />;
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
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Type
              {selectedTypes.length > 0 && (
                <Badge variant="secondary" className="ml-1">
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
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Status
              {selectedStatuses.length > 0 && (
                <Badge variant="secondary" className="ml-1">
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
          <Button variant="ghost" size="icon" onClick={resetFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ArrowUpRight className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground mb-2">
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
        <div className="space-y-2">
          {filteredTransactions.map((tx) => (
            <Card key={tx.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Details */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`p-2 rounded-full flex-shrink-0 ${getTransactionColor(
                        tx.type
                      )}`}
                    >
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium capitalize">{tx.type}</p>
                        <Badge variant={tx.status === "completed" ? "default" : "secondary"}>
                          {tx.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {tx.type === "send"
                          ? tx.to
                            ? `To ${tx.to.slice(0, 10)}...${tx.to.slice(-8)}`
                            : "Sent"
                          : tx.from
                          ? `From ${tx.from.slice(0, 10)}...${tx.from.slice(-8)}`
                          : "Received"}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium">
                      {formatTokenAmount(tx.amount)} {tx.token}
                    </p>
                    <p className="text-sm text-muted-foreground">$0.00</p>
                  </div>

                  {/* Date */}
                  <div className="text-right flex-shrink-0 min-w-[100px]">
                    <p className="text-sm text-muted-foreground">{tx.timestamp}</p>
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
      <CardHeader>
        <CardTitle>Transaction Activity</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
