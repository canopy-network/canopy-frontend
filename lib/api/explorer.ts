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
 * Explorer search result base interface
 */
export interface ExplorerSearchResultBase<
  TType extends string = string,
  TResult = any
> {
  type: TType;
  chain_id: number;
  result: TResult;
}

/**
 * Explorer address search result
 */
export interface ExplorerAddressSearchResult
  extends ExplorerSearchResultBase<
    "address",
    {
      address: string;
      total_transactions?: number;
      recent_txs?: Transaction[];
    }
  > {}

/**
 * Explorer transaction search result
 */
export interface ExplorerTransactionSearchResult
  extends ExplorerSearchResultBase<"transaction", Transaction> {}

/**
 * Explorer block search result data
 */
export interface ExplorerBlockSearchResult
  extends ExplorerSearchResultBase<
    "block",
    {
      chain_id: number;
      height: number;
      hash: string;
      timestamp: string;
      proposer_address: string;
      num_txs_send?: number;
      num_txs_stake?: number;
      num_txs_edit_stake?: number;
      num_txs_unstake?: number;
      num_txs_pause?: number;
      num_txs_unpause?: number;
      num_txs_change_parameter?: number;
      num_txs_dao_transfer?: number;
      num_txs_certificate_result?: number;
      num_txs_subsidy?: number;
      num_txs_create_order?: number;
      num_txs_edit_order?: number;
      num_txs_delete_order?: number;
      num_txs_dex_deposit?: number;
      num_txs_dex_withdraw?: number;
      num_txs_dex_limit_order?: number;
      num_events_reward?: number;
      num_events_slash?: number;
      num_events_double_sign?: number;
      num_events_unstake_ready?: number;
      num_events_order_book_swap?: number;
      num_events_order_created?: number;
      num_events_order_edited?: number;
      num_events_order_deleted?: number;
      num_events_order_filled?: number;
      num_events_dex_deposit?: number;
      num_events_dex_withdraw?: number;
      num_events_dex_swap?: number;
      num_events_pool_created?: number;
      num_events_pool_points_created?: number;
      num_events_pool_points_redeemed?: number;
      num_events_pool_points_transfered?: number;
      num_orders_created?: number;
      num_orders_edited?: number;
      num_orders_deleted?: number;
      total_txs?: number;
      total_events?: number;
      total_fees?: number;
    }
  > {}

/**
 * Explorer search result union
 */
export type ExplorerSearchResult =
  | ExplorerAddressSearchResult
  | ExplorerTransactionSearchResult
  | ExplorerBlockSearchResult
  | ExplorerSearchResultBase;

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

  /**
   * Get network-wide statistics overview
   *
   * @returns Promise resolving to overview data with pagination wrapper
   *
   * @example
   * ```typescript
   * const overview = await explorerApi.getOverview();
   * ```
   */
  getOverview: () =>
    apiClient.get<ExplorerOverviewResponse>("/api/v1/explorer/overview"),
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
  const data: Transaction[] = response.data as unknown as Transaction[];
  return data || [];
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
  console.log("[getExplorerBlocks] response", response);
  console.log("[getExplorerBlocks] response.data", response.data);

  const data: Block[] = response.data as unknown as Block[];
  return data || [];
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

// ============================================================================
// EXPLORER SEARCH
// ============================================================================

export interface ExplorerSearchResponse {
  data: ExplorerSearchResult[];
}

/**
 * Search explorer entities by hash/address/height.
 */
export async function searchExplorerEntities(
  query: string
): Promise<ExplorerSearchResult[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  try {
    const response = await apiClient.get<ExplorerSearchResponse>(
      "/api/v1/explorer/search",
      { q: trimmedQuery }
    );

    const payload = response?.data;

    if (Array.isArray(payload)) {
      return payload as ExplorerSearchResult[];
    }

    if (
      payload &&
      typeof payload === "object" &&
      Array.isArray((payload as ExplorerSearchResponse).data)
    ) {
      return (payload as ExplorerSearchResponse).data;
    }

    if (
      payload &&
      typeof payload === "object" &&
      Array.isArray((payload as any).data)
    ) {
      return (payload as any).data as ExplorerSearchResult[];
    }

    return [];
  } catch (error) {
    console.error(
      "[searchExplorerEntities] Error fetching search results",
      error
    );
    return [];
  }
}

// ============================================================================
// EXPLORER OVERVIEW
// ============================================================================

/**
 * Explorer overview response from API
 *
 * Contains network-wide statistics including TVL, volume, active chains,
 * validators, holders, and transaction metrics with 24-hour change indicators.
 *
 * @property {number} tvl - Total Value Locked in raw number format
 * @property {string} tvl_formatted - Total Value Locked in human-readable format (e.g., "3.5M")
 * @property {number} tvl_change_24h - Percentage change in TVL over the last 24 hours
 * @property {number} volume_24h - 24-hour volume in raw number format
 * @property {string} volume_24h_formatted - 24-hour volume in human-readable format
 * @property {number} volume_change_24h - Percentage change in volume over the last 24 hours
 * @property {number} active_chains - Total number of active chains on the network
 * @property {number} active_chains_change - Change in number of active chains
 * @property {number} total_validators - Total number of validators across all chains
 * @property {number} total_validators_change - Change in total validators (percentage or count)
 * @property {number} total_holders - Total number of token holders across the network
 * @property {number} total_holders_change - Change in total holders (percentage or count)
 * @property {number} total_transactions - Total number of transactions processed
 * @property {number} total_transactions_change - Change in total transactions (percentage or count)
 */
export interface ExplorerOverview {
  tvl: number;
  tvl_formatted: string;
  tvl_change_24h: number;
  volume_24h: number;
  volume_24h_formatted: string;
  volume_change_24h: number;
  active_chains: number;
  active_chains_change: number;
  total_validators: number;
  total_validators_change: number;
  total_holders: number;
  total_holders_change: number;
  total_transactions: number;
  total_transactions_change: number;
}

/**
 * Explorer overview API response
 */
export interface ExplorerOverviewResponse {
  data: ExplorerOverview;
}

/**
 * Get network-wide statistics overview
 *
 * @returns Promise resolving to overview data
 *
 * @example
 * ```typescript
 * const overview = await getExplorerOverview();
 * ```
 */
export async function getExplorerOverview(): Promise<ExplorerOverview | null> {
  try {
    const response = await explorerApi.getOverview();
    console.log("[getExplorerOverview] response", response);
    console.log("[getExplorerOverview] response.data", response.data);
    console.log(
      "[getExplorerOverview] response.data?.data",
      response.data?.data
    );

    // The API response structure is: ApiResponse<ExplorerOverviewResponse>
    // Which means: { data: ExplorerOverviewResponse, pagination: ... }
    // And ExplorerOverviewResponse is: { data: ExplorerOverview }
    // So we need: response.data.data
    if (response.data?.data) {
      return response.data.data as ExplorerOverview;
    }

    // Fallback: maybe the API returns the data directly in response.data
    // Check if response.data has the structure of ExplorerOverview (has tvl property)
    if (
      response.data &&
      typeof response.data === "object" &&
      "tvl" in response.data &&
      !("data" in response.data)
    ) {
      return response.data as unknown as ExplorerOverview;
    }

    console.warn(
      "[getExplorerOverview] Unexpected response structure:",
      response
    );
    return null;
  } catch (error) {
    console.error("[getExplorerOverview] Error fetching overview:", error);
    return null;
  }
}
