"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Box, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn, WINDOW_BREAKPOINTS } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useChainsStore } from "@/lib/stores/chains-store";
import { CommandSearchTrigger } from "@/components/command-search-trigger";
import Link from "next/link";
import {
  searchExplorerEntities,
  ExplorerSearchResult,
} from "@/lib/api/explorer";
import { CopyableText } from "@/components/ui/copyable-text";

type ExplorerChainOption = {
  id: string | number;
  chain_name: string;
};

const DEFAULT_CHAIN: ExplorerChainOption = {
  id: 0,
  chain_name: "Canopy",
};

const DEBOUNCE_DELAY_MS = 400;

export function ExplorerSearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    results: any[];
  }>({ type: "", results: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [selectedChain, setSelectedChain] =
    useState<ExplorerChainOption | null>(DEFAULT_CHAIN);

  const getChainById = useChainsStore((state) => state.getChainById);

  const handleChainSelect = (chain: ExplorerChainOption) => {
    setSelectedChain(chain);
    const params = new URLSearchParams(searchParams.toString());
    params.set("chain", chain.id.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Initialize selected chain from URL
  useEffect(() => {
    const chainId = searchParams.get("chain");

    if (!chainId) {
      setSelectedChain(DEFAULT_CHAIN);
      return;
    }

    const chain = getChainById(chainId);

    if (chain) {
      setSelectedChain({
        id: chain.id,
        chain_name: chain.chain_name,
      });
    } else {
      setSelectedChain(DEFAULT_CHAIN);
    }
  }, [searchParams, getChainById]);

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
      setSearchResults({ type: "", results: [] });
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

        setIsSearching(false);

        if (isCancelled || requestIdRef.current !== currentRequestId) {
          return;
        }

        const result_type = response[0]?.type;

        if (result_type && response.length > 0 && response[0].result) {
          switch (result_type) {
            case "address":
              const address_data = response[0].result;

              const address = {
                address: address_data.address,
                total_transactions: address_data.total_transactions,
                recent_txs: address_data.recent_txs,
              };

              setSearchResults({ type: "address", results: [address] });

              break;
            case "transaction":
              const transaction_data = response[0].result;

              const transaction = {
                height: transaction_data.height,
                hash: transaction_data.tx_hash,
                timestamp: formatTimestamp(transaction_data.timestamp),
                message_type: transaction_data.message_type,
                signer: transaction_data.signer,
              };

              setSearchResults({ type: "transaction", results: [transaction] });

              break;
            case "block":
              const block_data = response[0].result;

              const block = {
                height: block_data.height,
                hash: block_data.hash,
                timestamp: formatTimestamp(block_data.timestamp),
                proposer_address: block_data.proposer_address,
                num_txs: block_data.num_txs,
                num_events: block_data.num_events,
                total_fees: block_data.total_fees,
              };

              setSearchResults({ type: "block", results: [block] });
              break;
          }
        }

        // setSearchResults(
        //   response.map((item) => ({ type: item.type, results: [item.result] }))
        // );
      } catch (error) {
        console.error("[ExplorerSearchBar] Failed to search", error);

        if (!isCancelled && requestIdRef.current === currentRequestId) {
          setSearchError("Unable to fetch search results");
          // setSearchResults([{ type: "", results: [] }]);
        }
      } finally {
        if (!isCancelled && requestIdRef.current === currentRequestId) {
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

  const handleResultSelect = (result: ExplorerSearchResult) => {
    if (!result) return;

    let targetPath: string | null = null;

    if (result.type === "transaction") {
      targetPath = `/transactions/${result.result.tx_hash}`;
    } else if (result.type === "block") {
      targetPath = `/blocks/${result.result.height}`;
    } else if (result.type === "address") {
      targetPath = `/validators/${result.result.address}`;
    }

    if (targetPath) {
      router.push(targetPath);
      setSearchQuery("");
      setSearchResults({ type: "", results: [] });
      setDebouncedQuery("");
    }
  };

  const shouldShowResults =
    !isSearching && searchResults.results && searchResults.results.length > 0;

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults({ type: "", results: [] });
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
        setSearchResults({ type: "", results: [] });
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
        <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400 pointer-events-none" />
        <Input
          type="text"
          placeholder={
            window.innerWidth < WINDOW_BREAKPOINTS.LG
              ? "Search by address, tx hash..."
              : "Search by address, tx hash, block..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 lg:pl-12 pr-[120px] text-xs lg:text-sm lg:pr-[140px] py-5 lg:py-6 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-400  rounded-xl"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-[140px] top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-white/5"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {shouldShowResults && (
          <div
            className="absolute left-0 top-full mt-3 w-full z-20 bg-card p-4 rounded-xl border shadow-xl "
            id="search-results-container"
          >
            <span className="text-sm text-muted-foreground uppercase font-medium pb-3 inline-block">
              {searchResults.type}
            </span>

            {searchResults.type === "transaction" &&
              searchResults.results.length > 0 &&
              searchResults.results.map((result) => (
                <Link
                  key={result.hash}
                  className="flex flex-row items-center justify-between gap-2 py-3 border-t hover:bg-muted/30 transition-colors cursor-pointer"
                  href={`/transactions/${encodeURIComponent(result.hash)}`}
                >
                  <div className="h-8 w-8 bg-primary/25 rounded-lg flex items-center justify-center">
                    <Box className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-start  ml-2 flex-col mr-auto">
                    <span className="text-sm text-muted-foreground capitalize font-medium">
                      Block <span>{result.height}</span>
                    </span>
                    <p className="text-sm text-white  max-w-[300px]">
                      {truncateHash(result.hash)}{" "}
                      <span className="text-xs text-muted-foreground/50">
                        {formatTimestamp(result.timestamp)}
                      </span>
                    </p>
                  </div>
                  <div className="text-xs font-medium text-muted-foreground flex flex-col items-end gap-1">
                    MESSAGE TYPE
                    <span className="text-xs text-white font-normal">
                      {result.message_type}
                    </span>
                  </div>
                </Link>
              ))}
            {searchResults.type === "block" &&
              searchResults.results.length > 0 &&
              searchResults.results.map((result) => (
                <Link
                  key={result.hash}
                  className="flex flex-row items-center justify-between gap-2 py-3 border-t hover:bg-muted/30 transition-colors cursor-pointer"
                  href={`/blocks/${result.height}`}
                >
                  <div className="h-8 w-8 bg-primary/25 rounded-lg flex items-center justify-center">
                    <Box className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-start  ml-2 flex-col mr-auto">
                    <span className="text-sm text-muted-foreground capitalize font-medium">
                      Block <span>{result.height}</span>
                    </span>
                    <p className="text-sm text-white  max-w-[300px]">
                      {truncateHash(result.hash)}{" "}
                      <span className="text-xs text-muted-foreground/50">
                        {formatTimestamp(result.timestamp)}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-start  ml-2 flex-col mr-auto">
                    <span className="text-sm text-muted-foreground/50 capitalize font-medium">
                      Account
                    </span>
                    <div className="max-w-[300px]">
                      <CopyableText
                        text={result.proposer_address}
                        truncate={truncateHash}
                        className="w-full"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            {searchResults.type === "address" &&
              searchResults.results.length > 0 &&
              searchResults.results.map((result) => (
                <Link
                  key={result.resultaddress}
                  className="flex flex-row items-center justify-between gap-2 py-3 border-t hover:bg-muted/30 transition-colors cursor-pointer"
                  href={`/address/${result.address}`}
                >
                  <div className="h-8 w-8 bg-primary/25 rounded-lg flex items-center justify-center">
                    <Box className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-start  ml-2 flex-col mr-auto">
                    <span className="text-sm text-muted-foreground capitalize font-medium">
                      Address <span>{result.address}</span>
                    </span>
                  </div>
                  <div className="flex items-start  ml-2 flex-col mr-auto">
                    <span className="text-sm text-muted-foreground/50 capitalize font-medium">
                      Recent Transactions
                    </span>
                    <span className="text-xs text-white font-normal">
                      {result.recent_txs.length}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>

      <CommandSearchTrigger
        className="absolute right-1 mr-[-4px] top-1/2 transform -translate-y-1/2"
        explorerMode
        displayChainName={selectedChain?.chain_name}
        onChainSelect={handleChainSelect}
        noRouterPush={true}
        chainSearchOnly={true}
      />
    </div>
  );
}
