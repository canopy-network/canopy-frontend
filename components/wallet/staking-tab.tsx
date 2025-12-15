"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Info,
  ArrowUpDown,
  CheckCircle2,
  RefreshCw,
  Wallet,
  Layers,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useMockStaking } from "@/lib/hooks/use-mock-staking";
import type { MockStake, MockUnstakingItem } from "@/lib/mockdata/staking";
import { EarningsHistorySheet } from "./earnings-history-sheet";
import { formatBalance } from "@/lib/utils/wallet-helpers";
import { UnstakeDialog } from "./unstake-dialog";
import { CancelUnstakeDialog } from "./cancel-unstake-dialog";
import { UnstakingDetailSheet } from "./unstaking-detail-sheet";
import { EarnRewardsDialog } from "./earn-rewards-dialog";
import { ManageCnpyStakeDialog } from "./manage-cnpy-stake-dialog";

interface StakingTabProps {
  addresses: string[];
}

type SortField = "apy" | "amount" | "earnings";
type SortOrder = "asc" | "desc";
type ActiveFilter = "all" | "active" | "queue";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatUsd(value: number) {
  return `$${currencyFormatter.format(value)}`;
}

const MAIN_CHAIN_ID = 0; // Mock main chain id for CNPY

export function StakingTab({ addresses }: StakingTabProps) {
  const hasWallet = addresses.length > 0;
  const {
    data,
    isLoading,
    totalInterestEarned,
    unstakingCount,
  } = useMockStaking(hasWallet ? addresses[0] : undefined, { enabled: hasWallet });

  const [sortBy, setSortBy] = useState<SortField>("apy");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [canceledUnstakeIds, setCanceledUnstakeIds] = useState<
    Array<string | number>
  >([]);
  const [newUnstakingItems, setNewUnstakingItems] = useState<
    MockUnstakingItem[]
  >([]);
  const [selectedStake, setSelectedStake] = useState<MockStake | null>(null);
  const [selectedUnstaking, setSelectedUnstaking] = useState<
    MockUnstakingItem | null
  >(null);
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [showManageCnpyDialog, setShowManageCnpyDialog] = useState(false);
  const [showUnstakeDialog, setShowUnstakeDialog] = useState(false);
  const [showHistorySheet, setShowHistorySheet] = useState(false);
  const [stakeOverrides, setStakeOverrides] = useState<
    Record<
      number,
      {
        amount: number;
        rewards?: number;
        rewardsUSD?: number;
        restakeRewards?: boolean;
        committees?: number[];
      }
    >
  >({});
  const [showUnstakingDetail, setShowUnstakingDetail] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const stakes = data.stakes ?? [];
  const assets = data.assets ?? [];
  const baseUnstaking = data.unstaking ?? [];
  const allUnstaking = [...baseUnstaking, ...newUnstakingItems];
  const visibleUnstaking = allUnstaking.filter(
    (item) => !canceledUnstakeIds.includes(item.id)
  );
  const displayStakes = useMemo(() => {
    return stakes.map((stake) => {
      const override = stakeOverrides[stake.id];
      if (!override) return stake;

      // Build updated committees when override exists
      let committees = stake.committees ?? [];
      if (override.committees) {
        const pool = [
          ...(stake.committees ?? []),
          ...(stake.availableChains ?? []),
          {
            chainId: stake.chainId,
            chain: stake.chain,
            symbol: stake.symbol,
            color: stake.color,
          } as any,
        ];
        committees = override.committees
          .map((id) => pool.find((c) => c.chainId === id))
          .filter(Boolean) as any[];
      }

      return {
        ...stake,
        amount: override.amount,
        rewards: override.rewards ?? stake.rewards,
        rewardsUSD: override.rewardsUSD ?? stake.rewardsUSD,
        restakeRewards:
          override.restakeRewards !== undefined
            ? override.restakeRewards
            : stake.restakeRewards,
        committees,
      };
    });
  }, [stakeOverrides, stakes]);

  const activeCount = useMemo(
    () => displayStakes.filter((stake) => stake.amount > 0).length,
    [displayStakes]
  );

  const earningsForSheet = useMemo(() => {
    const normalizeDate = (label: string) => {
      const lower = label.toLowerCase();
      if (lower === "today") return new Date();
      if (lower === "yesterday")
        return new Date(Date.now() - 24 * 60 * 60 * 1000);
      const parsed = new Date(label);
      return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    let counter = 0;
    return (data.earningsHistory ?? []).flatMap((day) => {
      const dayDate = normalizeDate(day.date).toISOString();
      return day.transactions.map((tx, idx) => {
        const chainAsset = assets.find((a) => a.chainId === tx.chainId);
        return {
          id: counter++,
          date: dayDate,
          chain: chainAsset?.name ?? tx.symbol,
          symbol: tx.symbol,
          amount: tx.amount,
          usdValue: tx.amountUSD,
          color: chainAsset?.color ?? "#1f2937",
        };
      });
    });
  }, [assets, data.earningsHistory]);

  const handleSort = (column: SortField) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const sortedStakes = useMemo(() => {
    const copy = [...displayStakes];
    copy.sort((a, b) => {
      if (a.isCnpy) return -1;
      if (b.isCnpy) return 1;

      const getValue = (stake: MockStake) => {
        if (sortBy === "apy") return stake.apy;
        if (sortBy === "amount") return stake.amount;
        return stake.rewardsUSD ?? stake.rewards ?? 0;
      };

      const diff = getValue(a) - getValue(b);
      return sortOrder === "asc" ? diff : -diff;
    });
    return copy;
  }, [displayStakes, sortBy, sortOrder]);

  const filteredStakes = useMemo(() => {
    if (activeFilter === "active") {
      return sortedStakes.filter((stake) => stake.amount > 0);
    }
    return sortedStakes;
  }, [activeFilter, sortedStakes]);

  const handleStakeClick = (stake: MockStake) => {
    setSelectedStake(stake);
    if (stake.isCnpy) {
      setShowManageCnpyDialog(true);
    } else {
      setShowStakeDialog(true);
    }
  };

  const handleUnstakeClick = (stake: MockStake) => {
    setSelectedStake(stake);
    setShowUnstakeDialog(true);
  };

  const handleViewUnstakingDetails = (item: MockUnstakingItem) => {
    setSelectedUnstaking(item);
    setShowUnstakingDetail(true);
  };

  const handleCancelUnstake = (item: MockUnstakingItem) => {
    setSelectedUnstaking(item);
    setShowCancelDialog(true);
  };

  const renderRestakeBadge = (stake: MockStake) => {
    if (stake.amount <= 0) return null;

    return stake.restakeRewards ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="text-green-600 border-green-600/50 gap-1 whitespace-nowrap mt-1"
          >
            <RefreshCw className="w-3 h-3" />
            Auto-compound
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Rewards are automatically restaked to increase your position.</p>
        </TooltipContent>
      </Tooltip>
    ) : (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="text-blue-500 border-blue-500/50 gap-1 whitespace-nowrap mt-1"
          >
            <Wallet className="w-3 h-3" />
            Auto-withdraw
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Rewards are automatically added to your wallet balance.</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const renderActionButtons = (stake: MockStake) => {
    const isActive = stake.amount > 0;

    if (stake.isCnpy) {
      return (
        <div className="flex flex-col items-end gap-1">
          {isActive && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs w-[110px]"
              onClick={() => handleUnstakeClick(stake)}
            >
              Unstake (7d)
            </Button>
          )}
          <Button
            size="sm"
            className="h-7 text-xs w-[110px]"
            onClick={() => handleStakeClick(stake)}
          >
            Manage Chains
          </Button>
        </div>
      );
    }

    if (isActive) {
      return (
        <div className="flex flex-col items-end gap-1">
          <Button
            size="sm"
            className="h-7 text-xs w-[78px]"
            onClick={() => handleStakeClick(stake)}
          >
            Add More
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs w-[78px]"
            onClick={() => handleUnstakeClick(stake)}
          >
            Unstake
          </Button>
        </div>
      );
    }

    return (
      <Button
        size="sm"
        className="h-7 text-xs w-[78px]"
        onClick={() => handleStakeClick(stake)}
      >
        Stake
      </Button>
    );
  };

  if (!hasWallet) {
    return (
      <Card>
        <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
          <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground opacity-60" />
          <p className="text-sm font-medium">No wallet connected</p>
          <p className="text-xs text-muted-foreground mt-1">
            Connect your wallet to view and manage your stakes.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-24" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card className="p-1">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="space-y-1">
              <p className="text-lg font-bold">Total interest earned to date</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">
                  {formatUsd(totalInterestEarned)}
                </h3>
                <span className="text-sm text-muted-foreground">USD</span>
              </div>

              <p className="text-sm text-muted-foreground mt-4 max-w-md">
                Earn up to 8.05% APY on your crypto. Rewards are automatically
                transferred.
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help inline-block ml-1.5 align-middle" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Annual Percentage Yield (APY) varies by asset and network
                      conditions.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Rewards are automatically transferred based on your
                      preference (restake or to balance).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </p>
            </div>
            <Button
              variant="outline"
              className="h-10"
              onClick={() => setShowHistorySheet(true)}
            >
              View Reward History
            </Button>
          </div>
        </Card>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`h-9 px-4 rounded-full text-sm font-medium transition-colors shrink-0 ${
              activeFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All Stakes
          </button>
          <button
            onClick={() => setActiveFilter("active")}
            className={`h-9 px-4 rounded-full text-sm font-medium transition-colors flex items-center gap-2 shrink-0 ${
              activeFilter === "active"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Active
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeFilter === "active"
                  ? "bg-primary-foreground/20"
                  : "bg-foreground/10"
              }`}
            >
              {activeCount}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter("queue")}
            className={`h-9 px-4 rounded-full text-sm font-medium transition-colors flex items-center gap-2 shrink-0 ${
              activeFilter === "queue"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Unstaking Queue
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeFilter === "queue"
                  ? "bg-primary-foreground/20"
                  : "bg-foreground/10"
              }`}
            >
              {visibleUnstaking.length || unstakingCount}
            </span>
          </button>
        </div>

        {activeFilter !== "queue" && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Chain</TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center gap-2">
                      Staked Amount
                      <ArrowUpDown className="w-4 h-4 shrink-0" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort("apy")}
                  >
                    <div className="flex items-center gap-2">
                      APY
                      <ArrowUpDown className="w-4 h-4 shrink-0" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort("earnings")}
                  >
                    <div className="flex items-center gap-2">
                      Rewards Earned
                      <ArrowUpDown className="w-4 h-4 shrink-0" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right whitespace-nowrap">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStakes.length > 0 ? (
                  filteredStakes.map((stake) => {
                    const asset = assets.find((a) => a.chainId === stake.chainId);
                    const stakedValueUSD = (stake.amount || 0) * (asset?.price || 0);
                    const isActive = stake.amount > 0;

                    return (
                      <TableRow key={stake.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: stake.color }}
                            >
                              <span className="text-sm font-bold text-white">
                                {stake.symbol.slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold">{stake.chain}</div>
                              <div className="text-sm text-muted-foreground">
                                {stake.symbol}
                              </div>
                              {renderRestakeBadge(stake)}
                              {stake.isCnpy &&
                                stake.committees &&
                                stake.committees.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1.5">
                                    <Layers className="w-3 h-3 text-muted-foreground" />
                                    <div className="flex -space-x-1.5">
                                      {stake.committees.slice(0, 5).map((committee) => (
                                        <Tooltip key={committee.chainId}>
                                          <TooltipTrigger asChild>
                                            <div
                                              className="w-5 h-5 rounded-full flex items-center justify-center border-2 border-background"
                                              style={{ backgroundColor: committee.color }}
                                            >
                                              <span className="text-[8px] font-bold text-white">
                                                {committee.symbol.slice(0, 1)}
                                              </span>
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Staking for {committee.chain}</p>
                                            {committee.rewards !== undefined && (
                                              <p className="text-xs text-muted-foreground">
                                                Earned: {committee.rewards} {committee.symbol}
                                              </p>
                                            )}
                                          </TooltipContent>
                                        </Tooltip>
                                      ))}
                                      {stake.committees.length > 5 && (
                                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-muted border-2 border-background">
                                          <span className="text-[8px] font-medium">
                                            +{stake.committees.length - 5}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-xs text-muted-foreground ml-1">
                                      {stake.committees.length} chain
                                      {stake.committees.length !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isActive ? (
                            <>
                              <div className="font-medium">
                                {stake.amount} {stake.symbol}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatUsd(stakedValueUSD)} USD
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Not staked
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{stake.apy}%</div>
                        </TableCell>
                        <TableCell>
                          {stake.rewards && stake.rewards > 0 ? (
                            <div>
                              <div className="font-medium">
                                {stake.rewards} {stake.symbol}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {stake.rewardsUSD ? formatUsd(stake.rewardsUSD) + " USD" : ""}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              {isActive ? "Earning..." : "-"}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {renderActionButtons(stake)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-muted rounded-full">
                          <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            {activeFilter === "active"
                              ? "No active stakes"
                              : "No staking positions"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Start staking to earn rewards
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        )}

        {activeFilter === "queue" && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Chain</TableHead>
                  <TableHead className="whitespace-nowrap">Amount</TableHead>
                  <TableHead className="whitespace-nowrap">Available In</TableHead>
                  <TableHead className="text-right whitespace-nowrap">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleUnstaking.length > 0 ? (
                  visibleUnstaking.map((item) => {
                    const stake = stakes.find((s) => s.chainId === item.chainId);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: stake?.color || "#1f2937" }}
                            >
                              <span className="text-sm font-bold text-white">
                                {item.symbol.slice(0, 2)}
                              </span>
                          </div>
                          <div>
                            <div className="font-semibold">
                              {stake?.chain || item.symbol}
                            </div>
                              <Badge variant="secondary" className="mt-1">
                                Pending
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {item.amount} {item.symbol}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {item.daysRemaining} days, {item.hoursRemaining} hours
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-9"
                              onClick={() => handleViewUnstakingDetails(item)}
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9"
                              onClick={() => handleCancelUnstake(item)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-muted rounded-full">
                          <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            No pending unstakes
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Unstaked funds will appear here during the unstaking period
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <EarnRewardsDialog
        open={showStakeDialog}
        onOpenChange={setShowStakeDialog}
        stake={
          selectedStake
            ? {
                ...selectedStake,
                amount:
                  stakeOverrides[selectedStake.id]?.amount ?? selectedStake.amount,
                price:
                  assets.find((a) => a.chainId === selectedStake.chainId)?.price ??
                  0,
                balance:
                  assets.find((a) => a.chainId === selectedStake.chainId)?.balance ??
                  0,
              }
            : null
        }
        onConfirm={(amountToAdd, autoCompound) => {
          if (!selectedStake) return;
          const currentAmount =
            stakeOverrides[selectedStake.id]?.amount ?? selectedStake.amount;
          setStakeOverrides((prev) => ({
            ...prev,
            [selectedStake.id]: {
              ...prev[selectedStake.id],
              amount: currentAmount + amountToAdd,
              rewards: prev[selectedStake.id]?.rewards,
              rewardsUSD: prev[selectedStake.id]?.rewardsUSD,
              restakeRewards: autoCompound,
            },
          }));
          setSelectedStake((prev) =>
            prev ? { ...prev, restakeRewards: autoCompound } : prev
          );
          toast.success(`Added ${formatBalance(amountToAdd, 2)} ${selectedStake.symbol}`);
        }}
      />

      <ManageCnpyStakeDialog
        open={showManageCnpyDialog}
        onOpenChange={setShowManageCnpyDialog}
        stake={
          selectedStake?.isCnpy
            ? {
                ...selectedStake,
                amount:
                  stakeOverrides[selectedStake.id]?.amount ?? selectedStake.amount,
                balance:
                  assets.find((a) => a.chainId === selectedStake.chainId)?.balance ??
                  0,
                price:
                  assets.find((a) => a.chainId === selectedStake.chainId)?.price ??
                  0,
              }
            : null
        }
        onConfirm={({ amountToAdd, committees, autoCompound }) => {
          if (!selectedStake) return;
          const currentAmount =
            stakeOverrides[selectedStake.id]?.amount ?? selectedStake.amount;
          setStakeOverrides((prev) => ({
            ...prev,
            [selectedStake.id]: {
              ...prev[selectedStake.id],
              amount: currentAmount + amountToAdd,
              committees,
              restakeRewards: autoCompound,
            },
          }));
          toast.success(
            `Updated CNPY stake (chains: ${committees.length}, +${formatBalance(
              amountToAdd,
              2
            )} CNPY)`
          );
        }}
      />

      <UnstakeDialog
        open={showUnstakeDialog}
        onOpenChange={setShowUnstakeDialog}
        stake={
          selectedStake
            ? {
                id: selectedStake.id,
                chain: selectedStake.chain,
                symbol: selectedStake.symbol,
                amount:
                  stakeOverrides[selectedStake.id]?.amount ?? selectedStake.amount,
                price:
                  assets.find((a) => a.chainId === selectedStake.chainId)?.price ??
                  0.1,
                color: selectedStake.color,
                apy: selectedStake.apy,
              }
            : undefined
        }
        onUnstakeSuccess={(stake, amount) => {
          setStakeOverrides((prev) => ({
            ...prev,
            [stake.id]: {
              ...prev[stake.id],
              amount: Math.max(0, stake.amount - amount),
            },
          }));
          const newEntry: MockUnstakingItem = {
            id: `unstake-${Date.now()}`,
            chainId: selectedStake?.chainId ?? selectedStake?.id ?? stake.id,
            symbol: stake.symbol,
            amount,
            daysRemaining: 7,
            hoursRemaining: 0,
          };
          setNewUnstakingItems((prev) => [...prev, newEntry]);
          toast.success(
            `Unstake of ${formatBalance(amount, 2)} ${stake.symbol} started (mock)`
          );
        }}
      />

      <EarningsHistorySheet
        open={showHistorySheet}
        onOpenChange={setShowHistorySheet}
        earnings={earningsForSheet}
      />

      <UnstakingDetailSheet
        open={showUnstakingDetail}
        onOpenChange={setShowUnstakingDetail}
        unstakingItem={
          selectedUnstaking
            ? (() => {
                const stake = displayStakes.find(
                  (s) => s.chainId === selectedUnstaking.chainId
                );
                const availableAt =
                  Date.now() +
                  (selectedUnstaking.daysRemaining * 24 +
                    selectedUnstaking.hoursRemaining) *
                    60 *
                    60 *
                    1000;
                return {
                  id: Number(selectedUnstaking.id) || 0,
                  chain: stake?.chain || selectedUnstaking.symbol,
                  symbol: selectedUnstaking.symbol,
                  amount: selectedUnstaking.amount,
                  availableAt,
                  color: stake?.color || "#1f2937",
                };
              })()
            : undefined
        }
        onCancelUnstake={() => {
          if (!selectedUnstaking) return;
          setCanceledUnstakeIds((prev) => [...prev, selectedUnstaking.id]);
          setShowUnstakingDetail(false);
          toast.success(
            `Unstake canceled for ${selectedUnstaking.symbol} (mock)`
          );
        }}
      />

      <CancelUnstakeDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        unstakingItem={
          selectedUnstaking
            ? {
                chain:
                  displayStakes.find(
                    (stake) => stake.chainId === selectedUnstaking.chainId
                  )?.chain || selectedUnstaking.symbol,
                symbol: selectedUnstaking.symbol,
                amount: selectedUnstaking.amount,
              }
            : undefined
        }
        onConfirm={() => {
          if (!selectedUnstaking) return;
          setCanceledUnstakeIds((prev) => [...prev, selectedUnstaking.id]);
          setShowCancelDialog(false);
          toast.success(
            `Unstake canceled for ${selectedUnstaking.symbol} (mock)`
          );
        }}
      />
    </TooltipProvider>
  );
}
