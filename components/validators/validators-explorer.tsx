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
import { validatorsApi, type ValidatorData } from "@/lib/api/validators";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

type ValidatorStatus = "Online" | "Offline" | "Jailed";

type TransformedValidator = {
  id: string;
  chain: {
    id: string;
    name: string;
    ticker: string;
    branding: string;
  };
  address: string;
  stake: number;
  votingPower: number;
  commission: string;
  uptime: number;
  status: ValidatorStatus;
  apy: number;
  rewards: number;
  committees: number[];
  rank: number;
  autoCompound: boolean;
  totalDelegated: number;
  committeeStakes: {
    committeeId: number;
    stake: number;
    percentage: number;
  }[];
  totalNetworkControl: number;
};

const statusAccent: Record<ValidatorStatus, string> = {
  Online:
    "border-[#00a63d] bg-[#00a63d]/10 text-[#00a63d] shadow-[0_0_14px_rgba(0,166,61,0.35)]",
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
  const [validators, setValidators] = useState<TransformedValidator[]>([]);
  const [isLoadingValidators, setIsLoadingValidators] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chainFilterId, setChainFilterId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();

  const chainContextId = chainContext?.id ?? null;
  const chainContextName = chainContext?.name ?? null;

  useEffect(() => {
    setChainFilterId(chainContextId);
  }, [chainContextId]);

  // Fetch validators from API
  useEffect(() => {
    async function fetchValidators() {
      try {
        setIsLoadingValidators(true);
        setError(null);

        const response = await validatorsApi.getValidators({
          chain_id: chainContextId ? parseInt(chainContextId) : undefined,
          limit: 100,
        });

        // Transform API data
        const transformedValidators: TransformedValidator[] =
          response.validators.map((validator: ValidatorData, index: number) => {
            // ===== Data from API =====
            const stakedCnpy = parseFloat(
              validator.staked_cnpy.replace(/,/g, "")
            );
            const votingPower = parseFloat(validator.voting_power);
            const committees = validator.committees || [validator.chain_id];
            const apy = validator.apy ?? 0;
            const uptime = Number(validator.uptime ?? 0);

            // Map API status to display status
            let statusDisplay: ValidatorStatus = "Online";
            if (validator.status === "unstaking") {
              statusDisplay = "Offline";
            } else if (validator.status === "paused") {
              statusDisplay = "Jailed";
            }

            // Calculate estimated rewards
            const rewards = stakedCnpy * (apy / 100);

            return {
              id: `${validator.chain_id}-${validator.address}`,
              chain: {
                id: validator.chain_id.toString(),
                name: validator.chain_name,
                ticker:
                  validator.chain_id === 1
                    ? "CNPY"
                    : `C00${validator.chain_id}`,
                branding: "#1dd13a",
              },
              address: validator.address,
              stake: stakedCnpy,
              votingPower: votingPower,
              commission: validator.delegate ? "10%" : "5%",
              uptime,
              status: statusDisplay,
              apy,
              rewards,
              committees,
              rank: index + 1,
              autoCompound: validator.compound,
              totalDelegated: validator.delegate ? stakedCnpy : 0,
              committeeStakes: committees.map((id) => ({
                committeeId: id,
                stake: stakedCnpy / committees.length,
                percentage: votingPower / committees.length,
              })),
              totalNetworkControl: votingPower,
            };
          });

        setValidators(transformedValidators);
        setIsLoadingValidators(false);
      } catch (err) {
        console.error("Failed to fetch validators:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load validators"
        );
        setIsLoadingValidators(false);
      }
    }

    fetchValidators();
  }, [chainContextId]);

  const validatorSource = validators;

  const chainFilterLabel = useMemo(() => {
    if (!chainFilterId) return "All Chains";
    const match = validators.find((v) => v.chain.id === chainFilterId);
    return match?.chain.name ?? "All Chains";
  }, [chainFilterId, validators]);

  const filteredValidators = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return validatorSource.filter((validator) => {
      const matchesQuery = query
        ? [
            validator.chain.name,
            validator.address,
            validator.status,
          ]
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
      return `${(stake / 1000000).toFixed(1)}M CNPY`;
    } else if (stake >= 1000) {
      return `${(stake / 1000).toFixed(1)}K CNPY`;
    }
    return `${stake.toFixed(0)} CNPY`;
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-3)}`;
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
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className=" border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                <Filter className="size-4" />
                {chainFilterLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0">
              <div className="flex flex-col">
                <button
                  type="button"
                  className={cn(
                    "px-4 py-2 text-sm text-left hover:bg-muted",
                    !chainFilterId && "bg-muted/50 font-semibold"
                  )}
                  onClick={() => {
                    setChainFilterId(null);
                    setIsFilterOpen(false);
                  }}
                >
                  All Chains
                </button>
                {Array.from(
                  new Map(
                    validators.map((v) => [v.chain.id, v.chain.name])
                  ).entries()
                ).map(([id, name]) => (
                  <button
                    key={id}
                    type="button"
                    className={cn(
                      "px-4 py-2 text-sm text-left hover:bg-muted",
                      chainFilterId === id && "bg-muted/50 font-semibold"
                    )}
                    onClick={() => {
                      setChainFilterId(id);
                      setIsFilterOpen(false);
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

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

      {error && (
        <Card className="p-6 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-500/20 p-2">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-red-500">
                Error Loading Validators
              </h3>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        </Card>
      )}

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
                  Chain
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Address
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Stake
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Uptime
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  APY
                </TableHead>
                <TableHead className="text-right text-xs uppercase tracking-wide text-muted-foreground">
                  Rewards
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoadingValidators ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-muted-foreground">
                        Loading validators...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedValidators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <span className="text-muted-foreground">
                      {error
                        ? "Unable to load validators"
                        : "No validators found"}
                    </span>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedValidators.map((validator) => (
                  <TableRow key={validator.id} appearance="plain">
                  <TableCell className="text-sm text-white/80">
                    {validator.chain.name}
                  </TableCell>

                    <TableCell className="text-sm text-white/80 font-mono">
                      <Link href={`/validators/${validator.address}`}>
                        <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 hover:bg-white/10 transition-colors">
                          {formatAddress(validator.address)}
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
                      {validator.uptime.toFixed(1)}%
                    </TableCell>

                    <TableCell className="text-sm text-white/80">
                      {validator.apy.toFixed(2)}%
                    </TableCell>

                    <TableCell className="text-right">
                      <span className="font-semibold text-sm text-[#00a63d]">
                        {validator.rewards.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
