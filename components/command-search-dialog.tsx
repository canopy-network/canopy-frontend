"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const RECENT_SEARCHES_KEY = "canopy_recent_searches";
const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_DELAY = 500; // 500ms delay before searching

interface ApiChain {
  id: number;
  ticker: string;
  chain_name: string;
  token_name: string;
  branding: string | null;
}

interface CommandSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  explorerMode?: boolean;
  onChainSelect?: (chain: { id: number; chain_name: string }) => void;
  noRouterPush?: boolean;
  chainSearchOnly?: boolean;
}

function GlobalSearchDialog({
  open,
  onOpenChange,
  onChainSelect,
  noRouterPush = false,
  chainSearchOnly,
}: CommandSearchDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<ApiChain[]>([]);
  const [filteredChains, setFilteredChains] = useState<ApiChain[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Debounce search query
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, DEBOUNCE_DELAY);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Search chains via API when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setFilteredChains([]);
      setIsSearching(false);
      return;
    }

    // Search chains via API
    const searchChains = async () => {
      setIsSearching(true);
      try {
        const data = await searchChains(debouncedQuery);

        if (data.success && data.chains) {
          // Map API response to Chain format
          const chainResults: ApiChain[] = data.chains.map((apiChain) => ({
            id: apiChain.id,
            chain_name: apiChain.chain_name,
            ticker: apiChain.ticker,
            token_name: apiChain.token_name,
            branding: apiChain.branding ?? null,
          }));
          setFilteredChains(chainResults);
        } else {
          setFilteredChains([]);
        }
      } catch (error) {
        console.error("Error searching chains:", error);
        setFilteredChains([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchChains();
  }, [debouncedQuery]);

  const loadRecentSearches = () => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          setRecentSearches(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error("Failed to load recent searches:", error);
    }
  };

  const saveToRecentSearches = (item: ApiChain) => {
    try {
      if (typeof window !== "undefined") {
        const existingIndex = recentSearches.findIndex(
          (search) => search.id === item.id
        );

        let updated = [...recentSearches];

        // If item already exists, remove it to re-add at the top
        if (existingIndex !== -1) {
          updated.splice(existingIndex, 1);
        }

        // Add to the beginning
        updated.unshift(item);

        // Keep only MAX_RECENT_SEARCHES
        updated = updated.slice(0, MAX_RECENT_SEARCHES);

        setRecentSearches(updated);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      console.error("Failed to save recent search:", error);
    }
  };

  const handleChainSelect = (chain: ApiChain) => {
    saveToRecentSearches(chain);

    if (noRouterPush) {
      onChainSelect?.({
        id: chain.id,
        chain_name: chain.chain_name,
      });
      // Add chain query parameter to URL
      const params = new URLSearchParams(searchParams.toString());
      params.set("chain", chain.id.toString());
      router.push(`${pathname}?${params.toString()}`);
      onOpenChange(false);
      setSearchQuery("");
      return;
    }

    router.push(`/chains/${chain.id}`);
    onOpenChange(false);
    setSearchQuery("");
  };

  const handleRecentSelect = (chain: ApiChain) => {
    if (noRouterPush) {
      // Add chain query parameter to URL
      const params = new URLSearchParams(searchParams.toString());
      params.set("chain", chain.id.toString());
      router.push(`${pathname}?${params.toString()}`);
      onOpenChange(false);
      setSearchQuery("");
      return;
    }

    router.push(`/chains/${chain.id}`);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput onValueChange={(value: string) => setSearchQuery(value)} />
      <CommandList>
        {isSearching && (
          <CommandEmpty>
            <div className="flex items-center justify-center gap-2 min-h-[264px] flex flex-col items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </div>
          </CommandEmpty>
        )}
        {!isSearching && debouncedQuery && filteredChains.length === 0 && (
          <CommandEmpty>
            <div className="py-6 text-center min-h-[264px] flex flex-col items-center justify-center">
              <p className="text-sm text-muted-foreground mb-2">
                No results found
              </p>
              <p className="text-xs text-muted-foreground">
                Try searching with a different name or ticker
              </p>
            </div>
          </CommandEmpty>
        )}

        {!debouncedQuery && noRouterPush && chainSearchOnly && (
          <div className="py-3 px-3 w-full">
            <Button
              variant="outline"
              onClick={() => {}}
              aria-label="Show all chains"
              className="w-full text-center"
            >
              Show all chains
            </Button>
          </div>
        )}
        {/* Recent Searches */}
        {!debouncedQuery && recentSearches.length > 0 && (
          <>
            <CommandGroup heading="Recent searches">
              {recentSearches.map((recent, index) => {
                return (
                  <CommandItem
                    key={`${recent.id}-${index}`}
                    onSelect={() => handleChainSelect(recent)}
                    className="flex items-center gap-3"
                  >
                    <Image
                      src={recent.branding ?? ""}
                      alt={`${recent.chain_name} branding`}
                      width={32}
                      height={32}
                      className="object-contain rounded-full size-8 border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {recent.chain_name}
                      </p>
                      {recent.ticker && (
                        <p className="text-xs text-muted-foreground">
                          ${recent.ticker}
                        </p>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Chain Results */}
        {debouncedQuery && !isSearching && filteredChains.length > 0 && (
          <CommandGroup heading="Chains">
            {filteredChains.map((chain) => (
              <CommandItem
                key={chain.id}
                onSelect={() => handleChainSelect(chain)}
                className="flex items-center gap-3"
              >
                {/* Chain Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#10b981" }}
                >
                  <Image
                    src={chain.branding ?? ""}
                    alt={`${chain.chain_name} branding`}
                    width={32}
                    height={32}
                    className="object-contain rounded-full size-8 border border-white/10"
                  />
                </div>

                {/* Chain Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {chain.chain_name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      ${chain.ticker}
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export default function CommandSearchDialog({
  open,
  onOpenChange,
  explorerMode = false,
  noRouterPush = false,
  chainSearchOnly = false,
  onChainSelect,
}: CommandSearchDialogProps) {
  if (explorerMode && chainSearchOnly && noRouterPush) {
    return (
      <GlobalSearchDialog
        open={open}
        onOpenChange={onOpenChange}
        onChainSelect={onChainSelect}
        noRouterPush={noRouterPush}
        chainSearchOnly={chainSearchOnly}
      />
    );
  }

  return (
    <GlobalSearchDialog
      open={open}
      onOpenChange={onOpenChange}
      onChainSelect={onChainSelect}
    />
  );
}
