"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, TrendingUp, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useStaking } from "@/lib/hooks/use-staking";
import { formatTokenAmount, withCommas } from "@/lib/utils/denomination";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface StakingTabProps {
  addresses: string[];
}

// Get color for chain icon based on chain ID
function getChainColor(chainId: number): string {
  const colors = [
    "bg-purple-500",
    "bg-orange-500",
    "bg-green-500",
    "bg-pink-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-red-500",
  ];
  return colors[chainId % colors.length];
}

// Format uCNPY to CNPY with commas
function formatCNPY(uCNPY: string): string {
  const cnpy = parseFloat(uCNPY) / 1_000_000;
  return withCommas(cnpy);
}

export function StakingTab({ addresses }: StakingTabProps) {
  const [activeSubTab, setActiveSubTab] = useState("rewards");

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
    address: addresses[0], // Filter by first address (selected wallet)
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate stats
  const activeStakesCount = positions.filter((p) => p.status === "active").length;
  const unstakingQueueCount = unstakingQueue.length;

  // Calculate total interest earned (from rewards)
  const totalInterestEarned = rewards.reduce((sum, reward) => {
    const usd = parseFloat(reward.claimable_rewards) / 1_000_000 * 0.1; // Mock USD conversion
    return sum + usd;
  }, 0);

  const handleClaim = (rewardAddress: string) => {
    toast.info("Claim functionality will be implemented soon");
    // TODO: Implement claim transaction
  };

  const handleStake = (chainId: number) => {
    toast.info("Stake functionality will be implemented soon");
    // TODO: Open stake dialog
  };

  const handleUnstake = (validatorAddress: string) => {
    toast.info("Unstake functionality will be implemented soon");
    // TODO: Open unstake dialog
  };

  const handleCancelUnstake = (address: string) => {
    toast.info("Cancel unstake functionality will be implemented soon");
    // TODO: Implement cancel unstake transaction
  };

  // Loading state
  if (isLoading && addresses.length > 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-12" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
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
          <Button
            onClick={() => refetchAll()}
            variant="outline"
            size="sm"
          >
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
          <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
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
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-2 px-2">
          <CardHeader className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Interest Earned</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs max-w-[200px]">
                    Total rewards earned from all staking positions
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">
              {/*TODO: SHOULD RETURNED FROM THE BACKEND AS MICRO*/}
              ${totalInterestEarned.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {totalRewardsCNPY ? `${totalRewardsCNPY} CNPY` : "0 CNPY"}
            </p>
          </CardHeader>
        </Card>

        <Card className="p-2 px-2">
          <CardHeader className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-muted-foreground">Active Stakes</p>
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{activeStakesCount}</p>
            <p className="text-xs text-muted-foreground">Currently staking</p>
          </CardHeader>
        </Card>

        <Card className="p-2 px-2">
          <CardHeader className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-muted-foreground">Unstaking Queue</p>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{unstakingQueueCount}</p>
            <p className="text-xs text-muted-foreground">Pending withdrawal</p>
          </CardHeader>
        </Card>
      </div>

      {/* Sub Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-muted/50">
          <TabsTrigger
            value="rewards"
            className="text-xs sm:text-sm data-[state=active]:bg-background"
          >
            Rewards
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="text-xs sm:text-sm data-[state=active]:bg-background"
          >
            Active Stakes
          </TabsTrigger>
          <TabsTrigger
            value="unstaking"
            className="text-xs sm:text-sm data-[state=active]:bg-background"
          >
            Unstaking
          </TabsTrigger>
        </TabsList>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="mt-4">
          {rewards.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 px-4">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mb-2">No staking rewards yet</p>
                <p className="text-xs text-muted-foreground">
                  Start staking to earn rewards
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {rewards.map((reward) => (
                <Card key={`${reward.chain_id}-${reward.address}`} className="p-2 px-2">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getChainColor(reward.chain_id)} flex items-center justify-center shrink-0`}>
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {reward.chain_name?.slice(0, 2) || 'CH'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base truncate">
                            {reward.chain_name || `Chain ${reward.chain_id}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {reward.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {reward.reward_count} rewards
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm sm:text-base text-green-500">
                          +{reward.claimable_cnpy}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total: {reward.total_rewards_cnpy}
                        </p>
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() => handleClaim(reward.address)}
                          disabled={parseFloat(reward.claimable_rewards) === 0}
                        >
                          Claim
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Active Stakes Tab */}
        <TabsContent value="active" className="mt-4">
          {positions.filter((p) => p.status === "active").length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 px-4">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mb-2">No active stakes</p>
                <p className="text-xs text-muted-foreground">
                  Stake your tokens to start earning rewards
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {positions
                .filter((p) => p.status === "active")
                .map((position) => (
                  <Card key={`${position.chain_id}-${position.address}`} className="p-2 px-2">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getChainColor(position.chain_id)} flex items-center justify-center shrink-0`}>
                            <span className="text-xs sm:text-sm font-bold text-white">
                              {position.chain_name?.slice(0, 2) || 'CH'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">
                              {position.chain_name || `Chain ${position.chain_id}`}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500">
                                Active
                              </Badge>
                              {position.delegate && (
                                <Badge variant="outline" className="text-xs">
                                  Delegating
                                </Badge>
                              )}
                              {position.compound && (
                                <Badge variant="outline" className="text-xs">
                                  Auto-compound
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-sm sm:text-base">
                            {position.staked_cnpy} CNPY
                          </p>
                          {position.total_rewards_cnpy && (
                            <p className="text-xs text-green-500">
                              +{position.total_rewards_cnpy} rewards
                            </p>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => handleUnstake(position.address)}
                          >
                            Unstake
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        {/* Unstaking Tab */}
        <TabsContent value="unstaking" className="mt-4">
          {unstakingQueue.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 px-4">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mb-2">No unstaking in progress</p>
                <p className="text-xs text-muted-foreground">
                  Unstaked tokens will appear here during the waiting period
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {unstakingQueue.map((entry) => (
                <Card key={`${entry.chain_id}-${entry.address}`} className="p-2 px-2">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getChainColor(entry.chain_id)} flex items-center justify-center shrink-0`}>
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {entry.chain_name?.slice(0, 2) || 'CH'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base truncate">
                            {entry.chain_name || `Chain ${entry.chain_id}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-500">
                              {entry.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {entry.time_remaining}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Available: {new Date(entry.estimated_completion).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm sm:text-base">
                          {entry.unstaking_cnpy} CNPY
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.blocks_remaining} blocks left
                        </p>
                        {entry.status === "unstaking" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => handleCancelUnstake(entry.address)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
