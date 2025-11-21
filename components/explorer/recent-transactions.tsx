"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, Box } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { LiveStatusComponent } from "./live-status-component";
import { TableArrow } from "@/components/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Transaction } from "@/lib/api/explorer";

const formatAddress = (value: string, prefix = 6, suffix = 6) =>
  `${value.slice(0, prefix)}...${value.slice(-suffix)}`;

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="mb-8 card-like p-4">
      <div className="flex items-center justify-between leading-none">
        <h2 className="text-2xl font-bold text-white">Recent Transactions</h2>
        <div className="flex items-center gap-4">
          <LiveStatusComponent />
          <div className="flex items-center gap-2 text-muted-foreground text-sm bg-white/[0.05] rounded-lg px-4 py-2">
            <Box className="w-4 h-4" />
            <span data-sample="latest-update-time">
              Latest update 44 secs ago
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden mt-6">
        <Table>
          <TableHeader className="">
            <TableRow className="bg-transparent hover:bg-transparent">
              <TableHead className="text-xs tracking-wide text-muted-foreground">
                Chain Name
              </TableHead>
              <TableHead className="text-xs tracking-wide text-muted-foreground">
                Hash
              </TableHead>
              <TableHead className="text-xs tracking-wide text-muted-foreground">
                From
              </TableHead>
              <TableHead />
              <TableHead className="text-xs tracking-wide text-muted-foreground">
                To
              </TableHead>
              <TableHead className="text-xs tracking-wide text-muted-foreground">
                Time
              </TableHead>
              <TableHead className="text-right text-xs tracking-wide text-muted-foreground">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.tx_hash} appearance="plain">
                <TableCell>
                  <Link
                    href={`/chains/${tx.chain_id}/transactions`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src="https://placehold.co/32/EEE/31343C"
                      alt="Blockchain"
                      width={32}
                      height={32}
                      className="object-contain rounded-full size-8 border border-white/10"
                      data-sample="chain-logo"
                    />
                    <div className="flex flex-col">
                      <span
                        className="font-semibold text-sm"
                        data-sample="chain-name"
                      >
                        blockchain
                      </span>
                    </div>
                  </Link>
                </TableCell>

                <TableCell className="text-xs text-white/80">
                  <Link
                    href={`/transactions/${encodeURIComponent(tx.tx_hash)}`}
                    className="hover:opacity-80 transition-opacity hover:underline"
                  >
                    {formatAddress(tx.tx_hash, 6, 6)}
                  </Link>
                </TableCell>

                <TableCell className="text-xs text-white">
                  {tx.signer ? (
                    <Link
                      href={`/accounts/${tx.signer}`}
                      className="hover:opacity-80 transition-opacity hover:underline"
                    >
                      {formatAddress(tx.signer, 6, 6)}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>

                <TableCell className="w-40 px-0">
                  <TableArrow className="text-white" />
                </TableCell>

                <TableCell className="text-xs text-white">
                  {tx.counterparty ? formatAddress(tx.counterparty, 6, 6) : "-"}
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  <span data-sample="relative-time">1 minute ago</span>
                </TableCell>

                <TableCell className="text-right">
                  {tx.amount != null ? (
                    <span className="text-emerald-400 font-semibold text-sm">
                      {tx.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      CNPY
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <Link href="/transactions">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              View All Transactions
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
