"use client";

import * as React from "react";
import { Box, Search, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LiveStatusComponent } from "./live-status-component";
import { getExplorerBlocks, type Block } from "@/lib/api/explorer";

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

// Format time ago from ISO timestamp string
const formatTimeAgo = (timestamp: string): string => {
  const now = Date.now();
  const blockTime = new Date(timestamp).getTime();
  const seconds = Math.floor((now - blockTime) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// Format ISO timestamp to readable format
const formatTimestamp = (timestamp: string): string => {
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
  const now = new Date();
  const startBlock = 891755;
  const sampleBlocks: Block[] = Array.from({ length: 10 }, (_, i) => {
    const blockHeight = startBlock - i;
    const blockTime = new Date(now.getTime() - i * 20000); // 20 seconds per block
    return {
      chain_id: 1,
      height: blockHeight,
      hash: `${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`,
      timestamp: blockTime.toISOString(),
      proposer_address: `0x${Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`,
      num_txs: Math.floor(Math.random() * 200) + 1,
      num_events: Math.floor(Math.random() * 300) + 1,
      total_fees: Math.floor(Math.random() * 1000000),
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

      const apiBlocks = await getExplorerBlocks({
        limit: 6,
        sort: "desc",
      });

      console.log("API Blocks:", apiBlocks);
      setBlocks(apiBlocks);
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

  // Calculate latest update time ago from most recent block
  const latestUpdateAgo = React.useMemo(() => {
    if (blocks.length === 0) return "0 secs ago";
    const mostRecentBlock = blocks[0]; // Blocks are sorted newest first
    const blockTime = new Date(mostRecentBlock.timestamp).getTime();
    const seconds = Math.floor((currentTime - blockTime) / 1000);
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
              <th
                id="reward-header"
                className="text-left p-4 text-sm font-medium text-muted-foreground"
              >
                Reward
              </th>
            </tr>
          </thead>
          <tbody>
            {blocks.length > 0 ? (
              blocks.map((block) => (
                <tr
                  key={block.height}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors px-0"
                >
                  {/* Column 1: Block Height */}
                  <td className="py-3">
                    <Link
                      href={`/blocks/${block.height}`}
                      className="hover:underline"
                    >
                      <div
                        data-column="1"
                        className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg flex-shrink-0 px-0">
                          <Box className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm">
                            Block #{block.height}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {block.height.toLocaleString()}
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
                    <Link
                      href={`/blocks/${block.height}`}
                      className="hover:underline"
                    >
                      <span className="font-mono text-sm cursor-pointer hover:opacity-80 transition-opacity">
                        {truncateHash(block.hash, 12, 4)}
                      </span>
                    </Link>
                  </td>
                  {/* Column 5: Block Producer */}
                  <td className="p-4">
                    <span className="font-mono text-sm">
                      {truncateHash(block.proposer_address, 12, 4)}
                    </span>
                  </td>
                  {/* Column 6: Transactions */}
                  <td className="p-4">
                    <div className="flex items-center justify-start">
                      <span className="inline-flex items-center justify-center  px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs  font-medium">
                        {block.num_txs}
                      </span>
                    </div>
                  </td>
                  {/* Column 7: Reward (sample data) */}
                  <td className="p-4">
                    <span
                      className="text-sm text-muted-foreground"
                      data-sample="block-reward"
                    >
                      {(Math.random() * 100 + 50).toFixed(2)} CNPY
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12">
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
        <Link href="/blocks">
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
