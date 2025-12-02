"use client";

import { useMemo } from "react";
import { AccountPortfolioChart } from "./account-portfolio-chart";
import { PortfolioTable } from "./portfolio-table";
import type { AddressResponse } from "@/types/addresses";

interface AccountPortfolioProps {
  address: string;
  apiData?: AddressResponse;
}

/**
 * Convert CNPY from smallest unit (like wei) to standard units
 * CNPY uses 9 decimal places
 */
function cnpyToStandard(cnpy: number): number {
  return cnpy / 1_000_000_000;
}

/**
 * Color palette for portfolio assets
 */
const ASSET_COLORS = [
  "#ec4899", // pink
  "#3b82f6", // blue
  "#eab308", // yellow
  "#22c55e", // green
  "#a855f7", // purple
  "#f97316", // orange
  "#06b6d4", // cyan
  "#8b5cf6", // violet
];

/**
 * Transform API balances data into portfolio format
 */
function transformBalancesToPortfolio(apiData: AddressResponse | undefined): {
  totalValue: number;
  assets: Array<{
    id: number;
    token: string;
    price: number | null;
    priceChange: number | null;
    balance: number | null;
    usdValue: number | null;
    percentage: number;
    color: string;
  }>;
} | null {
  if (!apiData || !apiData.balances || apiData.balances.length === 0) {
    return null;
  }

  const { balances, summary } = apiData;
  const totalValue = cnpyToStandard(summary.total_portfolio_value_cnpy);

  // Transform balances into assets
  const assets = balances.map((balance, index) => {
    const balanceStandard = cnpyToStandard(balance.balance);
    const percentage =
      totalValue > 0 ? (balanceStandard / totalValue) * 100 : 0;

    // Use chain name as token identifier, or extract ticker if available
    const token = balance.chain_name || `Chain ${balance.chain_id}`;

    return {
      id: balance.chain_id,
      token,
      price: null, // Price data not available in API response
      priceChange: null, // Price change data not available in API response
      balance: balanceStandard,
      usdValue: balanceStandard, // Assuming 1:1 CNPY to USD for now
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      color: ASSET_COLORS[index % ASSET_COLORS.length],
    };
  });

  // Sort by percentage (descending)
  assets.sort((a, b) => b.percentage - a.percentage);

  return {
    totalValue,
    assets,
  };
}

export function AccountPortfolio({ apiData }: AccountPortfolioProps) {
  const portfolioData = useMemo(
    () => transformBalancesToPortfolio(apiData),
    [apiData]
  );

  if (!portfolioData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">No portfolio data available</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row lg:gap-6 gap-4">
      {/* Portfolio Chart */}
      <AccountPortfolioChart data={portfolioData} />

      {/* Portfolio Table */}
      <PortfolioTable data={portfolioData} />
    </div>
  );
}
