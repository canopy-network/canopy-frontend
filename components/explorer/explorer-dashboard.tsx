"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/layout/container";
import { Spacer } from "@/components/layout/spacer";
import { NetworkOverview } from "./network-overview";
import { NewLaunches } from "./new-launches";
import { TopValidators } from "./top-validators";
import { RecentTransactions } from "./recent-transactions";
import { RecentBlocks } from "./recent-blocks";
import { TrendingChains } from "./trending-chains";
import { Chain } from "@/types/chains";
import { SearchBar } from "./explorer-search-bar";
import { getSampleTransactions } from "@/lib/demo-data/sample-transactions";
import {
  getExplorerTransactions,
  type Transaction,
  type ExplorerOverview,
  getExplorerBlocks,
  Block,
} from "@/lib/api/explorer";

interface Validator {
  name: string;
  address: string;
  stake: string;
  apr: string;
  uptime: number;
  uptimeTrend?: number[]; // Array of uptime values for sparkline (7 or 30 data points)
  commissionRate?: number; // Commission rate percentage
  commissionChange?: number; // Change in commission rate (positive = increased, negative = decreased)
  healthScore?: number; // Performance score 0-100
  status?: "healthy" | "warning" | "at_risk"; // Health status
  statusMessage?: string; // Tooltip message
  chains?: string[]; // Array of chain names the validator is staking for
}

interface ChainSummary {
  id: string;
  name: string;
  ticker?: string;
  market_cap: string;
  marketCapRaw?: number; // Raw market cap value in USD for CNPY conversion
  tvl: string;
  tvlRaw?: number; // Raw TVL value in USD for CNPY conversion
  liquidity: string;
  liquidityRaw?: number; // Raw liquidity value in USD for CNPY conversion
  volume_24h: string;
  volume24hRaw?: number; // Raw volume value in USD for CNPY conversion
  change_24h: number;
  validators: number;
  holders: number;
  chartData?: number[]; // 24 data points for the chart
}

// Helper functions for randomization
const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number, decimals = 2) =>
  Number((Math.random() * (max - min) + min).toFixed(decimals));

const randomChainName = () => {
  const prefixes = [
    "DeFi",
    "GameFi",
    "NFT",
    "Social",
    "Infra",
    "Web3",
    "Meta",
    "Crypto",
  ];
  const suffixes = [
    "Chain",
    "Network",
    "Protocol",
    "Labs",
    "DAO",
    "Swap",
    "Bridge",
    "Hub",
  ];
  return `${prefixes[randomBetween(0, prefixes.length - 1)]} ${
    suffixes[randomBetween(0, suffixes.length - 1)]
  }`;
};

const randomTokenSymbol = () => {
  const symbols = [
    "DEFI",
    "GAME",
    "NFT",
    "SOCL",
    "INFRA",
    "WEB3",
    "META",
    "CRYP",
    "TOKEN",
    "COIN",
  ];
  return symbols[randomBetween(0, symbols.length - 1)];
};

const formatMarketCap = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

// Helper function to format metrics from API data
const formatOverviewMetrics = (data: ExplorerOverview | null) => {
  console.log("[formatOverviewMetrics] data", data);

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
      delta: `${data.active_chains_change >= 0 ? "+" : ""}${
        data.active_chains_change
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

// Sample trending chains data
const sampleTrendingChains: ChainSummary[] = Array.from(
  { length: 5 },
  (_, i) => {
    const marketCap = randomBetween(150000, 500000);
    const tvl = randomBetween(30000000, 80000000);
    const liquidity = randomBetween(10000000, 50000000);
    const volume24h = randomBetween(8000000, 20000000);
    const change24h = randomFloat(-5, 25, 1);

    // Generate 24 data points for the chart
    const chartData = Array.from({ length: 24 }, () => Math.random() * 100);

    return {
      id: `chain-${i + 1}`,
      name: randomChainName(),
      ticker: `$${randomTokenSymbol()}`,
      market_cap: formatMarketCap(marketCap),
      marketCapRaw: marketCap,
      tvl: formatMarketCap(tvl),
      tvlRaw: tvl,
      liquidity: formatMarketCap(liquidity),
      liquidityRaw: liquidity,
      volume_24h: formatMarketCap(volume24h),
      volume24hRaw: volume24h,
      change_24h: change24h,
      validators: randomBetween(500, 1200),
      holders: randomBetween(200, 800),
      chartData,
    };
  }
);

// Sample new launches data - using Chain interface structure
const sampleNewLaunches: Chain[] = Array.from({ length: 5 }, (_, i) => {
  const marketCap = randomBetween(30000, 200000);
  const cnpyReserve = randomBetween(25000, 150000);
  const tokenReserve = randomBetween(400000, 800000);
  const currentPrice = randomFloat(0.05, 0.15, 4);
  const priceChange = randomFloat(-10, 30, 1);
  const volume24h = randomBetween(5000, 30000);
  const uniqueTraders = randomBetween(150, 600);
  const totalTransactions = randomBetween(200, 800);
  const launchTime = new Date(
    Date.now() - randomBetween(1, 30) * 24 * 60 * 60 * 1000
  );

  return {
    id: `new-chain-${i + 1}`,
    chain_name: randomChainName(),
    token_symbol: randomTokenSymbol(),
    token_name: `${randomChainName()} Token`,
    chain_description: "A sample blockchain",
    template_id: `template-${randomBetween(1, 5)}`,
    consensus_mechanism: ["PoS", "PoW", "DPoS", "PoA"][randomBetween(0, 3)],
    token_total_supply: randomBetween(500000, 2000000),
    graduation_threshold: randomBetween(50000, 200000),
    creation_fee_cnpy: randomBetween(500, 2000),
    initial_cnpy_reserve: randomBetween(5000, 20000),
    initial_token_supply: randomBetween(300000, 700000),
    bonding_curve_slope: randomFloat(0.3, 0.8, 2),
    actual_launch_time: launchTime.toISOString(),
    creator_initial_purchase_cnpy: randomBetween(2000, 10000),
    status: "virtual_active" as const,
    is_graduated: false,
    graduation_time: null,
    chain_id: null,
    genesis_hash: null,
    validator_min_stake: randomBetween(500, 2000),
    created_by: `user-${randomBetween(1, 50)}`,
    created_at: launchTime.toISOString(),
    updated_at: new Date().toISOString(),
    virtual_pool: {
      id: `pool-${i + 1}`,
      chain_id: `new-chain-${i + 1}`,
      cnpy_reserve: cnpyReserve,
      token_reserve: tokenReserve,
      current_price_cnpy: currentPrice,
      market_cap_usd: marketCap,
      total_volume_cnpy: volume24h * randomBetween(2, 5),
      total_transactions: totalTransactions,
      unique_traders: uniqueTraders,
      is_active: true,
      price_24h_change_percent: priceChange,
      volume_24h_cnpy: volume24h,
      high_24h_cnpy: currentPrice * randomFloat(1.05, 1.2, 4),
      low_24h_cnpy: currentPrice * randomFloat(0.8, 0.95, 4),
      created_at: launchTime.toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
});

// Sample top validators data
const sampleTopValidators: Validator[] = Array.from({ length: 6 }, (_, i) => {
  const stake = randomBetween(200000, 800000);
  const apr = randomFloat(5, 12, 1);
  const uptime = randomFloat(95, 99.99, 2);
  const commissionRate = randomFloat(0, 10, 1);
  const commissionChange = randomFloat(-2, 2, 2);

  // Generate health score and status
  // Status based on healthScore: 100 = healthy, 60-99 = warning, <60 = at_risk
  const healthScore = randomFloat(50, 100, 0);
  let status: "healthy" | "warning" | "at_risk";
  if (healthScore >= 95) {
    status = "healthy";
  } else if (healthScore >= 60) {
    status = "warning";
  } else {
    status = "at_risk";
  }

  // Generate uptime trend data (7 days)
  const baseUptime = uptime;
  const uptimeTrend = Array.from({ length: 7 }, () => {
    const variation = randomFloat(-0.5, 0.5, 2);
    return Math.max(90, Math.min(100, baseUptime + variation));
  });

  // Generate placeholder chain names
  const chainNames = [
    "Ethereum",
    "Polygon",
    "Avalanche",
    "Solana",
    "BNB Chain",
    "Arbitrum",
    "Optimism",
    "Base",
    "Cosmos",
    "Polkadot",
  ];
  const numChains = randomBetween(1, 4); // 1-4 chains per validator
  const chains = chainNames.sort(() => Math.random() - 0.5).slice(0, numChains);

  return {
    name: `val-${String(i + 1).padStart(2, "0")}`,
    address: `0x${Array(40)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("")}`,
    stake: formatMarketCap(stake),
    apr: `${apr}%`,
    uptime: uptime,
    uptimeTrend: uptimeTrend,
    commissionRate: commissionRate,
    commissionChange: commissionChange,
    healthScore: healthScore,
    status: status,
    statusMessage:
      status === "healthy"
        ? "Healthy — no missed blocks in the last 24h"
        : status === "warning"
        ? "Warning — some missed blocks detected"
        : "At risk — multiple missed blocks or slashing detected",
    chains: chains,
  };
});

// Sample recent transactions data - use actual sample transactions so hashes match
const sampleTransactions = getSampleTransactions();
const sampleRecentTransactions: Transaction[] = sampleTransactions
  .slice(0, 5)
  .map((tx) => ({
    chain_id: 0, // Using 0 as default since we don't have chain_id in sample data
    height: tx.blockHeight,
    tx_hash: tx.hash, // Use the actual hash from sample transactions
    timestamp: tx.timestamp,
    message_type: tx.method.toLowerCase(),
    signer: tx.from,
    counterparty: tx.to,
    amount: tx.amountCnpy,
    fee: tx.transactionFeeCnpy,
  }));

interface ExplorerDashboardProps {
  overviewData?: ExplorerOverview | null;
}

export function ExplorerDashboard({ overviewData }: ExplorerDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );

  const [recentBlocks, setRecentBlocks] = useState<Block[]>([]);

  const [isLoadingBlocks, toggleIsLoadingBlocks] = useState(false);
  // Format metrics from API data or use fallback
  const overviewMetrics = formatOverviewMetrics(overviewData || null);

  // Fetch transactions from API
  async function fetchBlocks() {
    try {
      toggleIsLoadingBlocks(true);
      const apiBlocks = await getExplorerBlocks({
        limit: 10,
      });

      console.log("[fetchBlocks] apiBlocks", apiBlocks);
      setRecentBlocks(apiBlocks);
      toggleIsLoadingBlocks(false);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  }

  async function fetchTransactions() {
    try {
      const apiTransactions = await getExplorerTransactions({
        limit: 5,
        sort: "desc",
      });
      setRecentTransactions(apiTransactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      // Fallback to sample data on error
    }
  }

  useEffect(() => {
    fetchTransactions();
    fetchBlocks();
  }, []);

  return (
    <>
      <Container
        tag="section"
        type="2xl"
        className="bg-background sticky top-0 lg:py-2 z-99 mb-4 lg:mb-0"
      >
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          chains={[
            ...sampleTrendingChains.map((c) => ({ id: c.id, name: c.name })),
            ...sampleNewLaunches.map((c) => ({
              id: c.id,
              name: c.chain_name,
            })),
          ]}
        />
      </Container>
      <Container tag="section" type="2xl" className="space-y-4 lg:space-y-6">
        {/* Search Bar */}

        <NetworkOverview
          metrics={overviewMetrics}
          historicData={{
            tvl: Array.from({ length: 48 }, (_, i) => ({
              time: Math.floor(Date.now() / 1000) - (48 - i) * 30 * 60,
              value: overviewData?.tvl
                ? overviewData.tvl * (0.95 + Math.random() * 0.1)
                : 45_000_000 + Math.random() * 1_500_000,
            })),
            volume: Array.from({ length: 48 }, (_, i) => ({
              time: Math.floor(Date.now() / 1000) - (48 - i) * 30 * 60,
              value: overviewData?.volume_24h
                ? overviewData.volume_24h * (0.95 + Math.random() * 0.1)
                : 8_500_000 + Math.random() * 600_000,
            })),
          }}
        />

        <TrendingChains chains={sampleTrendingChains} />

        {/* Bottom Grid: New Launches, Top Validators, Recent Transactions */}

        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 lg:mb-8 ">
          <NewLaunches chains={sampleNewLaunches} />
          <TopValidators validators={sampleTopValidators} />
        </div>

        <RecentBlocks
          blocks={recentBlocks}
          isLoading={isLoadingBlocks}
          error={null}
        />

        <RecentTransactions
          transactions={recentTransactions.length > 0 ? recentTransactions : []}
        />

        <Spacer height={320} />
      </Container>
    </>
  );
}
