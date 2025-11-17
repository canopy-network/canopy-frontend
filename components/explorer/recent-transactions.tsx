"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, Box } from "lucide-react";
import Link from "next/link";
import { LiveStatusComponent } from "./live-status-component";

interface Transaction {
  chain_id: number;
  height: number;
  tx_hash: string;
  timestamp: string;
  message_type: string;
  signer: string;
  counterparty: string | null;
  amount: number | null;
  fee: number;
}

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
            <span>Latest update 44 secs ago</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Chain Name
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Hash
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  From
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  To
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Time
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.tx_hash}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500" />
                      <span className="font-medium px-2 py-1 bg-muted rounded-md text-sm">
                        blockchain
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm">
                      {tx.tx_hash.substring(0, 8)}...
                      {tx.tx_hash.substring(tx.tx_hash.length - 4)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm">
                      {tx.signer.substring(0, 6)}...
                      {tx.signer.substring(tx.signer.length - 4)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm">
                      {tx.counterparty
                        ? `${tx.counterparty.substring(
                            0,
                            6
                          )}...${tx.counterparty.substring(
                            tx.counterparty.length - 4
                          )}`
                        : "-"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-muted-foreground text-sm">
                      1 minute ago
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-green-500 font-medium">
                      {tx.amount?.toFixed(2)} CNPY
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <Link href="/explorer/transactions">
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
