"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
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
import { getSampleBlocks, SampleBlock } from "@/lib/demo-data/sample-blocks";
import { canopyIconSvg, getCanopyAccent, EXPLORER_ICON_GLOW } from "@/lib/utils/brand";

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

const formatBlockTime = (blockTime?: number) => {
  if (!blockTime) return "—";
  return `${blockTime.toFixed(1)} s`;
};

const sampleBlocks = getSampleBlocks();
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

interface BlocksExplorerProps {
  chainContext?: {
    id: string;
    name: string;
  };
  hideChainColumn?: boolean;
  children?: ReactNode | ReactNode[];
}

export function BlocksExplorer({
  chainContext,
  hideChainColumn = false,
  children,
}: BlocksExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const chainContextId = chainContext?.id ?? null;
  const chainContextName = chainContext?.name ?? null;

  const blockSource = useMemo(() => {
    if (!chainContextId) {
      return sampleBlocks;
    }

    const hasMatches = sampleBlocks.some(
      (block) => block.chain.id === chainContextId
    );

    if (hasMatches) {
      return sampleBlocks;
    }

    return sampleBlocks.map((block, index) => ({
      ...block,
      id: `${chainContextId}-block-${index}`,
      chain: {
        ...block.chain,
        id: chainContextId,
        name: chainContextName ?? block.chain.name,
      },
    }));
  }, [chainContextId, chainContextName]);

  const chainFilterId = chainContextId;
  const displayChainName = chainContextName ?? "All Chains";

  const filteredBlocks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return blockSource.filter((block) => {
      const matchesQuery = query
        ? [
            block.chain.name,
            block.hash,
            String(block.number),
            block.block_producer,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;
      const matchesChain = chainFilterId
        ? block.chain.id === chainFilterId
        : true;
      return matchesQuery && matchesChain;
    });
  }, [searchQuery, chainFilterId, blockSource]);

  const totalEntries = filteredBlocks.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / ROWS_PER_PAGE));

  const paginatedBlocks = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredBlocks.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredBlocks, currentPage]);

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
    router.push(`/chains/${chain.id}/blocks`);
  };

  return (
    <Container type="boxed" className="space-y-6 px-6 lg:px-10">
      <div
        id="blocks-page-header"
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <h1 className="text-3xl font-bold tracking-tight">Blocks</h1>

        <HashSearchbar
          value={searchQuery}
          onType={setSearchQuery}
          placeholder="Search by height, hash"
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

    <Card className="p-6 border-primary/10 bg-gradient-to-br from-background via-background/70 to-primary/5">
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
              blocks
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
                  #
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Height
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Hash
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Txns
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Time
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Block Time
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Producer
                </TableHead>
                <TableHead className="text-right text-xs uppercase tracking-wide text-muted-foreground">
                  Gas
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedBlocks.map((block, idx) => (
                <TableRow key={block.id} appearance="plain">
                  <TableCell className="font-mono text-xs text-white/80">
                    {(currentPage - 1) * ROWS_PER_PAGE + idx + 1}
                  </TableCell>

                  <TableCell className="font-mono text-xs text-white/80">
                    <Link href={`/blocks/${block.number}`}>
                      {block.number.toLocaleString()}
                    </Link>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-white/80">
                    <Link href={`/blocks/${block.number}`}>
                      {formatAddress(block.hash, 6, 4)}
                    </Link>
                  </TableCell>

                  <TableCell className="text-sm text-white/80">
                    {block.transactions}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {getRelativeTime(block.timestamp)}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatBlockTime(block.block_time)}
                  </TableCell>

                  <TableCell>
                    <div className="inline-flex items-center gap-2">
                      <span
                        className="w-8 h-8 inline-flex items-center justify-center border-2 border-background rounded-full bg-muted"
                        dangerouslySetInnerHTML={{
                          __html: canopyIconSvg(
                            getCanopyAccent(block.chain?.name || block.block_producer)
                          ),
                        }}
                      />
                      <span className="inline-flex items-center rounded-md border border-[#36d26a] bg-[#36d26a]/10 text-[#7cff9d] px-3 py-1 text-xs font-semibold shadow-[0_0_14px_rgba(124,255,157,0.35)]">
                        {block.block_producer}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right text-sm text-white/80">
                    {block.gas_used.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
