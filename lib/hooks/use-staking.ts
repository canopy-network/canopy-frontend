"use client";

import { useState, useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { stakingApi } from "@/lib/api";
import type { StakingPosition } from "@/types/api";

type PositionStatus = "active" | "paused" | "unstaking";
type UnstakingStatus = "unstaking" | "ready";

// Helper to group positions by staking chain
export function groupPositionsByStake(positions: StakingPosition[]) {
  // Group by address + chain_id where the stake was made
  const grouped = positions.reduce((acc, position) => {
    const key = `${position.address}-${position.chain_id}`;
    if (!acc[key]) {
      acc[key] = position;
    }
    return acc;
  }, {} as Record<string, StakingPosition>);

  return Object.values(grouped);
}

// Helper to check if position has multi-chain committees
export function hasMultiChainCommittees(position: StakingPosition): boolean {
  return (position.committees?.length ?? 0) > 1;
}

export function useStaking(address?: string) {
  // State for filtering positions
  const [positionStatus, setPositionStatus] = useState<PositionStatus | undefined>(undefined);

  // State for filtering unstaking queue
  const [unstakingStatus, setUnstakingStatus] = useState<UnstakingStatus | undefined>(undefined);

  // Single query for positions with dynamic status filter
  const positionsQuery = useInfiniteQuery({
    queryKey: ["staking", "positions", address, positionStatus],
    queryFn: ({ pageParam }) =>
      stakingApi.getPositions({
        address,
        status: positionStatus,
        limit: 20,
        offset: pageParam
      }),
    enabled: !!address,
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.metadata.has_more
        ? lastPage.metadata.offset + lastPage.metadata.limit
        : undefined,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Query for rewards
  const rewardsQuery = useQuery({
    queryKey: ["staking", "rewards", address],
    queryFn: () =>
      stakingApi.getRewards({
        address,
        limit: 100
      }),
    enabled: !!address,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Single query for unstaking queue with dynamic status filter
  const unstakingQuery = useQuery({
    queryKey: ["staking", "unstaking", address, unstakingStatus],
    queryFn: () =>
      stakingApi.getUnstakingQueue({
        address,
        status: unstakingStatus,
        limit: 100
      }),
    enabled: !!address,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Flatten positions from all pages
  const allPositions = useMemo(() => {
    return positionsQuery.data?.pages.flatMap(page => page.positions) ?? [];
  }, [positionsQuery.data]);

  // Group positions by staking chain to avoid duplicates
  const positions = useMemo(() => {
    return groupPositionsByStake(allPositions);
  }, [allPositions]);

  // Get metadata from first page
  const metadata = useMemo(() => {
    return positionsQuery.data?.pages[0]?.metadata;
  }, [positionsQuery.data]);

  // Rewards list for APY calculations
  const rewardsList = rewardsQuery.data?.rewards ?? [];

  // Build chain-level APY map (weighted by staked amount when available)
  const { apyByChain, blendedAPY } = useMemo(() => {
    const chainAgg = new Map<number, { weighted: number; stake: number; count: number }>();
    rewardsList.forEach((reward) => {
      const chainId = Number(reward.chain_id);
      const apy = Number(reward.staking_apy);
      if (!Number.isFinite(chainId) || !Number.isFinite(apy)) return;
      const stake = parseFloat(reward.staked_amount || "0");
      const weight = Number.isFinite(stake) && stake > 0 ? stake : 1;
      const entry = chainAgg.get(chainId) || { weighted: 0, stake: 0, count: 0 };
      entry.weighted += apy * weight;
      entry.stake += weight;
      entry.count += 1;
      chainAgg.set(chainId, entry);
    });

    const record: Record<number, number> = {};
    let totalWeighted = 0;
    let totalStake = 0;
    chainAgg.forEach((entry, chainId) => {
      const denom = entry.stake > 0 ? entry.stake : entry.count || 1;
      const avg = entry.weighted / denom;
      record[chainId] = Number.isFinite(avg) ? avg : 0;
      totalWeighted += entry.weighted;
      totalStake += denom;
    });

    const blendedFromApi = rewardsQuery.data?.blended_apy;
    const blendedFallback =
      totalStake > 0 && Number.isFinite(totalWeighted / totalStake)
        ? totalWeighted / totalStake
        : undefined;

    return {
      apyByChain: record,
      blendedAPY: blendedFromApi ?? blendedFallback,
    };
  }, [rewardsList, rewardsQuery.data?.blended_apy]);

  // Calculate total staked across all positions
  const totalStaked = useMemo(() => {
    return positions.reduce((sum, position) => {
      return sum + parseFloat(position.staked_amount || "0");
    }, 0);
  }, [positions]);

  // Get total rewards from API response (in micro units)
  const totalRewardsEarned = useMemo(() => {
    const fromRewardsEndpoint = rewardsQuery.data?.total_rewards;
    if (fromRewardsEndpoint) {
      const parsed = parseFloat(fromRewardsEndpoint);
      if (Number.isFinite(parsed)) return parsed;
    }
    return positions.reduce((sum, position) => {
      return sum + parseFloat(position.total_rewards || "0");
    }, 0);
  }, [positions, rewardsQuery.data?.total_rewards]);

  // Calculate total claimable rewards from rewards API
  const totalClaimableRewards = useMemo(() => {
    return rewardsQuery.data?.rewards.reduce((sum, reward) => {
      return sum + parseFloat(reward.claimable_rewards || "0");
    }, 0) ?? 0;
  }, [rewardsQuery.data]);

  // Get unstaking queue entries
  const unstakingQueue = unstakingQuery.data?.queue ?? [];

  // Calculate total amount in unstaking
  const totalUnstaking = useMemo(() => {
    return unstakingQueue.reduce((sum, entry) => {
      return sum + parseFloat(entry.unstaking_amount || "0");
    }, 0);
  }, [unstakingQueue]);

  return {
    // Positions
    positions,
    allPositions,
    positionsQuery,
    positionStatus,
    setPositionStatus,

    // Rewards
    rewards: rewardsList,
    rewardsQuery,
    totalRewardsEarned,
    totalClaimableRewards,
    apyByChain,
    blendedAPY,

    // Unstaking
    unstakingQueue,
    unstakingQuery,
    unstakingStatus,
    setUnstakingStatus,
    totalUnstaking,

    // Totals
    totalStaked,

    // Metadata
    metadata,
    chainStats: metadata?.chain_stats ?? [],

    // Counts from backend metadata
    totalPositions: metadata?.total ?? 0,

    // Loading states
    isLoading: positionsQuery.isLoading || rewardsQuery.isLoading || unstakingQuery.isLoading,
    isError: positionsQuery.isError || rewardsQuery.isError || unstakingQuery.isError,

    // Infinite scroll
    hasNextPage: positionsQuery.hasNextPage,
    fetchNextPage: positionsQuery.fetchNextPage,
    isFetchingNextPage: positionsQuery.isFetchingNextPage,

    // Helper functions
    hasMultiChainCommittees,
  };
}
