"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { getChainTransactions, type ApiTransaction } from "@/lib/api";

// Function to truncate address: first 6 chars + ... + last 6 chars
const truncateAddress = (address: string): string => {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
};

// Format time ago from ISO timestamp
const formatTimeAgo = (isoDate: string): string => {
  const now = new Date();
  const date = new Date(isoDate);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds} secs ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};

// Copy button component with tooltip
const CopyAddressButton = ({ address }: { address: string }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip open={copied}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copied!" : "Copy address"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const columns: ColumnDef<ApiTransaction>[] = [
  {
    accessorKey: "id",
    header: "Transaction ID",
    cell: ({ row }: { row: any }) => {
      const fullId = row.getValue("id") as string;
      const truncatedId = truncateAddress(fullId);

      return (
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {truncatedId}
          </a>
          <CopyAddressButton address={fullId} />
        </div>
      );
    },
  },
  {
    accessorKey: "transaction_type",
    header: "Type",
    cell: ({ row }: { row: any }) => {
      const type = row.getValue("transaction_type") as string;
      const isBuy = type === "buy";

      return (
        <Badge
          variant="secondary"
          className={`${
            isBuy
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-red-500/20 text-red-400 border-red-500/30"
          } border flex items-center gap-1 w-fit`}
        >
          {isBuy ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {type.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }: { column: any }) => {
      return (
        <div className="flex items-center gap-1">
          <span>Time</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </div>
      );
    },
    cell: ({ row }: { row: any }) => (
      <div className="text-white/70">
        {formatTimeAgo(row.getValue("created_at"))}
      </div>
    ),
  },
  {
    accessorKey: "user_id",
    header: "User",
    cell: ({ row }: { row: any }) => {
      const fullAddress = row.getValue("user_id") as string;
      const truncatedAddress = truncateAddress(fullAddress);

      return (
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {truncatedAddress}
          </a>
          <CopyAddressButton address={fullAddress} />
        </div>
      );
    },
  },
  {
    accessorKey: "cnpy_amount",
    header: ({ column }: { column: any }) => {
      return (
        <div className="flex items-center gap-1">
          <span>CNPY Amount</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </div>
      );
    },
    cell: ({ row }: { row: any }) => {
      const amount = row.getValue("cnpy_amount") as number;
      return <div className="text-white font-mono">{amount.toFixed(4)}</div>;
    },
  },
  {
    accessorKey: "token_amount",
    header: ({ column }: { column: any }) => {
      return (
        <div className="flex items-center gap-1">
          <span>Token Amount</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </div>
      );
    },
    cell: ({ row }: { row: any }) => {
      const amount = row.getValue("token_amount") as number;
      return (
        <div className="text-white font-mono">{amount.toLocaleString()}</div>
      );
    },
  },
  {
    accessorKey: "price_per_token_cnpy",
    header: ({ column }: { column: any }) => {
      return (
        <div className="flex items-center gap-1">
          <span>Price</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </div>
      );
    },
    cell: ({ row }: { row: any }) => {
      const price = row.getValue("price_per_token_cnpy") as number;
      return <div className="text-white font-mono">{price.toFixed(8)}</div>;
    },
  },
  {
    accessorKey: "trading_fee_cnpy",
    header: ({ column }: { column: any }) => {
      return (
        <div className="flex items-center gap-1">
          <span>Fee (CNPY)</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </div>
      );
    },
    cell: ({ row }: { row: any }) => {
      const fee = row.getValue("trading_fee_cnpy") as number;
      return <div className="text-white font-mono">{fee.toFixed(6)}</div>;
    },
  },
];

interface BlockExplorerTableProps {
  chainId: string;
}

export function BlockExplorerTable({ chainId }: BlockExplorerTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [transactions, setTransactions] = React.useState<ApiTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalTransactions, setTotalTransactions] = React.useState(0);

  // Fetch transactions
  const fetchTransactions = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching transactions for chain:", chainId, {
        page: currentPage,
        limit: pageSize,
      });

      const response = await getChainTransactions(chainId, {
        page: currentPage,
        limit: pageSize,
      });

      console.log("Transactions response received:", response);
      console.log("Response data:", response.data);
      console.log("Response pagination:", response.pagination);

      if (response.data) {
        console.log("Setting transactions:", response.data.length, "items");
        setTransactions(response.data);
      } else {
        console.log("No data in response");
      }

      if (response.pagination) {
        setTotalPages(response.pagination.pages);
        setTotalTransactions(response.pagination.total);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError("Failed to load transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [chainId, currentPage, pageSize]);

  // Fetch on mount and when dependencies change
  React.useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const table = useReactTable({
    data: transactions,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      sorting,
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">
          Recent Transactions
          {!loading && totalTransactions > 0 && (
            <span className="text-sm text-white/50 ml-2">
              ({totalTransactions.toLocaleString()} total)
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={fetchTransactions}
            disabled={loading}
          >
            <span className="mr-2">🔄</span>
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-white/10 overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <TableRow
                key={headerGroup.id}
                className="border-white/10 hover:bg-transparent"
              >
                {headerGroup.headers.map((header: any) => (
                  <TableHead
                    key={header.id}
                    className="text-white/50 font-medium whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-white/50"
                >
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-red-400"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: any) => (
                <TableRow
                  key={row.id}
                  className="border-white/10 hover:bg-white/5"
                >
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-white/50"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">Show</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1); // Reset to first page when changing page size
            }}
          >
            <SelectTrigger className="h-8 w-[70px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="bg-[#1a1a1a] border-white/20">
              {[10, 20, 25, 30, 40, 50].map((size) => (
                <SelectItem
                  key={size}
                  value={`${size}`}
                  className="text-white hover:bg-white/10"
                >
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-white/70">per page</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || loading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50"
            >
              ⟪
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50"
            >
              ‹
            </Button>
            <span className="text-sm text-white">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50"
            >
              ›
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages || loading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50"
            >
              ⟫
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
