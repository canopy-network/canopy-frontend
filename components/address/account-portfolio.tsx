"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AccountPortfolioChart } from "./account-portfolio-chart";
import { PortfolioTable } from "./portfolio-table";

interface AccountPortfolioProps {
  address: string;
}

// Placeholder function - will be replaced with actual API call
async function fetchPortfolioData(address: string) {
  // TODO: Replace with actual API call
  return {
    totalValue: 43567.32,
    assets: [
      {
        id: 1,
        token: "CNPY",
        price: 1.2,
        priceChange: 12.8,
        balance: 104345.12,
        usdValue: 125214.14,
        percentage: 51,
        color: "#ec4899", // pink
      },
      {
        id: 2,
        token: "CNPY",
        price: 1.2,
        priceChange: 12.8,
        balance: 104345.12,
        usdValue: 125214.14,
        percentage: 17,
        color: "#3b82f6", // blue
      },
      {
        id: 3,
        token: "CNPY",
        price: 1.2,
        priceChange: 12.8,
        balance: 104345.12,
        usdValue: 125214.14,
        percentage: 10,
        color: "#eab308", // yellow
      },
      {
        id: 4,
        token: "CNPY",
        price: 1.2,
        priceChange: 12.8,
        balance: 104345.12,
        usdValue: 125214.14,
        percentage: 2,
        color: "#22c55e", // green
      },
      {
        id: 5,
        token: "Other",
        price: null,
        priceChange: null,
        balance: null,
        usdValue: null,
        percentage: 35,
        color: "#a855f7", // purple
      },
    ],
  };
}

export function AccountPortfolio({ address }: AccountPortfolioProps) {
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolioData() {
      try {
        const data = await fetchPortfolioData(address);
        setPortfolioData(data);
      } catch (error) {
        console.error("Failed to fetch portfolio data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPortfolioData();
  }, [address]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:gap-6 gap-4">
      {/* Portfolio Chart */}
      <AccountPortfolioChart data={portfolioData} />

      {/* Portfolio Table */}
      <PortfolioTable data={portfolioData} />
    </div>
  );
}
