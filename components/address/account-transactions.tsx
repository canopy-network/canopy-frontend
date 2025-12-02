"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CommandSearchTrigger } from "@/components/command-search-trigger";
import { TableArrow } from "@/components/icons";
import { cn, WINDOW_BREAKPOINTS } from "@/lib/utils";
import {
  getSampleTransactions,
  SampleTransaction,
} from "@/lib/demo-data/sample-transactions";

interface AccountTransactionsProps {
  address: string;
  hideChainColumn?: boolean;
}

const methodAccent: Record<SampleTransaction["method"], string> = {
  Transfer: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Swap: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  Stake: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  Contract: "border-amber-400/40 bg-amber-500/10 text-amber-200",
};

const formatAddress = (value: string, prefix = 4, suffix = 4) =>
  `${value.slice(0, prefix)}...${value.slice(-suffix)}`;

const getRelativeTime = (timestamp: string) => {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = Math.max(1, Math.round((now - time) / 60000));
  if (diff < 60) return `${diff} min${diff > 1 ? "s" : ""} ago`;
  const hours = Math.round(diff / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const sampleTransactions = getSampleTransactions().slice(0, 6);

export function AccountTransactions({
  address,
  hideChainColumn = false,
}: AccountTransactionsProps) {
  const transactionsForAddress = sampleTransactions.filter(
    (tx) =>
      tx.from.toLowerCase() === address.toLowerCase() ||
      tx.to.toLowerCase() === address.toLowerCase()
  );

  const displayTransactions =
    transactionsForAddress.length > 0
      ? transactionsForAddress
      : sampleTransactions;

  const displayChainName = "All Chains";

  const handleChainSelect = () => {
    // placeholder until chain selector is wired up
  };

  return (
    <Card className="lg:p-6 p-4 ">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 justify-between w-full">
          <h3 className="text-xl font-semibold">Transactions</h3>

          {window.innerWidth <= WINDOW_BREAKPOINTS.LG && (
            <CommandSearchTrigger
              buttonSize="sm"
              displayChainName={displayChainName}
              onChainSelect={handleChainSelect}
            />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {window.innerWidth > WINDOW_BREAKPOINTS.LG && (
            <CommandSearchTrigger
              explorerMode
              buttonSize="sm"
              displayChainName={displayChainName}
              onChainSelect={handleChainSelect}
            />
          )}

          <Button
            variant="outline"
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <Filter className="size-4" />
            Filter
          </Button>

          <Button
            variant="outline"
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <Download className="size-4" />
            CSV
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-transparent hover:bg-transparent">
            {!hideChainColumn && (
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                Chain Name
              </TableHead>
            )}
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
              Hash
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
              Block Height
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
              Method
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
              From
            </TableHead>
            <TableHead />
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
              To
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
              Time
            </TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide text-muted-foreground">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {displayTransactions.map((tx) => (
            <TableRow key={tx.id} appearance="plain">
              {!hideChainColumn && (
                <TableCell className="lg:px-4 pl-0 !min-w-44 lg:w-auto">
                  <div className="flex items-center gap-3">
                    <Image
                      src={tx.chain.branding}
                      alt={`${tx.chain.name} logo`}
                      width={20}
                      height={20}
                      className="size-8 rounded-full border border-white/10 object-contain"
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold truncate">
                        {tx.chain.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {tx.chain.ticker}
                      </span>
                    </div>
                  </div>
                </TableCell>
              )}

              <TableCell className="font-mono text-xs text-white/80">
                <Link href={`/transactions/${tx.hash}`}>
                  {formatAddress(tx.hash, 6, 6)}
                </Link>
              </TableCell>

              <TableCell className="font-mono text-xs text-white/80">
                #{tx.blockHeight.toLocaleString()}
              </TableCell>

              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                    methodAccent[tx.method]
                  )}
                >
                  {tx.method}
                </span>
              </TableCell>

              <TableCell className="font-mono text-xs text-white">
                {formatAddress(tx.from, 6, 6)}
              </TableCell>

              <TableCell className="w-12">
                <TableArrow className="text-white" />
              </TableCell>

              <TableCell className="font-mono text-xs text-white">
                {formatAddress(tx.to, 6, 6)}
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {getRelativeTime(tx.timestamp)}
              </TableCell>

              <TableCell className="text-right lg:pr-4 pr-0">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-emerald-400">
                    {tx.amountCnpy.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    CNPY
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Image
                      src="/icons/gas-pump.svg"
                      alt="Gas usage"
                      width={11}
                      height={10}
                      className="h-2.5 w-[11px] opacity-80"
                    />
                    <span>
                      {tx.tokenAmount} {tx.chain.ticker.replace("$", "")}
                    </span>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center ">
        <Button
          variant="outline"
          className="min-w-[140px] border-white/20 bg-transparent text-white hover:bg-white/10"
        >
          Show more
        </Button>
      </div>
    </Card>
  );
}
