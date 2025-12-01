/**
 * useStaking Hook
 *
 * Custom hook for managing staking data with React Query.
 * Provides staking positions, rewards, and unstaking queue.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2025-11-28
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stakingApi } from "@/lib/api";
import type {
  StakingPositionsRequest,
  StakingPositionsResponse,
  StakingRewardsRequest,
  StakingRewardsResponse,
  UnstakingQueueRequest,
  UnstakingQueueResponse,
} from "@/types/api";

/**
 * Query key factory for staking queries
 */
export const stakingKeys = {
  all: ["staking"] as const,
  positions: (params?: StakingPositionsRequest) =>
    [...stakingKeys.all, "positions", params] as const,
  rewards: (params?: StakingRewardsRequest) =>
    [...stakingKeys.all, "rewards", params] as const,
  unstaking: (params?: UnstakingQueueRequest) =>
    [...stakingKeys.all, "unstaking", params] as const,
};

/**
 * Hook to get staking positions
 *
 * @param params - Query parameters for filtering positions
 * @param options - React Query options
 * @returns Staking positions query result
 */
export function useStakingPositions(
  params?: StakingPositionsRequest,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: stakingKeys.positions(params),
    queryFn: () => stakingApi.getPositions(params),
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval ?? 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });
}

/**
 * Hook to get staking rewards
 *
 * @param params - Query parameters for filtering rewards
 * @param options - React Query options
 * @returns Staking rewards query result
 */
export function useStakingRewards(
  params?: StakingRewardsRequest,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: stakingKeys.rewards(params),
    queryFn: () => stakingApi.getRewards(params),
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval ?? 30000,
    staleTime: 15000,
  });
}

/**
 * Hook to get unstaking queue
 *
 * @param params - Query parameters for filtering unstaking entries
 * @param options - React Query options
 * @returns Unstaking queue query result
 */
export function useUnstakingQueue(
  params?: UnstakingQueueRequest,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: stakingKeys.unstaking(params),
    queryFn: () => stakingApi.getUnstakingQueue(params),
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval ?? 10000, // Refresh every 10 seconds for countdown
    staleTime: 5000,
  });
}

/**
 * Combined staking hook with all data
 *
 * @param options - Configuration options
 * @returns Combined staking data
 */
export function useStaking(options?: {
  enabled?: boolean;
  chainIds?: string;
  status?: "active" | "paused" | "unstaking";
  refetchInterval?: number;
}) {
  const params: StakingPositionsRequest = {
    chain_ids: options?.chainIds,
    status: options?.status,
  };

  const positions = useStakingPositions(params, {
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
  });

  const rewards = useStakingRewards(
    { chain_ids: options?.chainIds },
    {
      enabled: options?.enabled,
      refetchInterval: options?.refetchInterval,
    }
  );

  const unstaking = useUnstakingQueue(
    { chain_ids: options?.chainIds },
    {
      enabled: options?.enabled,
      refetchInterval: options?.refetchInterval ?? 10000,
    }
  );

  return {
    // Positions data
    positions: positions.data?.positions ?? [],
    positionsMetadata: positions.data?.metadata,
    isLoadingPositions: positions.isLoading,
    positionsError: positions.error,

    // Rewards data
    rewards: rewards.data?.rewards ?? [],
    totalRewards: rewards.data?.total_rewards,
    totalRewardsCNPY: rewards.data?.total_cnpy,
    rewardsMetadata: rewards.data?.metadata,
    isLoadingRewards: rewards.isLoading,
    rewardsError: rewards.error,

    // Unstaking data
    unstakingQueue: unstaking.data?.queue ?? [],
    unstakingMetadata: unstaking.data?.metadata,
    isLoadingUnstaking: unstaking.isLoading,
    unstakingError: unstaking.error,

    // Combined states
    isLoading: positions.isLoading || rewards.isLoading || unstaking.isLoading,
    isError: positions.isError || rewards.isError || unstaking.isError,
    error: positions.error || rewards.error || unstaking.error,

    // Refetch functions
    refetchPositions: positions.refetch,
    refetchRewards: rewards.refetch,
    refetchUnstaking: unstaking.refetch,
    refetchAll: async () => {
      await Promise.all([
        positions.refetch(),
        rewards.refetch(),
        unstaking.refetch(),
      ]);
    },
  };
}

/**
 * Helper hook to get active staking positions only
 *
 * @param chainIds - Optional chain IDs filter
 * @returns Active staking positions
 */
export function useActiveStakes(chainIds?: string) {
  const { positions, isLoadingPositions } = useStaking({
    status: "active",
    chainIds,
  });

  return {
    activeStakes: positions,
    isLoading: isLoadingPositions,
  };
}

/**
 * Helper hook to get total staked amount
 *
 * @param chainIds - Optional chain IDs filter
 * @returns Total staked amount across all positions
 */
export function useTotalStaked(chainIds?: string) {
  const { positions, isLoadingPositions } = useStaking({
    status: "active",
    chainIds,
  });

  const totalStaked = positions.reduce((sum, position) => {
    const amount = parseFloat(position.staked_amount) || 0;
    return sum + amount;
  }, 0);

  return {
    totalStaked: totalStaked.toString(),
    totalStakedCNPY: (totalStaked / 1_000_000).toFixed(2), // Convert uCNPY to CNPY
    isLoading: isLoadingPositions,
  };
}

/**
 * Helper hook to get claimable rewards
 *
 * @param chainIds - Optional chain IDs filter
 * @returns Total claimable rewards
 */
export function useClaimableRewards(chainIds?: string) {
  const { rewards, isLoadingRewards } = useStaking({ chainIds });

  const totalClaimable = rewards.reduce((sum, reward) => {
    const amount = parseFloat(reward.claimable_rewards) || 0;
    return sum + amount;
  }, 0);

  return {
    totalClaimable: totalClaimable.toString(),
    totalClaimableCNPY: (totalClaimable / 1_000_000).toFixed(2),
    rewardsByChain: rewards,
    isLoading: isLoadingRewards,
  };
}

/**
 * Helper hook to check if unstaking is in progress
 *
 * @returns Whether any unstaking is in progress
 */
export function useHasUnstaking() {
  const { unstakingQueue, isLoadingUnstaking } = useStaking();

  return {
    hasUnstaking: unstakingQueue.length > 0,
    unstakingCount: unstakingQueue.length,
    isLoading: isLoadingUnstaking,
  };
}
