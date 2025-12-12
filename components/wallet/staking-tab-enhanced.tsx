"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Loader2,
} from "lucide-react";
import { useStaking } from "@/lib/hooks/use-staking";
import { formatTokenAmount, withCommas } from "@/lib/utils/denomination";
import { Skeleton } from "@/components/ui/skeleton";
import { StakeDialog } from "./stake-dialog";
import { UnstakeDialog } from "./unstake-dialog";
import { UnstakingDetailSheet } from "./unstaking-detail-sheet";
import { CancelUnstakeDialog } from "./cancel-unstake-dialog";

interface StakingTabEnhancedProps {
  addresses: string[];
}

type SortField = "apy" | "amount" | "earnings";
type SortOrder = "asc" | "desc";
type ActiveFilter = "all" | "active" | "queue";

// Format uCNPY to CNPY with commas
function formatCNPY(uCNPY: string | number): string {
  const cnpy = parseFloat(uCNPY.toString()) / 1_000_000;
  return withCommas(cnpy);
}

// Get color for chain based on chain ID
function getChainColor(chainId: number): string {
  const colors = [
    "#9333EA", // purple
    "#F97316", // orange
    "#10B981", // green
    "#EC4899", // pink
    "#3B82F6", // blue
    "#EAB308", // yellow
    "#6366F1", // indigo
    "#EF4444", // red
  ];
  return colors[chainId % colors.length];
}

export function StakingTabEnhanced({ addresses }: StakingTabEnhancedProps) {
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [unstakeDialogOpen, setUnstakeDialogOpen] = useState(false);
  const [unstakingDetailOpen, setUnstakingDetailOpen] = useState(false);
  const [cancelUnstakeDialogOpen, setCancelUnstakeDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [selectedUnstaking, setSelectedUnstaking] = useState<any>(null);
  const [sortBy, setSortBy] = useState<SortField>("apy");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  // Fetch staking data from backend
  const {
    positions,
    rewards,
    unstakingQueue,
    totalRewards,
    totalRewardsCNPY,
    isLoading,
    isError,
    error,
    refetchAll,
  } = useStaking({
    enabled: addresses.length > 0,
    refetchInterval: 30000,
  });

  // Calculate total interest earned
  const totalInterestEarned = useMemo(() => {
    return rewards.reduce((sum, reward) => {
      const usd = parseFloat(reward.claimable_rewards) / 1_000_000 * 0.1; // TODO: Real USD conversion
      return sum + usd;
    }, 0);
  }, [rewards]);

  const handleSort = (column: SortField) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const sortedPositions = useMemo(() => {
    return [...positions].sort((a, b) => {
      let compareA: number, compareB: number;

      switch (sortBy) {
        case "apy":
          // TODO: Get real APY from backend
          compareA = 8.05;
          compareB = 8.05;
          break;
        case "amount":
          compareA = parseFloat(a.amount) || 0;
          compareB = parseFloat(b.amount) || 0;
          break;
        case "earnings":
          const rewardA = rewards.find((r) => r.validator_address === a.validator_address);
          const rewardB = rewards.find((r) => r.validator_address === b.validator_address);
          compareA = parseFloat(rewardA?.claimable_rewards || "0");
          compareB = parseFloat(rewardB?.claimable_rewards || "0");
          break;
        default:
          compareA = 0;
          compareB = 0;
      }

      if (sortOrder === "asc") {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });
  }, [positions, rewards, sortBy, sortOrder]);

  const filteredPositions = useMemo(() => {
    if (activeFilter === "active") {
      return sortedPositions.filter((p) => p.status === "active");
    }
    return sortedPositions;
  }, [sortedPositions, activeFilter]);

  const activeStakesCount = positions.filter((p) => p.status === "active").length;

  const handleStakeClick = (position: any) => {
    setSelectedPosition(position);
    setStakeDialogOpen(true);
  };

  const handleUnstakeClick = (position: any) => {
    setSelectedPosition(position);
    setUnstakeDialogOpen(true);
  };

  const handleViewUnstakingDetails = (item: any) => {
    setSelectedUnstaking(item);
    setUnstakingDetailOpen(true);
  };

  const handleCancelUnstake = (item: any) => {
    setSelectedUnstaking(item);
    setCancelUnstakeDialogOpen(true);
  };

  // Render restake badge
  const renderRestakeBadge = (position: any) => {
    // TODO: Get auto-compound setting from backend
    const restakeRewards = true;

    return restakeRewards ? (
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
          <p>Rewards are automatically restaked to increase your position</p>
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
          <p>Rewards are automatically added to your wallet balance</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  // Render action buttons
  const renderActionButtons = (position: any) => {
    const isActive = position.status === "active";

    if (isActive) {
      return (
        <div className="flex flex-col items-end gap-1">
          <Button
            size="sm"
            className="h-7 text-xs w-[72px]"
            onClick={() => handleStakeClick(position)}
          >
            Add More
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs w-[72px]"
            onClick={() => handleUnstakeClick(position)}
          >
            Unstake
          </Button>
        </div>
      );
    }

    return (
      <Button
        size="sm"
        className="h-7 text-xs w-[72px]"
        onClick={() => handleStakeClick(position)}
      >
        Stake
      </Button>
    );
  };

  // Loading state
  if (isLoading && addresses.length > 0) {
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

  // Error state
  if (isError) {
    return (
      <Card>
        <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
          <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-destructive opacity-50" />
          <p className="text-sm text-destructive mb-2">Error loading staking data</p>
          <p className="text-xs text-muted-foreground mb-4">
            {error?.message || "Failed to fetch staking information"}
          </p>
          <Button onClick={() => refetchAll()} variant="outline" size="sm">
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Empty state (no addresses)
  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
          <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
            No wallet connected
          </p>
          <p className="text-xs text-muted-foreground">
            Connect a wallet to view staking information
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Total Interest Earned Section */}
        <Card className="p-1">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="space-y-1">
              <p className="text-lg font-bold">Total interest earned to date</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">
                  ${totalInterestEarned.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
                <span className="text-sm text-muted-foreground">USD</span>
              </div>

              <p className="text-sm text-muted-foreground mt-4 max-w-md">
                Earn up to 8.05% APY on your crypto. Rewards are automatically transferred.
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help inline-block ml-1.5 align-middle" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Annual Percentage Yield (APY) varies by asset and network conditions.</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Rewards are automatically transferred based on your preference (restake or to
                      balance).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </p>
            </div>
          </div>
        </Card>

        {/* Pill Navigation */}
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
              {activeStakesCount}
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
              {unstakingQueue.length}
            </span>
          </button>
        </div>

        {/* Stakes Table (for 'all' and 'active' filters) */}
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
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.length > 0 ? (
                  filteredPositions.map((position) => {
                    const reward = rewards.find(
                      (r) => r.validator_address === position.validator_address
                    );
                    const isActive = position.status === "active";
                    const chainColor = getChainColor(position.chain_id);

                    return (
                      <TableRow key={position.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: chainColor }}
                            >
                              <span className="text-sm font-bold text-white">
                                {position.chain_id}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold">Chain {position.chain_id}</div>
                              <div className="text-sm text-muted-foreground">CNPY</div>
                              {renderRestakeBadge(position)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isActive ? (
                            <>
                              <div className="font-medium">
                                {formatCNPY(position.amount)} CNPY
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ${(parseFloat(position.amount) / 1_000_000 * 0.1).toFixed(2)} USD
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">Not staked</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">8.05%</div>
                        </TableCell>
                        <TableCell>
                          {reward && parseFloat(reward.claimable_rewards) > 0 ? (
                            <div>
                              <div className="font-medium">
                                {formatCNPY(reward.claimable_rewards)} CNPY
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ${(parseFloat(reward.claimable_rewards) / 1_000_000 * 0.1).toFixed(2)} USD
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              {isActive ? "Earning..." : "-"}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {renderActionButtons(position)}
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
                            {activeFilter === "active" ? "No active stakes" : "No staking positions"}
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

        {/* Unstaking Queue Table */}
        {activeFilter === "queue" && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Chain</TableHead>
                  <TableHead className="whitespace-nowrap">Amount</TableHead>
                  <TableHead className="whitespace-nowrap">Available In</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unstakingQueue.length > 0 ? (
                  unstakingQueue.map((item) => {
                    const chainColor = getChainColor(item.chain_id);
                    // TODO: Calculate actual time remaining from completion_time
                    const daysRemaining = 7;
                    const hoursRemaining = 0;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: chainColor }}
                            >
                              <span className="text-sm font-bold text-white">
                                {item.chain_id}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold">Chain {item.chain_id}</div>
                              <Badge variant="secondary" className="mt-1">
                                Pending
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCNPY(item.amount)} CNPY</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {daysRemaining} days, {hoursRemaining} hours
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

      {/* Dialogs */}
      <StakeDialog
        open={stakeDialogOpen}
        onOpenChange={setStakeDialogOpen}
        initialChainId={selectedPosition?.chain_id}
      />

      <UnstakeDialog
        open={unstakeDialogOpen}
        onOpenChange={setUnstakeDialogOpen}
        position={selectedPosition}
      />

      <UnstakingDetailSheet
        unstakingItem={selectedUnstaking}
        open={unstakingDetailOpen}
        onOpenChange={setUnstakingDetailOpen}
        onCancel={handleCancelUnstake}
      />

      <CancelUnstakeDialog
        open={cancelUnstakeDialogOpen}
        onOpenChange={setCancelUnstakeDialogOpen}
        unstakingItem={selectedUnstaking}
      />
    </TooltipProvider>
  );
}
