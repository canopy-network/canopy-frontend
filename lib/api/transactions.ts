/**
 * @fileoverview Transactions API Client
 *
 * This file contains API functions for fetching chain transactions.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

/**
 * Transaction data from API
 */
export interface Transaction {
  id: string;
  virtual_pool_id: string;
  chain_id: string;
  user_id: string;
  transaction_type: "buy" | "sell";
  cnpy_amount: number;
  token_amount: number;
  price_per_token_cnpy: number;
  trading_fee_cnpy: number;
  slippage_percent: number;
  transaction_hash: string | null;
  block_height: number | null;
  gas_used: number | null;
  pool_cnpy_reserve_after: number;
  pool_token_reserve_after: number;
  market_cap_after_usd: number;
  created_at: string;
}

/**
 * Parameters for fetching transactions
 */
export interface GetTransactionsParams {
  page?: number;
  limit?: number;
}

/**
 * Fetches transactions for a specific chain
 * @param chainId - The chain ID
 * @param params - Query parameters (page, limit)
 * @returns Promise with paginated transaction data
 */
export async function getChainTransactions(
  chainId: string,
  params?: GetTransactionsParams
): Promise<PaginatedResponse<Transaction>> {
  const url = `/api/v1/chains/${chainId}/transactions`;

  // The API returns the paginated response directly (data + pagination at root level)
  // The apiClient wraps it in ApiResponse, so response.data contains the PaginatedResponse
  const response = await apiClient.get<any>(url, params);

  // The response.data contains both data array and pagination object
  return response.data as PaginatedResponse<Transaction>;
}
