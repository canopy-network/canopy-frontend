"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Search, Clock, Link as LinkChain, Activity, Box } from "lucide-react";
import { useChainsStore } from "@/lib/stores/chains-store";

const RECENT_SEARCHES_KEY = "canopy_recent_searches";
const MAX_RECENT_SEARCHES = 5;

interface RecentSearch {
  type: "chain" | "transaction" | "block";
  id: string;
  name: string;
  ticker?: string;
  brandColor?: string;
  chainId?: string;
  chainName?: string;
}

interface CommandSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandSearchDialog({
  open,
  onOpenChange,
}: CommandSearchDialogProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const chains = useChainsStore((state) => state.chains);
  const [filteredChains, setFilteredChains] = useState<typeof chains>([]);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Filter chains based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChains([]);
      return;
    }

    const query = searchQuery.toLowerCase();

    // Filter chains by name or ticker
    const chainResults = chains
      .filter(
        (chain) =>
          chain.chain_name.toLowerCase().includes(query) ||
          chain.token_symbol.toLowerCase().includes(query)
      )
      .slice(0, 5); // Limit to top 5 results

    setFilteredChains(chainResults);
  }, [searchQuery, chains]);

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

  const saveToRecentSearches = (item: RecentSearch) => {
    try {
      if (typeof window !== "undefined") {
        const existingIndex = recentSearches.findIndex(
          (search) => search.type === item.type && search.id === item.id
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

  const handleChainSelect = (chain: (typeof chains)[0]) => {
    saveToRecentSearches({
      type: "chain",
      id: chain.id,
      name: chain.chain_name,
      ticker: chain.token_symbol,
      brandColor: "#10b981", // Default color, can be customized
    });
    router.push(`/creator/${chain.id}`);
    onOpenChange(false);
    setSearchQuery("");
  };

  const handleRecentSelect = (recent: RecentSearch) => {
    if (recent.type === "chain") {
      router.push(`/creator/${recent.id}`);
      onOpenChange(false);
      setSearchQuery("");
    } else if (recent.type === "transaction") {
      // TODO: Add transaction detail page route
      console.log("Navigate to transaction:", recent.id);
      onOpenChange(false);
      setSearchQuery("");
    } else if (recent.type === "block") {
      // TODO: Add block detail page route
      console.log("Navigate to block:", recent.id);
      onOpenChange(false);
      setSearchQuery("");
    }
  };

  const getRecentIcon = (type: RecentSearch["type"]) => {
    switch (type) {
      case "chain":
        return LinkChain;
      case "transaction":
        return Activity;
      case "block":
        return Box;
      default:
        return Search;
    }
  };

  const truncateHash = (hash: string): string => {
    if (!hash || hash.length < 10) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search chains, transactions, or blocks..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        {searchQuery && filteredChains.length === 0 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <>
            <CommandGroup heading="Recent searches">
              {recentSearches.map((recent, index) => {
                const IconComponent = getRecentIcon(recent.type);
                return (
                  <CommandItem
                    key={`${recent.type}-${recent.id}-${index}`}
                    onSelect={() => handleRecentSelect(recent)}
                    className="flex items-center gap-3"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {recent.type === "chain" && recent.brandColor && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: recent.brandColor }}
                      >
                        <span className="text-xs font-bold text-black">
                          {recent.ticker?.[0] || recent.name[0]}
                        </span>
                      </div>
                    )}
                    {recent.type !== "chain" && (
                      <IconComponent className="w-4 h-4" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {recent.type === "transaction"
                          ? truncateHash(recent.name)
                          : recent.name}
                      </p>
                      {recent.ticker && (
                        <p className="text-xs text-muted-foreground">
                          ${recent.ticker}
                        </p>
                      )}
                      {recent.chainName && (
                        <p className="text-xs text-muted-foreground">
                          {recent.chainName}
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
        {searchQuery && filteredChains.length > 0 && (
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
                  <span className="text-sm font-bold text-black">
                    {chain.token_symbol[0]}
                  </span>
                </div>

                {/* Chain Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {chain.chain_name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      ${chain.token_symbol}
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Placeholder for future transaction/block search */}
        {searchQuery && filteredChains.length === 0 && (
          <CommandEmpty>
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                No chains found
              </p>
              <p className="text-xs text-muted-foreground">
                Try searching with a different name or ticker
              </p>
            </div>
          </CommandEmpty>
        )}
      </CommandList>
    </CommandDialog>
  );
}
