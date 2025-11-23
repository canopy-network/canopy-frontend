"use client";

import * as React from "react";
import { Box, Search, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LatestUpdated } from "./latest-updated";
import { Block } from "@/lib/api/explorer";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

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

export function RecentBlocks({
  blocks,
  isLoading,
  error,
}: {
  blocks: Block[];
  isLoading: boolean;
  error: string | null;
}) {
  // Get the most recent block timestamp for LatestUpdated component
  const mostRecentTimestamp = React.useMemo(() => {
    if (blocks.length === 0) return undefined;
    return blocks[0].timestamp; // Blocks are sorted newest first
  }, [blocks]);

  if (isLoading && blocks.length === 0) {
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
    <Card className="w-full gap-0" padding="explorer">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <>
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-primary lg:block hidden" />
            <h3 className="text-lg font-semibold">Recent Blocks</h3>
          </div>
          <LatestUpdated timestamp={mostRecentTimestamp} />
        </>
      </div>

      {/* Block Table */}
      <div className="overflow-x-auto no-scrollbar pb-4 lg:pb-0">
        <Table>
          <TableHeader>
            <TableRow appearance="plain">
              <TableHead
                id="block-height-header"
                className="text-left p-4 pl-0 lg:pl-4 text-sm font-medium text-muted-foreground"
              >
                {/* Column 1 - Block Height - No header */}
                <div className="block lg:hidden">Height</div>
              </TableHead>
              <TableHead
                id="timestamp-header"
                className="text-left p-4 text-sm font-medium text-muted-foreground"
              >
                Timestamp
              </TableHead>
              <TableHead
                id="age-header"
                className="text-left p-4 text-sm font-medium text-muted-foreground"
              >
                Age
              </TableHead>
              <TableHead
                id="block-hash-header"
                className="text-left p-4 text-sm font-medium text-muted-foreground"
              >
                Block Hash
              </TableHead>
              <TableHead
                id="block-producer-header"
                className="text-left p-4 text-sm font-medium text-muted-foreground"
              >
                Block Producer
              </TableHead>
              <TableHead
                id="transactions-header"
                className="text-left p-4 text-sm font-medium text-muted-foreground"
              >
                Transactions
              </TableHead>
              <TableHead
                id="reward-header"
                className="text-left p-4 text-sm font-medium text-muted-foreground"
              >
                Reward
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.length > 0 ? (
              blocks.map((block) => (
                <TableRow
                  key={block.height}
                  appearance="plain"
                  className="px-0"
                >
                  {/* Column 1: Block Height */}
                  <TableCell className="py-3 pl-0 lg:pl-4">
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
                  </TableCell>
                  {/* Column 2: Timestamp */}
                  <TableCell className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {formatTimestamp(block.timestamp)}
                    </span>
                  </TableCell>
                  {/* Column 3: Age */}
                  <TableCell className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(block.timestamp)}
                    </span>
                  </TableCell>
                  {/* Column 4: Block Hash */}
                  <TableCell className="p-4">
                    <Link
                      href={`/blocks/${block.height}`}
                      className="hover:underline"
                    >
                      <span className="font-mono text-sm cursor-pointer hover:opacity-80 transition-opacity">
                        {truncateHash(block.hash, 12, 4)}
                      </span>
                    </Link>
                  </TableCell>
                  {/* Column 5: Block Producer */}
                  <TableCell className="p-4">
                    <span className="font-mono text-sm">
                      {truncateHash(block.proposer_address, 12, 4)}
                    </span>
                  </TableCell>
                  {/* Column 6: Transactions */}
                  <TableCell className="p-4">
                    <div className="flex items-center lg:justify-start justify-center">
                      <span className="inline-flex items-center justify-center  px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs  font-medium">
                        {block.num_txs}
                      </span>
                    </div>
                  </TableCell>
                  {/* Column 7: Reward (sample data) */}
                  <TableCell className="p-4">
                    <span
                      className="text-sm text-muted-foreground"
                      data-sample="block-reward"
                    >
                      {(Math.random() * 100 + 50).toFixed(2)} CNPY
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow appearance="plain">
                <TableCell colSpan={7} className="text-center py-12">
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
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
