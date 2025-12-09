import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Clock, ChevronRight, Wallet } from "lucide-react";
import { useLiquidityPoolsStore } from "@/lib/stores/liquidity-pools-store";
import tokensData from "@/data/tokens.json";
import { useWalletStore } from "@/lib/stores/wallet-store";

export default function PoolSelectionDialog({
  open,
  onOpenChange,
  onSelectPool,
}) {
  const { wallets } = useWalletStore();
  const { available_pools, fetchPools } = useLiquidityPoolsStore();
  const isConnected = wallets.length > 0;

  const [searchQuery, setSearchQuery] = useState("");
  const [recentPools, setRecentPools] = useState([]);

  // Get user's LP positions (mock data for now)
  // TODO: Implement actual LP position fetching using wallet addresses
  const userLpPositions = useMemo(() => {
    return [];
  }, [isConnected]);

  // Fetch pools when dialog opens if not already loaded
  useEffect(() => {
    if (open && available_pools.length === 0) {
      fetchPools();
    }
  }, [open, available_pools.length, fetchPools]);

  // Load recent pools from localStorage
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem("recentPools") || "[]");
    setRecentPools(recent);
  }, [open]);

  // Get all pools sorted by APY
  const allPools = useMemo(() => {
    return [...available_pools].sort((a, b) => b.apr - a.apr);
  }, [available_pools]);

  // Get pools where user has positions
  const userPoolsList = useMemo(() => {
    const userPoolIds = userLpPositions.map((pos) => pos.poolId);
    return allPools.filter((pool) => userPoolIds.includes(pool.id));
  }, [allPools, userLpPositions]);

  // Filter pools based on search
  const filteredPools = useMemo(() => {
    if (!searchQuery) return allPools;

    const query = searchQuery.toLowerCase();
    return allPools.filter((pool) => {
      const tokenA = tokensData.find((t) => t.symbol === pool.tokenA);
      const tokenB = tokensData.find((t) => t.symbol === pool.tokenB);

      return (
        pool.tokenA.toLowerCase().includes(query) ||
        pool.tokenB.toLowerCase().includes(query) ||
        tokenA?.name?.toLowerCase().includes(query) ||
        tokenB?.name?.toLowerCase().includes(query)
      );
    });
  }, [allPools, searchQuery]);

  // Get recent pools that are still valid
  const recentPoolsList = recentPools
    .map((id) => allPools.find((p) => p.id === id))
    .filter((p) => p)
    .slice(0, 3);

  const handleSelectPool = (pool) => {
    // Add to recent pools
    const updated = [
      pool.id,
      ...recentPools.filter((id) => id !== pool.id),
    ].slice(0, 5);
    localStorage.setItem("recentPools", JSON.stringify(updated));
    setRecentPools(updated);

    onSelectPool(pool);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Select a Pool</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by token name or symbol"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Pool List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          {/* Your Positions - Pools where user has staked */}
          {!searchQuery && userPoolsList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2">
                <Wallet className="w-3 h-3" />
                <span>Your Positions</span>
              </div>
              <div className="space-y-1">
                {userPoolsList.map((pool) => {
                  const position = userLpPositions.find(
                    (pos) => pos.poolId === pool.id
                  );
                  return (
                    <PoolItem
                      key={pool.id}
                      pool={pool}
                      onSelect={handleSelectPool}
                      positionValue={position?.valueUSD}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Pools */}
          {!searchQuery && recentPoolsList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2">
                <Clock className="w-3 h-3" />
                <span>Recent</span>
              </div>
              <div className="space-y-1">
                {recentPoolsList.map((pool) => (
                  <PoolItem
                    key={pool.id}
                    pool={pool}
                    onSelect={handleSelectPool}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Pools */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2">
              <TrendingUp className="w-3 h-3" />
              <span>{searchQuery ? "Search Results" : "All Pools"}</span>
            </div>
            <div className="space-y-1">
              {filteredPools.length > 0 ? (
                filteredPools.map((pool) => (
                  <PoolItem
                    key={pool.id}
                    pool={pool}
                    onSelect={handleSelectPool}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No pools found
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PoolItem({ pool, onSelect, positionValue }) {
  const tokenA = tokensData.find((t) => t.symbol === pool.tokenA);
  const tokenB = tokensData.find((t) => t.symbol === pool.tokenB);

  return (
    <button
      onClick={() => onSelect(pool)}
      className="w-full p-3 rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        {/* Token Pair Avatars */}
        <div className="flex -space-x-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-background"
            style={{ backgroundColor: tokenB?.brandColor || "#6b7280" }}
          >
            <span className="text-sm font-bold text-white">
              {pool.tokenB[0]}
            </span>
          </div>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-background"
            style={{ backgroundColor: tokenA?.brandColor || "#1dd13a" }}
          >
            <span className="text-sm font-bold text-white">
              {pool.tokenA[0]}
            </span>
          </div>
        </div>

        {/* Pool Info */}
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {pool.tokenB} / {pool.tokenA}
            </span>
            {positionValue && (
              <span className="text-xs bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded">
                $
                {positionValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            TVL ${(pool.totalLiquidity / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* APY & Arrow */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-green-500">
          {pool.apr}% APY
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </button>
  );
}
