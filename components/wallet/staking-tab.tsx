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
import { useStaking } from "@/lib/hooks/use-staking";
import {formatBalance, formatTimeRemaining} from "@/lib/utils/wallet-helpers";

import { UnstakingDetailSheet } from "./unstaking-detail-sheet";
import {fromMicroUnits} from "@/lib/utils/denomination";
import {StakeDialog} from "@/components/wallet/stake-dialog";
import { UnstakeDialog } from "@/components/wallet/unstake-dialog";

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

const MAIN_CHAIN_ID = 1; // Real main chain ID for CNPY

/**
 * Transform backend StakingPosition to display format
 */
interface DisplayStake {
  id: string;
  chainId: number;
  symbol: string;
  chain: string;
  amount: number; // native amount (converted)
  nativeAmount: number;
  cnpyAmount: number;
  apy: number;
  rewards: number; // in CNPY
  rewardsUSD?: number;
  color: string;
  restakeRewards: boolean;
  committees?: Array<{
    chainId: number;
    chainName: string;
  }>;
  status: "active" | "paused" | "unstaking";
}

/**
 * Transform backend UnstakingEntry to display format
 */
interface DisplayUnstaking {
  id: string;
  chainId: number;
  chain: string;
  symbol: string;
  nativeAmount: number;
  cnpyAmount: number;
  daysRemaining: number;
  hoursRemaining: number;
  status: "active" | "paused" | "unstaking";
  availableAt: number;
  timeRemainingLabel: string;
}

// TODO: Get from chains API or config
const CHAIN_COLORS: Record<number, string> = {
  1: "#1dd13a", // CNPY
  2: "#8b5cf6", // GAME
  3: "#06b6d4", // SOCL
  5: "#f59e0b", // STRM
  6: "#ec4899", // DFIM
};

const getStatusColor = (status: DisplayStake["status"]) => {
  switch (status) {
    case "unstaking":
      return "text-red-500";
    case "active":
      return "text-green-500";
    case "paused":
      return "text-yellow-500";
    default:
      return "text-gray-500";
  }
};

const getStatusLabel = (status: DisplayStake["status"]) => {
  switch (status) {
    case "active":
      return "Active";
    case "paused":
      return "Paused";
    case "unstaking":
      return "Unstaking";
    default:
      return status;
  }
};

export function StakingTab({ addresses }: StakingTabProps) {
  const hasWallet = addresses.length > 0;
  const address = hasWallet ? addresses[0] : undefined;

  // Fetch real data from backend
  const {
    positions,
    rewards,
    unstakingQueue,
    totalRewardsEarned,
    isLoading,
    isError,
  } = useStaking(address);

  const [sortBy, setSortBy] = useState<SortField>("apy");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [selectedStake, setSelectedStake] = useState<DisplayStake | null>(null);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [selectedUnstake, setSelectedUnstake] = useState<DisplayStake | null>(null);
  const [showUnstakeDialog, setShowUnstakeDialog] = useState(false);
  const [selectedUnstaking, setSelectedUnstaking] = useState<DisplayUnstaking | null>(null);
  const [showUnstakingDetail, setShowUnstakingDetail] = useState(false);

  // Transform backend positions to display format
  const displayStakes = useMemo<DisplayStake[]>(() => {
    return positions.map((pos) => {
      // Convert amounts from uCNPY to CNPY
      const nativeAmount = fromMicroUnits(pos.staked_amount || "0");
      const cnpyAmount = fromMicroUnits(pos.staked_cnpy || "0");
      const rewardsCNPY = pos.total_rewards
        ? fromMicroUnits(pos.total_rewards)
        : 0;


      return {
        id: `${pos.chain_id}-${pos.address}`,
        chainId: pos.chain_id,
        symbol: pos.chain_symbol,
        chain: pos.chain_name || `Chain ${pos.chain_id}`,
        amount: nativeAmount,
        nativeAmount,
        cnpyAmount,
        apy: 8.5, // TODO: Get APY from rewards/positions data
        rewards: rewardsCNPY,
        rewardsUSD: undefined, // TODO: Calculate USD value
        color: CHAIN_COLORS[pos.chain_id] || "#1dd13a",
        restakeRewards: pos.compound,
        committees: pos.committees.map((committee) => ({
          chainId: committee.chain_id,
          chainName: committee.chain_name
        })),
        status: pos.status,
      };
    });
  }, [positions]);

  // Transform unstaking queue to display format
  const displayUnstaking = useMemo<DisplayUnstaking[]>(() => {
    return unstakingQueue.map((entry) => {
      const completionTimestamp = entry.estimated_completion
        ? Date.parse(entry.estimated_completion)
        : NaN;
      const availableAt = Number.isNaN(completionTimestamp)
        ? Date.now() + Math.max(entry.blocks_remaining, 0) * 1000
        : completionTimestamp;

      const remainingMs = Math.max(availableAt - Date.now(), 0);
      const daysRemaining = Math.floor(remainingMs / 86400000);
      const hoursRemaining = Math.floor((remainingMs % 86400000) / 3600000);

      const nativeAmount = fromMicroUnits(entry.unstaking_amount);
      const cnpyAmount = fromMicroUnits(
        entry.unstaking_cnpy !== undefined ? entry.unstaking_cnpy : entry.unstaking_amount
      );

      return {
        id: `${entry.chain_id}-${entry.address}`,
        chainId: entry.chain_id,
        chain: entry.chain_name || `Chain ${entry.chain_id}`,
        symbol: "CNPY",
        nativeAmount,
        cnpyAmount,
        daysRemaining,
        hoursRemaining,
        status: entry.status,
        availableAt,
        timeRemainingLabel:
          entry.status === "ready"
            ? "Ready to withdraw"
            : entry.time_remaining ||
              formatTimeRemaining(
                Math.max(entry.blocks_remaining, Math.ceil(remainingMs / 1000))
              ),
      };
    });
  }, [unstakingQueue]);

  // Convert total rewards from micro units to display value
  const totalInterestEarned = useMemo(() => {
    return fromMicroUnits(totalRewardsEarned.toString());
  }, [totalRewardsEarned]);

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


      const getValue = (stake: DisplayStake) => {
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
      return sortedStakes.filter((stake) => stake.amount > 0 && stake.status === "active");
    }
    return sortedStakes;
  }, [activeFilter, sortedStakes]);

  const activeCount = useMemo(
    () => displayStakes.filter((stake) => stake.amount > 0 && stake.status === "active").length,
    [displayStakes]
  );

  const renderRestakeBadge = (stake: DisplayStake) => {
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

  const renderActionButtons = (stake: DisplayStake) => {
    const isActive = stake.amount > 0 && stake.status === "active";
    const isUnstaking = stake.status === "unstaking";

    if (isUnstaking) {
      return ( <></>);
    }


    if (isActive) {
      return (
        <div className="flex flex-col items-end gap-1">
          <Button
            size="sm"
            className="h-7 text-xs w-[78px]"
            onClick={() => {
              setSelectedStake(stake);
              setShowManageDialog(true);
            }}
          >
            Add More
          </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs w-[78px]"
          onClick={() => {
              setSelectedUnstake(stake);
              setShowUnstakeDialog(true);
          }}
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
        onClick={() => {
          toast.info("Stake functionality coming soon");
          // TODO: Implement stake
        }}
      >
        Stake
      </Button>
    );
  };

  const handleViewUnstakingDetails = (item: DisplayUnstaking) => {
    setSelectedUnstaking(item);
    setShowUnstakingDetail(true);
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

  if (isError) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            Failed to load staking data
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Please try again later
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Total Interest Earned Card */}
        <Card className="p-1">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="space-y-1">
              <p className="text-lg font-bold">Total rewards earned</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">
                  {formatBalance(totalInterestEarned, 2)} CNPY
                </h3>
              </div>

              <p className="text-sm text-muted-foreground mt-4 max-w-md">
                Earn rewards on your crypto by staking. Rewards are automatically
                transferred based on your settings.
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help inline-block ml-1.5 align-middle" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Annual Percentage Yield (APY) varies by chain and network
                      conditions.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </p>
            </div>
          </div>
        </Card>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`h-9 px-4 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
              activeFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All Stakes
          </button>
          <button
            onClick={() => setActiveFilter("active")}
            className={`h-9 px-4 rounded-full text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0 ${
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
            className={`h-9 px-4 rounded-full text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0 ${
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
              {displayUnstaking.length}
            </span>
          </button>
        </div>

        {/* Stakes Table */}
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
                      <ArrowUpDown className="w-4 h-4 flex-shrink-0" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort("apy")}
                  >
                    <div className="flex items-center gap-2">
                      APY
                      <ArrowUpDown className="w-4 h-4 flex-shrink-0" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort("earnings")}
                  >
                    <div className="flex items-center gap-2">
                      Rewards Earned
                      <ArrowUpDown className="w-4 h-4 flex-shrink-0" />
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
                    const isActive = stake.amount > 0 && stake.status === "active";

                    return (
                      <TableRow key={stake.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
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
                              <div className="mt-1 flex flex-wrap gap-1">
                                <Badge
                                  variant="secondary"
                                  className={`text-[11px] font-medium ${getStatusColor(
                                    stake.status
                                  )}`}
                                >
                                  {getStatusLabel(stake.status)}
                                </Badge>
                              </div>
                              {renderRestakeBadge(stake)}
                              { stake.committees &&
                                stake.committees.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1.5">
                                    <Layers className="w-3 h-3 text-muted-foreground" />
                                    <div className="flex -space-x-1.5">
                                      {stake.committees.slice(0, 5).map((committee) => (
                                        <Tooltip key={committee.chainId}>
                                          <TooltipTrigger asChild>
                                            <div
                                              className="w-5 h-5 rounded-full flex items-center justify-center border-2 border-background"
                                              style={{ backgroundColor: CHAIN_COLORS[committee.chainId] || "#1f2937" }}
                                            >
                                              <span className="text-[8px] font-bold text-white">
                                                {committee.chainId}
                                              </span>
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Staking for {committee.chainName || `Chain ${committee.chainId}`}</p>
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
                          {stake.amount > 0 ? (
                            <div className="space-y-1">
                              <div className="font-medium flex items-center gap-2">
                                {formatBalance(stake.nativeAmount, 2)} {stake.symbol}

                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatBalance(stake.cnpyAmount, 2)} CNPY
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">Not staked</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{stake.apy}%</div>
                        </TableCell>
                        <TableCell>
                          {stake.rewards && stake.rewards > 0 ? (
                            <div>
                              <div className="font-medium">
                                {formatBalance(stake.rewards, 2)} {stake.symbol}
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

        {/* Unstaking Queue */}
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
                {displayUnstaking.length > 0 ? (
                  displayUnstaking.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor:
                                CHAIN_COLORS[item.chainId] || "#1f2937",
                            }}
                          >
                            <span className="text-sm font-bold text-white">
                              {item.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold">{item.chain}</div>
                            <div className="text-sm text-muted-foreground">{item.symbol}</div>
                            <Badge
                              variant="secondary"
                              className={`mt-1 ${getStatusColor(item.status)}`}
                            >
                              {getStatusLabel(item.status)}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatBalance(item.nativeAmount, 2)} {item.symbol}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatBalance(item.cnpyAmount, 2)} CNPY
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {item.status === "ready"
                            ? "Ready to withdraw"
                            : `${item.daysRemaining} days, ${item.hoursRemaining} hours`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timeRemainingLabel}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9"
                          onClick={() => handleViewUnstakingDetails(item)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
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

      <UnstakingDetailSheet
        open={showUnstakingDetail}
        onOpenChange={(open) => {
          setShowUnstakingDetail(open);
          if (!open) {
            setSelectedUnstaking(null);
          }
        }}
        unstakingItem={
          selectedUnstaking
            ? {
                id: Number(selectedUnstaking.id) || 0,
                chain: selectedUnstaking.chain,
                symbol: selectedUnstaking.symbol,
                amount: selectedUnstaking.nativeAmount,
                availableAt: selectedUnstaking.availableAt,
                color: CHAIN_COLORS[selectedUnstaking.chainId] || "#1f2937",
              }
            : undefined
        }
        onCancelUnstake={() => {
          toast.info("Cancel unstake coming soon");
        }}
      />
      <UnstakeDialog
        open={showUnstakeDialog}
        onOpenChange={(open) => {
          setShowUnstakeDialog(open);
          if (!open) {
            setSelectedUnstake(null);
          }
        }}
        position={
          selectedUnstake
            ? ({
                chain_id: selectedUnstake.chainId,
                chain_name: selectedUnstake.chain,
                chain_symbol: selectedUnstake.symbol,
                staked_amount: selectedUnstake.nativeAmount.toString(),
                staked_cnpy: selectedUnstake.cnpyAmount.toString(),
                status: selectedUnstake.status,
                compound: selectedUnstake.restakeRewards,
                committees: selectedUnstake.committees?.map((c) => ({
                  chain_id: c.chainId,
                  chain_name: c.chainName,
                })) || [],
              } as any)
            : null
        }
        onUnstakeSuccess={() => {
          toast.success("Unstake submitted");
        }}
      />
      {/* Manage Stake Dialog */}
      <StakeDialog
        open={showManageDialog}
        onOpenChange={setShowManageDialog}
        initialChainId={selectedStake?.chainId}
        initialCommittees={selectedStake?.committees?.map((committee) => committee.chainId) || []}
        initialStakedAmount={Number(selectedStake?.amount)}
        disallowChainIds={displayStakes
          .filter((s) => s.status !== "unstaking") // allow chains only in unstaking to be restaked
          .map((s) => s.chainId)}

      />
    </TooltipProvider>
  );
}
