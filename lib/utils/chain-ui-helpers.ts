/**
 * @fileoverview Chain UI helper utilities
 *
 * This module provides utility functions for computing UI-specific values
 * from chain and virtual pool data. These are pure functions that don't
 * modify data structures, keeping the data layer clean.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { Chain, ChainStatus, VirtualPool, Accolade } from "@/types/chains";

// ============================================================================
// PROGRESS & GRADUATION CALCULATIONS
// ============================================================================

/**
 * Calculate graduation progress percentage
 * @param chain - Chain data
 * @param virtualPool - Optional virtual pool data
 * @returns Progress percentage (0-100)
 */
export function calculateGraduationProgress(
  chain: Chain,
  virtualPool?: VirtualPool | null
): number {
  if (!virtualPool) return 0;

  const progress =
    (virtualPool.cnpy_reserve / chain.graduation_threshold) * 100;
  return Math.min(Math.round(progress), 100);
}

/**
 * Calculate remaining CNPY needed for graduation
 * @param chain - Chain data
 * @param virtualPool - Optional virtual pool data
 * @returns Remaining CNPY amount
 */
export function calculateRemainingCNPY(
  chain: Chain,
  virtualPool?: VirtualPool | null
): number {
  if (!virtualPool) return chain.graduation_threshold;

  const remaining = chain.graduation_threshold - virtualPool.cnpy_reserve;
  return Math.max(remaining, 0);
}

// ============================================================================
// STATUS MAPPING
// ============================================================================

/**
 * Map Chain status to UI-friendly status label
 * @param status - Chain status from API
 * @returns UI-friendly status string
 */
export function getStatusLabel(
  status: ChainStatus
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
 * Map template category to UI category
 * @param category - Template category from API
 * @returns UI category
 */
export function getCategoryFromTemplate(
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
      return "defi"; // Default fallback
  }
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format currency amount with K/M suffixes
 * @param amount - Amount to format
 * @returns Formatted string (e.g., "1.2M", "500K", "123")
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  } else {
    return amount.toFixed(0);
  }
}

/**
 * Format large numbers with K/M/B suffixes
 * @param value - Number to format
 * @returns Formatted string
 */
export function formatNumber(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Format price with appropriate decimal places
 * @param price - Price to format
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toFixed(2);
  } else if (price >= 0.01) {
    return price.toFixed(4);
  } else {
    return price.toFixed(8);
  }
}

/**
 * Format percentage with sign
 * @param percent - Percentage value
 * @returns Formatted percentage string (e.g., "+12.5%", "-3.2%")
 */
export function formatPercentage(percent: number): string {
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${percent.toFixed(1)}%`;
}

// ============================================================================
// TIME UTILITIES
// ============================================================================

/**
 * Calculate time left until launch or graduation
 * @param scheduledLaunchTime - Scheduled launch time ISO string
 * @param status - Current chain status
 * @returns Time left string (e.g., "2d 5h", "5h", "Live", "Completed")
 */
export function calculateTimeLeft(
  scheduledLaunchTime?: string,
  status?: ChainStatus
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

/**
 * Calculate age of chain since creation
 * @param createdAt - Creation timestamp ISO string
 * @returns Age string (e.g., "5d", "12h", "30m")
 */
export function calculateAge(createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  return `${diffMinutes}m`;
}

/**
 * Format relative time string
 * @param timestamp - ISO timestamp string
 * @returns Relative time string (e.g., "2 days ago", "5 hours ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
}

// ============================================================================
// MARKET METRICS
// ============================================================================

/**
 * Calculate Fully Diluted Valuation (FDV)
 * @param currentPrice - Current token price in CNPY
 * @param totalSupply - Total token supply
 * @returns FDV value
 */
export function calculateFDV(
  currentPrice: number,
  totalSupply: number
): number {
  return currentPrice * totalSupply;
}

/**
 * Get price from virtual pool or default to 0
 * @param virtualPool - Optional virtual pool data
 * @returns Current price
 */
export function getPrice(virtualPool?: VirtualPool | null): number {
  return virtualPool?.current_price_cnpy || 0;
}

/**
 * Get market cap from virtual pool or default to 0
 * @param virtualPool - Optional virtual pool data
 * @returns Market cap
 */
export function getMarketCap(virtualPool?: VirtualPool | null): number {
  return virtualPool?.market_cap_usd || 0;
}

/**
 * Get 24h volume from virtual pool or default to 0
 * @param virtualPool - Optional virtual pool data
 * @returns 24h volume
 */
export function getVolume24h(virtualPool?: VirtualPool | null): number {
  return virtualPool?.volume_24h_cnpy || 0;
}

/**
 * Get 24h price change from virtual pool or default to 0
 * @param virtualPool - Optional virtual pool data
 * @returns 24h price change percentage
 */
export function getPriceChange24h(virtualPool?: VirtualPool | null): number {
  return virtualPool?.price_24h_change_percent || 0;
}

// ============================================================================
// ASSET UTILITIES
// ============================================================================

/**
 * Extract logo URL from chain assets
 * @param chain - Chain data with assets
 * @returns Logo URL or undefined
 */
export function getLogoUrl(chain: Chain): string | undefined {
  if (chain.branding) return chain.branding;

  const logoAsset = chain.assets?.find((asset) => asset.asset_type === "logo");
  return logoAsset?.file_url;
}

/**
 * Extract banner URL from chain assets
 * @param chain - Chain data with assets
 * @returns Banner URL or undefined
 */
export function getBannerUrl(chain: Chain): string | undefined {
  if (chain.banner) return chain.banner;

  const bannerAsset = chain.assets?.find(
    (asset) =>
      asset.asset_type === "banner" || asset.asset_type === "screenshot"
  );
  return bannerAsset?.file_url;
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Generate a consistent color for a chain based on its name
 * @param name - Chain name
 * @returns Hex color code
 */
export function generateChainColor(name: string): string {
  const colors = [
    "#dc2626", // red
    "#ea580c", // orange
    "#ca8a04", // yellow
    "#16a34a", // green
    "#0891b2", // cyan
    "#2563eb", // blue
    "#7c3aed", // violet
    "#c026d3", // fuchsia
    "#db2777", // pink
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

/**
 * Get color class for price change
 * @param priceChange - Price change percentage
 * @returns Tailwind color class
 */
export function getPriceChangeColor(priceChange: number): string {
  return priceChange >= 0 ? "text-green-500" : "text-red-500";
}

// ============================================================================
// ACCOLADES UTILITIES
// ============================================================================

/**
 * Filter accolades to show only one per category - the highest achieved one
 * An accolade is considered "achieved" when current_value >= threshold
 *
 * @param accolades - Array of all accolades from the API
 * @returns Filtered array with one accolade per category (the highest achieved)
 *
 * @example
 * ```typescript
 * const filtered = filterAccoladesByCategory(allAccolades);
 * // Returns: [{ category: "holder", threshold: 100, ... }, { category: "market_cap", threshold: 10000, ... }]
 * ```
 */
export function filterAccoladesByCategory(accolades: Accolade[]): Accolade[] {
  // Group accolades by category
  const byCategory = new Map<string, Accolade[]>();

  accolades.forEach((accolade) => {
    const category = accolade.category;
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
    }
    byCategory.get(category)!.push(accolade);
  });

  // For each category, find the highest achieved accolade
  const result: Accolade[] = [];

  byCategory.forEach((categoryAccolades) => {
    // Filter to only achieved accolades (current_value >= threshold)
    const achieved = categoryAccolades.filter(
      (a) => a.current_value >= a.threshold
    );

    if (achieved.length > 0) {
      // Sort by threshold descending to get the highest achieved
      achieved.sort((a, b) => b.threshold - a.threshold);
      result.push(achieved[0]);
    }
  });

  return result;
}
