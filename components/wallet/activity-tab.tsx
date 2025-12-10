"use client";

import {useEffect, useMemo, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Command, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowDown,
  Check,
  ChevronDown,
  Loader2,
  Search,
  X
} from "lucide-react";
import {formatTokenAmount} from "@/lib/utils/denomination";
import {format} from "date-fns";
import {useTransactions} from "@/lib/hooks/use-transactions";
import {Skeleton} from "@/components/ui/skeleton";
import {chainsApi} from "@/lib/api";
import {Chain} from "@/types/chains";
import {cn} from "@/lib/utils";
import {Calendar} from "@/components/ui/calendar";
import {Input} from "@/components/ui/input";

interface ActivityTabProps {
  addresses: string[];
  compact?: boolean;
  showSearchInput?: boolean;
  showDateFilter?: boolean;
}

export function ActivityTab({
  addresses,
  compact = false,
  showSearchInput = true,
  showDateFilter = true,
}: ActivityTabProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedChainIds, setSelectedChainIds] = useState<number[]>([]);
  const [chainSearchQuery, setChainSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chains, setChains] = useState<Chain[]>([]);
  const [isLoadingChains, setIsLoadingChains] = useState(false);
  const [chainPopoverOpen, setChainPopoverOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [draftDateRange, setDraftDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const effectiveDateRange = showDateFilter ? dateRange : {};

  const transactionTypes = ["send", "receive", "stake", "unstake", "swap", "claim"];
  const statusTypes = ["completed", "pending", "failed"];
  const apiTransactionTypes = useMemo(() => {
    if (selectedTypes.length === 0) return undefined;

    // Include "send" when user selects "receive" to capture incoming sends that normalize to receives
    if (selectedTypes.includes("receive") && !selectedTypes.includes("send")) {
      return [...selectedTypes, "send"];
    }

    return selectedTypes;
  }, [selectedTypes]);

  // Fetch chains with search and debounce
  useEffect(() => {
    const fetchChains = async () => {
      try {
        setIsLoadingChains(true);

        const result = await chainsApi.getChains({
          filter: chainSearchQuery || undefined,
          limit: 50,
          // Don't filter by status - show all chains including drafted, active, and graduated
        });

        setChains(result.data || []);
      } catch (error) {
        console.error("[Chain Filter] Failed to fetch chains:", error);
        setChains([]); // Set empty array on error
      } finally {
        setIsLoadingChains(false);
      }
    };

    // Debounce: wait 300ms after user stops typing
    const debounceTimer = setTimeout(() => {
      fetchChains();
    }, 300);

    // Cleanup function to cancel the timer if the user keeps typing
    return () => clearTimeout(debounceTimer);
  }, [chainSearchQuery]);

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
    transactionTypes: apiTransactionTypes,
    chainIds: selectedChainIds.length > 0 ? selectedChainIds : undefined,
    startDate: effectiveDateRange.from ? effectiveDateRange.from.toISOString() : undefined,
    endDate: effectiveDateRange.to ? effectiveDateRange.to.toISOString() : undefined,
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

  // Client-side filtering (search, status, type)
  const filteredTransactions = useMemo(() => {
    const query = showSearchInput ? searchQuery.trim().toLowerCase() : "";

    return allTransactions.filter((tx) => {
      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(tx.status);
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(tx.actualType);
      const matchesSearch =
        !query ||
        tx.hash?.toLowerCase().includes(query) ||
        tx.from_address?.toLowerCase().includes(query) ||
        tx.to_address?.toLowerCase().includes(query);

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [allTransactions, selectedStatuses, selectedTypes, searchQuery, showSearchInput]);

  const dateSelections = showDateFilter
    ? [dateRange.from, dateRange.to].filter(Boolean).length
    : 0;

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedChainIds.length > 0 ||
    (showDateFilter && (dateRange.from !== undefined || dateRange.to !== undefined)) ||
    (showSearchInput && searchQuery.trim().length > 0);

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedChainIds([]);
    setChainSearchQuery("");
    setDateRange({});
    setDraftDateRange({});
    setSearchQuery("");
  };

  const dateLabel = useMemo(() => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`;
    }
    if (dateRange.from) {
      return `From ${format(dateRange.from, "MMM d")}`;
    }
    if (dateRange.to) {
      return `To ${format(dateRange.to, "MMM d")}`;
    }
    return "Date";
  }, [dateRange.from, dateRange.to]);

  const handleDatePopoverChange = (open: boolean) => {
    setDatePopoverOpen(open);
    if (open) {
      setDraftDateRange(dateRange);
    }
  };

  const handleClearDateRange = () => {
    setDraftDateRange({});
    setDateRange({});
    setDatePopoverOpen(false);
  };

  const handleApplyDateRange = () => {
    setDateRange(draftDateRange);
    setDatePopoverOpen(false);
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

  const chainColorPalette = [
    "bg-blue-100 text-blue-700",
    "bg-amber-100 text-amber-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-rose-100 text-rose-700",
    "bg-indigo-100 text-indigo-700",
    "bg-cyan-100 text-cyan-700",
  ];

  const getChainInitial = (tx: any) => {
    const source = tx.chain_name || tx.token_symbol || tx.type || "C";
    return source.slice(0, 1).toUpperCase();
  };

  const getChainColor = (tx: any) => {
    const source = tx.chain_name || tx.token_symbol || "chain";
    const hash = source.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return chainColorPalette[hash % chainColorPalette.length];
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "confirmed":
        return "graduated";
      case "pending":
        return "secondary";
      case "failed":
        return "rejected";
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
      <div className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {showSearchInput && (
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search hash or address"
                  className="pl-9 h-10 sm:h-11"
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm h-10 sm:h-11 rounded-full">
                  <span className="hidden sm:inline">Type</span>
                  <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4" />

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
                <Button variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm h-10 sm:h-11 rounded-full">
                  <span className="hidden sm:inline">Status</span>
                  <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4" />

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

            {/* Chain Filter */}
            <Popover open={chainPopoverOpen} onOpenChange={setChainPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm h-10 sm:h-11 rounded-full">
                  <span className="hidden sm:inline">Asset</span>
                  <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4" />

                  {selectedChainIds.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {selectedChainIds.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="end">
                <Command>
                  <CommandInput
                    placeholder="Search by name or symbol..."
                    value={chainSearchQuery}
                    onValueChange={setChainSearchQuery}
                  />
                  <CommandList>
                    {isLoadingChains ? (
                      <div className="p-4 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching chains...
                      </div>
                    ) : chains.length === 0 ? (
                      <div className="p-4 text-sm text-center">
                        <p className="text-muted-foreground">
                          {chainSearchQuery ? `No chains found for "${chainSearchQuery}"` : "No chains available"}
                        </p>
                        {chainSearchQuery && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Try searching by chain name or token symbol
                          </p>
                        )}
                      </div>
                    ) : (
                      <CommandGroup>
                        {chains.map((chain) => {
                          const isSelected = selectedChainIds.includes(Number(chain.chain_id));
                          return (
                            <CommandItem
                              key={chain.id}
                              onSelect={() => {
                                setSelectedChainIds(
                                  isSelected
                                    ? selectedChainIds.filter((id) => id !== Number(chain.chain_id))
                                    : [...selectedChainIds, Number(chain.chain_id)]
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-medium truncate">{chain.token_name || chain.chain_name}</span>
                                <span className="text-xs text-muted-foreground truncate">{chain.token_symbol}</span>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Date Filter */}
            {showDateFilter && (
              <Popover open={datePopoverOpen} onOpenChange={handleDatePopoverChange}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm h-10 sm:h-11 rounded-full">
                    <span className="max-w-[120px] truncate">{dateLabel}</span>
                    <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    {dateSelections > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {dateSelections}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] sm:w-[560px] p-0" align="end">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">From Date</p>
                      <Calendar
                        mode="single"
                        selected={draftDateRange.from}
                        onSelect={(date) =>
                          setDraftDateRange((prev) => ({ ...prev, from: date || undefined }))
                        }
                        disabled={(date) =>
                          date > new Date() || (draftDateRange.to ? date > draftDateRange.to : false)
                        }
                        initialFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">To Date</p>
                      <Calendar
                        mode="single"
                        selected={draftDateRange.to}
                        onSelect={(date) =>
                          setDraftDateRange((prev) => ({ ...prev, to: date || undefined }))
                        }
                        disabled={(date) =>
                          date > new Date() || (draftDateRange.from ? date < draftDateRange.from : false)
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={handleClearDateRange} className="h-9">
                      Clear
                    </Button>
                    <Button size="sm" onClick={handleApplyDateRange} className="h-9">
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Reset Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={resetFilters} className="h-10 w-10 sm:h-11 sm:w-11">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Card className="p-2 px-2">
          <CardContent className="text-center py-8 sm:py-12 px-4">
            <ArrowUpRight className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              {hasActiveFilters
                ? "No transactions found"
                : "No activity yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting your filters or search"
                : "Your transaction history will appear here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2 sm:space-y-3">
            {filteredTransactions.map((tx) => (
              <Card
                key={tx.hash}
                className="hover:bg-muted/30 transition-colors cursor-pointer px-2 py-2"
              >
                <CardContent className={cn("p-3 sm:p-4", compact && "p-3")}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
                    {/* Details */}
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <div
                        className={cn(
                          "w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0 font-semibold",
                          getChainColor(tx)
                        )}
                      >
                        {getChainInitial(tx)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm sm:text-base truncate">
                            {(tx.actualType === "receive" ? "Received" : "Sent")}{" "}
                            {tx.token_symbol || tx.chain_name || "asset"}
                          </p>
                          <Badge variant={getStatusBadgeVariant(tx.status)} className="text-xs capitalize">
                            {tx.status}
                          </Badge>
                          {tx.status === "pending" && (
                            <Loader2 className="h-3 w-3 animate-spin text-orange-500" />
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {tx.chain_name || "Unknown chain"}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {tx.actualType === "send"
                            ? tx.to_address
                              ? `To ${formatAddress(tx.to_address)}`
                              : "Sent"
                            : tx.from_address
                              ? `From ${formatAddress(tx.from_address)}`
                              : "Received"}
                        </p>
                      </div>
                    </div>

                    {/* Amount and Date */}
                    <div className="flex flex-col sm:items-end gap-1 sm:gap-2 text-left sm:text-right w-full sm:w-auto">
                      {/* Amount */}
                      <div className="flex-1 sm:flex-none min-w-[140px]">
                        <p className={`font-medium text-sm sm:text-base ${
                          tx.actualType === 'receive' ? 'text-green-500' :
                          tx.actualType === 'send' ? 'text-red-500' : ''
                        }`}>
                          {tx.actualType === 'receive' ? '+' : tx.actualType === 'send' ? '-' : ''}
                          {formatAmount(tx.amount)} {tx.token_symbol}
                        </p>
                        {tx.amount_usd && (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            ${parseFloat(tx.amount_usd).toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Date */}
                      <div className="flex-1 sm:flex-none min-w-[120px] sm:min-w-[140px] text-muted-foreground">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {formatTimestamp(tx.timestamp)}
                        </p>

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
