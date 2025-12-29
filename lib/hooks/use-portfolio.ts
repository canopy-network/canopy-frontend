/**
 * usePortfolio Hook
 *
 * Custom hook for managing portfolio data with React Query.
 * Provides real-time portfolio overview, balances, performance, and allocation.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2025-11-28
 */

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { portfolioApi } from "@/lib/api";
import type {
  PortfolioOverviewRequest,
  AccountBalancesRequest,
  PortfolioPerformanceRequest,
} from "@/types/api";

/**
 * Query key factory for portfolio queries
 */
export const portfolioKeys = {
  all: ["portfolio"] as const,
  overview: (addresses: string[]) => [...portfolioKeys.all, "overview", addresses] as const,
  balances: (addresses: string[], chainIds?: number[]) =>
    [...portfolioKeys.all, "balances", addresses, chainIds] as const,
  performance: (addresses: string[], period: string) =>
    [...portfolioKeys.all, "performance", addresses, period] as const,
  allocation: (addresses: string[]) => [...portfolioKeys.all, "allocation", addresses] as const,
};

/**
 * Hook to get portfolio overview
 *
 * @param addresses - Array of wallet addresses to include
 * @param options - React Query options
 * @returns Portfolio overview query result
 */
export function usePortfolioOverview(
  addresses: string[],
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  // Sort addresses to ensure stable query key (same addresses in different order = same cache)
  const sortedAddresses = useMemo(() => [...addresses].sort(), [addresses]);

  return useQuery({
    queryKey: portfolioKeys.overview(sortedAddresses),
    queryFn: async () => {
      const request: PortfolioOverviewRequest = {
        addresses: sortedAddresses,
        include_watch_only: false,
      };
      return portfolioApi.getPortfolioOverview(request);
    },
    enabled: options?.enabled !== false && sortedAddresses.length > 0,
    refetchInterval: options?.refetchInterval ?? undefined, // Disable auto-refetch by default
    staleTime: 60000, // Consider data stale after 1 minute (increased from 30s)
    gcTime: 300000, // Keep in cache for 5 minutes
  });
}

/**
 * Hook to get detailed account balances
 *
 * @param addresses - Array of wallet addresses
 * @param chainIds - Optional array of chain IDs to filter
 * @param options - React Query options
 * @returns Account balances query result
 */
export function useAccountBalances(
  addresses: string[],
  chainIds?: number[],
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: portfolioKeys.balances(addresses, chainIds),
    queryFn: async () => {
      const request: AccountBalancesRequest = {
        addresses,
        chain_ids: chainIds,
      };
      return portfolioApi.getAccountBalances(request);
    },
    enabled: options?.enabled !== false && addresses.length > 0,
    refetchInterval: options?.refetchInterval ?? 60000,
    staleTime: 30000,
  });
}

/**
 * Hook to get portfolio performance over time
 *
 * @param addresses - Array of wallet addresses
 * @param period - Time period for performance data
 * @param granularity - Data point granularity
 * @param options - React Query options
 * @returns Portfolio performance query result
 */
export function usePortfolioPerformance(
  addresses: string[],
  period: "24h" | "7d" | "30d" | "90d" | "1y" | "all" = "7d",
  granularity: "hourly" | "daily" | "weekly" | "monthly" = "daily",
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: portfolioKeys.performance(addresses, period),
    queryFn: async () => {
      const request: PortfolioPerformanceRequest = {
        addresses,
        period,
        granularity,
      };
      return portfolioApi.getPortfolioPerformance(request);
    },
    enabled: options?.enabled !== false && addresses.length > 0,
    staleTime: period === "24h" ? 60000 : 300000, // 1 min for 24h, 5 min for longer periods
  });
}

/**
 * Combined portfolio hook with all data
 *
 * @param addresses - Array of wallet addresses
 * @param options - Configuration options
 * @returns Combined portfolio data
 */
export function usePortfolio(
  addresses: string[],
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    performancePeriod?: "24h" | "7d" | "30d" | "90d" | "1y" | "all";
    chainIds?: number[];
  }
) {
  const enabled = options?.enabled !== false && addresses.length > 0;

  const overview = usePortfolioOverview(addresses, {
    enabled,
    refetchInterval: options?.refetchInterval,
  });

  const balances = useAccountBalances(addresses, options?.chainIds, {
    enabled,
    refetchInterval: options?.refetchInterval,
  });

  const performance = usePortfolioPerformance(addresses, options?.performancePeriod ?? "7d", "daily", { enabled });

  return {
    // Overview data
    overview: overview.data,
    isLoadingOverview: overview.isLoading,
    overviewError: overview.error,

    // Balances data
    balances: balances.data,
    isLoadingBalances: balances.isLoading,
    balancesError: balances.error,

    // Performance data
    performance: performance.data,
    isLoadingPerformance: performance.isLoading,
    performanceError: performance.error,

    // Combined states
    isLoading: overview.isLoading || balances.isLoading || performance.isLoading,
    isError: overview.isError || balances.isError || performance.isError,
    error: overview.error || balances.error || performance.error,

    // Refetch functions
    refetchOverview: overview.refetch,
    refetchBalances: balances.refetch,
    refetchPerformance: performance.refetch,
    refetchAll: async () => {
      await Promise.all([overview.refetch(), balances.refetch(), performance.refetch()]);
    },
  };
}

/**
 * Helper hook to get total portfolio value
 *
 * @param addresses - Array of wallet addresses
 * @returns Total portfolio value in CNPY and USD
 */
export function usePortfolioValue(addresses: string[]) {
  const { overview, isLoadingOverview } = usePortfolio(addresses);

  return {
    totalValueCNPY: overview?.total_value_cnpy,
    totalValueUSD: overview?.total_value_usd,
    change24h: overview?.performance?.total_pnl_percentage,
    isLoading: isLoadingOverview,
  };
}

/**
 * Helper hook to get portfolio allocation breakdown
 *
 * @param addresses - Array of wallet addresses
 * @returns Portfolio allocation by chain and type
 */
export function usePortfolioAllocation(addresses: string[]) {
  const { overview, isLoadingOverview } = usePortfolio(addresses);

  return {
    byChain: overview?.allocation?.by_chain,
    byType: overview?.allocation?.by_type,
    isLoading: isLoadingOverview,
  };
}
