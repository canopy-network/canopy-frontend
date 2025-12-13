"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Copy, ArrowUpRight, Search } from "lucide-react";
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
import { TableArrow } from "@/components/icons";
import {
  getSampleTransactions,
  SampleTransaction,
} from "@/lib/demo-data/sample-transactions";
import { getExplorerBlock } from "@/lib/api/explorer";
import type { Block as ApiBlock } from "@/types/blocks";
import { CopyableText } from "../ui/copyable-text";

// Extended block type to include all API response fields
type ExtendedApiBlock = ApiBlock & {
  total_txs?: number;
  total_events?: number;
};

// Transaction interface
interface Transaction {
  chain_name: string;
  hash: string;
  from: string;
  to: string;
  timestamp: number;
  amount: string;
  chain_id?: string;
}

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

// Format address for display (similar to transactions-explorer)
const formatAddress = (value: string, prefix = 6, suffix = 6) =>
  `${value.slice(0, prefix)}...${value.slice(-suffix)}`;

// Get relative time from timestamp string (for consistency with transactions-explorer)
const getRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const time = timestamp;
  const diff = Math.max(1, Math.round((now - time) / 60000));
  if (diff < 60) return `${diff} min${diff > 1 ? "s" : ""} ago`;
  const hours = Math.round(diff / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
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

// Generate sample transactions from actual sample data
const generateSampleTransactions = (count: number): Transaction[] => {
  const sampleTransactions = getSampleTransactions();
  // Use actual sample transactions so hashes match
  return sampleTransactions.slice(0, count).map((tx: SampleTransaction) => ({
    chain_name: tx.chain.name,
    hash: tx.hash, // Use actual hash from sample transactions
    from: tx.from,
    to: tx.to,
    timestamp: new Date(tx.timestamp).getTime(),
    amount: tx.amountCnpy.toFixed(2),
    chain_id: tx.chain.id, // Add chain_id for consistency
  }));
};

interface BlockDetailsProps {
  blockId: string;
}

export function BlockDetails({ blockId }: BlockDetailsProps) {
  const [block, setBlock] = React.useState<ExtendedApiBlock | null>(null);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [parentHash, setParentHash] = React.useState<string>("");

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

        const blockNumber = parseInt(blockId, 10);
        if (isNaN(blockNumber)) {
          setError("Invalid block ID");
          setLoading(false);
          return;
        }

        // Fetch block from API
        const apiBlock = await getExplorerBlock(blockNumber);
        setBlock(apiBlock as ExtendedApiBlock);

        // Generate placeholder parent hash (not available in API)
        const generatedParentHash = `0x${Array(64)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")}`;
        setParentHash(generatedParentHash);

        // Keep sample transactions as requested
        const totalTxs =
          (apiBlock as ExtendedApiBlock).total_txs ?? apiBlock.num_txs ?? 0;
        const sampleTransactions = generateSampleTransactions(totalTxs || 10);
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
    <>
      {/* Header with Title and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold">Block #{block.height}</h1>
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
              {formatCombinedTimestamp(new Date(block.timestamp).getTime())}
            </p>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Proposed by:</p>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
              <span className="text-sm break-all bg-input/30 px-2 py-2 rounded-md border border-input">
                <CopyableText text={block.proposer_address} showFull={true} />
              </span>
            </div>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Transaction count:</p>
            <p className="text-lg font-semibold">
              {(block as ExtendedApiBlock).total_txs ?? block.num_txs ?? 0}{" "}
              transactions
            </p>
          </div>
        </div>
      </Card>

      {/* Reward and Recipient Card */}
      <Card className="w-full">
        <div className="divide-y divide-border">
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Fee recipient:</p>
            <div className="flex items-center gap-2 flex-wrap  text-sm break-all">
              <span className="text-sm break-all bg-input/30 px-2 py-2 rounded-md border border-input">
                <CopyableText text={block.proposer_address} showFull={true} />
              </span>
            </div>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Block Reward:</p>
            <p className="text-lg font-semibold text-green-500">
              {((block.total_fees || 0) / 100).toFixed(2)} CNPY -[sample]
            </p>
          </div>
        </div>
      </Card>

      {/* Technical Details Card */}
      <Card className="w-full">
        <div className="divide-y divide-border">
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Gas used:</p>
            <p className="text-sm font-medium">0 -[sample]</p>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Gas Limit:</p>
            <p className="text-sm font-medium">200,000,000 -[sample]</p>
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
                {parentHash} -[sample]
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(parentHash)}
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
          <b>{(block as ExtendedApiBlock).total_txs ?? block.num_txs ?? 0}</b>{" "}
          Txns found
        </h4>

        <Table>
          <TableHeader className="">
            <TableRow className="bg-transparent hover:bg-transparent">
              <TableHead className="text-xs  tracking-wide text-muted-foreground">
                Chain Name
              </TableHead>
              <TableHead className="text-xs  tracking-wide text-muted-foreground">
                Hash
              </TableHead>
              <TableHead className="text-xs  tracking-wide text-muted-foreground">
                From
              </TableHead>
              <TableHead />
              <TableHead className="text-xs  tracking-wide text-muted-foreground">
                To
              </TableHead>
              <TableHead className="text-xs  tracking-wide text-muted-foreground">
                Time
              </TableHead>
              <TableHead className="text-right text-xs  tracking-wide text-muted-foreground">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTransactions.length > 0 ? (
              displayedTransactions.map((tx, index) => (
                <TableRow key={`${tx.hash}-${index}`} appearance="plain">
                  <TableCell className="font-mono text-xs text-white/80 flex items-center">
                    <Link
                      href={`/chains/${tx.chain_id}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <Image
                        src="https://placehold.co/32/EEE/31343C"
                        alt={tx.chain_name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      {tx.chain_name}
                    </Link>
                  </TableCell>
                  <TableCell className=" text-xs text-white/80">
                    <Link
                      href={`/transactions/${encodeURIComponent(tx.hash)}`}
                      className="hover:underline"
                    >
                      {formatAddress(tx.hash, 6, 6)}
                    </Link>
                  </TableCell>

                  <TableCell className=" text-xs text-white">
                    {formatAddress(tx.from, 6, 6)}
                  </TableCell>

                  <TableCell className="w-40">
                    <TableArrow className="text-white" />
                  </TableCell>

                  <TableCell className=" text-xs text-white">
                    {formatAddress(tx.to, 6, 6)}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {getRelativeTime(tx.timestamp)}
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="font-semibold text-sm text-[#00a63d]">
                      {parseFloat(tx.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      CNPY
                    </span>
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
            Updated {formatTimeAgo(new Date(block.timestamp).getTime())}
          </p>
        </div>
      </Card>
    </>
  );
}
