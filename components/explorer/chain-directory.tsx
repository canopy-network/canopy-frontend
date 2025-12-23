"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Chain } from "@/types/chains";
import { canopyIconSvg, getCanopyAccent } from "@/lib/utils/brand";
import { Container } from "@/components/layout/container";
import { HashSearchbar } from "@/components/hash-searchbar";
import { Download, Filter } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChainDetailModal } from "./chain-detail-modal";

interface ChainDirectoryProps {
  chains: Chain[];
  title?: string;
}

const formatMarketCap = (value?: number | null) => {
  if (value === undefined || value === null) return "N/A";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
};

type PaginationEntry = number | "ellipsis";

const buildPaginationRange = (currentPage: number, totalPages: number): PaginationEntry[] => {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const range = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);

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

export function ChainDirectory({ chains, title = "All Chains" }: ChainDirectoryProps) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 10;

  const handleRowClick = (chain: Chain) => {
    setSelectedChain(chain);
    setIsModalOpen(true);
  };

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return chains;
    return chains.filter((chain) =>
      [chain.chain_name, chain.token_symbol, chain.token_name].filter(Boolean).join(" ").toLowerCase().includes(query)
    );
  }, [chains, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const prevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const nextPage = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };
  const paginationItems = useMemo(() => buildPaginationRange(page, totalPages), [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const showingStart = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingEnd = Math.min(page * pageSize, filtered.length);

  const handleDownloadCsv = () => {
    const rows = [
      ["Name", "Token", "Status", "Market Cap", "Volume 24h", "Holders"],
      ...filtered.map((chain) => [
        chain.chain_name,
        chain.token_symbol,
        chain.status,
        chain.virtual_pool?.market_cap_usd ?? (chain as any)?.graduated_pool?.market_cap_usd ?? "",
        (chain as any)?.liquidity?.volume_24h_usd ?? "",
        (chain as any)?.holders?.total_holders ?? (chain as any)?.holders?.total ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "chains.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Container type="boxed" className="space-y-6 px-6 lg:px-10 mt-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white leading-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">Browse graduated chains and dive into their market stats.</p>
        </div>

        <HashSearchbar
          value={searchQuery}
          onType={setSearchQuery}
          placeholder="Search chains"
          wrapperClassName="max-w-[256px] ml-auto"
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className=" border-white/15 bg-white/5 text-white hover:bg-white/10">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button
            variant="outline"
            className=" border-white/15 bg-white/5 text-white hover:bg-white/10 gap-2"
            onClick={handleDownloadCsv}
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
        </div>
      </div>

      <Card padding="explorer" className="gap-2 lg:gap-6">
        <Table>
          <TableHeader>
            <TableRow appearance="plain">
              <TableHead className="pl-0 lg:pl-4">Name</TableHead>
              <TableHead className="pl-0 lg:pl-4">Status</TableHead>
              <TableHead className="pl-0 lg:pl-4">Token</TableHead>
              <TableHead className="pl-0 lg:pl-4">Market Cap</TableHead>
              <TableHead className="pl-0 lg:pl-4">Volume 24h</TableHead>
              <TableHead className="pl-0 lg:pl-4">Holders</TableHead>
              <TableHead className="pl-0 lg:pl-4 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow appearance="plain">
                <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                  No chains found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((chain) => (
                <TableRow
                  key={chain.id}
                  appearance="plain"
                  className="hover:bg-primary/5 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(chain)}
                >
                  <TableCell className="pl-0 lg:pl-4 font-medium">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex items-center justify-center align-middle w-8 h-8"
                        dangerouslySetInnerHTML={{
                          __html: canopyIconSvg(getCanopyAccent(chain.id)),
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="hover:text-primary transition-colors">{chain.chain_name}</span>
                        <span className="text-xs text-muted-foreground">{chain.token_name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="pl-0 lg:pl-4">
                    <Badge
                      variant="outline"
                      className="capitalize border-[#00a63d] bg-[#00a63d]/10 text-[#00a63d] shadow-[0_0_14px_rgba(0,166,61,0.35)]"
                    >
                      {chain.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="pl-0 lg:pl-4">${chain.token_symbol}</TableCell>
                  <TableCell className="pl-0 lg:pl-4">
                    {formatMarketCap(
                      chain.virtual_pool?.market_cap_usd ?? (chain as any)?.graduated_pool?.market_cap_usd
                    )}
                  </TableCell>
                  <TableCell className="pl-0 lg:pl-4">
                    {formatMarketCap((chain as any)?.liquidity?.volume_24h_usd as number)}
                  </TableCell>
                  <TableCell className="pl-0 lg:pl-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <span
                          className="w-6 h-6 inline-flex items-center justify-center border-2 border-background rounded-full bg-muted"
                          dangerouslySetInnerHTML={{
                            __html: canopyIconSvg(getCanopyAccent(chain.id)),
                          }}
                        />
                        <span
                          className="w-6 h-6 inline-flex items-center justify-center border-2 border-background rounded-full bg-muted"
                          dangerouslySetInnerHTML={{
                            __html: canopyIconSvg(getCanopyAccent(`${chain.id}-b`)),
                          }}
                        />
                      </div>
                      <span className="text-sm whitespace-nowrap">
                        +
                        {(
                          (chain as any)?.holders?.total_holders ??
                          (chain as any)?.holders?.total ??
                          0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="pl-0 lg:pl-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(chain);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mt-4">
          <div className="text-xs text-muted-foreground">
            Showing {showingStart}-{showingEnd} of {filtered.length}
          </div>

          <Pagination className="justify-start lg:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    prevPage();
                  }}
                  aria-disabled={page === 1}
                  className={page === 1 ? "opacity-50 pointer-events-none" : ""}
                />
              </PaginationItem>
              {paginationItems.map((entry, idx) =>
                entry === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={entry}>
                    <PaginationLink
                      href="#"
                      isActive={entry === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(entry);
                      }}
                    >
                      {entry}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    nextPage();
                  }}
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? "opacity-50 pointer-events-none" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Card>

      {/* Modal */}
      {selectedChain && <ChainDetailModal chain={selectedChain} open={isModalOpen} onOpenChange={setIsModalOpen} />}
    </Container>
  );
}
