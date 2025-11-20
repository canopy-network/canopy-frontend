"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Download, Filter } from "lucide-react";
import Link from "next/link";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { TableArrow } from "@/components/icons";
import {
  getSampleTransactions,
  SampleTransaction,
} from "@/lib/demo-data/sample-transactions";

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

const methodAccent: Record<SampleTransaction["method"], string> = {
  Transfer: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Swap: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  Stake: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  Contract: "border-amber-400/40 bg-amber-500/10 text-amber-200",
};

const sampleTransactions = getSampleTransactions();
const ROWS_PER_PAGE = 20;

type PaginationEntry = number | "ellipsis";

const buildPaginationRange = (
  currentPage: number,
  totalPages: number
): PaginationEntry[] => {
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

  const pagination: PaginationEntry[] = [];
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

interface TransactionsExplorerProps {
  chainContext?: {
    id: string;
    name: string;
  };
  hideChainColumn?: boolean;
  children?: ReactNode | ReactNode[];
}

export function TransactionsExplorer({
  chainContext,
  hideChainColumn = false,
  children,
}: TransactionsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const chainContextId = chainContext?.id ?? null;
  const chainContextName = chainContext?.name ?? null;

  const transactionSource = useMemo(() => {
    if (!chainContextId) {
      return sampleTransactions;
    }

    const hasMatches = sampleTransactions.some(
      (tx) => tx.chain.id === chainContextId
    );

    if (hasMatches) {
      return sampleTransactions;
    }

    return sampleTransactions.map((tx, index) => ({
      ...tx,
      id: `${chainContextId}-tx-${index}`,
      chain: {
        ...tx.chain,
        id: chainContextId,
        name: chainContextName ?? tx.chain.name,
      },
    }));
  }, [chainContextId, chainContextName]);

  const chainFilterId = chainContextId;
  const displayChainName = chainContextName ?? "All Chains";

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return transactionSource.filter((tx) => {
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
      const matchesChain = chainFilterId ? tx.chain.id === chainFilterId : true;
      return matchesQuery && matchesChain;
    });
  }, [searchQuery, chainFilterId, transactionSource]);

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
  }, [searchQuery, chainFilterId]);

  useEffect(() => {
    setCurrentPage((previous) => Math.min(previous, totalPages));
  }, [totalPages]);

  const showingStart =
    totalEntries === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1;
  const showingEnd = Math.min(currentPage * ROWS_PER_PAGE, totalEntries);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const handleChainSelect = (chain: { id: string; chain_name: string }) => {
    router.push(`/chain/${chain.id}/transactions`);
  };

  return (
    <Container type="boxed" className="space-y-6 xl:px-0">
      <div
        id="transactions-page-header"
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>

        <HashSearchbar
          value={searchQuery}
          onType={setSearchQuery}
          placeholder="Search by address, txn hash"
          wrapperClassName="max-w-[256px] ml-auto"
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

      {children ? <div>{children}</div> : null}

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
              {paginatedTransactions.map((tx) => (
                <TableRow key={tx.id} appearance="plain">
                  {!hideChainColumn && (
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

            <Pagination className=" ml-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (!isFirstPage) {
                        setCurrentPage((page) => Math.max(1, page - 1));
                      }
                    }}
                    aria-disabled={isFirstPage}
                    tabIndex={isFirstPage ? -1 : undefined}
                    className={cn(
                      "",
                      isFirstPage && "pointer-events-none opacity-40"
                    )}
                  />
                </PaginationItem>

                {paginationItems.map((item, index) =>
                  item === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis className="text-white/50" />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === item}
                        onClick={(event) => {
                          event.preventDefault();
                          setCurrentPage(item);
                        }}
                        className={cn(
                          currentPage === item
                            ? "border-white/15  border bg-transparent text-white hover:text-background"
                            : ""
                        )}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (!isLastPage) {
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        );
                      }
                    }}
                    aria-disabled={isLastPage}
                    tabIndex={isLastPage ? -1 : undefined}
                    className={cn(
                      "",
                      isLastPage && "pointer-events-none opacity-40"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </Card>
    </Container>
  );
}
