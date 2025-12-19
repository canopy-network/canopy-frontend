"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { TableCard, TableColumn } from "@/components/explorer/table-card";
import { explorerApi, type Transaction } from "@/lib/api/explorer";
import { canopyIconSvg, getCanopyAccent } from "@/lib/utils/brand";
import { TableArrow } from "@/components/icons";
import { chainsApi } from "@/lib/api/chains";
import type { Chain } from "@/types/chains";

const ROWS_PER_PAGE = 10;

const formatAddress = (value: string, prefix = 6, suffix = 6) =>
  `${value.slice(0, prefix)}...${value.slice(-suffix)}`;

// Format time ago from ISO timestamp string
const formatTimeAgo = (timestamp: string): string => {
  const now = Date.now();
  const txTime = new Date(timestamp).getTime();
  const seconds = Math.floor((now - txTime) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

interface TransactionsExplorerProps {
  chainContext?: {
    id: string;
    name: string;
  };
}

export function TransactionsExplorer({ chainContext }: TransactionsExplorerProps) {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [cursorHistory, setCursorHistory] = useState<(number | undefined)[]>([undefined]); // Track cursor history for pagination
  const [chainNames, setChainNames] = useState<Record<number, string>>({});
  const [chainColors, setChainColors] = useState<Record<number, string>>({});

  // Get chain_id from URL search params or chainContext
  const chainIdFromUrl = searchParams.get("chain");
  const effectiveChainId = useMemo(() => {
    // Priority: URL param > chainContext
    if (chainIdFromUrl) {
      const chainIdNum = parseInt(chainIdFromUrl, 10);
      return chainIdNum > 0 ? chainIdNum : undefined;
    }
    return chainContext?.id ? parseInt(chainContext.id, 10) : undefined;
  }, [chainIdFromUrl, chainContext?.id]);

  // Calculate cursor for current page (cursor-based pagination)
  // cursorHistory[0] = undefined (page 1, no cursor)
  // cursorHistory[1] = cursor used to fetch page 2 (next_cursor from page 1)
  // cursorHistory[2] = cursor used to fetch page 3 (next_cursor from page 2)
  // So to fetch page N, we use cursorHistory[N-1]
  const currentCursor = useMemo(() => {
    // Page 1 uses no cursor, page 2+ uses cursor from history
    return currentPage > 1 ? cursorHistory[currentPage - 1] : undefined;
  }, [currentPage, cursorHistory]);

  // Fetch transactions with pagination
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setIsLoadingTransactions(true);
        const response = await explorerApi.getTransactions({
          ...(effectiveChainId && { chain_id: effectiveChainId }),
          limit: ROWS_PER_PAGE,
          cursor: currentCursor,
          sort: "desc",
        });

        if (response?.data) {
          // Handle both direct array and nested data structure
          const txData = Array.isArray(response.data) 
            ? response.data 
            : (response.data as any).data || [];
          
          setTransactions(txData);

          // Get pagination info
          const pagination = Array.isArray(response.data)
            ? (response as any).pagination
            : (response.data as any).pagination || response.pagination;

          // Update cursor history and total count based on pagination
          if (txData.length > 0 && pagination) {
            const nextCursor = pagination.next_cursor;

            // Store cursor for next page navigation
            // next_cursor is the height of the last transaction in current page
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
            // next_cursor is the height of the last transaction, which represents the total number of transactions
            const hasMore = nextCursor !== null && nextCursor !== undefined;
            if (hasMore) {
              // Use next_cursor as the total count since it represents the height of the last transaction
              // Height is incremental, so next_cursor is a good estimate of total transactions
              setTotalCount(nextCursor);
            } else {
              // This is the last page, calculate exact total from current page data
              setTotalCount(txData.length + ((currentPage - 1) * ROWS_PER_PAGE));
            }
          } else {
            setTotalCount(0);
          }
        }
        setIsLoadingTransactions(false);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setIsLoadingTransactions(false);
      }
    }
    fetchTransactions();
  }, [currentPage, effectiveChainId, currentCursor]);

  // Reset to page 1 when chain changes
  useEffect(() => {
    setCurrentPage(1);
    setCursorHistory([undefined]);
    setTotalCount(0);
  }, [effectiveChainId]);

  // Fetch chain names and colors for all unique chain_ids in transactions
  useEffect(() => {
    const fetchChainInfo = async () => {
      if (!transactions || transactions.length === 0) return;

      const uniqueChainIds = Array.from(
        new Set(transactions.map((tx) => tx.chain_id))
      );

      const names: Record<number, string> = {};
      const colors: Record<number, string> = {};

      await Promise.all(
        uniqueChainIds.map(async (chainId) => {
          try {
            const response = await chainsApi.getChain(chainId.toString()).catch(() => null);
            if (response?.data) {
              const chainData = response.data as Chain;
              names[chainId] = chainData.chain_name || `Chain ${chainId}`;
              colors[chainId] = chainData.brand_color || getCanopyAccent(chainId.toString());
            } else {
              names[chainId] = `Chain ${chainId}`;
              colors[chainId] = getCanopyAccent(chainId.toString());
            }
          } catch (error) {
            console.error(`Failed to fetch chain ${chainId}:`, error);
            names[chainId] = `Chain ${chainId}`;
            colors[chainId] = getCanopyAccent(chainId.toString());
          }
        })
      );

      setChainNames(names);
      setChainColors(colors);
    };

    fetchChainInfo();
  }, [transactions]);

  // Helper function to get chain name from chain_id
  const getChainName = useMemo(
    () => (chainId: number): string => {
      return chainNames[chainId] || `Chain ${chainId}`;
    },
    [chainNames]
  );

  // Helper function to get chain color from chain_id
  const getChainColor = useMemo(
    () => (chainId: number): string => {
      return chainColors[chainId] || getCanopyAccent(chainId.toString());
    },
    [chainColors]
  );

  // Filter transactions by search query
  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return transactions;

    return transactions.filter((tx) => {
      const chainName = getChainName(tx.chain_id).toLowerCase();
      const hash = tx.tx_hash.toLowerCase();
      const signer = tx.signer?.toLowerCase() || "";
      const counterparty = tx.counterparty?.toLowerCase() || "";
      const method = tx.message_type?.toLowerCase() || "";
      const blockHeight = tx.height.toString();

      return (
        chainName.includes(query) ||
        hash.includes(query) ||
        signer.includes(query) ||
        counterparty.includes(query) ||
        method.includes(query) ||
        blockHeight.includes(query)
      );
    });
  }, [transactions, searchQuery, getChainName]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const columns: TableColumn[] = [
    { label: "Chain Name", width: "w-[180px]" },
    { label: "Hash", width: "w-32" },
    { label: "Block Height", width: "w-32" },
    { label: "Method", width: "w-32" },
    { label: "From", width: "w-32" },
    { label: "", width: "w-10" }, // Arrow column
    { label: "To", width: "w-32" },
    { label: "Time", width: "w-32" },
    { label: "Amount", width: "w-40" },
  ];

  const rows = filteredTransactions.map((tx) => {
    const chainName = getChainName(tx.chain_id);
    const chainColor = getChainColor(tx.chain_id);

    // Format method name
    const formatMethod = (method: string) => {
      if (!method) return "-";
      // Convert camelCase or snake_case to Title Case
      return method
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase())
        .trim();
    };

    // Get method badge color
    const getMethodColor = (method: string) => {
      const methodLower = method.toLowerCase();
      if (methodLower.includes("transfer")) {
        return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
      }
      if (methodLower.includes("swap")) {
        return "border-sky-500/40 bg-sky-500/10 text-sky-300";
      }
      if (methodLower.includes("stake")) {
        return "border-purple-500/40 bg-purple-500/10 text-purple-300";
      }
      if (methodLower.includes("contract")) {
        return "border-amber-400/40 bg-amber-500/10 text-amber-200";
      }
      return "border-white/20 bg-white/5 text-white/80";
    };

    return [
      // Chain Name
      <div key="chain" className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          dangerouslySetInnerHTML={{
            __html: canopyIconSvg(chainColor),
          }}
        />
        <Link
          href={`/transactions/${encodeURIComponent(tx.tx_hash)}`}
          className="flex flex-col hover:text-primary transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-medium text-white text-sm">{chainName}</span>
        </Link>
      </div>,
      // Hash
      <Link
        key="hash"
        href={`/transactions/${encodeURIComponent(tx.tx_hash)}`}
        className="text-xs text-white/80 hover:opacity-80 transition-opacity hover:underline font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {formatAddress(tx.tx_hash, 6, 6)}
      </Link>,
      // Block Height
      <Link
        key="block"
        href={`/blocks/${tx.height}`}
        className="text-xs text-white/80 hover:opacity-80 transition-opacity hover:underline font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        #{tx.height.toLocaleString()}
      </Link>,
      // Method
      <div key="method">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getMethodColor(tx.message_type)}`}
        >
          {formatMethod(tx.message_type)}
        </span>
      </div>,
      // From
      <div key="from">
        {tx.signer && tx.signer.trim() !== "" ? (
          <Link
            href={`/accounts/${tx.signer}`}
            className="text-xs text-white hover:opacity-80 transition-opacity hover:underline font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            {formatAddress(tx.signer, 6, 6)}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </div>,
      // Arrow
      <div key="arrow" className="flex items-center justify-center">
        <TableArrow className="" />
      </div>,
      // To
      <div key="to">
        {tx.counterparty && tx.counterparty.trim() !== "" ? (
          <Link
            href={`/accounts/${tx.counterparty}`}
            className="text-xs text-white hover:opacity-80 transition-opacity hover:underline font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            {formatAddress(tx.counterparty, 6, 6)}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </div>,
      // Time
      <span key="time" className="text-sm text-muted-foreground">
        {formatTimeAgo(tx.timestamp)}
      </span>,
      // Amount
      <div key="amount" className="text-right">
        {tx.amount != null ? (
          <div className="flex flex-col items-end">
            <span className="font-semibold text-sm text-[#00a63d]">
              {tx.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              CNPY
            </span>
            {tx.fee != null && tx.fee > 0 && (
              <span className="text-xs text-muted-foreground mt-0.5">
                Gas {tx.fee.toLocaleString(undefined, {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </div>,
    ];
  });

  return (
    <div className="px-4 lg:p-6">
      <TableCard
        id="transactions-table"
        title="Transactions"
        searchPlaceholder="Search by address, txn hash"
        onSearch={setSearchQuery}
        searchValue={searchQuery}
        live={false}
        columns={columns}
        rows={rows}
        loading={isLoadingTransactions}
        paginate={true}
        pageSize={ROWS_PER_PAGE}
        currentEntriesPerPage={ROWS_PER_PAGE}
        totalCount={totalCount}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        spacing={3}
        className="gap-2 lg:gap-6"
      />
    </div>
  );
}
