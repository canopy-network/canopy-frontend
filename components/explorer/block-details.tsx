"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Container } from "../layout/container";

// Block interface
interface Block {
  number: number;
  hash: string;
  parent_hash: string;
  timestamp: number;
  transactions: number;
  reward: string;
  block_producer: string;
  fee_recipient: string;
  gas_used: string;
  gas_limit: string;
}

// Transaction interface
interface Transaction {
  chain_name: string;
  hash: string;
  from: string;
  to: string;
  timestamp: number;
  amount: string;
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

// Format time ago from timestamp (e.g., "1 hr 22 mins ago")
const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  if (hours < 24) {
    if (remainingMinutes === 0) {
      return `${hours} hr ago`;
    }
    return `${hours} hr ${remainingMinutes} min${
      remainingMinutes === 1 ? "" : "s"
    } ago`;
  }

  const days = Math.floor(seconds / 86400);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

// Format timestamp to readable format (Nov-18 2025 12:47:27PM)
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${month}-${day} ${year} ${hours12}:${minutes}:${seconds}${ampm}`;
};

// Format combined timestamp (1 hr 22 mins ago (Nov-18 2025 12:47:27PM))
const formatCombinedTimestamp = (timestamp: number): string => {
  const timeAgo = formatTimeAgo(timestamp);
  const fullDate = formatTimestamp(timestamp);
  return `${timeAgo} (${fullDate})`;
};

// Generate sample block data
const generateSampleBlock = (blockNumber: number): Block => {
  const now = Date.now();
  return {
    number: blockNumber,
    hash: `0x${Array(64)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("")}`,
    parent_hash: `0x${Array(64)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("")}`,
    timestamp: now - Math.floor(Math.random() * 3600000), // Random time in last hour
    transactions: Math.floor(Math.random() * 500) + 100,
    reward: (Math.random() * 200 + 50).toFixed(2),
    block_producer: `val-${String(Math.floor(Math.random() * 100)).padStart(
      2,
      "0"
    )}`,
    fee_recipient: `0x${Array(64)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("")}`,
    gas_used: (Math.random() * 50000 + 10000).toFixed(3),
    gas_limit: "200,000,000",
  };
};

// Generate sample transactions
const generateSampleTransactions = (count: number): Transaction[] => {
  const now = Date.now();
  return Array.from({ length: count }, () => ({
    chain_name: "blockchain",
    hash: `0x${Array(64)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("")}`,
    from: `0x${Array(40)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("")}`,
    to: `0x${Array(40)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("")}`,
    timestamp: now - Math.floor(Math.random() * 3600000),
    amount: (Math.random() * 20000 + 1000).toFixed(2),
  }));
};

interface BlockDetailsProps {
  blockId: string;
}

export function BlockDetails({ blockId }: BlockDetailsProps) {
  const [block, setBlock] = React.useState<Block | null>(null);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Fetch block data
  React.useEffect(() => {
    const fetchBlock = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Replace with actual API call when backend is ready
        // Example: const response = await getBlockById(blockId);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Use sample data for visualization
        const blockNumber = parseInt(blockId, 10);
        const sampleBlock = generateSampleBlock(blockNumber);
        setBlock(sampleBlock);

        // Generate transactions for this block
        const sampleTransactions = generateSampleTransactions(
          sampleBlock.transactions
        );
        setTransactions(sampleTransactions);
      } catch (err) {
        console.error("Failed to fetch block:", err);
        setError("Failed to load block details");
      } finally {
        setLoading(false);
      }
    };

    fetchBlock();
  }, [blockId]);

  const displayedTransactions = React.useMemo(
    () => transactions.slice(0, 10),
    [transactions]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">
          Loading block...
        </span>
      </div>
    );
  }

  if (error || !block) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-medium text-destructive mb-1">
          {error || "Block not found"}
        </p>
      </div>
    );
  }

  return (
    <Container type="boxed" className="space-y-6">
      {/* Header with Title and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold">Block #{block.number}</h1>
        <div className="w-full flex-1 max-w-[532px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by address, tx hash, block..."
              className="w-full pl-12 pr-4 py-6 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Block Summary Card */}
      <Card className="w-full">
        <div className="divide-y divide-border">
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Timestamp:</p>
            <p className="text-sm font-medium">
              {formatCombinedTimestamp(block.timestamp)}
            </p>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Proposed by:</p>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
              <span className="text-sm text-muted-foreground">
                Block proposed by
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-fit lg:min-w-[120px]"
              >
                {block.block_producer}
              </Button>
            </div>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Transaction count:</p>
            <p className="text-lg font-semibold">
              {block.transactions} transactions
            </p>
          </div>
        </div>
      </Card>

      {/* Reward and Recipient Card */}
      <Card className="w-full">
        <div className="divide-y divide-border">
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Fee recipient:</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm break-all">
                {block.fee_recipient}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(block.fee_recipient)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Block Reward:</p>
            <p className="text-lg font-semibold text-green-500">
              {block.reward} CNPY
            </p>
          </div>
        </div>
      </Card>

      {/* Technical Details Card */}
      <Card className="w-full">
        <div className="divide-y divide-border">
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Gas used:</p>
            <p className="text-sm font-medium">
              {parseFloat(block.gas_used).toLocaleString()}
            </p>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Gas Limit:</p>
            <p className="text-sm font-medium">{block.gas_limit}</p>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Hash:</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm break-all">{block.hash}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(block.hash)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Parent Hash:</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm break-all">
                {block.parent_hash}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(block.parent_hash)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="w-full gap-4">
        <h4 className="text-lg">
          <b>{block.transactions}</b> Txns found
        </h4>

        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Chain Name</TableHead>
              <TableHead>Hash</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTransactions.length > 0 ? (
              displayedTransactions.map((tx, index) => (
                <TableRow key={`${tx.hash}-${index}`} className="border-border">
                  <TableCell>
                    <Button variant="outline" size="sm" className="h-7">
                      {tx.chain_name}
                    </Button>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {truncateHash(tx.hash, 6, 4)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-mono text-sm">
                      {truncateHash(tx.from, 6, 4)}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {truncateHash(tx.to, 6, 4)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTimeAgo(tx.timestamp)}
                  </TableCell>
                  <TableCell className="text-green-500 font-medium">
                    {parseFloat(tx.amount).toLocaleString()} CNPY
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <p className="text-sm text-muted-foreground">
                    No transactions found
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Link href="/transactions">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              View All Transactions
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>

          <p className="text-xs text-muted-foreground">
            Updated {formatTimeAgo(block.timestamp)}
          </p>
        </div>
      </Card>
    </Container>
  );
}
