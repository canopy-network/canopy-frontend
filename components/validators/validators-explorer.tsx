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
import {
  getSampleValidators,
  SampleValidator,
} from "@/lib/demo-data/sample-validators";

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

interface ValidatorsExplorerProps {
  chainContext?: {
    id: string;
    name: string;
  };
  hideChainColumn?: boolean;
  children?: ReactNode | ReactNode[];
}

const statusAccent: Record<SampleValidator["status"], string> = {
  Online:
    "border-[#36d26a] bg-[#36d26a]/10 text-[#7cff9d] shadow-[0_0_14px_rgba(124,255,157,0.35)]",
  Offline: "border-gray-500/40 bg-gray-500/10 text-gray-300",
  Jailed:
    "border-red-500/60 bg-red-500/10 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]",
};

export function ValidatorsExplorer({
  chainContext,
  hideChainColumn = false,
  children,
}: ValidatorsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const chainContextId = chainContext?.id ?? null;
  const chainContextName = chainContext?.name ?? null;

  const validatorSource = useMemo(() => {
    if (!chainContextId) {
      return getSampleValidators();
    }

    const sampleValidators = getSampleValidators();
    const hasMatches = sampleValidators.some(
      (validator) => validator.chain.id === chainContextId
    );

    if (hasMatches) {
      return sampleValidators;
    }

    return sampleValidators.map((validator, index) => ({
      ...validator,
      id: `${chainContextId}-validator-${index}`,
      chain: {
        ...validator.chain,
        id: chainContextId,
        name: chainContextName ?? validator.chain.name,
      },
    }));
  }, [chainContextId, chainContextName]);

  const chainFilterId = chainContextId;
  const displayChainName = chainContextName ?? "All Chains";

  const filteredValidators = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return validatorSource.filter((validator) => {
      const matchesQuery = query
        ? [validator.chain.name, validator.name, validator.status]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;
      const matchesChain = chainFilterId
        ? validator.chain.id === chainFilterId
        : true;
      return matchesQuery && matchesChain;
    });
  }, [searchQuery, chainFilterId, validatorSource]);

  const totalEntries = filteredValidators.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / ROWS_PER_PAGE));

  const paginatedValidators = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredValidators.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredValidators, currentPage]);

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
    router.push(`/chains/${chain.id}/validators`);
  };

  const formatStake = (stake: number) => {
    if (stake >= 1000000) {
      return `$${(stake / 1000000).toFixed(1)}M`;
    } else if (stake >= 1000) {
      return `$${(stake / 1000).toFixed(1)}K`;
    }
    return `$${stake.toFixed(0)}`;
  };

  return (
    <Container type="boxed" className="space-y-6 px-6 lg:px-10 mt-6">
      <div
        id="validators-page-header"
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <h1 className="text-3xl font-bold tracking-tight">Validators</h1>

        <HashSearchbar
          value={searchQuery}
          onType={setSearchQuery}
          placeholder="Search by validator name"
          wrapperClassName="max-w-[256px] ml-auto"
        />

        <div className="flex flex-wrap items-center gap-3">
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
              validators
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
                  Validator Name
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Stake
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Blocks
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Uptime
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  APR
                </TableHead>
                <TableHead className="text-right text-xs uppercase tracking-wide text-muted-foreground">
                  Rewards
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedValidators.map((validator) => (
                <TableRow key={validator.id} appearance="plain">
                  <TableCell>
                    <Link href={`/validators/${validator.address}`}>
                      <span className="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 hover:bg-white/10 transition-colors cursor-pointer">
                        {validator.name}
                      </span>
                    </Link>
                  </TableCell>

                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                        statusAccent[validator.status]
                      )}
                    >
                      <span className="h-2 w-2 rounded-full bg-current shadow-[0_0_0_3px_rgba(255,255,255,0.08)]" />
                      {validator.status}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-white/80">
                    {formatStake(validator.stake)}
                  </TableCell>

                  <TableCell className="text-sm text-white/80">
                    {validator.blocks.toLocaleString()}
                  </TableCell>

                  <TableCell className="text-sm text-white/80">
                    {validator.uptime.toFixed(1)}%
                  </TableCell>

                  <TableCell className="text-sm text-white/80">
                    {validator.apr.toFixed(1)}%
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="font-semibold text-sm text-[#7cff9d]">
                      {validator.rewards.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      CNPY
                    </span>
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
