"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Droplets,
  Search,
  ArrowUpDown,
  CheckCircle,
  Plus,
  Wallet,
  Clock,
} from "lucide-react";
import AddLiquidityDialog from "./add-liquidity-dialog";
import WithdrawLiquidityDialog from "./withdraw-liquidity-dialog";
import ClaimFeesDialog from "./claim-fees-dialog";
import CancelWithdrawDialog from "./cancel-withdraw-dialog";
import LpEarningsHistorySheet from "./lp-earnings-history-sheet";
import LpSummaryPanel from "./lp-summary-panel";
import PositionCard from "./position-card";

// CNPY Logo component
function CnpyLogo({ size = 32 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #1dd13a 0%, #0fa32c 100%)",
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        C
      </span>
    </div>
  );
}

// Token Avatar component
function TokenAvatar({
  symbol,
  color,
  size = 32,
}: {
  symbol: string;
  color?: string;
  size?: number;
}) {
  if (symbol === "CNPY") {
    return <CnpyLogo size={size} />;
  }

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color || "#6b7280",
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        {symbol.slice(0, 2)}
      </span>
    </div>
  );
}

// Token display component
function TokenDisplay({
  tokenA,
  tokenB,
  tokenBData,
  hasUserToken = false,
}: {
  tokenA: string;
  tokenB: string;
  tokenBData?: any;
  hasUserToken?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <TokenAvatar symbol={tokenB} color={tokenBData?.brandColor} size={36} />
        {hasUserToken && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-background flex items-center justify-center">
            <Wallet className="w-2.5 h-2.5 text-green-500" />
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{tokenBData?.name || tokenB}</span>
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          {tokenB}
          {hasUserToken && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 font-medium">
              In Wallet
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface LiquidityClientProps {
  liquidityPools: any[];
  tokens: any[];
  lpPositions?: any[];
  lpWithdrawing?: any[];
  lpEarningsHistory?: any[];
  isConnected?: boolean;
  userTokens?: Set<string>;
}

export default function LiquidityClient({
  liquidityPools,
  tokens,
  lpPositions = [],
  lpWithdrawing = [],
  lpEarningsHistory = [],
  isConnected = false,
  userTokens = new Set(),
}: LiquidityClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("tvl");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Dialog states
  const [addLiquidityOpen, setAddLiquidityOpen] = useState(false);
  const [withdrawLiquidityOpen, setWithdrawLiquidityOpen] = useState(false);
  const [claimFeesOpen, setClaimFeesOpen] = useState(false);
  const [cancelWithdrawOpen, setCancelWithdrawOpen] = useState(false);
  const [earningsHistoryOpen, setEarningsHistoryOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedWithdraw, setSelectedWithdraw] = useState(null);
  const [selectedPoolForAdd, setSelectedPoolForAdd] = useState(null);

  // Local state for UI updates (mock)
  const [canceledWithdrawIds, setCanceledWithdrawIds] = useState<string[]>([]);
  const [newWithdrawingItems, setNewWithdrawingItems] = useState<any[]>([]);

  // Combine and filter withdrawing items
  const allWithdrawingItems = [...lpWithdrawing, ...newWithdrawingItems];
  const visibleWithdrawing = allWithdrawingItems.filter(
    (item) => !canceledWithdrawIds.includes(item.id)
  );

  // Filter and sort pools
  const filteredPools = useMemo(() => {
    let pools = [...liquidityPools];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      pools = pools.filter(
        (pool) =>
          pool.tokenA.toLowerCase().includes(query) ||
          pool.tokenB.toLowerCase().includes(query) ||
          tokens
            .find((t) => t.symbol === pool.tokenB)
            ?.name?.toLowerCase()
            .includes(query)
      );
    }

    // Sort
    pools.sort((a, b) => {
      // Primary sort: pools with user's tokens first (if connected)
      if (isConnected && userTokens.size > 0) {
        const aHasUserToken =
          userTokens.has(a.tokenA) || userTokens.has(a.tokenB);
        const bHasUserToken =
          userTokens.has(b.tokenA) || userTokens.has(b.tokenB);

        if (aHasUserToken && !bHasUserToken) return -1;
        if (!aHasUserToken && bHasUserToken) return 1;
      }

      // Secondary sort: by selected column
      let compareA, compareB;

      switch (sortBy) {
        case "tvl":
          compareA = a.totalLiquidity;
          compareB = b.totalLiquidity;
          break;
        case "volume":
          compareA = a.volume24h;
          compareB = b.volume24h;
          break;
        case "fees":
          compareA = a.fees24h;
          compareB = b.fees24h;
          break;
        case "apr":
          compareA = a.apr;
          compareB = b.apr;
          break;
        default:
          compareA = a.totalLiquidity;
          compareB = b.totalLiquidity;
      }

      return sortOrder === "desc" ? compareB - compareA : compareA - compareB;
    });

    return pools;
  }, [
    searchQuery,
    sortBy,
    sortOrder,
    isConnected,
    userTokens,
    liquidityPools,
    tokens,
  ]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  // Dialog handlers
  const handleAddLiquidity = (pool = null) => {
    setSelectedPoolForAdd(pool);
    setAddLiquidityOpen(true);
  };

  const handleWithdraw = (position: any) => {
    setSelectedPosition(position);
    setWithdrawLiquidityOpen(true);
  };

  const handleClaimFees = (position: any) => {
    setSelectedPosition(position);
    setClaimFeesOpen(true);
  };

  const handleCancelWithdraw = (item: any) => {
    setSelectedWithdraw(item);
    setCancelWithdrawOpen(true);
  };

  const handleWithdrawSuccess = (position: any, percentage: number) => {
    // Mock: Add to withdrawing queue
    const newWithdrawItem = {
      id: `withdraw-${Date.now()}-${position.poolId}`,
      poolId: position.poolId,
      tokenA: position.tokenA,
      tokenB: position.tokenB,
      lpTokens: (position.lpTokens * percentage) / 100,
      tokenAAmount: (position.tokenAAmount * percentage) / 100,
      tokenBAmount: (position.tokenBAmount * percentage) / 100,
      valueUSD: (position.valueUSD * percentage) / 100,
      hoursRemaining: 24,
    };
    setNewWithdrawingItems((prev) => [...prev, newWithdrawItem]);
  };

  const handleCancelWithdrawSuccess = (item: any) => {
    setCanceledWithdrawIds((prev) => [...prev, item.id]);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <>
      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
          {/* Section 1: Summary Panel (Full Width) */}
          <LpSummaryPanel
            lpPositions={lpPositions}
            pools={liquidityPools}
            onAddLiquidity={() => handleAddLiquidity()}
            onViewHistory={() => setEarningsHistoryOpen(true)}
          />

          {/* Section 2: Your Positions */}
          {lpPositions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Positions</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lpPositions.map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Withdrawing Queue (if any) */}
          {visibleWithdrawing.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Withdrawing
                <Badge variant="secondary">{visibleWithdrawing.length}</Badge>
              </h2>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pool</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Available In</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleWithdrawing.map((item) => {
                      const tokenBData = tokens.find(
                        (t) => t.symbol === item.tokenB
                      );
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex -space-x-2">
                                <TokenAvatar
                                  symbol={item.tokenB}
                                  color={tokenBData?.brandColor}
                                  size={32}
                                />
                                <TokenAvatar symbol={item.tokenA} size={32} />
                              </div>
                              <div className="font-medium">
                                {item.tokenB} / {item.tokenA}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {item.tokenAAmount?.toFixed(2)} {item.tokenA}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.tokenBAmount?.toFixed(2)} {item.tokenB}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              ${item.valueUSD.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{item.hoursRemaining} hours</span>
                            </div>
                            <Badge variant="secondary" className="mt-1">
                              Pending
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9"
                              onClick={() => handleCancelWithdraw(item)}
                            >
                              Cancel
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* Section 4: Available Pools */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pools</h2>

            <Card className="p-1">
              {/* Search and Actions */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search pools by token..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Button className="gap-2" onClick={() => handleAddLiquidity()}>
                  <Plus className="w-4 h-4" />
                  New Position
                </Button>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Market</TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("tvl")}
                    >
                      <div className="flex items-center gap-2">
                        TVL
                        <ArrowUpDown
                          className={`w-4 h-4 ${
                            sortBy === "tvl" ? "text-foreground" : ""
                          }`}
                        />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("volume")}
                    >
                      <div className="flex items-center gap-2">
                        Volume (24h)
                        <ArrowUpDown
                          className={`w-4 h-4 ${
                            sortBy === "volume" ? "text-foreground" : ""
                          }`}
                        />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("fees")}
                    >
                      <div className="flex items-center gap-2">
                        Fees (24h)
                        <ArrowUpDown
                          className={`w-4 h-4 ${
                            sortBy === "fees" ? "text-foreground" : ""
                          }`}
                        />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("apr")}
                    >
                      <div className="flex items-center gap-2">
                        APY (24h)
                        <ArrowUpDown
                          className={`w-4 h-4 ${
                            sortBy === "apr" ? "text-foreground" : ""
                          }`}
                        />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPools.length > 0 ? (
                    filteredPools.map((pool) => {
                      const tokenBData = tokens.find(
                        (t) => t.symbol === pool.tokenB
                      );
                      const hasUserToken =
                        isConnected &&
                        (userTokens.has(pool.tokenA) ||
                          userTokens.has(pool.tokenB));
                      return (
                        <TableRow
                          key={pool.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors group"
                        >
                          <TableCell className="p-0">
                            <Link
                              href={`/liquidity/${pool.tokenB.toLowerCase()}-${pool.tokenA.toLowerCase()}`}
                              className="flex items-center p-4"
                            >
                              <TokenDisplay
                                tokenA={pool.tokenA}
                                tokenB={pool.tokenB}
                                tokenBData={tokenBData}
                                hasUserToken={hasUserToken}
                              />
                            </Link>
                          </TableCell>
                          <TableCell className="p-0">
                            <Link
                              href={`/liquidity/${pool.tokenB.toLowerCase()}-${pool.tokenA.toLowerCase()}`}
                              className="block p-4"
                            >
                              <div className="font-medium">
                                {formatCurrency(pool.totalLiquidity)}
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="p-0">
                            <Link
                              href={`/liquidity/${pool.tokenB.toLowerCase()}-${pool.tokenA.toLowerCase()}`}
                              className="block p-4"
                            >
                              <div className="font-medium">
                                {formatCurrency(pool.volume24h)}
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="p-0">
                            <Link
                              href={`/liquidity/${pool.tokenB.toLowerCase()}-${pool.tokenA.toLowerCase()}`}
                              className="block p-4"
                            >
                              <div className="font-medium">
                                {formatCurrency(pool.fees24h)}
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="p-0">
                            <Link
                              href={`/liquidity/${pool.tokenB.toLowerCase()}-${pool.tokenA.toLowerCase()}`}
                              className="block p-4"
                            >
                              <div className="font-medium text-green-500">
                                {pool.apr.toFixed(2)}%
                              </div>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="p-4 bg-muted rounded-full">
                            <Droplets className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              No pools found
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Try a different search term
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AddLiquidityDialog
        open={addLiquidityOpen}
        onOpenChange={setAddLiquidityOpen}
        selectedPool={selectedPoolForAdd}
        availablePools={liquidityPools}
      />

      <WithdrawLiquidityDialog
        open={withdrawLiquidityOpen}
        onOpenChange={setWithdrawLiquidityOpen}
        position={selectedPosition}
        onWithdrawSuccess={handleWithdrawSuccess}
      />

      <ClaimFeesDialog
        open={claimFeesOpen}
        onOpenChange={setClaimFeesOpen}
        position={selectedPosition}
      />

      <CancelWithdrawDialog
        open={cancelWithdrawOpen}
        onOpenChange={setCancelWithdrawOpen}
        withdrawItem={selectedWithdraw}
        onCancelSuccess={handleCancelWithdrawSuccess}
      />

      <LpEarningsHistorySheet
        open={earningsHistoryOpen}
        onOpenChange={setEarningsHistoryOpen}
        lpEarningsHistory={lpEarningsHistory}
        lpPositions={lpPositions}
      />
    </>
  );
}
