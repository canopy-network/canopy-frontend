"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { CommandSearchTrigger } from "@/components/command-search-trigger";
import { HashSearchbar } from "@/components/hash-searchbar";

type ChainDescriptor = {
  id: string;
  name: string;
  ticker: string;
  branding: string;
};

type TransactionRow = {
  id: string;
  chain: ChainDescriptor;
  hash: string;
  blockHeight: number;
  method: "Transfer" | "Swap" | "Stake" | "Contract";
  from: string;
  to: string;
  timestamp: string;
  amountCnpy: number;
  tokenAmount: number;
};

const chainCatalog: ChainDescriptor[] = [
  {
    id: "chris-testing",
    name: "Chris is Testing",
    ticker: "$CNPY",
    branding: "/placeholder-logo.svg",
  },
  {
    id: "aperture",
    name: "Aperture Network",
    ticker: "$CNPY",
    branding: "/images/logo.svg",
  },
  {
    id: "solaris",
    name: "Solaris Chain",
    ticker: "$CNPY",
    branding: "/placeholder-logo.svg",
  },
  {
    id: "atlas",
    name: "Atlas Labs",
    ticker: "$CNPY",
    branding: "/placeholder-logo.svg",
  },
];

const randomHex = (length: number) =>
  Array.from({ length }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");

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

const methodAccent: Record<TransactionRow["method"], string> = {
  Transfer: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Swap: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  Stake: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  Contract: "border-amber-400/40 bg-amber-500/10 text-amber-200",
};

const generateTransactions = (count = 200): TransactionRow[] => {
  const methods: TransactionRow["method"][] = [
    "Transfer",
    "Swap",
    "Stake",
    "Contract",
  ];

  return Array.from({ length: count }, (_, index) => {
    const chain = chainCatalog[index % chainCatalog.length];
    const method = methods[index % methods.length];
    const minutesAgo = (index + 1) * 3;

    return {
      id: `tx-${index}`,
      chain,
      hash: `0x${randomHex(64)}`,
      blockHeight: 34000 + index * 7,
      method,
      from: `0x${randomHex(40)}`,
      to: `0x${randomHex(40)}`,
      timestamp: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
      amountCnpy: Number((Math.random() * 20000 + 2000).toFixed(2)),
      tokenAmount: Number((Math.random() * 2).toFixed(3)),
    };
  });
};

const sampleTransactions = generateTransactions();

const ROWS_PER_PAGE = 20;

type PaginationItem = number | "ellipsis";

const buildPaginationRange = (
  currentPage: number,
  totalPages: number
): PaginationItem[] => {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const range = new Set<number>([
    1,
    totalPages,
    currentPage,
    currentPage - 1,
    currentPage + 1,
  ]);

  const sorted = Array.from(range)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const pagination: PaginationItem[] = [];
  let previous: number | undefined;

  for (const page of sorted) {
    if (previous !== undefined && page - previous > 1) {
      pagination.push("ellipsis");
    }
    pagination.push(page);
    previous = page;
  }

  return pagination;
};

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChain, setActiveChain] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const selectedChain = useMemo(
    () =>
      activeChain
        ? chainCatalog.find((chain) => chain.id === activeChain) ?? null
        : null,
    [activeChain]
  );
  const displayChainName = selectedChain ? selectedChain.name : "All Chains";

  const handleChainSelect = (chain: { id: string; chain_name: string }) => {
    setActiveChain(chain.id);
    setSearchQuery("");
  };

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sampleTransactions.filter((tx) => {
      const matchesQuery = query
        ? [
            tx.chain.name,
            tx.chain.ticker,
            tx.hash,
            tx.from,
            tx.to,
            tx.method,
            String(tx.blockHeight),
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;
      const matchesChain = activeChain ? tx.chain.id === activeChain : true;
      return matchesQuery && matchesChain;
    });
  }, [searchQuery, activeChain]);

  const totalEntries = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / ROWS_PER_PAGE));

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredTransactions.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const paginationItems = useMemo(
    () => buildPaginationRange(currentPage, totalPages),
    [currentPage, totalPages]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeChain]);

  useEffect(() => {
    setCurrentPage((previous) => Math.min(previous, totalPages));
  }, [totalPages]);

  const showingStart =
    totalEntries === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1;
  const showingEnd = Math.min(currentPage * ROWS_PER_PAGE, totalEntries);

  return (
    <Container type="boxed" className="space-y-6 xl:px-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>

        <HashSearchbar
          value={searchQuery}
          onType={setSearchQuery}
          placeholder="Search by address, txn hash"
          wrapperClassName="max-w-xl ml-auto"
        />

        <div className="flex flex-wrap items-center gap-3">
          <CommandSearchTrigger
            explorerMode
            displayChainName={displayChainName}
            onChainSelect={handleChainSelect}
          />

          <Button
            variant="outline"
            className=" border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <Filter className="size-4" />
            Filter
          </Button>

          <Button
            variant="outline"
            className=" border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <Download className="size-4" />
            CSV
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="text-white ">
                {totalEntries === 0 ? 0 : showingStart}
              </span>{" "}
              to <span className="text-white ">{showingEnd}</span> of{" "}
              <span className="text-white ">
                {totalEntries.toLocaleString()}
              </span>{" "}
              transactions
            </p>
          </div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Live updates every 12 seconds
          </p>
        </div>

        <div className="overflow-hidden">
          <Table>
            <TableHeader className="">
              <TableRow className="bg-transparent hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Chain Name
                </TableHead>
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
              {paginatedTransactions.map((tx) => (
                <TableRow key={tx.id} appearance="plain">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={tx.chain.branding}
                        alt={`${tx.chain.name} logo`}
                        width={20}
                        height={20}
                        className="object-contain rounded-full size-8 border border-white/10"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {tx.chain.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {tx.chain.ticker}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-white/80">
                    {formatAddress(tx.hash, 6, 6)}
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
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      <ArrowRight className="size-4 text-white/70" />
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-white">
                    {formatAddress(tx.to, 6, 6)}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {getRelativeTime(tx.timestamp)}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-emerald-400 font-semibold text-sm">
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

          <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
            <p>
              Showing {showingStart} to {showingEnd} of{" "}
              {totalEntries.toLocaleString()} entries
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-4 py-2 transition-colors",
                  currentPage === 1
                    ? "border-white/5 text-white/30"
                    : "border-white/15 text-white/80 hover:border-white/40"
                )}
              >
                <ChevronLeft className="size-4" />
                Previous
              </button>

              {paginationItems.map((item, index) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-white/40"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCurrentPage(item)}
                    className={cn(
                      "min-w-10 rounded-full border px-3 py-2 text-center transition-colors",
                      currentPage === item
                        ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-200"
                        : "border-white/15 text-white/80 hover:border-white/40"
                    )}
                    aria-current={currentPage === item}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-4 py-2 transition-colors",
                  currentPage === totalPages
                    ? "border-white/5 text-white/30"
                    : "border-white/15 text-white/80 hover:border-white/40"
                )}
              >
                Next
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </Container>
  );
}
