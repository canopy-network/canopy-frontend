"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CopyableText } from "@/components/ui/copyable-text";
import { Transaction } from "@/lib/api/explorer";

// Format time ago from timestamp (e.g., "1 hr 22 mins ago")
const formatTimeAgo = (timestamp: string): string => {
  const now = Date.now();
  const txTime = new Date(timestamp).getTime();
  const seconds = Math.floor((now - txTime) / 1000);

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  if (hours < 24) {
    if (remainingMinutes === 0) {
      return `${hours} hr ago`;
    }
    return `${hours} hr ${remainingMinutes} min${remainingMinutes === 1 ? "" : "s"
      } ago`;
  }

  const days = Math.floor(seconds / 86400);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

// Format timestamp to readable format (Nov-18 2025 12:47:27PM)
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
const formatCombinedTimestamp = (timestamp: string): string => {
  const timeAgo = formatTimeAgo(timestamp);
  const fullDate = formatTimestamp(timestamp);
  return `${timeAgo} (${fullDate})`;
};

// Format method name
const formatMethod = (method: string) => {
  if (!method) return "-";
  // Convert camelCase or snake_case to Title Case
  return method
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
};

interface TransactionDetailProps {
  transaction: Transaction;
}

export function TransactionDetail({ transaction }: TransactionDetailProps) {
  // Format transaction hash with 0x prefix if not present
  const formatHash = (hash: string) => {
    return hash.startsWith("0x") ? hash : `0x${hash}`;
  };

  const fullHash = formatHash(transaction.tx_hash);
  const fromAddress = transaction.signer ? formatHash(transaction.signer) : "";
  const toAddress = transaction.counterparty ? formatHash(transaction.counterparty) : "";

  // Calculate gas usage percentage (mock for now, API might not have gas_limit)
  const gasUsed = 0; // transaction.gas_used || 0;
  const gasLimit = 0; // transaction.gas_limit || 0;
  const gasPercentage = gasLimit > 0 ? (gasUsed / gasLimit) * 100 : 0;

  // Minimum fee (could be from API or default)
  const minimumFee = 0.1;

  return (
    <>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-fit bg-transparent p-0 h-auto gap-0">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#00a63d] data-[state=active]:text-white data-[state=active]:bg-transparent rounded-md px-4 py-2"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="internal"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#00a63d] data-[state=active]:text-white data-[state=active]:bg-transparent rounded-md px-4 py-2"
          >
            Internal Txns
          </TabsTrigger>
          <TabsTrigger
            value="logs"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#00a63d] data-[state=active]:text-white data-[state=active]:bg-transparent rounded-md px-4 py-2"
          >
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Transaction Overview Card */}
          <Card className="w-full">
            <div className="divide-y divide-border">
              <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground">Transaction Hash:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <CopyableText
                    text={fullHash}
                    showFull={true}
                    className="flex items-center gap-2"
                    textClassName="font-mono text-sm break-all"
                    iconMuted={false}
                  />
                </div>
              </div>

              <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground">Block:</p>
                <Link
                  href={`/blocks/${transaction.height}`}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  #{transaction.height.toLocaleString()}
                </Link>
              </div>

              <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground">Method:</p>
                <p className="text-sm font-medium">{formatMethod(transaction.message_type)}</p>
              </div>

              <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground">Timestamp:</p>
                <p className="text-sm font-medium">
                  {formatCombinedTimestamp(transaction.timestamp)}
                </p>
              </div>
            </div>
          </Card>

          {/* Participants and Financials Card */}
          <Card className="w-full">
            <div className="divide-y divide-border">
              <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground">From:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {fromAddress ? (
                    <CopyableText
                      text={fromAddress}
                      showFull={true}
                      className="flex items-center gap-2"
                      textClassName="font-mono text-sm break-all"
                      iconMuted={false}
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
              </div>

              <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground">To:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {toAddress ? (
                    <CopyableText
                      text={toAddress}
                      showFull={true}
                      className="flex items-center gap-2"
                      textClassName="font-mono text-sm break-all"
                      iconMuted={false}
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
              </div>

              <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground">Value:</p>
                <p className="text-sm font-medium">
                  {transaction.amount != null ? transaction.amount.toLocaleString() : "0"}
                </p>
              </div>

              <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground">Transaction Fee:</p>
                <p className="text-sm font-semibold text-[#00a63d]">
                  {transaction.fee != null
                    ? `${transaction.fee.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} CNPY`
                    : "0 CNPY"}
                </p>
              </div>

              <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground">Minimum Fee:</p>
                <p className="text-sm font-semibold text-[#00a63d]">
                  {minimumFee.toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}{" "}
                  CNPY
                </p>
              </div>

              <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground">Gas Used:</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{gasUsed.toLocaleString()}</span>
                  {gasLimit > 0 && (
                    <>
                      <Progress value={gasPercentage} className="flex-1 max-w-[200px]" />
                      <span className="text-xs text-muted-foreground">
                        {gasUsed.toLocaleString()} (Gas Limit)
                      </span>
                    </>
                  )}
                  {gasLimit === 0 && (
                    <span className="text-xs text-muted-foreground">
                      {gasUsed.toLocaleString()} (Gas Limit)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Memo Card */}
          <Card className="w-full">
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-2">Memo:</p>
              <p className="text-sm text-white">
                {transaction.message_json
                  ? JSON.stringify(JSON.parse(transaction.message_json), null, 2)
                  : "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="internal">
          <Card className="w-full p-6">
            <div className="text-sm text-muted-foreground">
              No internal transactions were recorded for this transaction.
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="w-full p-6">
            <div className="text-sm text-muted-foreground">
              No logs were recorded for this transaction.
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
