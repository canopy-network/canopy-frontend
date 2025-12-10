export interface MockAsset {
  id: number;
  chainId: number;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  color: string;
}

export interface MockCommittee {
  chainId: number;
  symbol: string;
  chain: string;
  color: string;
  rewards?: number;
  rewardsUSD?: number;
}

export interface MockAvailableChain {
  chainId: number;
  symbol: string;
  chain: string;
  color: string;
  estimatedApy: number;
}

export interface MockStake {
  id: number;
  chainId: number;
  symbol: string;
  chain: string;
  amount: number;
  apy: number;
  rewards: number;
  rewardsUSD?: number;
  color: string;
  restakeRewards: boolean;
  isCnpy?: boolean;
  committees?: MockCommittee[];
  availableChains?: MockAvailableChain[];
}

export interface MockUnstakingItem {
  id: string | number;
  chainId: number;
  symbol: string;
  amount: number;
  daysRemaining: number;
  hoursRemaining: number;
}

export interface EarningsHistoryEntry {
  id: string;
  chainId: number;
  symbol: string;
  amount: number;
  amountUSD: number;
}

export interface EarningsHistoryDay {
  date: string;
  transactions: EarningsHistoryEntry[];
}

export interface MockWalletStakingData {
  assets: MockAsset[];
  stakes: MockStake[];
  unstaking: MockUnstakingItem[];
  earningsHistory: EarningsHistoryDay[];
}

const defaultAddress = "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199";

const stakingDataset: Record<string, MockWalletStakingData> = {
  [defaultAddress]: {
    assets: [
      {
        id: 0,
        chainId: 0,
        symbol: "CNPY",
        name: "CANOPY",
        balance: 1000,
        price: 1.5,
        value: 1500,
        change24h: 2.5,
        color: "#1dd13a",
      },
      {
        id: 1,
        chainId: 1,
        symbol: "OENS",
        name: "Onchain ENS",
        balance: 2500,
        price: 2.24256,
        value: 5606.24,
        change24h: 3.2,
        color: "#10b981",
      },
      {
        id: 2,
        chainId: 2,
        symbol: "GAME",
        name: "MyGameChain",
        balance: 450,
        price: 6.92129,
        value: 3114.58,
        change24h: 8.1,
        color: "#8b5cf6",
      },
      {
        id: 3,
        chainId: 3,
        symbol: "SOCL",
        name: "Social Connect",
        balance: 890,
        price: 2.10084,
        value: 1869.75,
        change24h: -2.3,
        color: "#06b6d4",
      },
      {
        id: 4,
        chainId: 5,
        symbol: "STRM",
        name: "StreamVault",
        balance: 320,
        price: 4.55,
        value: 1456,
        change24h: 1.8,
        color: "#f59e0b",
      },
      {
        id: 5,
        chainId: 6,
        symbol: "DFIM",
        name: "DeFi Masters",
        balance: 150,
        price: 2.745,
        value: 411.75,
        change24h: -0.5,
        color: "#ec4899",
      },
      {
        id: 6,
        chainId: 14,
        symbol: "HLTH",
        name: "HealthChain",
        balance: 350,
        price: 3.25,
        value: 1137.5,
        change24h: 4.2,
        color: "#dc2626",
      },
      {
        id: 7,
        chainId: 15,
        symbol: "DYPRO",
        name: "DeFi Yield Pro",
        balance: 180,
        price: 5.85,
        value: 1053,
        change24h: 6.8,
        color: "#3b82f6",
      },
      {
        id: 8,
        chainId: 16,
        symbol: "MLAND",
        name: "Metaverse Land",
        balance: 220,
        price: 4.12,
        value: 906.4,
        change24h: -1.5,
        color: "#a855f7",
      },
    ],
    stakes: [
      {
        id: 0,
        chainId: 0,
        symbol: "CNPY",
        chain: "Canopy",
        amount: 5000,
        apy: 8.5,
        rewards: 12.45,
        rewardsUSD: 18.68,
        color: "#1dd13a",
        restakeRewards: true,
        isCnpy: true,
        committees: [
          {
            chainId: 1,
            symbol: "OENS",
            chain: "Onchain ENS",
            color: "#10b981",
            rewards: 3.25,
            rewardsUSD: 7.28,
          },
          {
            chainId: 2,
            symbol: "GAME",
            chain: "MyGameChain",
            color: "#8b5cf6",
            rewards: 1.85,
            rewardsUSD: 12.81,
          },
        ],
        availableChains: [
          {
            chainId: 3,
            symbol: "SOCL",
            chain: "Social Connect",
            color: "#06b6d4",
            estimatedApy: 6.2,
          },
          {
            chainId: 5,
            symbol: "STRM",
            chain: "StreamVault",
            color: "#f59e0b",
            estimatedApy: 7.8,
          },
          {
            chainId: 6,
            symbol: "DFIM",
            chain: "DeFi Masters",
            color: "#ec4899",
            estimatedApy: 5.5,
          },
          {
            chainId: 14,
            symbol: "HLTH",
            chain: "HealthChain",
            color: "#dc2626",
            estimatedApy: 4.9,
          },
          {
            chainId: 15,
            symbol: "DYPRO",
            chain: "DeFi Yield Pro",
            color: "#3b82f6",
            estimatedApy: 8.2,
          },
        ],
      },
      {
        id: 1,
        chainId: 1,
        symbol: "OENS",
        chain: "Onchain ENS",
        amount: 500,
        apy: 12.5,
        rewards: 2.15,
        rewardsUSD: 4.82,
        color: "#10b981",
        restakeRewards: true,
      },
      {
        id: 2,
        chainId: 2,
        symbol: "GAME",
        chain: "MyGameChain",
        amount: 200,
        apy: 18.2,
        rewards: 0.82,
        rewardsUSD: 5.68,
        color: "#8b5cf6",
        restakeRewards: false,
      },
      {
        id: 3,
        chainId: 3,
        symbol: "SOCL",
        chain: "Social Connect",
        amount: 0,
        apy: 8.5,
        rewards: 0,
        color: "#06b6d4",
        restakeRewards: true,
      },
      {
        id: 4,
        chainId: 5,
        symbol: "STRM",
        chain: "StreamVault",
        amount: 0,
        apy: 15.3,
        rewards: 0,
        color: "#f59e0b",
        restakeRewards: true,
      },
      {
        id: 5,
        chainId: 6,
        symbol: "DFIM",
        chain: "DeFi Masters",
        amount: 0,
        apy: 10.8,
        rewards: 0,
        color: "#ec4899",
        restakeRewards: false,
      },
    ],
    unstaking: [
      {
        id: 1,
        chainId: 1,
        symbol: "OENS",
        amount: 100,
        daysRemaining: 5,
        hoursRemaining: 3,
      },
    ],
    earningsHistory: [
      {
        date: "Today",
        transactions: [
          { id: "earn-1", chainId: 1, symbol: "OENS", amount: 0.15, amountUSD: 0.34 },
          { id: "earn-2", chainId: 2, symbol: "GAME", amount: 0.08, amountUSD: 0.55 },
        ],
      },
      {
        date: "Yesterday",
        transactions: [
          { id: "earn-3", chainId: 1, symbol: "OENS", amount: 0.14, amountUSD: 0.31 },
          { id: "earn-4", chainId: 2, symbol: "GAME", amount: 0.09, amountUSD: 0.62 },
        ],
      },
      {
        date: "Dec 28, 2024",
        transactions: [
          { id: "earn-5", chainId: 1, symbol: "OENS", amount: 0.16, amountUSD: 0.36 },
          { id: "earn-6", chainId: 2, symbol: "GAME", amount: 0.1, amountUSD: 0.69 },
        ],
      },
      {
        date: "Dec 27, 2024",
        transactions: [
          { id: "earn-7", chainId: 1, symbol: "OENS", amount: 0.15, amountUSD: 0.34 },
          { id: "earn-8", chainId: 2, symbol: "GAME", amount: 0.08, amountUSD: 0.55 },
        ],
      },
      {
        date: "Dec 26, 2024",
        transactions: [
          { id: "earn-9", chainId: 1, symbol: "OENS", amount: 0.17, amountUSD: 0.38 },
          { id: "earn-10", chainId: 2, symbol: "GAME", amount: 0.09, amountUSD: 0.62 },
        ],
      },
      {
        date: "Dec 25, 2024",
        transactions: [
          { id: "earn-11", chainId: 1, symbol: "OENS", amount: 0.14, amountUSD: 0.31 },
          { id: "earn-12", chainId: 2, symbol: "GAME", amount: 0.08, amountUSD: 0.55 },
        ],
      },
      {
        date: "Dec 24, 2024",
        transactions: [
          { id: "earn-13", chainId: 1, symbol: "OENS", amount: 0.16, amountUSD: 0.36 },
          { id: "earn-14", chainId: 2, symbol: "GAME", amount: 0.1, amountUSD: 0.69 },
        ],
      },
      {
        date: "Dec 23, 2024",
        transactions: [
          { id: "earn-15", chainId: 1, symbol: "OENS", amount: 0.15, amountUSD: 0.34 },
          { id: "earn-16", chainId: 2, symbol: "GAME", amount: 0.09, amountUSD: 0.62 },
        ],
      },
    ],
  },
  "0x742d35cc6634c0532925a3b844bc9e7595f00000": {
    assets: [],
    stakes: [],
    unstaking: [],
    earningsHistory: [],
  },
};

export const emptyMockStakingData: MockWalletStakingData = {
  assets: [],
  stakes: [],
  unstaking: [],
  earningsHistory: [],
};

export const defaultMockStakingData = stakingDataset[defaultAddress];

export function getMockStakingData(address?: string): MockWalletStakingData {
  if (!address) {
    return defaultMockStakingData;
  }

  const normalized = address.toLowerCase();
  return stakingDataset[normalized] ?? defaultMockStakingData;
}

