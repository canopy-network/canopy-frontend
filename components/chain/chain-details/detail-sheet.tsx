"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, Copy, ExternalLink } from "lucide-react";
import type { ApiTransaction } from "@/lib/api";

interface Block {
  number: number;
  hash: string;
  timestamp: number;
  transactions: number;
  reward: string;
}

interface DetailSheetProps {
  type: "transaction" | "block";
  transaction?: ApiTransaction | null;
  block?: Block | null;
  ticker: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBlockClick?: (blockNumber: number) => void;
  previousBlockHash?: string;
}

export function DetailSheet({
  type,
  transaction,
  block,
  ticker,
  open,
  onOpenChange,
  onBlockClick,
  previousBlockHash,
}: DetailSheetProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedFrom, setCopiedFrom] = useState(false);
  const [copiedTo, setCopiedTo] = useState(false);
  const [copiedPrevHash, setCopiedPrevHash] = useState(false);

  // Format timestamp
  const formatTimestamp = (date: string | number) => {
    const dateObj = typeof date === "string" ? new Date(date) : new Date(date);
    return dateObj.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatTimeAgo = (date: string | number) => {
    const now = new Date();
    const dateObj = typeof date === "string" ? new Date(date) : new Date(date);
    const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Copy to clipboard
  const copyToClipboard = async (
    text: string,
    setCopied: (val: boolean) => void
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Get status badge for transaction
  const getStatusBadge = (tx: ApiTransaction) => {
    const status = !tx.transaction_hash
      ? "failed"
      : tx.block_height === null
      ? "pending"
      : "success";

    if (status === "success") {
      return (
        <Badge variant="outline" className="border-green-500/50 text-green-500">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Success
        </Badge>
      );
    }
    if (status === "pending") {
      return (
        <Badge
          variant="outline"
          className="border-yellow-500/50 text-yellow-500"
        >
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-red-500/50 text-red-500">
        <XCircle className="w-3 h-3 mr-1" />
        Failed
      </Badge>
    );
  };

  // Render transaction view
  const renderTransactionView = () => {
    if (!transaction) return null;

    const transactionHash = transaction.transaction_hash || transaction.id;
    const fromAddress = transaction.user_id;
    const toAddress = transaction.virtual_pool_id;
    const amount = transaction.token_amount;
    const fee = transaction.trading_fee_cnpy;

    return (
      <div className="space-y-5 mt-6">
        {/* Transaction Hash */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Transaction Hash</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-muted px-3 py-2 rounded-md break-all">
              {transactionHash}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(transactionHash, setCopiedHash)}
            >
              {copiedHash ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Status & Timestamp */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Status</p>
            {getStatusBadge(transaction)}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Timestamp</p>
            <div>
              <p className="text-sm font-medium">
                {formatTimeAgo(transaction.created_at)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatTimestamp(transaction.created_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Block Number */}
        {transaction.block_height && (
          <>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Block</p>
              <Button
                variant="link"
                className="h-auto p-0 text-sm font-medium text-primary"
                onClick={() => {
                  onBlockClick && onBlockClick(transaction.block_height!);
                  onOpenChange(false);
                }}
              >
                #{transaction.block_height.toLocaleString()}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className="h-px bg-border" />
          </>
        )}

        {/* From Address */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">From</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-muted px-3 py-2 rounded-md break-all">
              {fromAddress}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(fromAddress, setCopiedFrom)}
            >
              {copiedFrom ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* To Address */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">To</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-muted px-3 py-2 rounded-md break-all">
              {toAddress}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(toAddress, setCopiedTo)}
            >
              {copiedTo ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Amount & Fee */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-lg font-semibold">
              {amount.toLocaleString()} {ticker}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Transaction Fee</p>
            <p className="text-lg font-semibold">
              {fee ? `${fee.toFixed(6)} ${ticker}` : `< 0.001 ${ticker}`}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render block view
  const renderBlockView = () => {
    if (!block) return null;

    // Generate previous block hash if not provided
    const prevHash =
      previousBlockHash ||
      `0x${"0".repeat(62)}${block.number.toString(16).padStart(2, "0")}`;

    return (
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" variant="clear">
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" variant="clear">
            Transactions ({block.transactions})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5 mt-6">
          <div className="space-y-5">
            {/* Block Number */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Block Number</p>
              <p className="text-2xl font-bold">
                #{block.number.toLocaleString()}
              </p>
            </div>

            <div className="h-px bg-border" />

            {/* Timestamp */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Timestamp</p>
              <div>
                <p className="text-sm font-medium">
                  {formatTimeAgo(block.timestamp)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTimestamp(block.timestamp)}
                </p>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Transactions */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-lg font-semibold">{block.transactions}</p>
            </div>

            <div className="h-px bg-border" />

            {/* Block Reward */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Block Reward</p>
              <p className="text-lg font-semibold">
                {block.reward} {ticker}
              </p>
            </div>

            <div className="h-px bg-border" />

            {/* Block Hash */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Block Hash</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono bg-muted px-3 py-2 rounded-md break-all">
                  {block.hash}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(block.hash, setCopiedHash)}
                >
                  {copiedHash ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Previous Block Hash */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Previous Block Hash
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono bg-muted px-3 py-2 rounded-md break-all">
                  {prevHash}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(prevHash, setCopiedPrevHash)}
                >
                  {copiedPrevHash ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <div className="px-4">
            <p className="text-sm text-muted-foreground">
              Transaction list for this block will be displayed here.
            </p>
            {/* TODO: Add transaction list for this block */}
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  const getTitle = () => {
    if (type === "transaction") {
      return "Transaction Details";
    }
    if (type === "block" && block) {
      return `Block #${block.number.toLocaleString()}`;
    }
    return "Details";
  };

  const shouldRender = () => {
    if (type === "transaction" && !transaction) return false;
    if (type === "block" && !block) return false;
    return true;
  };

  if (!shouldRender()) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">
            {getTitle()}
          </SheetTitle>
        </SheetHeader>

        {type === "transaction" ? renderTransactionView() : renderBlockView()}
      </SheetContent>
    </Sheet>
  );
}
