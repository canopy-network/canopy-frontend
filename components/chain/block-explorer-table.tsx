"use client";

import * as React from "react";
import {
  ArrowRightLeft,
  Search,
  XCircle,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getChainTransactions, type ApiTransaction } from "@/lib/api";
import { chainsApi } from "@/lib/api/chains";
import type { Chain } from "@/types/chains";

// Function to truncate hash: first 4 chars + ... + last 4 chars
const truncateHash = (hash: string): string => {
  if (!hash) return "";
  if (hash.length <= 8) return hash;
  return `${hash.slice(0, 4)}...${hash.slice(-4)}`;
};

// Format time ago from ISO timestamp
const formatTimeAgo = (isoDate: string): string => {
  const now = new Date();
  const date = new Date(isoDate);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// Get status badge component
const getStatusBadge = (status: "success" | "failed" | "pending") => {
  switch (status) {
    case "success":
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-400 border-green-500/30 flex items-center gap-1"
        >
          <CheckCircle2 className="w-3 h-3" />
          Success
        </Badge>
      );
    case "failed":
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-400 border-red-500/30 flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          Failed
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 flex items-center gap-1"
        >
          <Clock className="w-3 h-3" />
          Pending
        </Badge>
      );
  }
};

// Generate sample transaction data for visualization
const generateSampleTransactions = (chainId: string): ApiTransaction[] => {
  const now = new Date();
  const sampleTransactions: ApiTransaction[] = [
    {
      id: "0x4c8f3a2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b1",
      virtual_pool_id:
        "pool_0x979f8a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4",
      chain_id: chainId,
      user_id:
        "0x056c8f3a2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b155a5",
      transaction_type: "buy",
      cnpy_amount: 4024.5,
      token_amount: 4024,
      price_per_token_cnpy: 1.0,
      trading_fee_cnpy: 40.245,
      slippage_percent: 0.5,
      transaction_hash:
        "0x4c8f3a2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b1",
      block_height: 12345,
      gas_used: 21000,
      pool_cnpy_reserve_after: 50000,
      pool_token_reserve_after: 50000,
      market_cap_after_usd: 50000,
      created_at: new Date(now.getTime() - 60000).toISOString(), // 1m ago
    },
    {
      id: "0x2a7e4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b1e0d9c8b7a6f5",
      virtual_pool_id:
        "pool_0x5943a2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b17d96",
      chain_id: chainId,
      user_id:
        "0x1f55a2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b10d3b",
      transaction_type: "buy",
      cnpy_amount: 8763.2,
      token_amount: 8763,
      price_per_token_cnpy: 1.0,
      trading_fee_cnpy: 87.632,
      slippage_percent: 0.3,
      transaction_hash:
        "0x2a7e4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b1e0d9c8b7a6f5",
      block_height: 12346,
      gas_used: 21000,
      pool_cnpy_reserve_after: 58763,
      pool_token_reserve_after: 41237,
      market_cap_after_usd: 58763,
      created_at: new Date(now.getTime() - 60000).toISOString(), // 1m ago
    },
    {
      id: "0xbce4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2",
      virtual_pool_id:
        "pool_0xa8aa3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a2c78",
      chain_id: chainId,
      user_id:
        "0x68e9a2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b11db0",
      transaction_type: "sell",
      cnpy_amount: 376.8,
      token_amount: 376,
      price_per_token_cnpy: 1.0,
      trading_fee_cnpy: 3.768,
      slippage_percent: 0.2,
      transaction_hash:
        "0xbce4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2",
      block_height: 12347,
      gas_used: 21000,
      pool_cnpy_reserve_after: 58386,
      pool_token_reserve_after: 41614,
      market_cap_after_usd: 58386,
      created_at: new Date(now.getTime() - 60000).toISOString(), // 1m ago
    },
    {
      id: "0xe350a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2",
      virtual_pool_id:
        "pool_0x3b17a2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b1b3a4",
      chain_id: chainId,
      user_id:
        "0xeabaa2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b1a2a6",
      transaction_type: "buy",
      cnpy_amount: 4049.1,
      token_amount: 4049,
      price_per_token_cnpy: 1.0,
      trading_fee_cnpy: 40.491,
      slippage_percent: 0.4,
      transaction_hash: null, // Failed transaction
      block_height: null,
      gas_used: null,
      pool_cnpy_reserve_after: 58386,
      pool_token_reserve_after: 41614,
      market_cap_after_usd: 58386,
      created_at: new Date(now.getTime() - 60000).toISOString(), // 1m ago
    },
    {
      id: "0xe55fa3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2",
      virtual_pool_id:
        "pool_0x6e22a2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b14331",
      chain_id: chainId,
      user_id:
        "0x6b7fa2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b1e932",
      transaction_type: "sell",
      cnpy_amount: 977.5,
      token_amount: 977,
      price_per_token_cnpy: 1.0,
      trading_fee_cnpy: 9.775,
      slippage_percent: 0.1,
      transaction_hash:
        "0xe55fa3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2",
      block_height: 12348,
      gas_used: 21000,
      pool_cnpy_reserve_after: 57408,
      pool_token_reserve_after: 42592,
      market_cap_after_usd: 57408,
      created_at: new Date(now.getTime() - 60000).toISOString(), // 1m ago
    },
    {
      id: "0x66a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2",
      virtual_pool_id:
        "pool_0x4016a2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b1ccd7",
      chain_id: chainId,
      user_id:
        "0x1af4a2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b1cd70",
      transaction_type: "buy",
      cnpy_amount: 9848.7,
      token_amount: 9848,
      price_per_token_cnpy: 1.0,
      trading_fee_cnpy: 98.487,
      slippage_percent: 0.6,
      transaction_hash:
        "0x66a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2",
      block_height: null, // Pending
      gas_used: null,
      pool_cnpy_reserve_after: 67257,
      pool_token_reserve_after: 32743,
      market_cap_after_usd: 67257,
      created_at: new Date(now.getTime() - 60000).toISOString(), // 1m ago
    },
    {
      id: "0x1aea3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2",
      virtual_pool_id:
        "pool_0x4005a2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b1a8cc",
      chain_id: chainId,
      user_id:
        "0xcfada2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b1a418",
      transaction_type: "buy",
      cnpy_amount: 7221.3,
      token_amount: 7221,
      price_per_token_cnpy: 1.0,
      trading_fee_cnpy: 72.213,
      slippage_percent: 0.3,
      transaction_hash:
        "0x1aea3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2",
      block_height: 12349,
      gas_used: 21000,
      pool_cnpy_reserve_after: 64478,
      pool_token_reserve_after: 35522,
      market_cap_after_usd: 64478,
      created_at: new Date(now.getTime() - 60000).toISOString(), // 1m ago
    },
    {
      id: "0xaca3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2",
      virtual_pool_id:
        "pool_0x35afa2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b18188",
      chain_id: chainId,
      user_id:
        "0x135fa2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b136e9",
      transaction_type: "sell",
      cnpy_amount: 2508.9,
      token_amount: 2508,
      price_per_token_cnpy: 1.0,
      trading_fee_cnpy: 25.089,
      slippage_percent: 0.2,
      transaction_hash:
        "0xaca3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2",
      block_height: 12350,
      gas_used: 21000,
      pool_cnpy_reserve_after: 61969,
      pool_token_reserve_after: 38031,
      market_cap_after_usd: 61969,
      created_at: new Date(now.getTime() - 60000).toISOString(), // 1m ago
    },
    {
      id: "0xe4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2",
      virtual_pool_id:
        "pool_0x98d8a2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b1ebf3",
      chain_id: chainId,
      user_id:
        "0x57cea2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b1295f",
      transaction_type: "buy",
      cnpy_amount: 8448.4,
      token_amount: 8448,
      price_per_token_cnpy: 1.0,
      trading_fee_cnpy: 84.484,
      slippage_percent: 0.4,
      transaction_hash:
        "0xe4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2",
      block_height: 12351,
      gas_used: 21000,
      pool_cnpy_reserve_after: 70417,
      pool_token_reserve_after: 29583,
      market_cap_after_usd: 70417,
      created_at: new Date(now.getTime() - 60000).toISOString(), // 1m ago
    },
    {
      id: "0xc9a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2",
      virtual_pool_id:
        "pool_0x2690a2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b1d5b1",
      chain_id: chainId,
      user_id:
        "0x2f16a2b1e9d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1e0d9c8b7a6f5e4d3c2b162ce",
      transaction_type: "sell",
      cnpy_amount: 6494.6,
      token_amount: 6494,
      price_per_token_cnpy: 1.0,
      trading_fee_cnpy: 64.946,
      slippage_percent: 0.3,
      transaction_hash:
        "0xc9a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2",
      block_height: null, // Pending
      gas_used: null,
      pool_cnpy_reserve_after: 63922,
      pool_token_reserve_after: 36078,
      market_cap_after_usd: 63922,
      created_at: new Date(now.getTime() - 60000).toISOString(), // 1m ago
    },
  ];

  return sampleTransactions;
};

interface BlockExplorerTableProps {
  chainId: string;
  onTransactionClick?: (transaction: ApiTransaction) => void;
}

export function BlockExplorerTable({
  chainId,
  onTransactionClick,
}: BlockExplorerTableProps) {
  const [transactions, setTransactions] = React.useState<ApiTransaction[]>([]);
  const [allTransactions, setAllTransactions] = React.useState<
    ApiTransaction[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMoreTransactions, setLoadingMoreTransactions] =
    React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [transactionSearchQuery, setTransactionSearchQuery] =
    React.useState("");
  const [searchTransactionsOpen, setSearchTransactionsOpen] =
    React.useState(false);
  const [chainData, setChainData] = React.useState<Chain | null>(null);

  // Fetch chain data to get ticker
  const fetchChainData = React.useCallback(async () => {
    try {
      const response = await chainsApi.getChain(chainId);
      if (response.data) {
        setChainData(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch chain data:", err);
    }
  }, [chainId]);

  // Fetch transactions
  const fetchTransactions = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getChainTransactions(chainId, {
        page: currentPage,
        limit: pageSize,
      });

      if (response.data && response.data.length > 0) {
        // For initial load (page 1), replace transactions
        if (currentPage === 1) {
          setAllTransactions(response.data);
          setTransactions(response.data);
        }

        if (response.pagination) {
          setTotalPages(response.pagination.pages);
        }
      } else {
        // Use sample data if no real data is available (for visualization)
        const sampleData = generateSampleTransactions(chainId);
        if (currentPage === 1) {
          setAllTransactions(sampleData);
          setTransactions(sampleData);
        }
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      // Use sample data on error for visualization
      const sampleData = generateSampleTransactions(chainId);
      if (currentPage === 1) {
        setAllTransactions(sampleData);
        setTransactions(sampleData);
      }
      setTotalPages(1);
      setError(null); // Don't show error when using sample data
    } finally {
      setLoading(false);
    }
  }, [chainId, currentPage, pageSize]);

  // Fetch chain data on mount
  React.useEffect(() => {
    fetchChainData();
  }, [fetchChainData]);

  // Fetch transactions on mount and when dependencies change
  React.useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter transactions based on search query
  const filteredTransactions = React.useMemo(() => {
    if (!transactionSearchQuery) {
      return transactions;
    }
    const query = transactionSearchQuery.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.id?.toLowerCase().includes(query) ||
        tx.transaction_hash?.toLowerCase().includes(query) ||
        tx.user_id?.toLowerCase().includes(query) ||
        tx.virtual_pool_id?.toLowerCase().includes(query)
    );
  }, [transactions, transactionSearchQuery]);

  // Derive transaction status
  const getTransactionStatus = (
    tx: ApiTransaction
  ): "success" | "failed" | "pending" => {
    // If transaction_hash is null, it's likely failed
    if (!tx.transaction_hash) {
      // If it has a block_height, it might have failed after being included
      // Otherwise, it's a failed transaction
      return "failed";
    }
    // If block_height is null but hash exists, it's pending
    if (tx.block_height === null) {
      return "pending";
    }
    // Has both hash and block_height, so it's successful
    return "success";
  };

  // Handle transaction click
  const handleTransactionClick = (tx: ApiTransaction) => {
    onTransactionClick?.(tx);
  };

  // Handle load more transactions
  const handleLoadMoreTransactions = React.useCallback(async () => {
    if (currentPage >= totalPages || loadingMoreTransactions) {
      return;
    }

    try {
      setLoadingMoreTransactions(true);
      const nextPage = currentPage + 1;

      const response = await getChainTransactions(chainId, {
        page: nextPage,
        limit: pageSize,
      });

      if (response.data && response.data.length > 0) {
        const updated = [...allTransactions, ...response.data];
        setAllTransactions(updated);
        setTransactions(updated);
        setCurrentPage(nextPage);
      }

      if (response.pagination) {
        setTotalPages(response.pagination.pages);
      }
    } catch (err) {
      console.error("Failed to load more transactions:", err);
    } finally {
      setLoadingMoreTransactions(false);
    }
  }, [
    chainId,
    currentPage,
    pageSize,
    totalPages,
    allTransactions,
    loadingMoreTransactions,
  ]);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">
          Loading transactions...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-medium text-destructive mb-1">{error}</p>
      </div>
    );
  }

  return (
    <Card className="w-full p-6">
      {/* Header with Search */}
      <div className="flex items-center justify-between mb-4">
        {searchTransactionsOpen ? (
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by hash, from address, or to address..."
                value={transactionSearchQuery}
                onChange={(e) => setTransactionSearchQuery(e.target.value)}
                className="pl-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchTransactionsOpen(false);
                setTransactionSearchQuery("");
              }}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTransactionsOpen(true)}
            >
              <Search className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Transaction List */}
      <div className="overflow-x-auto">
        <div>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <button
                key={tx.id}
                onClick={() => handleTransactionClick(tx)}
                className="w-full flex items-center justify-between py-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg flex-shrink-0">
                    <ArrowRightLeft className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-medium truncate">
                      {truncateHash(tx.transaction_hash || tx.id)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(tx.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:gap-6 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">From:</span>
                    <span className="font-mono text-xs">
                      {truncateHash(tx.user_id)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">To:</span>
                    <span className="font-mono text-xs">
                      {truncateHash(tx.virtual_pool_id)}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="font-semibold">
                      {tx.token_amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      {chainData?.token_symbol || "REDAO"}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(getTransactionStatus(tx))}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-muted rounded-full">
                  <Search className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                No transactions found
              </p>
              <p className="text-xs text-muted-foreground">
                {transactionSearchQuery
                  ? "Try searching with a different hash or address"
                  : "No transactions available"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Loading More Indicator */}
      {!transactionSearchQuery && currentPage < totalPages && (
        <div className="mt-4">
          <div className="flex items-center justify-center py-2">
            {loadingMoreTransactions ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading more transactions...
                </span>
              </>
            ) : (
              <Button
                variant="ghost"
                onClick={handleLoadMoreTransactions}
                disabled={currentPage >= totalPages}
                className="text-sm text-muted-foreground"
              >
                Load more
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
