"use client";

import * as React from "react";
import { Box, Search, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LiveStatusComponent } from "./live-status-component";

// Block interface
interface Block {
  number: number;
  hash: string;
  timestamp: number;
  transactions: number;
  reward: string;
  block_producer: string;
}

// Function to truncate hash: first chars + ... + last chars
const truncateHash = (
  hash: string,
  start: number = 8,
  end: number = 4
): string => {
  if (!hash) return "";
  if (hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
};

// Format time ago from timestamp
const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// Format timestamp to readable format
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Generate sample block data for visualization
const generateSampleBlocks = (): Block[] => {
  const now = Date.now();
  const startBlock = 891755;
  const sampleBlocks: Block[] = Array.from({ length: 10 }, (_, i) => {
    const blockNumber = startBlock - i;
    return {
      number: blockNumber,
      hash: `${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`,
      timestamp: now - i * 20000, // 20 seconds per block
      transactions: Math.floor(Math.random() * 200) + 1,
      reward: (Math.random() * 100 + 50).toFixed(2),
      block_producer: `${Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`,
    };
  });

  return sampleBlocks;
};

export function RecentBlocks() {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentTime, setCurrentTime] = React.useState(Date.now());

  // Update current time every second for live countdown
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch blocks
  const fetchBlocks = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call when backend is ready
      // Example: const response = await getChainBlocks();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use sample data for visualization
      const sampleData = generateSampleBlocks();
      setBlocks(sampleData);
    } catch (err) {
      console.error("Failed to fetch blocks:", err);
      // Use sample data on error for visualization
      const sampleData = generateSampleBlocks();
      setBlocks(sampleData);
      setError(null); // Don't show error when using sample data
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch blocks on mount and when dependencies change
  React.useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  // Limit to 6 blocks for display
  const filteredBlocks = React.useMemo(() => {
    return blocks.slice(0, 6);
  }, [blocks]);

  // Calculate latest update time ago from most recent block
  const latestUpdateAgo = React.useMemo(() => {
    if (blocks.length === 0) return "0 secs ago";
    const mostRecentBlock = blocks[0]; // Blocks are sorted newest first
    const seconds = Math.floor(
      (currentTime - mostRecentBlock.timestamp) / 1000
    );
    if (seconds < 60) return `${seconds} secs ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    return `${Math.floor(seconds / 3600)} hrs ago`;
  }, [blocks, currentTime]);

  if (loading && blocks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">
          Loading blocks...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-medium text-destructive mb-1">{error}</p>
      </div>
    );
  }

  return (
    <Card className="w-full gap-0">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <>
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Recent Blocks</h3>
          </div>
          <div className="flex items-center gap-4">
            <LiveStatusComponent />
            <div className="flex items-center gap-2 text-muted-foreground text-sm bg-white/[0.05] rounded-lg px-4 py-2">
              <Box className="w-4 h-4" />
              <span>Latest update {latestUpdateAgo}</span>
            </div>
          </div>
        </>
      </div>

      {/* Block Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th
                id="block-height-header"
                className="text-left p-4 text-sm font-medium text-muted-foreground"
              >
                {/* Column 1 - Block Height - No header */}
              </th>
              <th
                id="timestamp-header"
                className="text-left p-4 text-sm font-medium text-muted-foreground"
              >
                Timestamp
              </th>
              <th
                id="age-header"
                className="text-left p-4 text-sm font-medium text-muted-foreground"
              >
                Age
              </th>
              <th
                id="block-hash-header"
                className="text-left p-4 text-sm font-medium text-muted-foreground"
              >
                Block Hash
              </th>
              <th
                id="block-producer-header"
                className="text-left p-4 text-sm font-medium text-muted-foreground"
              >
                Block Producer
              </th>
              <th
                id="transactions-header"
                className="text-left p-4 text-sm font-medium text-muted-foreground"
              >
                Transactions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBlocks.length > 0 ? (
              filteredBlocks.map((block) => (
                <tr
                  key={block.number}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors px-0"
                >
                  {/* Column 1: Block Height */}
                  <td className="py-3">
                    <Link href={`/block/${block.number}`}>
                      <div
                        data-column="1"
                        className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg flex-shrink-0 px-0">
                          <Box className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm">
                            Block #{block.number}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {block.number.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </td>
                  {/* Column 2: Timestamp */}
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {formatTimestamp(block.timestamp)}
                    </span>
                  </td>
                  {/* Column 3: Age */}
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(block.timestamp)}
                    </span>
                  </td>
                  {/* Column 4: Block Hash */}
                  <td className="p-4">
                    <Link href={`/block/${block.number}`}>
                      <span className="font-mono text-sm cursor-pointer hover:opacity-80 transition-opacity">
                        {truncateHash(block.hash, 12, 4)}
                      </span>
                    </Link>
                  </td>
                  {/* Column 5: Block Producer */}
                  <td className="p-4">
                    <span className="font-mono text-sm">
                      {truncateHash(block.block_producer, 12, 4)}
                    </span>
                  </td>
                  {/* Column 6: Transactions */}
                  <td className="p-4">
                    <div className="flex items-center justify-start">
                      <span className="inline-flex items-center justify-center  px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs  font-medium">
                        {block.transactions}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-muted rounded-full">
                      <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    No blocks found
                  </p>
                  <p className="text-xs text-muted-foreground">
                    No blocks available
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View All Blocks Button */}
      <div className="flex items-center justify-start pt-4 border-t border-border">
        <Link href="/explorer/blocks">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1"
          >
            View All Blocks
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
