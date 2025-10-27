/**
 * @fileoverview Price History API Client
 *
 * This file contains API functions for fetching OHLC price history data.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api";

/**
 * OHLC candlestick data point
 */
export interface PriceHistoryDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  trade_count: number;
}

/**
 * Parameters for fetching price history
 */
export interface GetPriceHistoryParams {
  start_time?: string; // RFC3339/ISO 8601 format
  end_time?: string; // RFC3339/ISO 8601 format
}

/**
 * Fetches OHLC price history for a specific chain
 * @param chainId - The chain ID
 * @param params - Query parameters (start_time, end_time)
 * @returns Promise with price history data
 */
export async function getChainPriceHistory(
  chainId: string,
  params?: GetPriceHistoryParams
): Promise<ApiResponse<PriceHistoryDataPoint[]>> {
  const url = `/api/v1/chains/${chainId}/price-history`;

  return apiClient.get<PriceHistoryDataPoint[]>(url, params);
}

/**
 * Helper function to calculate start time for different timeframes
 * @param timeframe - Timeframe string (1H, 1D, 1W, 1M, 1Y)
 * @returns Object with start_time and end_time in ISO format
 */
export function getTimeRangeForTimeframe(
  timeframe: string
): GetPriceHistoryParams {
  const now = new Date();
  const startTime = new Date();

  switch (timeframe) {
    case "1H":
      startTime.setHours(now.getHours() - 1);
      break;
    case "1D":
      startTime.setDate(now.getDate() - 1);
      break;
    case "1W":
      startTime.setDate(now.getDate() - 7);
      break;
    case "1M":
      startTime.setMonth(now.getMonth() - 1);
      break;
    case "1Y":
      startTime.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startTime.setDate(now.getDate() - 1); // Default to 1D
  }

  return {
    start_time: startTime.toISOString(),
    end_time: now.toISOString(),
  };
}

/**
 * Convert price history data to chart format using close prices
 * @param data - Array of price history data points
 * @returns Array of {value, time} objects for the chart
 */
export function convertPriceHistoryToChart(
  data: PriceHistoryDataPoint[]
): Array<{ value: number; time: number }> {
  return data.map((point) => ({
    value: point.close,
    time: Math.floor(new Date(point.timestamp).getTime() / 1000), // Convert to Unix timestamp
  }));
}

/**
 * Convert price history data to volume chart format
 * @param data - Array of price history data points
 * @returns Array of {value, time} objects for the chart
 */
export function convertVolumeHistoryToChart(
  data: PriceHistoryDataPoint[]
): Array<{ value: number; time: number }> {
  return data.map((point) => ({
    value: point.volume,
    time: Math.floor(new Date(point.timestamp).getTime() / 1000), // Convert to Unix timestamp
  }));
}
