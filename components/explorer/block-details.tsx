"use client";

import * as React from "react";
import Link from "next/link";
import { Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExplorerBlock } from "@/lib/api/explorer";
import type { Block as ApiBlock } from "@/types/blocks";
import { CopyableText } from "../ui/copyable-text";
import { TableCard, TableColumn } from "./table-card";
import { canopyIconSvg, getCanopyAccent } from "@/lib/utils/brand";
import type { Transaction } from "@/lib/api/explorer";
import { TableArrow } from "@/components/icons";

// Extended block type to include all API response fields
type ExtendedApiBlock = ApiBlock & {
  // Transactions array
  transactions?: Transaction[];
  // Transaction counts by type
  num_txs_send?: number;
  num_txs_stake?: number;
  num_txs_edit_stake?: number;
  num_txs_unstake?: number;
  num_txs_pause?: number;
  num_txs_unpause?: number;
  num_txs_change_parameter?: number;
  num_txs_dao_transfer?: number;
  num_txs_certificate_result?: number;
  num_txs_subsidy?: number;
  num_txs_create_order?: number;
  num_txs_edit_order?: number;
  num_txs_delete_order?: number;
  num_txs_dex_deposit?: number;
  num_txs_dex_withdraw?: number;
  num_txs_dex_limit_order?: number;
  // Event counts by type
  num_events_reward?: number;
  num_events_slash?: number;
  num_events_double_sign?: number;
  num_events_unstake_ready?: number;
  num_events_order_book_swap?: number;
  num_events_order_created?: number;
  num_events_order_edited?: number;
  num_events_order_deleted?: number;
  num_events_order_filled?: number;
  num_events_dex_deposit?: number;
  num_events_dex_withdraw?: number;
  num_events_dex_swap?: number;
  num_events_pool_created?: number;
  num_events_pool_points_created?: number;
  num_events_pool_points_redeemed?: number;
  num_events_pool_points_transfered?: number;
  // Order counts
  num_orders_created?: number;
  num_orders_edited?: number;
  num_orders_deleted?: number;
  // Totals
  total_txs?: number;
  total_events?: number;
  total_rewards?: number;
  reward_events?: number;
};

// Format time ago from timestamp (e.g., "1 hr 22 mins ago")
const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  if (hours < 24) {
    if (remainingMinutes === 0) {
      return `${hours} hr ago`;
    }
    return `${hours} hr ${remainingMinutes} min${remainingMinutes === 1 ? "" : "s"
      } ago`;
  }

  const days = Math.floor(seconds / 86400);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};


// Format timestamp to readable format (Nov-18 2025 12:47:27PM)
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${month}-${day} ${year} ${hours12}:${minutes}:${seconds}${ampm}`;
};

// Format combined timestamp (1 hr 22 mins ago (Nov-18 2025 12:47:27PM))
const formatCombinedTimestamp = (timestamp: number): string => {
  const timeAgo = formatTimeAgo(timestamp);
  const fullDate = formatTimestamp(timestamp);
  return `${timeAgo} (${fullDate})`;
};


interface BlockDetailsProps {
  blockId: string;
}

export function BlockDetails({ blockId }: BlockDetailsProps) {
  // Parse block ID
  const blockNumber = React.useMemo(() => {
    const parsed = parseInt(blockId, 10);
    return isNaN(parsed) ? null : parsed;
  }, [blockId]);

  // Use React Query hook to fetch block data
  const {
    data: apiBlock,
    isLoading: loading,
    error: queryError,
  } = useExplorerBlock(blockNumber || 0, undefined, {
    enabled: !!blockNumber,
  });

  const block = apiBlock as ExtendedApiBlock | null;
  const error = queryError ? "Failed to load block details" : null;

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">
          Loading block...
        </span>
      </div>
    );
  }

  if (error || !block) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-medium text-destructive mb-1">
          {error || "Block not found"}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Header with Title and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold">Block #{block.height}</h1>
        <div className="w-full flex-1 max-w-[532px]">
        </div>
      </div>

      {/* Block Summary Card */}
      <Card className="w-full">
        <div className="divide-y divide-border">
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Chain ID:</p>
            <p className="text-sm font-medium">{block.chain_id}</p>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Timestamp:</p>
            <p className="text-sm font-medium">
              {formatCombinedTimestamp(new Date(block.timestamp).getTime())}
            </p>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Proposed by:</p>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
              <span className="text-sm break-all bg-input/30 px-2 py-2 rounded-md border border-input">
                <CopyableText text={block.proposer_address} showFull={true} />
              </span>
            </div>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Total Transactions:</p>
            <p className="text-lg font-semibold">
              {(block as ExtendedApiBlock).total_txs ?? block.num_txs ?? 0}
            </p>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Total Events:</p>
            <p className="text-lg font-semibold">
              {(block as ExtendedApiBlock).total_events ?? block.num_events ?? 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Reward and Fees Card */}
      <Card className="w-full">
        <div className="divide-y divide-border">
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Fee recipient:</p>
            <div className="flex items-center gap-2 flex-wrap  text-sm break-all">
              <span className="text-sm break-all bg-input/30 px-2 py-2 rounded-md border border-input">
                <CopyableText text={block.proposer_address} showFull={true} />
              </span>
            </div>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Total Fees:</p>
            <p className="text-lg font-semibold text-green-500">
              {((block.total_fees || 0) / 100).toFixed(2)} CNPY
            </p>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Total Rewards:</p>
            <p className="text-lg font-semibold text-green-500">
              {((block as ExtendedApiBlock).total_rewards || 0) / 1000000} CNPY
            </p>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Reward Events:</p>
            <p className="text-lg font-semibold">
              {(block as ExtendedApiBlock).reward_events ?? (block as ExtendedApiBlock).num_events_reward ?? 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Technical Details Card */}
      <Card className="w-full">
        <div className="divide-y divide-border">
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Hash:</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm break-all">{block.hash}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(block.hash)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Event Types Breakdown */}
      {(() => {
        const extendedBlock = block as ExtendedApiBlock;
        const eventTypes = [
          { key: 'num_events_reward', label: 'Reward' },
          { key: 'num_events_slash', label: 'Slash' },
          { key: 'num_events_double_sign', label: 'Double Sign' },
          { key: 'num_events_unstake_ready', label: 'Unstake Ready' },
          { key: 'num_events_order_book_swap', label: 'Order Book Swap' },
          { key: 'num_events_order_created', label: 'Order Created' },
          { key: 'num_events_order_edited', label: 'Order Edited' },
          { key: 'num_events_order_deleted', label: 'Order Deleted' },
          { key: 'num_events_order_filled', label: 'Order Filled' },
          { key: 'num_events_dex_deposit', label: 'DEX Deposit' },
          { key: 'num_events_dex_withdraw', label: 'DEX Withdraw' },
          { key: 'num_events_dex_swap', label: 'DEX Swap' },
          { key: 'num_events_pool_created', label: 'Pool Created' },
          { key: 'num_events_pool_points_created', label: 'Pool Points Created' },
          { key: 'num_events_pool_points_redeemed', label: 'Pool Points Redeemed' },
          { key: 'num_events_pool_points_transfered', label: 'Pool Points Transferred' },
        ];
        const activeEventTypes = eventTypes.filter(evt => {
          const value = extendedBlock[evt.key as keyof ExtendedApiBlock] as number | undefined;
          return value !== undefined && value > 0;
        });

        if (activeEventTypes.length === 0) return null;

        return (
          <Card className="w-full">
            <h4 className="text-lg mb-4">Event Types</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeEventTypes.map(evt => (
                <div key={evt.key} className="flex flex-col">
                  <p className="text-xs text-muted-foreground">{evt.label}</p>
                  <p className="text-sm font-semibold">
                    {extendedBlock[evt.key as keyof ExtendedApiBlock] as number}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        );
      })()}

      {/* Transactions Table */}
      {(() => {
        const extendedBlock = block as ExtendedApiBlock;
        const transactions = extendedBlock.transactions || [];
        const totalTxs = extendedBlock.total_txs ?? block.num_txs ?? 0;

        // Format address helper
        const formatAddress = (address: string, start: number = 6, end: number = 4): string => {
          if (!address || address.length <= start + end) return address;
          return `${address.slice(0, start)}...${address.slice(-end)}`;
        };

        // Format method name
        const formatMethod = (method: string) => {
          if (!method) return "-";
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

        // Get chain name and color
        const getChainName = (chainId: number): string => {
          // You can expand this with actual chain names if needed
          return `Chain ${chainId}`;
        };

        const getChainColor = (chainId: number): string => {
          return getCanopyAccent(chainId.toString());
        };

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
              {formatTimeAgo(new Date(tx.timestamp).getTime())}
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
          <TableCard
            title={
              <>
                <b>{totalTxs}</b> Transactions
              </>
            }
            columns={columns}
            rows={rows}
            loading={false}
            paginate={false}
            spacing={3}
            className="gap-2 lg:gap-6"
            viewAllPath="/transactions"
            viewAllText="View All Transactions"
          />
        );
      })()}
    </>
  );
}
