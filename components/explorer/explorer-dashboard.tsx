"use client";

import { useState } from "react";
import { Container } from "@/components/layout/container";
import { Spacer } from "@/components/layout/spacer";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NetworkOverview } from "./network-overview";
import { NewLaunches } from "./new-launches";
import { TopValidators } from "./top-validators";
import { RecentTransactions } from "./recent-transactions";
import { RecentBlocks } from "./recent-blocks";
import { TrendingChains } from "./trending-chains";
import { Chain } from "@/types/chains";
import { SearchBar } from "./explorer-search-bar";
import { getSampleTransactions } from "@/lib/demo-data/sample-transactions";

interface Transaction {
  chain_id: number;
  height: number;
  tx_hash: string;
  timestamp: string;
  message_type: string;
  signer: string;
  counterparty: string | null;
  amount: number | null;
  fee: number;
}

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

// Sample network overview data
const networkStats = {
  tvl: randomBetween(40000000, 80000000),
  tvl_change: randomFloat(5, 20, 1),
  volume: randomBetween(5000000, 10000000),
  volume_change: randomFloat(2, 15, 1),
  active_chains: randomBetween(100, 150),
  chains_change: randomBetween(1, 10),
  validators: randomBetween(1000, 1500),
  validators_change: randomFloat(2, 10, 1),
  holders: randomBetween(200000, 300000),
  holders_change: randomFloat(5, 20, 1),
  total_transactions: randomBetween(15000000, 25000000),
  transactions_change: randomFloat(5, 15, 1),
};

const formatMillions = (value: number) =>
  `$${(value / 1_000_000).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}M`;

const overviewMetrics = [
  {
    id: "tvl",
    label: "TVL",
    value: formatMillions(networkStats.tvl),
    delta: `+${networkStats.tvl_change}% last 24h`,
  },
  {
    id: "volume",
    label: "Volume",
    value: `${(networkStats.volume / 1_000_000).toFixed(2)}M`,
    delta: `+${networkStats.volume_change}% last 24h`,
  },
  {
    id: "active_chains",
    label: "Active Chains",
    value: networkStats.active_chains.toLocaleString(),
    delta: `+${networkStats.chains_change} this week`,
  },
  {
    id: "validators",
    label: "Validators",
    value: networkStats.validators.toLocaleString(),
    delta: `+${networkStats.validators_change}% last 24h`,
  },
  {
    id: "holders",
    label: "Holders",
    value: `${(networkStats.holders / 1000).toFixed(1)}K`,
    delta: `+${networkStats.holders_change}% last 24h`,
  },
  {
    id: "transactions",
    label: "Total Transactions",
    value: `${(networkStats.total_transactions / 1_000_000).toFixed(1)}M`,
    delta: `+${networkStats.transactions_change}% last 24h`,
  },
];

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

export function ExplorerDashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-black text-white">
      <Container type="2xl" className="space-y-6">
        {/* Search Bar */}
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

        <NetworkOverview metrics={overviewMetrics} />

        <TrendingChains chains={sampleTrendingChains} />

        {/* Bottom Grid: New Launches, Top Validators, Recent Transactions */}

        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 mb-8 ">
          <NewLaunches chains={sampleNewLaunches} />
          <TopValidators validators={sampleTopValidators} />
        </div>

        <RecentBlocks />

        <RecentTransactions transactions={sampleRecentTransactions} />

        <Spacer height={320} />
      </Container>
    </div>
  );
}
