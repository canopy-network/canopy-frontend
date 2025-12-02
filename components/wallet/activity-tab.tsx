"use client";

import { useState, useMemo } from "react";
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
import { Search, Filter, ArrowUpRight, ArrowDownLeft, X, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { formatTokenAmount } from "@/lib/utils/denomination";
import { format } from "date-fns";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityTabProps {
  addresses: string[];
  compact?: boolean;
}

export function ActivityTab({ addresses, compact = false }: ActivityTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const transactionTypes = ["send", "receive", "stake", "unstake", "swap", "claim"];
  const statusTypes = ["completed", "pending", "failed"];

  // Fetch transaction data from backend
  const {
    transactions,
    pendingTransactions,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoadingHistory,
    isLoadingPending,
    isLoading,
    isError,
    error,
    refetchAll,
  } = useTransactions(addresses, {
    enabled: addresses.length > 0,
    transactionTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
    historyLimit: 20,
  });

  // Combine pending and completed transactions and determine actual type
  const allTransactions = useMemo(() => {
    const combined = [...pendingTransactions, ...transactions];

    // Normalize addresses for comparison (remove 0x prefix if present)
    const normalizeAddress = (addr?: string) => addr?.toLowerCase().replace(/^0x/, '') || '';
    const userAddresses = addresses.map(normalizeAddress);

    // Map transactions and determine if they are sends or receives
    return combined.map((tx) => {
      const fromAddr = normalizeAddress(tx.from_address);
      const toAddr = normalizeAddress(tx.to_address);

      // Determine actual transaction direction
      let actualType = tx.type;
      if (tx.type === 'send') {
        // If user is the recipient, it's actually a receive
        if (userAddresses.includes(toAddr) && !userAddresses.includes(fromAddr)) {
          actualType = 'receive';
        }
        // If user is the sender, it remains send
        else if (userAddresses.includes(fromAddr)) {
          actualType = 'send';
        }
      }

      return {
        ...tx,
        actualType, // Store the calculated type
      };
    });
  }, [pendingTransactions, transactions, addresses]);

  // Client-side filtering (search and status)
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      const matchesSearch =
        !searchQuery ||
        tx.hash?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.to_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.from_address?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(tx.status);

      return matchesSearch && matchesStatus;
    });
  }, [allTransactions, searchQuery, selectedStatuses]);

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy HH:mm");
    } catch {
      return timestamp;
    }
  };

  // Format amount from uCNPY to CNPY
  const formatAmount = (amount?: string) => {
    if (!amount) return "0";
    const cnpy = parseFloat(amount) / 1_000_000;
    return formatTokenAmount(cnpy.toString());
  };

  // Loading state
  if (isLoading && addresses.length > 0) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Skeleton className="h-10 sm:h-11 flex-1" />
          <Skeleton className="h-10 sm:h-11 w-24" />
          <Skeleton className="h-10 sm:h-11 w-24" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20" />
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
          <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-destructive opacity-50" />
          <p className="text-sm text-destructive mb-2">Error loading transactions</p>
          <p className="text-xs text-muted-foreground mb-4">
            {error?.message || "Failed to fetch transaction history"}
          </p>
          <Button onClick={() => refetchAll()} variant="outline" size="sm">
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Empty state (no addresses)
  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
          <ArrowUpRight className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
            No wallet connected
          </p>
          <p className="text-xs text-muted-foreground">
            Connect a wallet to view transaction history
          </p>
        </CardContent>
      </Card>
    );
  }

  const content = (
    <div className="space-y-3 sm:space-y-4">
      {/* Pending Transactions Badge */}
      {pendingTransactions.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
          <p className="text-sm text-orange-500">
            {pendingTransactions.length} pending transaction{pendingTransactions.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

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
        <>
          <div className="space-y-2 sm:space-y-3">
            {filteredTransactions.map((tx) => (
              <Card key={tx.hash} className="hover:bg-muted/30 transition-colors cursor-pointer px-2 py-2">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Details */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div
                        className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${getTransactionColor(
                          tx.actualType
                        )}`}
                      >
                        {getTransactionIcon(tx.actualType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium capitalize text-sm sm:text-base">
                            {tx.actualType}
                          </p>
                          <Badge variant={getStatusBadgeVariant(tx.status)} className="text-xs">
                            {tx.status}
                          </Badge>
                          {tx.status === "pending" && (
                            <Loader2 className="h-3 w-3 animate-spin text-orange-500" />
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {tx.actualType === "send"
                            ? tx.to_address
                              ? `To ${formatAddress(tx.to_address)}`
                              : "Sent"
                            : tx.from_address
                              ? `From ${formatAddress(tx.from_address)}`
                              : "Received"}
                        </p>
                        {tx.chain_name && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Chain: {tx.chain_name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amount and Date */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                      {/* Amount */}
                      <div className="text-left sm:text-right">
                        <p className={`font-medium text-sm sm:text-base ${
                          tx.actualType === 'receive' ? 'text-green-500' :
                          tx.actualType === 'send' ? 'text-red-500' : ''
                        }`}>
                          {tx.actualType === 'receive' ? '+' : tx.actualType === 'send' ? '-' : ''}
                          {formatAmount(tx.amount)} CNPY
                        </p>
                        {tx.amount_usd && (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            ${parseFloat(tx.amount_usd).toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Date */}
                      <div className="text-right sm:min-w-[140px]">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {formatTimestamp(tx.timestamp)}
                        </p>
                        {tx.block_height && (
                          <p className="text-xs text-muted-foreground">
                            Block {tx.block_height}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="gap-2"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Load more
                  </>
                )}
              </Button>
            </div>
          )}
        </>
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
