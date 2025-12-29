"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { TableCard, TableColumn } from "@/components/explorer/table-card";
import {
  useExplorerSearch,
  getExplorerBlocksWithPagination,
  type Block,
} from "@/lib/api/explorer";
import type { ExplorerBlocksResponse } from "@/types/blocks";
import { canopyIconSvg, EXPLORER_ICON_GLOW, getCanopyAccent } from "@/lib/utils/brand";
import { useChainsStore } from "@/lib/stores/chains-store";
import { CopyableText } from "@/components/ui/copyable-text";
import { useQuery } from "@tanstack/react-query";
import { Box } from "lucide-react";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { searchChains } from "@/lib/api/chains";

const ROWS_PER_PAGE = 10;

const formatAddress = (value: string, prefix = 6, suffix = 6) => {
  if (!value || value.length <= prefix + suffix) return value;
  return `${value.slice(0, prefix)}...${value.slice(-suffix)}`;
};

const formatTimeAgo = (timestamp: string): string => {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = Math.max(1, Math.round((now - time) / 60000));
  if (diff < 60) return `${diff} min${diff > 1 ? "s" : ""} ago`;
  const hours = Math.round(diff / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const formatBlockTime = (blockTime?: number): string => {
  if (!blockTime) return "-";
  return `${blockTime.toFixed(1)} s`;
};

const getValidatorName = (address: string): string => {
  if (!address || address.length < 6) return "-";
  const shortAddr = address.slice(0, 6);
  return `Val-${shortAddr.slice(-2)}`;
};

interface BlocksExplorerProps {
  chainContext?: {
    id: string;
    name: string;
  };
  hideChainColumn?: boolean;
  children?: React.ReactNode | React.ReactNode[];
}

export function BlocksExplorer({
  chainContext,
  children,
}: BlocksExplorerProps) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorHistory, setCursorHistory] = useState<(number | undefined)[]>([undefined]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchedChainId, setSearchedChainId] = useState<number | undefined>(undefined);
  const getChainById = useChainsStore((state) => state.getChainById);

  const chainIdFromUrl = searchParams.get("chain");
  const chainContextId = useMemo(() => {
    if (chainIdFromUrl) {
      const chainIdNum = parseInt(chainIdFromUrl, 10);
      return chainIdNum > 0 ? chainIdNum : undefined;
    }
    return chainContext?.id ? parseInt(chainContext.id, 10) : undefined;
  }, [chainIdFromUrl, chainContext?.id]);

  const trimmedSearchQuery = useMemo(() => searchQuery.trim(), [searchQuery]);
  const debouncedSearchQuery = useDebouncedValue(trimmedSearchQuery, 300);
  const shouldUseSearch = debouncedSearchQuery.length > 0;

  useEffect(() => {
    if (!debouncedSearchQuery) {
      setSearchedChainId(undefined);
      return;
    }

    const controller = new AbortController();

    const searchForChains = async () => {
      try {
        const data = await searchChains(
          debouncedSearchQuery,
          controller.signal
        );

        if (data.success && data.chains && data.chains.length > 0) {
          const firstChain = data.chains[0];
          setSearchedChainId(firstChain.id);
        } else {
          setSearchedChainId(undefined);
        }
      } catch (error) {
        const errorCode = (error as { code?: string }).code;
        if ((error as Error).name === "AbortError" || errorCode === "ERR_CANCELED") {
          return;
        }
        console.error("Error searching chains:", error);
        setSearchedChainId(undefined);
      }
    };

    searchForChains();
    return () => controller.abort();
  }, [debouncedSearchQuery]);

  const effectiveChainId = searchedChainId ?? chainContextId;

  const {
    data: searchResults,
    isLoading: isSearching,
  } = useExplorerSearch(debouncedSearchQuery, {
    enabled: shouldUseSearch && !searchedChainId,
  });

  const searchBlocks = useMemo(() => {
    if (!shouldUseSearch || !searchResults) return [];
    return searchResults
      .filter((result) => result.type === "block")
      .map((result) => {
        if (result.type === "block") {
          return result.result as Block;
        }
        return null;
      })
      .filter((block): block is Block => block !== null);
  }, [searchResults, shouldUseSearch]);

  const isUsingBlocksApi = !shouldUseSearch || searchedChainId !== undefined;

  const currentCursor = useMemo(() => {
    if (!isUsingBlocksApi) return undefined;
    return currentPage > 1 ? cursorHistory[currentPage - 1] : undefined;
  }, [currentPage, cursorHistory, isUsingBlocksApi]);

  const {
    data: blocksResponse,
    isLoading: isLoadingBlocks,
  } = useQuery<ExplorerBlocksResponse>({
    queryKey: ["explorer", "blocks", effectiveChainId, currentCursor, ROWS_PER_PAGE, currentPage],
    queryFn: async () => {
      const params = {
        ...(effectiveChainId && { chain_id: effectiveChainId }),
        limit: ROWS_PER_PAGE,
        cursor: currentCursor,
        sort: "desc" as const,
      };
      return await getExplorerBlocksWithPagination(params);
    },
    enabled: isUsingBlocksApi,
    staleTime: 10000,
  });

  const blocks = useMemo(() => {
    if (!isUsingBlocksApi) {
      return searchBlocks;
    }

    return blocksResponse?.data ?? [];
  }, [isUsingBlocksApi, searchBlocks, blocksResponse]);

  useEffect(() => {
    if (!isUsingBlocksApi || !blocksResponse) {
      return;
    }

    const blocksData = blocksResponse.data ?? [];
    if (blocksData.length === 0) {
      setTotalCount(0);
      return;
    }

    const nextCursor = blocksResponse.pagination?.next_cursor;

    if (nextCursor !== null && nextCursor !== undefined) {
      setCursorHistory((prev) => {
        const newHistory = [...prev];
        while (newHistory.length <= currentPage) {
          newHistory.push(undefined);
        }
        newHistory[currentPage] = nextCursor;
        return newHistory;
      });
    }

    const hasMore = nextCursor !== null && nextCursor !== undefined;
    if (hasMore) {
      setTotalCount(nextCursor);
    } else {
      setTotalCount(blocksData.length + ((currentPage - 1) * ROWS_PER_PAGE));
    }
  }, [isUsingBlocksApi, blocksResponse, currentPage]);

  const getChainColor = (chainId: number): string => {
    const chain = getChainById(chainId.toString());
    return chain?.brand_color || getCanopyAccent(chainId.toString());
  };

  const totalEntries = isUsingBlocksApi
    ? totalCount > 0
      ? totalCount
      : blocks.length > 0
        ? blocks.length
        : 0
    : searchBlocks.length;

  const paginatedBlocks = useMemo(() => {
    if (!isUsingBlocksApi) {
      const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
      return blocks.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }
    return blocks;
  }, [blocks, currentPage, isUsingBlocksApi]);

  useEffect(() => {
    setCurrentPage(1);
    setCursorHistory([undefined]);
    setTotalCount(0);
  }, [debouncedSearchQuery, chainContextId, searchedChainId]);

  const columns: TableColumn[] = [
    { label: "Height", width: "w-32" },
    { label: "Hash", width: "w-40" },
    { label: "Txns", width: "w-24" },
    { label: "Time", width: "w-32" },
    { label: "Block Time", width: "w-32" },
    { label: "Producer", width: "w-40" },
    { label: "Gas", width: "w-32" },
  ];

  const rows = paginatedBlocks
    .map((block) => {
      if (!block || !block.height) {
        return null;
      }

      const chainColor = getChainColor(block.chain_id || 1);
      const validatorName = block.proposer_address
        ? getValidatorName(block.proposer_address)
        : "-";
      const numTxs = block.num_txs ?? (block as any).total_txs ?? 0;
      const blockTime = (block as any).block_time;
      const totalFees = (block as any).total_fees ?? 0;

      return [
        <Link
          key="height"
          href={`/blocks/${block.height}`}
          className="flex items-center gap-2 text-xs text-white/80 hover:opacity-80 transition-opacity hover:underline font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center w-5 h-5 border border-[#00a63d] rounded bg-black/30">
            <Box className={`w-3 h-3 text-[#00a63d] ${EXPLORER_ICON_GLOW}`} />
          </div>
          {block.height ? block.height.toLocaleString() : "-"}
        </Link>,
        <Link
          key="hash"
          href={`/blocks/${block.height}`}
          className="text-xs font-mono text-white/80 hover:opacity-80 transition-opacity hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {block.hash ? formatAddress(block.hash, 6, 4) : "-"}
        </Link>,
        <span key="txns" className="text-sm text-white/80">
          {numTxs.toLocaleString()}
        </span>,
        <span key="time" className="text-sm text-muted-foreground">
          {block.timestamp ? formatTimeAgo(block.timestamp) : "-"}
        </span>,
        <span key="block-time" className="text-sm text-muted-foreground">
          {formatBlockTime(blockTime)}
        </span>,
        <div key="producer" className="flex flex-col gap-1">
          {block.proposer_address ? (
            <>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 flex items-center justify-center shrink-0"
                  dangerouslySetInnerHTML={{
                    __html: canopyIconSvg(chainColor),
                  }}
                />
                <Link
                  href={`/validators/${block.proposer_address}`}
                  className="text-xs font-medium text-white hover:opacity-80 transition-opacity hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {validatorName}
                </Link>
              </div>
              <Link
                href={`/accounts/${block.proposer_address}`}
                className="text-xs font-mono text-white/60 hover:opacity-80 transition-opacity hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <CopyableText
                  text={block.proposer_address}
                  truncate={(addr) => formatAddress(addr, 5, 5)}
                  className="text-xs"
                />
              </Link>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>,
        <span key="gas" className="text-sm text-white/80 text-right">
          {totalFees.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>,
      ];
    })
    .filter((row): row is React.ReactNode[] => row !== null);

  const isLoading = shouldUseSearch
    ? (searchedChainId !== undefined ? isLoadingBlocks : isSearching)
    : isLoadingBlocks;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      {children ? <div>{children}</div> : null}
      <TableCard
        id="blocks-table"
        title="Blocks"
        searchPlaceholder="Search by height, hash, block..."
        onSearch={handleSearch}
        searchValue={searchQuery}
        live={false}
        columns={columns}
        rows={rows}
        loading={isLoading}
        paginate={true}
        pageSize={ROWS_PER_PAGE}
        currentEntriesPerPage={ROWS_PER_PAGE}
        totalCount={totalEntries}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        showCSVButton={true}
        spacing={3}
        className="gap-2 lg:gap-6"
      />
    </div>
  );
}
