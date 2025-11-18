import { PortfolioOverviewResponse } from "../types/api/portfolio";

export const mockPortfolioOverview: PortfolioOverviewResponse = {
  total_value_cnpy: "125000",
  total_value_usd: "87500",
  accounts: [
    {
      address: "canopy1abc...def123",
      label: "Main Wallet",
      chain_id: 1,
      chain_name: "Canopy Hub",
      balance: "50000",
      balance_usd: "35000",
      staked_balance: "30000",
      staked_usd: "21000",
      delegated_balance: "20000",
      delegated_usd: "14000",
      available_balance: "0",
      available_usd: "0",
    },
    {
      address: "canopy1xyz...abc456",
      label: "Trading Wallet",
      chain_id: 1,
      chain_name: "Canopy Hub",
      balance: "25000",
      balance_usd: "17500",
      staked_balance: "15000",
      staked_usd: "10500",
      delegated_balance: "10000",
      delegated_usd: "7000",
      available_balance: "0",
      available_usd: "0",
    },
  ],
  allocation: {
    by_chain: [
      {
        chain_id: 1,
        chain_name: "Canopy Hub",
        total_value_cnpy: "75000",
        total_value_usd: "52500",
        percentage: 60,
      },
      {
        chain_id: 2,
        chain_name: "Ethereum",
        total_value_cnpy: "35000",
        total_value_usd: "24500",
        percentage: 28,
      },
      {
        chain_id: 3,
        chain_name: "Polygon",
        total_value_cnpy: "15000",
        total_value_usd: "10500",
        percentage: 12,
      },
    ],
    by_type: {
      liquid: {
        value_cnpy: "25000",
        value_usd: "17500",
        percentage: 20,
      },
      staked: {
        value_cnpy: "60000",
        value_usd: "42000",
        percentage: 48,
      },
      delegated: {
        value_cnpy: "40000",
        value_usd: "28000",
        percentage: 32,
      },
    },
  },
  performance: {
    total_pnl_usd: "12500",
    total_pnl_percentage: 16.67,
    period: "30d",
  },
  last_updated: new Date().toISOString(),
};
