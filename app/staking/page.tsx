"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWallet } from "@/components/wallet/wallet-provider";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";
import { useStaking } from "@/lib/hooks/use-staking";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Coins,
  AlertCircle,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { StakingPosition, ValidatorReward } from "@/types/api";

// Types for combined chain data
interface ChainStakeData {
  chain_id: number;
  chain_name: string;
  chain_symbol: string;
  apy: number; // Annual Percentage Yield
  earned_amount: string; // Earned amount in tokens
  earned_usd: string; // USD value
  earned_raw: number; // Raw number for calculations
  staked_cnpy?: string; // Staked amount if user has position
  staked_raw?: number; // Raw staked amount
  status?: string; // active/paused/unstaking
  address?: string; // Validator address if user has position
  has_position: boolean; // Whether user has a staking position
  has_rewards: boolean; // Whether user has earned rewards
  avatar_color: string; // Color for avatar
}

// Sorting types
type SortField = "chain" | "apy" | "earned";
type SortDirection = "asc" | "desc";

// Avatar colors for chains
const AVATAR_COLORS = [
  "bg-purple-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-cyan-500",
];

function StakingContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { currentWallet, connectWallet } = useWallet();
  const [activeTab, setActiveTab] = useState("rewards");

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("apy");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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
    enabled: !!currentWallet,
    address: currentWallet?.address,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate APY based on staked amount and rewards
  const calculateAPY = (
    rewards_cnpy: string,
    staked_cnpy: string,
    time_staked?: string
  ): number => {
    try {
      const rewards = parseFloat(rewards_cnpy.replace(/,/g, ""));
      const staked = parseFloat(staked_cnpy.replace(/,/g, ""));

      if (staked === 0 || !time_staked) {
        // Mock APY for demonstration (8-18% range)
        return 8 + Math.random() * 10;
      }

      const stakedDate = new Date(time_staked);
      const now = new Date();
      const daysStaked = Math.max(
        1,
        (now.getTime() - stakedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const apy = (rewards / staked) * (365 / daysStaked) * 100;

      // Cap APY at reasonable values (0-50%)
      return Math.min(50, Math.max(0, apy));
    } catch {
      // Fallback mock APY
      return 8 + Math.random() * 10;
    }
  };

  // Extract symbol from chain name or use default
  const extractSymbol = (chainName: string): string => {
    // Try to extract symbol from chain name
    const words = chainName.split(" ");
    if (words.length > 1) {
      return words
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 4);
    }
    return chainName.slice(0, 4).toUpperCase();
  };

  // Combine positions and rewards to get all unique chains
  const allChainsData = useMemo<ChainStakeData[]>(() => {
    const chainMap = new Map<number, ChainStakeData>();

    // Add positions
    (positions || []).forEach((pos, index) => {
      const earnedRaw = parseFloat(
        (pos.total_rewards_cnpy || "0").replace(/,/g, "")
      );
      const stakedRaw = parseFloat((pos.staked_cnpy || "0").replace(/,/g, ""));

      chainMap.set(pos.chain_id, {
        chain_id: pos.chain_id,
        chain_name: pos.chain_name || `Chain ${pos.chain_id}`,
        chain_symbol: extractSymbol(pos.chain_name || `Chain ${pos.chain_id}`),
        apy: calculateAPY(
          pos.total_rewards_cnpy || "0",
          pos.staked_cnpy || "0",
          pos.time_staked
        ),
        earned_amount: pos.total_rewards_cnpy || "0",
        earned_usd: "0.00", // TODO: Get from backend
        earned_raw: earnedRaw,
        staked_cnpy: pos.staked_cnpy,
        staked_raw: stakedRaw,
        status: pos.status,
        address: pos.address,
        has_position: true,
        has_rewards: earnedRaw > 0,
        avatar_color: AVATAR_COLORS[index % AVATAR_COLORS.length],
      });
    });

    // Add/update from rewards
    (rewards || []).forEach((reward, index) => {
      const existing = chainMap.get(reward.chain_id);
      const earnedRaw = parseFloat(
        (reward.total_rewards_cnpy || "0").replace(/,/g, "")
      );

      if (existing) {
        // Update earned amount if rewards endpoint has different data
        existing.earned_amount = reward.total_rewards_cnpy || "0";
        existing.earned_raw = earnedRaw;
        existing.has_rewards = earnedRaw > 0;
      } else {
        // Chain with rewards but no position
        chainMap.set(reward.chain_id, {
          chain_id: reward.chain_id,
          chain_name: reward.chain_name || `Chain ${reward.chain_id}`,
          chain_symbol: extractSymbol(
            reward.chain_name || `Chain ${reward.chain_id}`
          ),
          apy: 10 + Math.random() * 8,
          earned_amount: reward.total_rewards_cnpy || "0",
          earned_usd: "0.00",
          earned_raw: earnedRaw,
          has_position: false,
          has_rewards: earnedRaw > 0,
          avatar_color:
            AVATAR_COLORS[(positions?.length || 0 + index) % AVATAR_COLORS.length],
        });
      }
    });

    return Array.from(chainMap.values());
  }, [positions, rewards]);

  // Sort chains data
  const sortedChainsData = useMemo(() => {
    const sorted = [...allChainsData].sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case "chain":
          compareValue = a.chain_name.localeCompare(b.chain_name);
          break;
        case "apy":
          compareValue = a.apy - b.apy;
          break;
        case "earned":
          compareValue = a.earned_raw - b.earned_raw;
          break;
      }

      return sortDirection === "asc" ? compareValue : -compareValue;
    });

    return sorted;
  }, [allChainsData, sortField, sortDirection]);

  // Active stakes (positions with amount > 0)
  const activeStakes = useMemo(() => {
    return (positions || []).filter((p) => {
      const staked = parseFloat((p.staked_cnpy || "0").replace(/,/g, ""));
      return staked > 0;
    });
  }, [positions]);

  // Calculate total earned in USD
  const totalEarnedUSD = useMemo(() => {
    // TODO: Calculate actual USD value from backend
    // For now, mock calculation
    const totalCNPY = parseFloat((totalRewardsCNPY || "0").replace(/,/g, ""));
    const mockUSDPrice = 0.0001; // Mock CNPY price
    return (totalCNPY * mockUSDPrice).toFixed(2);
  }, [totalRewardsCNPY]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // New field, default to descending (highest first)
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  // Handle stake action
  const handleStake = (chainId: number, chainName: string) => {
    toast.info(`Stake dialog for ${chainName} will be implemented soon`);
    // TODO: Open stake dialog
  };

  // Handle claim action
  const handleClaim = (address: string, chainName: string) => {
    toast.info(`Claim dialog for ${chainName} will be implemented soon`);
    // TODO: Open claim dialog
  };

  // If not authenticated, show auth prompt
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md px-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground">
            Please sign in to view and manage your staking positions.
          </p>
          <Button onClick={() => router.push("/login")} size="lg">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // If no wallet connected, show connect prompt
  if (!currentWallet) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md px-4">
          <Coins className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">No Wallet Connected</h2>
          <p className="text-muted-foreground">
            Connect your wallet to view and manage your staking positions across
            all Canopy chains.
          </p>
          <Button onClick={connectWallet} size="lg">
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Total Interest Earned Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm text-muted-foreground mb-2">
                Total interest earned to date
              </h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">${totalEarnedUSD}</span>
                <span className="text-sm text-muted-foreground">USD</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Earn up to 8.05% APY on your crypto. Redeem any time.</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Staking rewards are calculated based on your staked amount
                      and the current APY. You can claim rewards at any time.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <Button variant="outline" size="default">
              View Earned Balances
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border-b border-border rounded-none h-auto p-0 w-full justify-start">
            <TabsTrigger
              value="rewards"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-4 py-3"
            >
              Rewards
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-4 py-3"
            >
              Active Stakes
              {activeStakes.length > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-full">
                  {activeStakes.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="unstaking"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-4 py-3"
            >
              Unstaking Queue
              {unstakingQueue && unstakingQueue.length > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-full">
                  {unstakingQueue.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-4">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Failed to load staking data
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {error?.message || "An error occurred"}
                  </p>
                  <Button onClick={refetchAll} variant="outline">
                    <Loader2 className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </div>
              ) : sortedChainsData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Coins className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No chains available
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    There are no chains available for staking at this time.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-normal">
                        <button
                          onClick={() => handleSort("chain")}
                          className="flex items-center hover:text-foreground transition-colors"
                        >
                          Chain
                          {renderSortIcon("chain")}
                        </button>
                      </TableHead>
                      <TableHead className="text-muted-foreground font-normal">
                        <button
                          onClick={() => handleSort("apy")}
                          className="flex items-center hover:text-foreground transition-colors"
                        >
                          Annual yield
                          {renderSortIcon("apy")}
                        </button>
                      </TableHead>
                      <TableHead className="text-muted-foreground font-normal">
                        <button
                          onClick={() => handleSort("earned")}
                          className="flex items-center hover:text-foreground transition-colors"
                        >
                          Current Earned Balance
                          {renderSortIcon("earned")}
                        </button>
                      </TableHead>
                      <TableHead className="text-right text-muted-foreground font-normal">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedChainsData.map((chain) => (
                      <TableRow
                        key={chain.chain_id}
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full ${chain.avatar_color} flex items-center justify-center flex-shrink-0`}
                            >
                              <span className="text-sm font-bold text-white">
                                {chain.chain_symbol.slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {chain.chain_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {chain.chain_symbol}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="font-medium">
                            {chain.apy.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          {chain.has_rewards ? (
                            <div>
                              <div className="font-medium">
                                {chain.earned_amount} {chain.chain_symbol}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {chain.earned_usd} USD
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Not yet earning
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {chain.has_rewards && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-background hover:bg-muted"
                                onClick={() =>
                                  handleClaim(chain.address!, chain.chain_name)
                                }
                                disabled={chain.earned_raw === 0}
                              >
                                Claim
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-background hover:bg-muted"
                              onClick={() =>
                                handleStake(chain.chain_id, chain.chain_name)
                              }
                            >
                              Stake
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Active Stakes Tab */}
          <TabsContent value="active" className="space-y-4">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : activeStakes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Coins className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active stakes</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md">
                    Start staking CNPY on any Canopy chain to earn rewards and
                    participate in network consensus.
                  </p>
                  <Button onClick={() => setActiveTab("rewards")}>
                    View Available Chains
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-normal">
                        Chain
                      </TableHead>
                      <TableHead className="text-muted-foreground font-normal">
                        Staked Amount
                      </TableHead>
                      <TableHead className="text-muted-foreground font-normal">
                        APY
                      </TableHead>
                      <TableHead className="text-muted-foreground font-normal">
                        Rewards Earned
                      </TableHead>
                      <TableHead className="text-right text-muted-foreground font-normal">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeStakes.map((position, index) => {
                      const apy = calculateAPY(
                        position.total_rewards_cnpy || "0",
                        position.staked_cnpy || "0",
                        position.time_staked
                      );
                      const chainSymbol = extractSymbol(
                        position.chain_name || `Chain ${position.chain_id}`
                      );

                      return (
                        <TableRow
                          key={position.address}
                          className="border-b border-border hover:bg-muted/50"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full ${
                                  AVATAR_COLORS[index % AVATAR_COLORS.length]
                                } flex items-center justify-center flex-shrink-0`}
                              >
                                <span className="text-sm font-bold text-white">
                                  {chainSymbol.slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {position.chain_name ||
                                    `Chain ${position.chain_id}`}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {chainSymbol}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div>
                              <div className="font-medium">
                                {position.staked_cnpy} CNPY
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {/* TODO: USD value */}
                                0.00 USD
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="font-medium">
                              {apy.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <div>
                              <div className="font-medium">
                                {position.total_rewards_cnpy || "0"} CNPY
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {/* TODO: USD value */}
                                0.00 USD
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-background hover:bg-muted"
                            >
                              Unstake
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Unstaking Queue Tab */}
          <TabsContent value="unstaking" className="space-y-4">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !unstakingQueue || unstakingQueue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Coins className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No pending unstakes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    When you unstake, your tokens will appear here during the
                    7-day waiting period.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-normal">
                        Chain
                      </TableHead>
                      <TableHead className="text-muted-foreground font-normal">
                        Amount
                      </TableHead>
                      <TableHead className="text-muted-foreground font-normal">
                        Available In
                      </TableHead>
                      <TableHead className="text-right text-muted-foreground font-normal">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unstakingQueue.map((entry, index) => {
                      const chainSymbol = extractSymbol(
                        entry.chain_name || `Chain ${entry.chain_id}`
                      );

                      return (
                        <TableRow
                          key={index}
                          className="border-b border-border hover:bg-muted/50"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full ${
                                  AVATAR_COLORS[index % AVATAR_COLORS.length]
                                } flex items-center justify-center flex-shrink-0`}
                              >
                                <span className="text-sm font-bold text-white">
                                  {chainSymbol.slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {entry.chain_name || `Chain ${entry.chain_id}`}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {chainSymbol}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="font-medium">
                              {entry.amount_cnpy} CNPY
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            {entry.estimated_completion ? (
                              <div>
                                <div className="font-medium">
                                  ~{entry.blocks_remaining} blocks
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(
                                    entry.estimated_completion
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                Calculating...
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-background hover:bg-muted"
                              >
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="hover:bg-muted"
                              >
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

export default function StakingPage() {
  return <StakingContent />;
}
