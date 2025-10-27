"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, XCircle, Box } from "lucide-react";
import { useChainsStore } from "@/lib/stores/chains-store";

interface Block {
  number: number;
  hash: string;
  timestamp: number;
  transactions: number;
  reward: string;
}

export function ChainBlocks() {
  // Get current chain from store
  const currentChain = useChainsStore((state) => state.currentChain);

  const chainId = currentChain?.id;
  const ticker = currentChain?.token_symbol || "TOKEN";
  const initialBlockCount = 10;
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [filteredBlocks, setFilteredBlocks] = useState<Block[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate placeholder block data
  const generatePlaceholderBlocks = (
    startBlock: number,
    count: number
  ): Block[] => {
    const now = Date.now();
    return Array.from({ length: count }, (_, i) => {
      const blockNumber = startBlock - i;
      return {
        number: blockNumber,
        hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random()
          .toString(16)
          .substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
        timestamp: now - i * 15000, // 15 seconds per block
        transactions: Math.floor(Math.random() * 200) + 10,
        reward: "158.55",
      };
    });
  };

  // Initial data fetch
  useEffect(() => {
    const fetchBlocks = async () => {
      setIsLoading(true);
      // TODO: Replace with actual API call when backend is ready
      // Example: const response = await fetch(`/api/chains/${chainId}/blocks`);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const placeholderData = generatePlaceholderBlocks(
        145600,
        initialBlockCount
      );
      setBlocks(placeholderData);
      setFilteredBlocks(placeholderData);
      setIsLoading(false);
    };

    fetchBlocks();
  }, [chainId, initialBlockCount]);

  // Filter blocks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBlocks(blocks);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = blocks.filter((block) => {
      // Filter by block number
      if (block.number.toString().includes(query)) {
        return true;
      }
      // Filter by block hash (full hash or truncated version)
      if (block.hash.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    });

    setFilteredBlocks(filtered);
  }, [searchQuery, blocks]);

  // Truncate hash: first 6 digits + "..." + last 4
  const truncateHash = (hash: string): string => {
    if (!hash || hash.length < 10) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Load more blocks
  const handleLoadMore = async () => {
    setLoadingMore(true);

    // TODO: Replace with actual API call
    // Example: const response = await fetch(`/api/chains/${chainId}/blocks?before=${blocks[blocks.length - 1].number}`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const lastBlockNumber = blocks[blocks.length - 1].number;
    const moreBlocks = generatePlaceholderBlocks(lastBlockNumber - 1, 10);

    setBlocks([...blocks, ...moreBlocks]);
    if (!searchQuery.trim()) {
      setFilteredBlocks([...blocks, ...moreBlocks]);
    }

    setLoadingMore(false);
  };

  // Handle block click
  const handleBlockClick = (block: Block) => {
    console.log("Block clicked:", block);
    // TODO: Navigate to block detail page or open modal
    // Example: router.push(`/explorer/block/${block.number}`);
  };

  // Show message if no chain is selected
  if (!currentChain) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Box className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm font-medium text-muted-foreground mb-1">
            No Chain Selected
          </p>
          <p className="text-xs text-muted-foreground">
            Select a chain to view its blocks
          </p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-sm text-muted-foreground">
            Loading blocks...
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="gap-0">
      {/* Header with search */}
      <div className="flex items-center justify-between mb-4">
        {searchOpen ? (
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by block number or hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Recent Blocks</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Blocks list */}

      <div id="blocks-list" className="overflow-auto no-scrollbar">
        <div className="w-fit xl:w-full ">
          {filteredBlocks.length > 0 ? (
            filteredBlocks.map((block) => (
              <button
                key={block.number}
                onClick={() => handleBlockClick(block)}
                className="w-full flex items-center justify-between py-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer text-left "
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <Box className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold whitespace-nowrap ">
                      Block #{block.number}
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(block.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-sm ml-4">
                  <div>
                    <span className="text-muted-foreground">Txns: </span>
                    <span className="font-medium">{block.transactions}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reward: </span>
                    <span className="font-medium whitespace-nowrap">
                      {block.reward} {ticker}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {truncateHash(block.hash)}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-muted rounded-full">
                  <Search className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                No blocks found
              </p>
              <p className="text-xs text-muted-foreground">
                Try searching with a different block number or hash
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Show More Button */}
      {filteredBlocks.length > 0 && !searchQuery && (
        <div id="show-more-blocks" className="mt-4">
          {loadingMore ? (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">
                Loading more blocks...
              </span>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLoadMore}
            >
              Show More
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
