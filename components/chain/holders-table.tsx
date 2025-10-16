"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Copy, Check } from "lucide-react";
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

// Function to truncate address: first 6 chars + ... + last 6 chars
const truncateAddress = (address: string): string => {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
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

export type Holder = {
  rank: number;
  account: string;
  accountLabel?: string;
  tokenAccount: string;
  quantity: string;
  percentage: string;
  value: string;
  tags: string[];
};

// Base data template
const baseData: Holder[] = [
  {
    rank: 1,
    account: "USDT Mint Authority #3",
    tokenAccount: "8hnVkd24Gp7s1QYVPBQSayS4uLokKEj1Uq6NFjk6PibK",
    quantity: "311,150,706.839466",
    percentage: "11.35%",
    value: "$311,292,699.18",
    tags: ["Whale"],
  },
  {
    rank: 2,
    account: "Binance 3",
    tokenAccount: "FJUszQ8h5NmP9s4QYVPBQSayS4uLokKEj1Uq6nJTXie",
    quantity: "237,673,445.470416",
    percentage: "8.67%",
    value: "$237,781,906.76",
    tags: ["Whale", "9+"],
  },
  {
    rank: 3,
    account: "Binance 2",
    tokenAccount: "CyBjGp3h9NmP9s4QYVPBQSayS4uLokKEj1Uq687xZES",
    quantity: "214,126,844.547909",
    percentage: "7.81%",
    value: "$214,224,560.45",
    tags: ["Whale", "9+"],
  },
  {
    rank: 4,
    account: "66GvPQ...YYYQBF",
    tokenAccount: "GoHYhy2h8NmP9s4QYVPBQSayS4uLokKEj1Uq6YddM4y",
    quantity: "126,273,125.940611",
    percentage: "4.6%",
    value: "$126,330,750.16",
    tags: ["Whale", "1+"],
  },
  {
    rank: 5,
    account: "Binance 3",
    tokenAccount: "TB5FCq9h2NmP9s4QYVPBQSayS4uLokKEj1Uq6qzEj2M",
    quantity: "111,443,085.399",
    percentage: "4.06%",
    value: "$111,493,941.99",
    tags: ["Whale", "9+"],
  },
  {
    rank: 6,
    account: "Binance 3",
    tokenAccount: "yrdcCZ4h1NmP9s4QYVPBQSayS4uLokKEj1Uq68kPqaw",
    quantity: "97,322,587.554",
    percentage: "3.55%",
    value: "$97,367,000.31",
    tags: ["Whale", "9+"],
  },
  {
    rank: 7,
    account: "3csuXZ...L51spj",
    tokenAccount: "HVjeB45h7NmP9s4QYVPBQSayS4uLokKEj1Uq6wuUNoW",
    quantity: "91,055,219.307607",
    percentage: "3.32%",
    value: "$91,096,771.98",
    tags: ["Whale", "1+"],
  },
  {
    rank: 8,
    account: "2qo8jv...6DnNZy",
    tokenAccount: "BWMAq1Kh3NmP9s4QYVPBQSayS4uLokKEj1Uq6RwHMgv",
    quantity: "84,324,212.716227",
    percentage: "3.07%",
    value: "$84,362,693.72",
    tags: ["Whale", "3+"],
  },
  {
    rank: 9,
    account: "USDT Mint Authority Multisig",
    tokenAccount: "99pfYk6h5NmP9s4QYVPBQSayS4uLokKEj1Uq6g13tDt",
    quantity: "73,262,719.192721",
    percentage: "2.67%",
    value: "$73,296,152.33",
    tags: ["Whale"],
  },
  {
    rank: 10,
    account: "Binance 3",
    tokenAccount: "8hGBwe2h9NmP9s4QYVPBQSayS4uLokKEj1Uq6CWwJbo",
    quantity: "66,604,056.016",
    percentage: "2.43%",
    value: "$66,634,450.5",
    tags: ["Whale", "9+"],
  },
];

// Duplicate data to create 50 entries for pagination
const mockData: Holder[] = Array.from({ length: 5 }, (_, groupIndex) =>
  baseData.map((holder, index) => ({
    ...holder,
    rank: groupIndex * 10 + index + 1,
    // Vary the token accounts slightly for each duplicate
    tokenAccount:
      holder.tokenAccount.slice(0, -4) +
      Math.random().toString(36).substring(2, 6).toUpperCase(),
  }))
).flat();

export const columns: ColumnDef<Holder>[] = [
  {
    accessorKey: "rank",
    header: "#",
    cell: ({ row }: { row: any }) => (
      <div className="text-white/70">{row.getValue("rank")}</div>
    ),
  },
  {
    accessorKey: "account",
    header: "Account",
    cell: ({ row }: { row: any }) => {
      const account = row.original.account;
      const tags = row.original.tags || [];

      return (
        <div className="flex items-center gap-2 max-w-[200px]">
          {(tags.includes("Binance 3") || tags.includes("Binance 2")) && (
            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-xs flex-shrink-0">
              B
            </div>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="#"
                  className="text-blue-400 hover:text-blue-300 transition-colors truncate block"
                >
                  {account}
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>{account}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
  {
    accessorKey: "tokenAccount",
    header: "Token Account",
    cell: ({ row }: { row: any }) => {
      const fullAddress = row.getValue("tokenAccount") as string;
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
    accessorKey: "quantity",
    header: ({ column }: { column: any }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: { row: any }) => (
      <div className="text-white">{row.getValue("quantity")}</div>
    ),
  },
  {
    accessorKey: "percentage",
    header: "Percentage",
    cell: ({ row }: { row: any }) => (
      <div className="text-white">{row.getValue("percentage")}</div>
    ),
  },
  {
    accessorKey: "value",
    header: ({ column }: { column: any }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Value
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: { row: any }) => (
      <div className="text-white font-medium">{row.getValue("value")}</div>
    ),
  },
];

export function HoldersTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: mockData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">
          Total{" "}
          <span className="text-white/70">
            {(2471549).toLocaleString()} holders
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <span className="mr-2">📥</span>
            Export CSV
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
            {table.getRowModel().rows?.length ? (
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
                  No results.
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
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="bg-[#1a1a1a] border-white/20">
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem
                  key={pageSize}
                  value={`${pageSize}`}
                  className="text-white hover:bg-white/10"
                >
                  {pageSize}
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
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50"
            >
              ⟪
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50"
            >
              ‹
            </Button>
            <span className="text-sm text-white">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50"
            >
              ›
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
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
