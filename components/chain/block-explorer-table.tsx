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
import { ArrowUpDown, Copy, Check, AlertCircle } from "lucide-react";
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

export type Transaction = {
  signature: string;
  block: number;
  timeAgo: string;
  instructions: string[];
  by: string;
  value: number;
  fee: number;
  status: "success" | "error";
};

// Base transaction data
const baseTransactions: Transaction[] = [
  {
    signature: "48fx6ASoBA1RxZvM2kP9QYVPBQSayS4uLokKEj1Uq6N",
    block: 373806886,
    timeAgo: "16 secs ago",
    instructions: ["route"],
    by: "BWB7Ze1zGM9s1QYVPBQSayS4uLet2uBq8YN9",
    value: 0.36,
    fee: 0.000005,
    status: "success",
  },
  {
    signature: "4yF38TCLFNNgirm2fP9QYVPBQSayS4uLokKEj1Uq6N",
    block: 373806886,
    timeAgo: "16 secs ago",
    instructions: ["fill"],
    by: "CDg3bPoM219s1QYVPBq5p7s4uo48ayS4uLokKEj1Uq6",
    value: 0.08993,
    fee: 0.00001041,
    status: "success",
  },
  {
    signature: "4LDXVWhssedu3xP9QYVPBQSayS4uLokKEj1Uq6NFjk",
    block: 373806886,
    timeAgo: "16 secs ago",
    instructions: ["route"],
    by: "HLtnuk5FLQ9s1QYVPBQSamVzccToQZEayS4uLokKEj1",
    value: 0.0000779,
    fee: 0.0000779,
    status: "error",
  },
  {
    signature: "2nsLBLSTmRTuVP9QYVPBQSayS4uLokKEj1Uq6NFjk6",
    block: 373806886,
    timeAgo: "16 secs ago",
    instructions: ["route"],
    by: "HLtnuk5FLQ9s1QYVPBQSamVzccToQZEayS4uLokKEj1",
    value: 0.0000779,
    fee: 0.0000779,
    status: "error",
  },
  {
    signature: "ekQ85es97dtiB6XP9QYVPBQSayS4uLokKEj1Uq6NFj",
    block: 373806886,
    timeAgo: "16 secs ago",
    instructions: ["route"],
    by: "HLtnuk5FLQ9s1QYVPBQSamVzccToQZEayS4uLokKEj1",
    value: 0.0000779,
    fee: 0.0000779,
    status: "error",
  },
  {
    signature: "2FXz4EWMktgLgtP9QYVPBQSayS4uLokKEj1Uq6NFjk",
    block: 373806885,
    timeAgo: "16 secs ago",
    instructions: ["setLoadedAccountsDataS..."],
    by: "9TXFVx8N9d9s1QYVPM3bEXqkR3ZayS4uLokKEj1Uq6N",
    value: 0.00005001,
    fee: 0.00005001,
    status: "error",
  },
  {
    signature: "5ix54FrYZtFW4qQP9QYVPBQSayS4uLokKEj1Uq6NFj",
    block: 373806885,
    timeAgo: "16 secs ago",
    instructions: ["setLoadedAccountsDataS..."],
    by: "9TXFVx8N9d9s1QYVPM3bEXqkR3ZayS4uLokKEj1Uq6N",
    value: 0.00005001,
    fee: 0.00005001,
    status: "error",
  },
  {
    signature: "36YDkAqtuAe246P9QYVPBQSayS4uLokKEj1Uq6NFjk",
    block: 373806885,
    timeAgo: "16 secs ago",
    instructions: ["route"],
    by: "FDcMd2X6jt9s1QYVPBXEo2Kejxq5ayS4uLokKEj1Uq6",
    value: 0.00007602,
    fee: 0.00007602,
    status: "error",
  },
  {
    signature: "3xd3QMhjL8rVsQP9QYVPBQSayS4uLokKEj1Uq6NFjk",
    block: 373806885,
    timeAgo: "16 secs ago",
    instructions: ["route"],
    by: "FDcMd2X6jt9s1QYVPBXEo2Kejxq5ayS4uLokKEj1Uq6",
    value: 0.00007601,
    fee: 0.00007601,
    status: "error",
  },
  {
    signature: "7kL9PmNjT2rVsQP9QYVPBQSayS4uLokKEj1Uq6NFjk",
    block: 373806884,
    timeAgo: "18 secs ago",
    instructions: ["route"],
    by: "BWB7Ze1zGM9s1QYVPBQSayS4uLet2uBq8YN9",
    value: 0.24,
    fee: 0.000005,
    status: "success",
  },
];

// Duplicate data to create 50 entries for pagination
const mockTransactions: Transaction[] = Array.from(
  { length: 5 },
  (_, groupIndex) =>
    baseTransactions.map((tx, index) => ({
      ...tx,
      signature:
        tx.signature.slice(0, -4) +
        Math.random().toString(36).substring(2, 6).toUpperCase(),
      block: tx.block - groupIndex,
    }))
).flat();

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "signature",
    header: "Signature",
    cell: ({ row }: { row: any }) => {
      const fullSignature = row.getValue("signature") as string;
      const truncatedSignature = truncateAddress(fullSignature);
      const status = row.original.status;

      return (
        <div className="flex items-center gap-2">
          {status === "error" && (
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          )}
          <a
            href="#"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {truncatedSignature}
          </a>
          <CopyAddressButton address={fullSignature} />
        </div>
      );
    },
  },
  {
    accessorKey: "block",
    header: "Block",
    cell: ({ row }: { row: any }) => (
      <a
        href="#"
        className="text-blue-400 hover:text-blue-300 transition-colors"
      >
        {row.getValue("block")}
      </a>
    ),
  },
  {
    accessorKey: "timeAgo",
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
      <div className="text-white/70">{row.getValue("timeAgo")}</div>
    ),
  },
  {
    accessorKey: "instructions",
    header: "Instructions",
    cell: ({ row }: { row: any }) => {
      const instructions = row.getValue("instructions") as string[];
      return (
        <div className="flex gap-1 flex-wrap">
          {instructions.map((instruction, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-white/10 text-white/90 hover:bg-white/20 text-xs px-2 py-0.5"
            >
              {instruction}
            </Badge>
          ))}
          {instructions.length > 1 && (
            <Badge
              variant="secondary"
              className="bg-white/10 text-white/90 hover:bg-white/20 text-xs px-2 py-0.5"
            >
              {instructions.length}+
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "by",
    header: "By",
    cell: ({ row }: { row: any }) => {
      const fullAddress = row.getValue("by") as string;
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
    accessorKey: "value",
    header: ({ column }: { column: any }) => {
      return (
        <div className="flex items-center gap-1">
          <span>Value (SOL)</span>
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
      <div className="text-white font-mono">{row.getValue("value")}</div>
    ),
  },
  {
    accessorKey: "fee",
    header: ({ column }: { column: any }) => {
      return (
        <div className="flex items-center gap-1">
          <span>Fee (SOL)</span>
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
      <div className="text-white font-mono">{row.getValue("fee")}</div>
    ),
  },
];

export function BlockExplorerTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: mockTransactions,
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
        <h2 className="text-lg font-medium text-white">Recent Transactions</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <span className="mr-2">📥</span>
            Export
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
