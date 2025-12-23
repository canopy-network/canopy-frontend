"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Box, X, ArrowRightLeft, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn, WINDOW_BREAKPOINTS } from "@/lib/utils";
import Link from "next/link";
import {
  searchExplorerEntities,
  ExplorerSearchResult,
  ExplorerTransactionSearchResult,
  ExplorerAddressSearchResult,
  type Transaction,
} from "@/lib/api/explorer";
import type { ExplorerBlockSearchResult } from "@/types/blocks";
import { CopyableText } from "@/components/ui/copyable-text";
import { EXPLORER_ICON_GLOW, canopyIconSvg, getCanopyAccent } from "@/lib/utils/brand";
import { useChainsStore } from "@/lib/stores/chains-store";

const DEBOUNCE_DELAY_MS = 400;

// Grouped search results by type
type GroupedSearchResults = {
  transactions: ExplorerSearchResult[];
  blocks: ExplorerSearchResult[];
  addresses: ExplorerSearchResult[];
};

export function ExplorerSearchBar({ className }: { className?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const getChainById = useChainsStore((state) => state.getChainById);
  const [searchResults, setSearchResults] = useState<GroupedSearchResults>({
    transactions: [],
    blocks: [],
    addresses: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Type guards
  const isTransactionResult = (result: ExplorerSearchResult): result is ExplorerTransactionSearchResult => {
    return result.type === "transaction";
  };

  const isBlockResult = (result: ExplorerSearchResult): result is ExplorerBlockSearchResult => {
    return result.type === "block";
  };

  const isAddressResult = (result: ExplorerSearchResult): result is ExplorerAddressSearchResult => {
    return result.type === "address";
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setDebouncedQuery("");
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, DEBOUNCE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults({ transactions: [], blocks: [], addresses: [] });
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    let isCancelled = false;
    const currentRequestId = ++requestIdRef.current;

    const fetchResults = async () => {
      setIsSearching(true);
      setSearchError(null);

      try {
        const response = await searchExplorerEntities(debouncedQuery);
        console.log("[ExplorerSearchBar] Search response:", response);
        console.log("[ExplorerSearchBar] Response type:", typeof response);
        console.log("[ExplorerSearchBar] Is array:", Array.isArray(response));
        console.log("[ExplorerSearchBar] Response length:", Array.isArray(response) ? response.length : "N/A");

        if (isCancelled || requestIdRef.current !== currentRequestId) {
          return;
        }

        // Group results by type
        const grouped: GroupedSearchResults = {
          transactions: [],
          blocks: [],
          addresses: [],
        };

        if (Array.isArray(response) && response.length > 0) {
          console.log("[ExplorerSearchBar] Response is array with length:", response.length);
          response.forEach((result, idx) => {
            console.log(`[ExplorerSearchBar] Processing result ${idx}:`, {
              type: result.type,
              typeValue: result.type,
              hasResult: !!result.result,
              resultKeys: result.result ? Object.keys(result.result) : [],
              fullResult: result,
            });

            // Normalize type to lowercase for comparison
            const normalizedType = String(result.type).toLowerCase().trim();
            console.log(`[ExplorerSearchBar] Normalized type: "${normalizedType}"`);

            if (normalizedType === "transaction") {
              console.log("[ExplorerSearchBar] Adding transaction result");
              grouped.transactions.push(result);
            } else if (normalizedType === "block") {
              console.log("[ExplorerSearchBar] Adding block result");
              grouped.blocks.push(result);
            } else if (normalizedType === "address") {
              console.log("[ExplorerSearchBar] Adding address result");
              grouped.addresses.push(result);
            } else {
              console.warn("[ExplorerSearchBar] Unknown result type:", result.type, "normalized:", normalizedType);
            }
          });
        } else {
          console.log("[ExplorerSearchBar] Response is not array or is empty:", {
            isArray: Array.isArray(response),
            length: Array.isArray(response) ? response.length : "N/A",
            response,
            responseString: JSON.stringify(response, null, 2),
          });
        }

        console.log("[ExplorerSearchBar] Grouped results:", grouped);
        console.log("[ExplorerSearchBar] Total grouped:", {
          transactions: grouped.transactions.length,
          blocks: grouped.blocks.length,
          addresses: grouped.addresses.length,
        });
        setSearchResults(grouped);
        setIsSearching(false);
      } catch (error) {
        console.error("[ExplorerSearchBar] Failed to search", error);

        if (!isCancelled && requestIdRef.current === currentRequestId) {
          setSearchError("Unable to fetch search results");
          setSearchResults({ transactions: [], blocks: [], addresses: [] });
          setIsSearching(false);
        }
      }
    };

    fetchResults();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  const formatTimestamp = (timestamp?: string | null) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  const truncateHash = (value: string, chars = 6) => {
    if (!value || value.length <= chars * 2) {
      return value;
    }

    return `${value.slice(0, chars)}…${value.slice(-chars)}`;
  };

  // Helper function to get chain name from chain_id
  const getChainName = (chainId: number): string => {
    const chain = getChainById(chainId.toString());
    return chain?.chain_name || `Chain ${chainId}`;
  };

  // Helper function to get chain color from chain_id
  const getChainColor = (chainId: number): string => {
    const chain = getChainById(chainId.toString());
    return chain?.brand_color || getCanopyAccent(chainId.toString());
  };

  const handleResultClick = () => {
    setSearchQuery("");
    setSearchResults({ transactions: [], blocks: [], addresses: [] });
    setDebouncedQuery("");
  };

  // Calculate total results count
  const totalResults = useMemo(() => {
    const total = searchResults.transactions.length + searchResults.blocks.length + searchResults.addresses.length;
    console.log("[ExplorerSearchBar] Total results:", total, {
      transactions: searchResults.transactions.length,
      blocks: searchResults.blocks.length,
      addresses: searchResults.addresses.length,
      isSearching,
      debouncedQuery,
    });
    return total;
  }, [searchResults, isSearching, debouncedQuery]);

  const shouldShowResults = !isSearching && debouncedQuery.length > 0;

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults({ transactions: [], blocks: [], addresses: [] });
    setDebouncedQuery("");
    setSearchError(null);
  };

  // Handle click outside to hide results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        shouldShowResults
      ) {
        setSearchResults({ transactions: [], blocks: [], addresses: [] });
      }
    };

    if (shouldShowResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [shouldShowResults]);

  return (
    <div className={cn("relative pr-0", className)} ref={searchContainerRef}>
      <div id="search-input-container" className="relative">
        <Search
          className={`absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400 pointer-events-none ${EXPLORER_ICON_GLOW}`}
        />
        <Input
          type="text"
          placeholder={
            typeof window !== "undefined" && window.innerWidth < WINDOW_BREAKPOINTS.LG
              ? "Search by address, tx hash..."
              : "Search by address, tx hash, block..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 lg:pl-12 pr-4 text-xs lg:text-sm py-5 lg:py-6 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-400  rounded-xl"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-white/5"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Loading indicator */}
        {isSearching && debouncedQuery && (
          <div className="absolute left-0 top-full mt-3 w-full z-20 bg-card p-4 rounded-xl border shadow-xl">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {searchError && !isSearching && (
          <div className="absolute left-0 top-full mt-3 w-full z-20 bg-card p-4 rounded-xl border shadow-xl">
            <div className="text-sm text-destructive">{searchError}</div>
          </div>
        )}

        {/* Search results */}
        {shouldShowResults && (
          <div
            className="absolute left-0 top-full mt-3 w-full z-20 bg-card rounded-xl border shadow-xl max-h-[600px] overflow-y-auto"
            id="search-results-container"
          >
            {/* Transactions Section */}
            {searchResults.transactions.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground uppercase font-medium">
                    Transactions ({searchResults.transactions.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {searchResults.transactions.map((result, index) => {
                    if (!isTransactionResult(result)) return null;
                    const tx: Transaction = result.result;
                    const chainId = result.chain_id;
                    const chainName = getChainName(chainId);
                    const chainColor = getChainColor(chainId);
                    return (
                      <Link
                        key={`tx-${index}-${tx.tx_hash}`}
                        href={`/transactions/${encodeURIComponent(tx.tx_hash)}`}
                        onClick={handleResultClick}
                        className="flex flex-row items-center justify-between gap-2 py-3 px-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer border-t border-border/50 first:border-t-0"
                      >
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                          dangerouslySetInnerHTML={{
                            __html: canopyIconSvg(chainColor),
                          }}
                        />
                        <div className="flex items-start ml-2 flex-col mr-auto min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground capitalize font-medium">
                              Block <span className="text-white">{tx.height}</span>
                            </span>
                            <span className="text-xs text-muted-foreground/50">•</span>
                            <span className="text-xs text-muted-foreground">{chainName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-white font-mono truncate max-w-[300px]">
                              {truncateHash(tx.tx_hash, 8)}
                            </p>
                            {tx.timestamp && (
                              <span className="text-xs text-muted-foreground/50 shrink-0">
                                {formatTimestamp(tx.timestamp)}
                              </span>
                            )}
                          </div>
                        </div>
                        {tx.message_type && (
                          <div className="text-xs font-medium text-muted-foreground flex flex-col items-end gap-1 shrink-0">
                            <span>TYPE</span>
                            <span className="text-xs text-white font-normal capitalize">{tx.message_type}</span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Blocks Section */}
            {searchResults.blocks.length > 0 && (
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Box className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground uppercase font-medium">
                    Blocks ({searchResults.blocks.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {searchResults.blocks.map((result, index) => {
                    if (!isBlockResult(result)) return null;
                    const block = result.result;
                    const chainId = result.chain_id;
                    const chainName = getChainName(chainId);
                    const chainColor = getChainColor(chainId);
                    const txCount = block.total_txs ?? 0;
                    return (
                      <Link
                        key={`block-${index}-${block.height}`}
                        href={`/blocks/${block.height}`}
                        onClick={handleResultClick}
                        className="flex flex-row items-center justify-between gap-2 py-3 px-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer border-t border-border/50 first:border-t-0"
                      >
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                          dangerouslySetInnerHTML={{
                            __html: canopyIconSvg(chainColor),
                          }}
                        />
                        <div className="flex items-start ml-2 flex-col mr-auto min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground capitalize font-medium">
                              Block <span className="text-white">#{block.height}</span>
                            </span>
                            <span className="text-xs text-muted-foreground/50">•</span>
                            <span className="text-xs text-muted-foreground">{chainName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-white font-mono truncate max-w-[300px]">
                              {truncateHash(block.hash, 8)}
                            </p>
                            {block.timestamp && (
                              <span className="text-xs text-muted-foreground/50 shrink-0">
                                {formatTimestamp(block.timestamp)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0 min-w-[120px]">
                          {block.proposer_address && (
                            <div className="text-xs text-muted-foreground/50 capitalize font-medium">Proposer</div>
                          )}
                          {block.proposer_address && (
                            <CopyableText
                              text={block.proposer_address}
                              truncate={truncateHash}
                              className="text-xs text-white font-mono"
                            />
                          )}
                          {txCount > 0 && <div className="text-xs text-muted-foreground mt-1">{txCount} txs</div>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Addresses Section */}
            {searchResults.addresses.length > 0 && (
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground uppercase font-medium">
                    Addresses ({searchResults.addresses.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {searchResults.addresses.map((result, index) => {
                    if (!isAddressResult(result)) return null;
                    const address = result.result;
                    const addressValue = address.address;
                    const chainId = result.chain_id;
                    const chainName = getChainName(chainId);
                    const chainColor = getChainColor(chainId);
                    // All addresses go to /accounts/{address} (not validators)
                    const href = `/accounts/${addressValue}`;

                    return (
                      <Link
                        key={`address-${index}-${addressValue}`}
                        href={href}
                        onClick={handleResultClick}
                        className="flex flex-row items-center justify-between gap-2 py-3 px-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer border-t border-border/50 first:border-t-0"
                      >
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                          dangerouslySetInnerHTML={{
                            __html: canopyIconSvg(chainColor),
                          }}
                        />
                        <div className="flex items-start ml-2 flex-col mr-auto min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-muted-foreground capitalize font-medium">Account</span>
                            <span className="text-xs text-muted-foreground/50">•</span>
                            <span className="text-xs text-muted-foreground">{chainName}</span>
                          </div>
                          <CopyableText
                            text={addressValue}
                            truncate={truncateHash}
                            className="text-sm text-white font-mono"
                          />
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {address.total_transactions !== undefined && (
                            <>
                              <span className="text-xs text-muted-foreground/50 capitalize font-medium">
                                Transactions
                              </span>
                              <span className="text-xs text-white font-normal">{address.total_transactions}</span>
                            </>
                          )}
                          {address.recent_txs && Array.isArray(address.recent_txs) && (
                            <span className="text-xs text-muted-foreground">{address.recent_txs.length} recent</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No results message */}
            {!isSearching && totalResults === 0 && debouncedQuery && !searchError && (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No results found for &quot;{debouncedQuery}&quot;</p>
                <p className="text-xs text-muted-foreground/50 mt-1">
                  Try searching by transaction hash, block height, or address
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
