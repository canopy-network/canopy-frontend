"use client";

import { useCallback } from "react";
import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { SampleTransaction } from "@/lib/demo-data/sample-transactions";

const formatAddress = (value: string, prefix = 6, suffix = 6) =>
  `${value.slice(0, prefix)}...${value.slice(-suffix)}`;

const getRelativeTime = (timestamp: string) => {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diffMinutes = Math.max(1, Math.round((now - time) / 60000));
  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  }
  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
};

const methodAccent: Record<SampleTransaction["method"], string> = {
  Transfer: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Swap: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  Stake: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  Contract: "border-amber-400/40 bg-amber-500/10 text-amber-200",
};

interface TransactionDetailProps {
  transaction: SampleTransaction;
}

export function TransactionDetail({ transaction }: TransactionDetailProps) {
  const copyToClipboard = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.error("Failed to copy value", error);
    }
  }, []);

  const timeDisplay = `${getRelativeTime(
    transaction.timestamp
  )} (${formatTimestamp(transaction.timestamp)})`;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Transaction Detail</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList variant="clear" className="w-fit rounded-full bg-white/5 p-1">
          <TabsTrigger
            value="overview"
            variant="clear"
            className="rounded-full px-4 py-2 data-[state=active]:bg-white/10"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="internal"
            variant="clear"
            className="rounded-full px-4 py-2 data-[state=active]:bg-white/10"
          >
            Internal Txns
          </TabsTrigger>
          <TabsTrigger
            value="logs"
            variant="clear"
            className="rounded-full px-4 py-2 data-[state=active]:bg-white/10"
          >
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="px-6 py-3 gap-0" id="transaction-detail-overview">
            <div className="flex items-center  ">
              <p className="text-sm text-muted-foreground w-full lg:max-w-[252px]">
                Transaction Hash:
              </p>
              <div className="flex items-center gap-2 border-b border-white/10 py-4 w-full">
                <span className="font-mono text-sm break-all">
                  {transaction.hash}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => copyToClipboard(transaction.hash)}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center  ">
              <p className="text-sm text-muted-foreground w-full lg:max-w-[252px]">
                Block:
              </p>
              <p className="font-mono text-sm border-b border-white/10 py-4 w-full">
                #{transaction.blockHeight.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center  ">
              <p className="text-sm text-muted-foreground w-full lg:max-w-[252px]">
                Method:
              </p>

              <div className="flex items-center gap-2  py-4 w-full border-b border-white/10">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                    methodAccent[transaction.method]
                  )}
                >
                  {transaction.method}
                </span>
              </div>
            </div>

            <div className="flex items-center  ">
              <p className="text-sm text-muted-foreground w-full lg:max-w-[252px]">
                Timestamp:
              </p>
              <p className="text-sm text-white py-4 w-full">{timeDisplay}</p>
            </div>
          </Card>

          <Card className="px-6 py-3 gap-0">
            <div className="flex items-center  ">
              <p className="text-sm text-muted-foreground w-full lg:max-w-[252px]">
                From:
              </p>
              <div className="flex items-center gap-2 border-b border-white/10 py-4 w-full">
                <span className="font-mono text-sm">
                  {formatAddress(transaction.from)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => copyToClipboard(transaction.from)}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center ">
              <p className="text-sm text-muted-foreground w-full lg:max-w-[252px]">
                To:
              </p>
              <div className="flex items-center gap-2 border-b border-white/10 py-4 w-full">
                <span className="font-mono text-sm">
                  {formatAddress(transaction.to)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => copyToClipboard(transaction.to)}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center  ">
              <p className="text-sm text-muted-foreground w-full lg:max-w-[252px]">
                Value:
              </p>
              <p className="font-semibold border-b border-white/10 py-4 w-full">
                {transaction.value
                  ? `${transaction.value} ${transaction.chain.ticker.replace(
                      "$",
                      ""
                    )}`
                  : "0"}
              </p>
            </div>

            <div className="flex items-center ">
              <p className="text-sm text-muted-foreground w-full lg:max-w-[252px]">
                Transaction Fee:
              </p>
              <p className="font-semibold text-emerald-400 py-4">
                {transaction.transactionFeeCnpy.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}{" "}
                CNPY
              </p>
            </div>
          </Card>

          <Card className="px-6 py-3 gap-0">
            <div className="flex items-center ">
              <p className="text-sm text-muted-foreground w-full lg:max-w-[252px]">
                Gas used:
              </p>
              <p className="text-sm text-white border-b border-white/10 py-4 w-full">
                {transaction.gasUsed.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center ">
              <p className="text-sm text-muted-foreground w-full lg:max-w-[252px]">
                Gas Price:
              </p>
              <p className="text-sm text-white py-4">
                {transaction.gasPriceGwei} Gwei
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="internal">
          <Card className="p-6">
            {transaction.internalTransactions.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No internal transactions were recorded for this transaction.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaction.internalTransactions.map((internalTxn, idx) => (
                    <TableRow key={internalTxn.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="capitalize">
                        {internalTxn.type}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {formatAddress(internalTxn.from)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {formatAddress(internalTxn.to)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {internalTxn.value}{" "}
                        {transaction.chain.ticker.replace("$", "")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="p-6 space-y-4">
            {transaction.logs.map((log, index) => (
              <pre
                key={`${log}-${index}`}
                className="rounded-lg bg-black/40 p-4 text-xs text-muted-foreground"
              >
                {log}
              </pre>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
