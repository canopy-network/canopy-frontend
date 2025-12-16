"use client";

import { useState, useMemo, useEffect } from "react";
import { Container } from "@/components/layout/container";
import { Spacer } from "@/components/layout/spacer";
import { NetworkOverview } from "./network-overview";
import { NewLaunches } from "./new-launches";
import { TopValidators } from "./top-validators";
import { RecentTransactions } from "./recent-transactions";
import { RecentBlocks } from "./recent-blocks";
import { TrendingChains, type ChainSummary } from "./trending-chains";
import { Chain } from "@/types/chains";
import { ExplorerSearchBar } from "./explorer-search-bar";
import {
  useExplorerTransactions,
  useExplorerBlocks,
  useExplorerTrendingChains,
  useExplorerOverview,
  type ExplorerOverview,
  type ExplorerTrendingChain,
} from "@/lib/api/explorer";
import { getGraduatedChains, getAllGraduatedChains } from "@/lib/api/chains";
import { useValidators, type ValidatorData } from "@/lib/api/validators";

interface Validator {
  name: string;
  address: string;
  stake?: string;
  apr?: string;
  apy?: number;
  votingPower?: number;
  uptime: number;
  uptimeTrend?: number[]; // Array of uptime values for sparkline (7 or 30 data points)
  healthScore?: number; // Performance score 0-100
  status?: "healthy" | "warning" | "at_risk"; // Health status
  statusMessage?: string; // Tooltip message
  chains?: string[]; // Array of chain names the validator is staking for
  originalStatus?: string;
}


// Helper function to format metrics from API data
const formatOverviewMetrics = (data: ExplorerOverview | null) => {
  // Return empty array if no data - component will handle empty state
  if (!data) {
    return [];
  }

  // Format real API data
  const formatNumber = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const formatDelta = (change: number, suffix: string = " last 24h") => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change}%${suffix}`;
  };

  return [
    {
      id: "tvl",
      label: "TVL",
      value: data.tvl_formatted || formatNumber(data.tvl),
      delta: formatDelta(data.tvl_change_24h),
    },
    {
      id: "volume",
      label: "Volume",
      value: data.volume_24h_formatted || formatNumber(data.volume_24h),
      delta: formatDelta(data.volume_change_24h),
    },
    {
      id: "active_chains",
      label: "Active Chains",
      value: data.active_chains.toLocaleString(),
      delta: `${data.active_chains_change >= 0 ? "+" : ""}${data.active_chains_change
        } this week`,
    },
    {
      id: "validators",
      label: "Validators",
      value: data.total_validators.toLocaleString(),
      delta: formatDelta(data.total_validators_change),
    },
    {
      id: "holders",
      label: "Holders",
      value: formatNumber(data.total_holders),
      delta: formatDelta(data.total_holders_change),
    },
    {
      id: "transactions",
      label: "Total Transactions",
      value: formatNumber(data.total_transactions),
      delta: formatDelta(data.total_transactions_change),
    },
  ];
};


const formatTrendingValue = (value?: number | null) => {
  if (value === undefined || value === null) return "-";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
};

const mapTrendingChainsToSummary = (
  chains: ExplorerTrendingChain[]
): ChainSummary[] =>
  chains.map((chain) => ({
    id: chain.chain_id ? chain.chain_id.toString() : `rank-${chain.rank}`,
    chainId: chain.chain_id,
    name: chain.chain_name || "Unknown Chain",
    rank: chain.rank,
    market_cap: formatTrendingValue(chain.market_cap),
    marketCapRaw: chain.market_cap,
    tvl: formatTrendingValue(chain.tvl),
    tvlRaw: chain.tvl,
    liquidity: formatTrendingValue(chain.liquidity ?? chain.tvl),
    liquidityRaw: chain.liquidity ?? chain.tvl,
    volume_24h: formatTrendingValue(chain.volume_24h),
    volume24hRaw: chain.volume_24h,
    change_24h: chain.change_24h ?? 0,
    validators: chain.validators ?? 0,
    holders: chain.holders ?? 0,
  }));

interface ExplorerDashboardProps {
  overviewData?: ExplorerOverview | null;
}

export function ExplorerDashboard({ overviewData: initialOverviewData }: ExplorerDashboardProps) {
  const [newChains, setNewChains] = useState<Chain[]>([]);

  // Use React Query hooks with auto-refetch every 10 seconds
  const {
    data: recentTransactions = [],
    isLoading: isLoadingTransactions,
  } = useExplorerTransactions(
    { limit: 5, sort: "desc" },
    { refetchInterval: 10000 } // Refetch every 10 seconds
  );

  const {
    data: recentBlocks = [],
    isLoading: isLoadingBlocks,
  } = useExplorerBlocks(
    { limit: 10 },
    { refetchInterval: 10000 } // Refetch every 10 seconds
  );

  const {
    data: trendingChainsData = [],
    isLoading: isLoadingTrending,
  } = useExplorerTrendingChains(
    { limit: 10 },
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  const {
    data: overviewData,
    isLoading: isLoadingOverview,
  } = useExplorerOverview({
    refetchInterval: 30000, // Refetch every 30 seconds
    initialData: initialOverviewData || undefined, // Use SSR data as initial
  });

  const {
    data: validatorsResponse,
  } = useValidators(
    { status: "active", limit: 9 },
    { refetchInterval: 10000 } // Refetch every 10 seconds
  );

  // Format metrics from API data
  const overviewMetrics = formatOverviewMetrics(overviewData || null);

  // Map trending chains to summary format - only use real data
  const trendingChains = useMemo(() => {
    return mapTrendingChainsToSummary(trendingChainsData);
  }, [trendingChainsData]);

  // Transform validators data
  const topValidators = useMemo<Validator[]>(() => {
    if (!validatorsResponse?.validators) return [];

    return validatorsResponse.validators.map((validator: ValidatorData) => {
      const votingPower = parseFloat(validator.voting_power);
      const apy = validator.apy ?? 0;
      const uptime = Number(validator.uptime ?? 0);
      const shortAddress = `${validator.address.slice(0, 6)}...${validator.address.slice(-6)}`;

      const statusMap: Record<
        ValidatorData["status"],
        "healthy" | "warning" | "at_risk"
      > = {
        active: "healthy",
        unstaking: "warning",
        paused: "at_risk",
      };

      const status = statusMap[validator.status] ?? "at_risk";

      return {
        name: shortAddress,
        address: validator.address,
        apy,
        votingPower,
        uptime,
        status,
        originalStatus: validator.status,
        healthScore: undefined,
        commissionRate: validator.delegate ? 10 : 5,
        chains: validator.committees
          ? validator.committees.map((id) => `Chain ${id}`)
          : [validator.chain_name],
      };
    });
  }, [validatorsResponse]);

  // Fetch new chains (graduated chains) - this uses chains API, not explorer API
  // Keep this as async function since there's no React Query hook for it yet
  useEffect(() => {
    async function fetchNewChains() {
      try {
        // Fast path: single page fetch
        const graduatedChainsResponse = await getGraduatedChains({
          include: "virtual_pool,graduated_pool",
          limit: 8,
        });

        let graduatedChains =
          (graduatedChainsResponse as any)?.data || graduatedChainsResponse || [];

        if (
          graduatedChains &&
          typeof graduatedChains === "object" &&
          Array.isArray((graduatedChains as any).data)
        ) {
          graduatedChains = (graduatedChains as any).data;
        }

        // Fallback to all pages if first fetch returns nothing
        if (!Array.isArray(graduatedChains) || graduatedChains.length === 0) {
          const allGraduated = await getAllGraduatedChains({
            include: "virtual_pool,graduated_pool",
            limit: 50,
          });

          graduatedChains =
            (allGraduated as any)?.data || allGraduated || graduatedChains;
          if (
            graduatedChains &&
            typeof graduatedChains === "object" &&
            Array.isArray((graduatedChains as any).data)
          ) {
            graduatedChains = (graduatedChains as any).data;
          }
        }

        if (graduatedChains.length === 0) {
          setNewChains([]);
          return;
        }

        const withGraduation = graduatedChains
          .filter((chain: { graduation_time: any; }) => chain.graduation_time)
          .sort(
            (a: { graduation_time: any; }, b: { graduation_time: any; }) =>
              new Date(b.graduation_time || 0).getTime() -
              new Date(a.graduation_time || 0).getTime()
          );

        const withoutGraduation = graduatedChains.filter(
          (chain: { graduation_time: any; }) => !chain.graduation_time
        );

        const ordered = [...withGraduation, ...withoutGraduation];
        setNewChains(ordered.slice(0, 8));
      } catch (error) {
        console.error("Failed to fetch new chains:", error);
        setNewChains([]);
      }
    }

    fetchNewChains();
  }, []);

  return (
    <>
      <Container
        tag="section"
        type="2xl"
        className="bg-background sticky top-0 lg:py-2 z-99 mb-4 lg:mb-0"
      >
        <ExplorerSearchBar />
      </Container>
      <Container tag="section" type="2xl" className="space-y-4 lg:space-y-6">
        {/* Search Bar */}

        <NetworkOverview
          metrics={overviewMetrics}
          historicData={undefined}
        />

        <TrendingChains chains={trendingChains} />

        {/* Bottom Grid: New Launches, Top Validators */}
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 lg:mb-8 ">
          <NewLaunches chains={newChains} />
          <TopValidators validators={topValidators} />
        </div>

        <RecentBlocks
          blocks={recentBlocks}
          isLoading={isLoadingBlocks}
          error={null}
        />

        <RecentTransactions
          transactions={recentTransactions}
        />

        <Spacer height={320} />
      </Container>
    </>
  );
}
