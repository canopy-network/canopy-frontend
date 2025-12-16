"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, ArrowUpRight, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExplorerBlock } from "@/lib/api/explorer";
import type { Block as ApiBlock } from "@/types/blocks";
import { CopyableText } from "../ui/copyable-text";

// Extended block type to include all API response fields
type ExtendedApiBlock = ApiBlock & {
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
    return `${hours} hr ${remainingMinutes} min${
      remainingMinutes === 1 ? "" : "s"
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
  const [searchQuery, setSearchQuery] = React.useState("");

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
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by address, tx hash, block..."
              className="w-full pl-12 pr-4 py-6 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-muted-foreground"
            />
          </div>
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

      {/* Transaction Types Breakdown */}
      {(() => {
        const extendedBlock = block as ExtendedApiBlock;
        const txTypes = [
          { key: 'num_txs_send', label: 'Send' },
          { key: 'num_txs_stake', label: 'Stake' },
          { key: 'num_txs_edit_stake', label: 'Edit Stake' },
          { key: 'num_txs_unstake', label: 'Unstake' },
          { key: 'num_txs_pause', label: 'Pause' },
          { key: 'num_txs_unpause', label: 'Unpause' },
          { key: 'num_txs_change_parameter', label: 'Change Parameter' },
          { key: 'num_txs_dao_transfer', label: 'DAO Transfer' },
          { key: 'num_txs_certificate_result', label: 'Certificate Result' },
          { key: 'num_txs_subsidy', label: 'Subsidy' },
          { key: 'num_txs_create_order', label: 'Create Order' },
          { key: 'num_txs_edit_order', label: 'Edit Order' },
          { key: 'num_txs_delete_order', label: 'Delete Order' },
          { key: 'num_txs_dex_deposit', label: 'DEX Deposit' },
          { key: 'num_txs_dex_withdraw', label: 'DEX Withdraw' },
          { key: 'num_txs_dex_limit_order', label: 'DEX Limit Order' },
        ];
        const activeTxTypes = txTypes.filter(tx => {
          const value = extendedBlock[tx.key as keyof ExtendedApiBlock] as number | undefined;
          return value !== undefined && value > 0;
        });
        
        if (activeTxTypes.length === 0) return null;
        
        return (
          <Card className="w-full">
            <h4 className="text-lg mb-4">Transaction Types</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeTxTypes.map(tx => (
                <div key={tx.key} className="flex flex-col">
                  <p className="text-xs text-muted-foreground">{tx.label}</p>
                  <p className="text-sm font-semibold">
                    {extendedBlock[tx.key as keyof ExtendedApiBlock] as number}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        );
      })()}

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

      {/* Transactions Summary */}
      <Card className="w-full gap-4">
        <h4 className="text-lg">
          <b>{(block as ExtendedApiBlock).total_txs ?? block.num_txs ?? 0}</b>{" "}
          Transactions
        </h4>
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Transaction details are not available in the block endpoint.
          </p>
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
      </Card>
    </>
  );
}
