"use client";

import * as React from "react";
import Link from "next/link";
import { TableCard, TableColumn } from "./table-card";
import { Transaction } from "@/lib/api/explorer";
import { canopyIconSvg, getCanopyAccent } from "@/lib/utils/brand";
import { TableArrow } from "@/components/icons";
import { chainsApi } from "@/lib/api/chains";
import type { Chain } from "@/types/chains";

const formatAddress = (value: string, prefix = 6, suffix = 6) => `${value.slice(0, prefix)}...${value.slice(-suffix)}`;

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

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function RecentTransactions({ transactions, isLoading = false }: RecentTransactionsProps) {
  const [chainNames, setChainNames] = React.useState<Record<number, string>>({});
  const [chainColors, setChainColors] = React.useState<Record<number, string>>({});

  // Fetch chain names and colors for all unique chain_ids in transactions
  React.useEffect(() => {
    const fetchChainInfo = async () => {
      if (!transactions || transactions.length === 0) return;

      const uniqueChainIds = Array.from(new Set(transactions.map((tx) => tx.chain_id)));

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
  const getChainName = React.useCallback(
    (chainId: number): string => {
      return chainNames[chainId] || `Chain ${chainId}`;
    },
    [chainNames]
  );

  // Helper function to get chain color from chain_id
  const getChainColor = React.useCallback(
    (chainId: number): string => {
      return chainColors[chainId] || getCanopyAccent(chainId.toString());
    },
    [chainColors]
  );

  // Get the most recent transaction timestamp for LatestUpdated component
  const mostRecentTimestamp = React.useMemo(() => {
    if (transactions.length === 0) return undefined;
    return transactions[0].timestamp; // Transactions are sorted newest first
  }, [transactions]);

  const columns: TableColumn[] = [
    { label: "Chain Name", width: "w-[180px]" },
    { label: "Hash", width: "w-32" },
    { label: "Status", width: "w-24" },
    { label: "From", width: "w-32" },
    { label: "", width: "w-10" }, // Arrow column
    { label: "To", width: "w-32" },
    { label: "Time", width: "w-32" },
    { label: "Amount", width: "w-32" },
  ];

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

  const rows = transactions.map((tx) => {
    const chainName = getChainName(tx.chain_id);
    const chainColor = getChainColor(tx.chain_id);

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
          href={`/chains/${tx.chain_id}/transactions`}
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
        className="text-xs text-white/80 hover:opacity-80 transition-opacity hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {formatAddress(tx.tx_hash, 6, 6)}
      </Link>,
      // Status (Method)
      <div key="status">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getMethodColor(
            tx.message_type
          )}`}
        >
          {formatMethod(tx.message_type)}
        </span>
      </div>,
      // From
      <div key="from">
        {tx.signer && tx.signer.trim() !== "" ? (
          <Link
            href={`/accounts/${tx.signer}`}
            className="text-xs text-white hover:opacity-80 transition-opacity hover:underline"
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
        <TableArrow className={""} />
      </div>,
      // To
      <div key="to">
        {tx.counterparty && tx.counterparty.trim() !== "" ? (
          <Link
            href={`/accounts/${tx.counterparty}`}
            className="text-xs text-white hover:opacity-80 transition-opacity hover:underline"
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
          <span className="font-semibold text-sm text-[#00a63d]">
            {tx.amount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            CNPY
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </div>,
    ];
  });

  return (
    <TableCard
      id="recent-transactions"
      title="Recent Transactions"
      live={true}
      columns={columns}
      rows={rows}
      viewAllPath="/transactions"
      loading={isLoading || transactions.length === 0}
      updatedTime={mostRecentTimestamp ? formatTimeAgo(mostRecentTimestamp) : undefined}
      compactFooter={true}
      spacing={3}
      className="gap-2 lg:gap-6"
      viewAllText="Transactions"
    />
  );
}
