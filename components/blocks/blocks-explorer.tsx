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

const ROWS_PER_PAGE = 10;

// Format address (truncate middle)
const formatAddress = (value: string, prefix = 6, suffix = 6) => {
  if (!value || value.length <= prefix + suffix) return value;
  return `${value.slice(0, prefix)}…${value.slice(-suffix)}`;
};

// Format time ago from timestamp
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

// Format block time
const formatBlockTime = (blockTime?: number): string => {
  if (!blockTime) return "—";
  return `${blockTime.toFixed(1)} s`;
};

// Get validator name from address
const getValidatorName = (address: string): string => {
  if (!address || address.length < 6) return "—";
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
  const [cursorHistory, setCursorHistory] = useState<(number | undefined)[]>([undefined]); // Track cursor history for pagination: [page0, page1, page2, ...]
  const [totalCount, setTotalCount] = useState(0);
  const [searchedChainId, setSearchedChainId] = useState<number | undefined>(undefined);
  const getChainById = useChainsStore((state) => state.getChainById);

  // Get chain_id from URL search params or chainContext
  const chainIdFromUrl = searchParams.get("chain");
  const chainContextId = useMemo(() => {
    // Priority: URL param > chainContext
    if (chainIdFromUrl) {
      const chainIdNum = parseInt(chainIdFromUrl, 10);
      const result = chainIdNum > 0 ? chainIdNum : undefined;
      console.log("[BlocksExplorer] chainIdFromUrl:", chainIdFromUrl, "-> chainContextId:", result);
      return result;
    }
    const result = chainContext?.id ? parseInt(chainContext.id, 10) : undefined;
    console.log("[BlocksExplorer] Using chainContext:", result);
    return result;
  }, [chainIdFromUrl, chainContext?.id]);

  // Determine if we should use search API or blocks API
  const shouldUseSearch = searchQuery.trim().length > 0;
  const trimmedSearchQuery = searchQuery.trim();

  // Search chains when there's a search query
  useEffect(() => {
    if (!trimmedSearchQuery) {
      setSearchedChainId(undefined);
      return;
    }

    const searchChains = async () => {
      try {
        const response = await fetch(
          `/api/chains/search?q=${encodeURIComponent(trimmedSearchQuery)}`
        );
        const data = await response.json();

        if (data.success && data.chains && data.chains.length > 0) {
          // Use the first matching chain's ID
          const firstChain = data.chains[0];
          setSearchedChainId(firstChain.id);
        } else {
          // No chain found, clear searched chain
          setSearchedChainId(undefined);
        }
      } catch (error) {
        console.error("Error searching chains:", error);
        setSearchedChainId(undefined);
      }
    };

    searchChains();
  }, [trimmedSearchQuery]);

  // Determine which chain_id to use: searched chain > context chain > undefined
  const effectiveChainId = searchedChainId ?? chainContextId;

  console.log("[BlocksExplorer] effectiveChainId:", effectiveChainId, {
    searchedChainId,
    chainContextId,
    chainIdFromUrl,
  });

  // Fetch blocks using search API when there's a search query but no chain match
  const {
    data: searchResults,
    isLoading: isSearching,
  } = useExplorerSearch(trimmedSearchQuery, {
    enabled: shouldUseSearch && !searchedChainId, // Only use explorer search if no chain was found
  });

  // Filter search results to only blocks
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

  // Calculate cursor for current page (cursor-based pagination)
  // Cursor history stores the cursor used to fetch each page
  // cursorHistory[0] = undefined (page 1, no cursor)
  // cursorHistory[1] = cursor used to fetch page 2 (next_cursor from page 1)
  // cursorHistory[2] = cursor used to fetch page 3 (next_cursor from page 2)
  // So to fetch page N, we use cursorHistory[N-1]
  const currentCursor = useMemo(() => {
    if (shouldUseSearch) return undefined; // Search doesn't use cursor
    // Page 1 uses no cursor, page 2+ uses cursor from history
    return currentPage > 1 ? cursorHistory[currentPage - 1] : undefined;
  }, [currentPage, cursorHistory, shouldUseSearch]);

  // Fetch blocks using blocks API when there's no search or when a chain was found
  // Use getExplorerBlocksWithPagination to get full response with pagination
  const {
    data: blocksResponse,
    isLoading: isLoadingBlocks,
  } = useQuery<ExplorerBlocksResponse>({
    queryKey: ["explorer", "blocks", effectiveChainId, currentCursor, ROWS_PER_PAGE, currentPage],
    queryFn: async () => {
      // Use getExplorerBlocksWithPagination which uses explorerApi.getBlocks internally
      // Pass chain_id so it updates when chain changes or when a chain is searched
      const params = {
        ...(effectiveChainId && { chain_id: effectiveChainId }),
        limit: ROWS_PER_PAGE,
        cursor: currentCursor,
        sort: "desc" as const,
      };
      console.log("[BlocksExplorer] Fetching blocks with params:", params);
      return await getExplorerBlocksWithPagination(params);
    },
    enabled: !shouldUseSearch || searchedChainId !== undefined, // Enable if no search or if chain was found
    staleTime: 10000, // 10 seconds
  });

  // Get blocks from API response and update cursor history
  const blocks = useMemo(() => {
    // If a chain was found via search, use blocks API (already filtered by chain_id)
    if (shouldUseSearch && searchedChainId !== undefined) {
      // Blocks are already filtered by chain_id in the API call
      if (!blocksResponse) return [];
      return Array.isArray(blocksResponse.data) ? blocksResponse.data : [];
    }

    // If no chain found, use explorer search API
    if (shouldUseSearch && !searchedChainId) {
      return searchBlocks;
    }

    if (!blocksResponse) {
      return [];
    }

    // Handle case where blocksResponse might be an array directly (fallback)
    if (Array.isArray(blocksResponse)) {
      console.warn("[BlocksExplorer] blocksResponse is an array, expected ExplorerBlocksResponse object");
      // If it's an array, we can't get pagination info, so estimate
      setTotalCount(blocksResponse.length);
      return blocksResponse;
    }

    // The API returns { data: Block[], pagination: { limit, next_cursor } }
    const blocksData = Array.isArray(blocksResponse.data)
      ? blocksResponse.data
      : [];

    // Update cursor history and total count based on pagination
    if (blocksData.length > 0) {
      const nextCursor = blocksResponse.pagination?.next_cursor;

      // Store cursor for next page navigation
      // next_cursor is the height of the last block in current page
      // Store it in cursorHistory[currentPage] so we can use it to fetch page (currentPage + 1)
      if (nextCursor !== null && nextCursor !== undefined) {
        setCursorHistory((prev) => {
          const newHistory = [...prev];
          // Ensure array is long enough
          while (newHistory.length <= currentPage) {
            newHistory.push(undefined);
          }
          // Store cursor for next page (currentPage + 1)
          newHistory[currentPage] = nextCursor;
          return newHistory;
        });
      }

      // Calculate total count
      // next_cursor is the height of the last block, which represents the total number of blocks
      const hasMore = nextCursor !== null && nextCursor !== undefined;
      if (hasMore) {
        // Use next_cursor as the total count since it represents the height of the last block
        // Height is incremental, so next_cursor is a good estimate of total blocks
        setTotalCount(nextCursor);
      } else {
        // This is the last page, calculate exact total from current page data
        setTotalCount(blocksData.length + ((currentPage - 1) * ROWS_PER_PAGE));
      }
    } else {
      setTotalCount(0);
    }

    return blocksData;
  }, [shouldUseSearch, searchBlocks, blocksResponse, currentPage, searchedChainId]);

  // Helper function to get chain color from chain_id
  const getChainColor = (chainId: number): string => {
    const chain = getChainById(chainId.toString());
    return chain?.brand_color || getCanopyAccent(chainId.toString());
  };

  // Calculate pagination
  // For search: use actual count
  // For API: use totalCount which is updated based on pagination response
  // If totalCount is 0 but we have blocks, use blocks.length as fallback
  const totalEntries = shouldUseSearch
    ? searchBlocks.length
    : totalCount > 0
      ? totalCount
      : blocks.length > 0
        ? blocks.length
        : 0;

  const paginatedBlocks = useMemo(() => {
    if (shouldUseSearch) {
      // For search results, paginate locally
      const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
      return blocks.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }
    // For API results, blocks are already paginated by API (one page at a time)
    return blocks;
  }, [blocks, currentPage, shouldUseSearch]);

  // Reset pagination when search or chain changes
  useEffect(() => {
    setCurrentPage(1);
    setCursorHistory([undefined]);
    setTotalCount(0);
  }, [searchQuery, chainContextId, searchedChainId]);

  const columns: TableColumn[] = [
    { label: "Height", width: "w-32" },
    { label: "Hash", width: "w-40" },
    { label: "Txns", width: "w-24" },
    { label: "Time", width: "w-32" },
    { label: "Block Time", width: "w-32" },
    { label: "Producer", width: "w-40" },
    { label: "Gas", width: "w-32" },
  ];

  const rows = paginatedBlocks.map((block) => {
    // Validate block has required fields
    if (!block || !block.height) {
      return null;
    }

    const chainColor = getChainColor(block.chain_id || 1);
    const validatorName = block.proposer_address ? getValidatorName(block.proposer_address) : "—";
    const numTxs = block.num_txs ?? (block as any).total_txs ?? 0;
    const blockTime = (block as any).block_time;
    const totalFees = (block as any).total_fees ?? 0;

    return [
      // Height - with green cube icon
      <Link
        key="height"
        href={`/blocks/${block.height}`}
        className="flex items-center gap-2 text-xs text-white/80 hover:opacity-80 transition-opacity hover:underline font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-5 h-5 border border-[#00a63d] rounded bg-black/30">
          <Box className={`w-3 h-3 text-[#00a63d] ${EXPLORER_ICON_GLOW}`} />
        </div>
        {block.height ? block.height.toLocaleString() : "—"}
      </Link>,
      // Hash
      <Link
        key="hash"
        href={`/blocks/${block.height}`}
        className="text-xs font-mono text-white/80 hover:opacity-80 transition-opacity hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {block.hash ? formatAddress(block.hash, 6, 4) : "—"}
      </Link>,
      // Transactions
      <span key="txns" className="text-sm text-white/80">
        {numTxs.toLocaleString()}
      </span>,
      // Time
      <span key="time" className="text-sm text-muted-foreground">
        {block.timestamp ? formatTimeAgo(block.timestamp) : "—"}
      </span>,
      // Block Time
      <span key="block-time" className="text-sm text-muted-foreground">
        {formatBlockTime(blockTime)}
      </span>,
      // Producer - with icon, validator name and address
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
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>,
      // Gas
      <span key="gas" className="text-sm text-white/80 text-right">
        {totalFees.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>,
    ];
  }).filter((row) => row !== null); // Filter out null rows

  const isLoading = shouldUseSearch
    ? (searchedChainId !== undefined ? isLoadingBlocks : isSearching)
    : isLoadingBlocks;


  // Handle search - use search API
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
