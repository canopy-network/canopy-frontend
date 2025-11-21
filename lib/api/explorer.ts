/**
 * @fileoverview Explorer API client
 *
 * This module provides type-safe methods for interacting with the explorer API endpoints.
 * All methods return properly typed responses and handle errors gracefully.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { apiClient } from "./client";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Explorer transaction response from API
 * Note: Fields like counterparty, amount, and other optional fields may not be present in all responses
 */
export interface Transaction {
  chain_id: number;
  height: number;
  tx_hash: string;
  timestamp: string;
  message_type: string;
  signer: string;
  fee: number;
  counterparty?: string | null;
  amount?: number | null;
  validator_address?: string | null;
  dest_chain_id?: number | null;
  order_id?: string | null;
  pool_id?: string | null;
  sell_asset_chain_id?: number | null;
  buy_asset_chain_id?: number | null;
  sell_amount?: number | null;
  buy_amount?: number | null;
  limit_price?: number | null;
  message_json?: string | null;
}

/**
 * Explorer transactions response with pagination
 */
export interface ExplorerTransactionsResponse {
  data: Transaction[];
  pagination: {
    limit: number;
    next_cursor: number | null;
  };
}

/**
 * Query parameters for getting transactions
 */
export interface GetExplorerTransactionsParams {
  chain_id?: number;
  message_type?: string;
  signer?: string;
  counterparty?: string;
  limit?: number;
  cursor?: number;
  sort?: "asc" | "desc";
}

/**
 * Explorer block response from API
 */
export interface Block {
  chain_id: number;
  height: number;
  hash: string;
  timestamp: string;
  proposer_address: string;
  num_txs: number;
  num_events: number;
  total_fees: number;
}

/**
 * Explorer blocks response with pagination
 */
export interface ExplorerBlocksResponse {
  data: Block[];
  pagination: {
    limit: number;
    next_cursor: number | null;
  };
}

/**
 * Query parameters for getting blocks
 */
export interface GetExplorerBlocksParams {
  chain_id?: number;
  limit?: number;
  cursor?: number;
  sort?: "asc" | "desc";
}

// ============================================================================
// EXPLORER API
// ============================================================================

/**
 * Explorer API client
 */
export const explorerApi = {
  /**
   * Get paginated list of recent transactions
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to transactions data with pagination
   *
   * @example
   * ```typescript
   * // Get recent transactions
   * const transactions = await explorerApi.getTransactions();
   *
   * // Get transactions with filters
   * const transactions = await explorerApi.getTransactions({
   *   chain_id: 1,
   *   message_type: 'send',
   *   limit: 20
   * });
   * ```
   */
  getTransactions: (params?: GetExplorerTransactionsParams) =>
    apiClient.get<ExplorerTransactionsResponse>(
      "/api/v1/explorer/transactions",
      params
    ),

  /**
   * Get detailed information about a specific transaction
   *
   * @param hash - Transaction hash (64-character hex string)
   * @param params - Optional query parameters (e.g., chain_id)
   * @returns Promise resolving to transaction detail data
   *
   * @example
   * ```typescript
   * const transaction = await explorerApi.getTransaction('a1b2c3d4...');
   * ```
   */
  getTransaction: (hash: string, params?: { chain_id?: number }) =>
    apiClient.get<Transaction>(`/api/v1/explorer/transactions/${hash}`, params),

  /**
   * Get paginated list of recent blocks
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to blocks data with pagination
   *
   * @example
   * ```typescript
   * // Get recent blocks
   * const blocks = await explorerApi.getBlocks();
   *
   * // Get blocks with filters
   * const blocks = await explorerApi.getBlocks({
   *   chain_id: 1,
   *   limit: 20
   * });
   * ```
   */
  getBlocks: (params?: GetExplorerBlocksParams) =>
    apiClient.get<ExplorerBlocksResponse>("/api/v1/explorer/blocks", params),

  /**
   * Get detailed information about a specific block
   *
   * @param height - Block height (uint64)
   * @param params - Optional query parameters (e.g., chain_id)
   * @returns Promise resolving to block detail data
   *
   * @example
   * ```typescript
   * const block = await explorerApi.getBlock(12345);
   * ```
   */
  getBlock: (height: number, params?: { chain_id?: number }) =>
    apiClient.get<Block>(`/api/v1/explorer/blocks/${height}`, params),
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get recent transactions (convenience function)
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to transactions array
 */
export async function getExplorerTransactions(
  params?: GetExplorerTransactionsParams
): Promise<Transaction[]> {
  const response = await explorerApi.getTransactions(params);
  return response.data?.data || [];
}

/**
 * Get a single transaction by hash (convenience function)
 *
 * @param hash - Transaction hash
 * @param chainId - Optional chain ID
 * @returns Promise resolving to transaction data
 */
export async function getExplorerTransaction(
  hash: string,
  chainId?: number
): Promise<Transaction> {
  const response = await explorerApi.getTransaction(hash, {
    chain_id: chainId,
  });
  return response.data as Transaction;
}

/**
 * Get recent blocks (convenience function)
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to blocks array
 */
export async function getExplorerBlocks(
  params?: GetExplorerBlocksParams
): Promise<Block[]> {
  const response = await explorerApi.getBlocks(params);
  return response.data || [];
}

/**
 * Get a single block by height (convenience function)
 *
 * @param height - Block height
 * @param chainId - Optional chain ID
 * @returns Promise resolving to block data
 */
export async function getExplorerBlock(
  height: number,
  chainId?: number
): Promise<Block> {
  const response = await explorerApi.getBlock(height, {
    chain_id: chainId,
  });
  return response.data as Block;
}
