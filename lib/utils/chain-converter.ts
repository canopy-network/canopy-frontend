/**
 * @fileoverview Chain data converter utilities
 *
 * This module provides utilities to convert raw chain data from the API
 * to ChainWithUI format for display in components.
 */

import { Chain, VirtualPool } from "@/types/chains";
import { ChainWithUI } from "@/lib/stores/chains-store";

/**
 * Convert Chain to ChainWithUI format for UI components
 */
export function convertToChainWithUI(
  chain: Chain,
  virtualPool?: VirtualPool | null
): ChainWithUI {
  // Calculate progress based on graduation threshold and current reserves
  const progress = virtualPool
    ? Math.min(
        100,
        (virtualPool.cnpy_reserve / chain.graduation_threshold) * 100
      )
    : 0;

  // Calculate market cap and other metrics
  const marketCap = virtualPool?.market_cap_usd || 0;
  const volume24h = virtualPool?.volume_24h_cnpy || 0;
  const fdv = virtualPool
    ? virtualPool.current_price_cnpy * chain.token_total_supply
    : 0;

  // Generate placeholder chart data
  const chartData = generatePlaceholderChartData(chain.created_at);

  // Generate placeholder bonding curve data
  const bondingCurve = generatePlaceholderBondingCurve(chain);

  return {
    // Spread all Chain properties
    ...chain,
    // Override with computed UI properties
    progress: Math.round(progress),
    price: virtualPool?.current_price_cnpy || 0,
    marketCap,
    volume24h,
    fdv,
    chartData,
    raised: formatCurrency(virtualPool?.cnpy_reserve || 0),
    target: formatCurrency(chain.graduation_threshold),
    participants: virtualPool?.unique_traders || 0,
    timeLeft: calculateTimeLeft(chain.scheduled_launch_time, chain.status),
    bondingCurve,
    status: mapChainStatusToProjectStatus(chain.status),
    category: mapTemplateCategoryToProjectCategory(
      chain.template?.template_category
    ),
    isGraduated: chain.is_graduated,
  };
}

/**
 * Map Chain status to Project status
 */
function mapChainStatusToProjectStatus(
  status: string
): "active" | "graduated" | "pending" {
  switch (status) {
    case "virtual_active":
      return "active";
    case "graduated":
      return "graduated";
    case "draft":
    case "pending_launch":
    case "failed":
    default:
      return "pending";
  }
}

/**
 * Map template category to project category
 */
function mapTemplateCategoryToProjectCategory(
  category?: string
): "defi" | "gaming" | "nft" | "infrastructure" | "social" {
  switch (category?.toLowerCase()) {
    case "defi":
      return "defi";
    case "gaming":
      return "gaming";
    case "nft":
      return "nft";
    case "infrastructure":
      return "infrastructure";
    case "social":
      return "social";
    default:
      return "defi"; // Default to DeFi
  }
}

/**
 * Generate placeholder chart data
 */
function generatePlaceholderChartData(createdAt: string) {
  const baseTime = new Date(createdAt).getTime();
  const now = Date.now();
  const timeDiff = now - baseTime;

  // Generate 10-15 data points over the time period
  const dataPoints = Math.min(
    15,
    Math.max(10, Math.floor(timeDiff / (24 * 60 * 60 * 1000)))
  );
  const chartData = [];

  let currentValue = 0.1; // Starting price

  for (let i = 0; i < dataPoints; i++) {
    const timeOffset = (timeDiff / dataPoints) * i;
    const time = new Date(baseTime + timeOffset).toISOString();

    // Simulate price growth with some randomness
    const growth = Math.random() * 0.05 + 0.02; // 2-7% growth per point
    currentValue *= 1 + growth;

    chartData.push({
      time,
      value: Math.round(currentValue * 100) / 100, // Round to 2 decimal places
    });
  }

  return chartData;
}

/**
 * Generate placeholder bonding curve data
 */
function generatePlaceholderBondingCurve(chain: Chain) {
  const points = [];
  const maxSupply = chain.initial_token_supply;
  const steps = 5;

  for (let i = 0; i <= steps; i++) {
    const supply = (maxSupply / steps) * i;
    const price = chain.bonding_curve_slope * supply + 0.01; // Base price + slope * supply

    points.push({
      price: Math.round(price * 1000) / 1000, // Round to 3 decimal places
      supply: Math.round(supply),
    });
  }

  return points;
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  } else {
    return amount.toFixed(0);
  }
}

/**
 * Calculate time left until launch or graduation
 */
function calculateTimeLeft(
  scheduledLaunchTime?: string,
  status?: string
): string {
  if (!scheduledLaunchTime || status === "graduated") {
    return "Completed";
  }

  const launchTime = new Date(scheduledLaunchTime).getTime();
  const now = Date.now();
  const diff = launchTime - now;

  if (diff <= 0) {
    return "Live";
  }

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else {
    return `${hours}h`;
  }
}
