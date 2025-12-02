"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { formatBalance } from "@/lib/utils/wallet-helpers";
import { toast } from "sonner";
import { format } from "date-fns";

interface TransactionDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: {
    hash: string;
    type: string;
    symbol: string;
    amount: number;
    timestamp: string | Date;
    status: "completed" | "pending" | "failed";
    from?: string;
    to?: string;
    blockNumber?: number;
    fee?: number;
    gasUsed?: number;
    gasLimit?: number;
  };
}

const STATUS_CONFIG = {
  completed: {
    label: "Success",
    className: "bg-green-500/20 text-green-500 border-green-500/20",
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/20 text-red-500 border-red-500/20",
  },
};

export function TransactionDetailSheet({
  open,
  onOpenChange,
  transaction,
}: TransactionDetailSheetProps) {
  if (!transaction) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const statusConfig = STATUS_CONFIG[transaction.status];
  const timestamp = typeof transaction.timestamp === "string" 
    ? new Date(transaction.timestamp)
    : transaction.timestamp;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Transaction Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="outline" className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
          </div>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Transaction Hash</span>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-muted rounded-lg text-xs font-mono break-all">
                {transaction.hash}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(transaction.hash, "Transaction hash")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Timestamp</span>
            <div className="text-right">
              <p className="text-sm font-medium">
                {format(timestamp, "MMM d, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(timestamp, "h:mm a")}
              </p>
            </div>
          </div>

          {/* Block Number */}
          {transaction.blockNumber && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Block</span>
              <Button
                variant="link"
                className="h-auto p-0 text-sm font-medium"
              >
                #{transaction.blockNumber}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}

          {/* From Address */}
          {transaction.from && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">From</span>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-muted rounded-lg text-xs font-mono break-all">
                  {transaction.from}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(transaction.from!, "Address")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* To Address */}
          {transaction.to && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">To</span>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-muted rounded-lg text-xs font-mono break-all">
                  {transaction.to}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(transaction.to!, "Address")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <p className="text-sm font-medium">
              {formatBalance(Math.abs(transaction.amount), 4)} {transaction.symbol}
            </p>
          </div>

          {/* Transaction Fee */}
          {transaction.fee !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Transaction Fee</span>
              <p className="text-sm font-medium">
                {transaction.fee < 0.001 ? "< 0.001" : formatBalance(transaction.fee, 6)} {transaction.symbol}
              </p>
            </div>
          )}

          {/* Gas Info (EVM) */}
          {transaction.gasUsed && transaction.gasLimit && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gas Used</span>
                <p className="text-sm font-medium">
                  {transaction.gasUsed.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gas Limit</span>
                <p className="text-sm font-medium">
                  {transaction.gasLimit.toLocaleString()}
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
