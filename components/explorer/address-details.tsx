"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, ArrowUpRight, Search, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExplorerAddress } from "@/lib/api/explorer";
import type { AddressResponse } from "@/types/addresses";
import { CopyableText } from "../ui/copyable-text";

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

// Format address (truncate middle)
const formatAddress = (address: string, startChars = 6, endChars = 6): string => {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}…${address.slice(-endChars)}`;
};

// Format number with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

// Format CNPY amount
const formatCNPY = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)}B CNPY`;
  } else if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M CNPY`;
  } else if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)}K CNPY`;
  }
  return `${amount.toFixed(2)} CNPY`;
};

interface AddressDetailsProps {
  address: string;
}

export function AddressDetails({ address }: AddressDetailsProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Use React Query hook to fetch address data
  const {
    data: addressData,
    isLoading: loading,
    error: queryError,
  } = useExplorerAddress(address, true, 20);

  const error = queryError ? "Failed to load address details" : null;

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">
          Loading address...
        </span>
      </div>
    );
  }

  if (error || !addressData) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-medium text-destructive mb-1">
          {error || "Address not found"}
        </p>
      </div>
    );
  }

  const summary = addressData.summary;
  const balances = addressData.balances || [];
  const transactions = addressData.transactions || [];

  return (
    <>
      {/* Header with Title and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/25 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Account</h1>
            <p className="text-sm text-muted-foreground font-mono">
              {formatAddress(address, 8, 8)}
            </p>
          </div>
        </div>
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

      {/* Address Summary Card */}
      <Card className="w-full">
        <div className="divide-y divide-border">
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Address:</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm break-all bg-input/30 px-2 py-2 rounded-md border border-input font-mono">
                <CopyableText text={address} showFull={true} />
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(address)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Total Portfolio Value:</p>
            <p className="text-lg font-semibold text-green-500">
              {summary.total_portfolio_value_fmt || formatCNPY(summary.total_portfolio_value_cnpy)}
            </p>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Liquid Balance:</p>
            <p className="text-lg font-semibold">
              {formatCNPY(summary.liquid_balance_cnpy)}
            </p>
          </div>
          {summary.staked_balance_cnpy > 0 && (
            <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
              <p className="text-sm text-muted-foreground">Staked Balance:</p>
              <p className="text-lg font-semibold">
                {formatCNPY(summary.staked_balance_cnpy)}
              </p>
            </div>
          )}
          {summary.lp_balance_cnpy > 0 && (
            <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
              <p className="text-sm text-muted-foreground">LP Balance:</p>
              <p className="text-lg font-semibold">
                {formatCNPY(summary.lp_balance_cnpy)}
              </p>
            </div>
          )}
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Chains:</p>
            <p className="text-lg font-semibold">
              {summary.chain_count}
            </p>
          </div>
          {summary.is_validator && (
            <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
              <p className="text-sm text-muted-foreground">Validator Status:</p>
              <p className="text-sm font-medium">
                Active on {summary.validator_chain_count} chain{summary.validator_chain_count !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Balances by Chain */}
      {balances.length > 0 && (
        <Card className="w-full">
          <h4 className="text-lg mb-4">Balances by Chain</h4>
          <div className="divide-y divide-border">
            {balances.map((balance) => (
              <div
                key={balance.chain_id}
                className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center"
              >
                <p className="text-sm text-muted-foreground">{balance.chain_name}:</p>
                <p className="text-sm font-medium">
                  {balance.balance_fmt || formatCNPY(balance.balance)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <Card className="w-full">
          <h4 className="text-lg mb-4">
            <b>
              {transactions.reduce((sum, chain) => sum + chain.total, 0)}
            </b>{" "}
            Transactions
          </h4>
          <div className="space-y-6">
            {transactions.map((chainTxs) => (
              <div key={chainTxs.chain_id} className="space-y-2">
                <h5 className="text-sm font-medium text-muted-foreground">
                  {chainTxs.chain_name} ({chainTxs.total} transactions)
                </h5>
                <div className="divide-y divide-border">
                  {chainTxs.transactions.slice(0, 10).map((tx) => (
                    <div
                      key={tx.tx_hash}
                      className="py-3 flex flex-col gap-2 lg:grid lg:grid-cols-[1fr_auto] lg:gap-4"
                    >
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/transactions/${encodeURIComponent(tx.tx_hash)}`}
                          className="text-sm font-mono text-primary hover:underline"
                        >
                          {formatAddress(tx.tx_hash, 8, 8)}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{tx.type}</span>
                          <span>•</span>
                          <Link
                            href={`/blocks/${tx.height}`}
                            className="hover:text-foreground"
                          >
                            Block #{tx.height}
                          </Link>
                          <span>•</span>
                          <span>
                            {formatCombinedTimestamp(new Date(tx.timestamp).getTime())}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-sm">
                        {tx.amount > 0 && (
                          <p className="font-medium">
                            {formatCNPY(tx.amount)}
                          </p>
                        )}
                        {tx.fee > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Fee: {formatCNPY(tx.fee)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {chainTxs.total > 10 && (
                  <div className="pt-2">
                    <Link href={`/transactions?address=${address}&chain=${chainTxs.chain_id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground gap-1"
                      >
                        View All {chainTxs.total} Transactions
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* No Transactions Message */}
      {transactions.length === 0 && (
        <Card className="w-full gap-4">
          <h4 className="text-lg">Transactions</h4>
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              No transactions found for this address.
            </p>
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
          </div>
        </Card>
      )}
    </>
  );
}

