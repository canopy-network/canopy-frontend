/**
 * @fileoverview Explorer API client with React Query hooks
 *
 * This module provides type-safe methods for interacting with the explorer API endpoints.
 * All methods return properly typed responses and handle errors gracefully.
 * Includes React Query hooks for data fetching with caching and automatic refetching.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  Block,
  ExplorerBlocksResponse,
  GetExplorerBlocksParams,
  ExplorerBlockSearchResult,
} from "@/types/blocks";
import type { AddressResponse } from "@/types/addresses";

// Re-export types for backward compatibility
export type {
  Block,
  ExplorerBlocksResponse,
  GetExplorerBlocksParams,
} from "@/types/blocks";
export type { AddressResponse } from "@/types/addresses";

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
 * Explorer trending chains item
 */
export interface ExplorerTrendingChain {
  rank: number;
  chain_id: number;
  chain_name: string;
  market_cap: number;
  tvl: number;
  volume_24h: number;
  validators: number;
  holders: number;
  risk?: string | null;
  liquidity?: number | null;
  change_24h?: number | null;
}

/**
 * Explorer trending chains response
 */
export interface ExplorerTrendingChainsResponse {
  data: ExplorerTrendingChain[];
  pagination?: {
    limit?: number;
    next_cursor?: number | null;
    total?: number;
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
 * Explorer search result base interface
 */
export interface ExplorerSearchResultBase<
  TType extends string = string,
  TResult = unknown
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
  > {
  type: "address";
}

/**
 * Explorer transaction search result
 */
export interface ExplorerTransactionSearchResult
  extends ExplorerSearchResultBase<"transaction", Transaction> {
  type: "transaction";
}

/**
 * Explorer search result union
 */
export type ExplorerSearchResult =
  | ExplorerAddressSearchResult
  | ExplorerTransactionSearchResult
  | ExplorerBlockSearchResult
  | ExplorerSearchResultBase;

// ============================================================================
// EXPLORER API
// ============================================================================

/**
 * Explorer API client
 * Uses /api/v1/explorer/* endpoints as per documentation
 */
export const explorerApi = {
  /**
   * Get paginated list of recent transactions
   * GET /api/v1/explorer/transactions
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to transactions data with pagination
   */
  getTransactions: (params?: GetExplorerTransactionsParams) =>
    apiClient.get<ExplorerTransactionsResponse>(
      "/explorer/transactions",
      params
    ),

  /**
   * Get detailed information about a specific transaction
   * GET /api/v1/explorer/transactions/{hash}
   *
   * @param hash - Transaction hash (64-character hex string)
   * @param params - Optional query parameters (e.g., chain_id)
   * @returns Promise resolving to transaction detail data
   */
  getTransaction: (hash: string, params?: { chain_id?: number }) =>
    apiClient.get<Transaction>(
      `/explorer/transactions/${hash}`,
      params
    ),

  /**
   * Get paginated list of recent blocks
   * GET /api/v1/explorer/blocks
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to blocks data with pagination
   */
  getBlocks: (params?: GetExplorerBlocksParams) =>
    apiClient.get<ExplorerBlocksResponse>(
      "/explorer/blocks",
      params
    ),

  /**
   * Get detailed information about a specific block
   * GET /api/v1/explorer/blocks/{height}
   *
   * @param height - Block height (uint64)
   * @param params - Optional query parameters (e.g., chain_id)
   * @returns Promise resolving to block detail data
   */
  getBlock: (height: number, params?: { chain_id?: number }) =>
    apiClient.get<Block>(
      `/explorer/blocks/${height}`.replace(/\/+$/, ""), // Remove all trailing slashes
      params
    ),

  /**
   * Get network-wide statistics overview
   * GET /api/v1/explorer/overview
   *
   * @returns Promise resolving to overview data with pagination wrapper
   */
  getOverview: () =>
    apiClient.get<ExplorerOverviewResponse>(
      "/explorer/overview"
    ),

  /**
   * Get trending chains
   * GET /api/v1/explorer/trending
   *
   * @param params - Query parameters for pagination/filtering
   * @returns Promise resolving to trending chains data
   */
  getTrendingChains: (params?: { limit?: number }) =>
    apiClient.get<ExplorerTrendingChainsResponse>(
      "/explorer/trending",
      params
    ),

  /**
   * Get comprehensive address information
   * GET /api/v1/explorer/addresses/{address}
   *
   * @param address - Address to lookup (40-character hex string)
   * @param params - Optional query parameters (include_transactions, transaction_limit)
   * @returns Promise resolving to address data
   */
  getAddress: (
    address: string,
    params?: {
      include_transactions?: boolean;
      transaction_limit?: number;
    }
  ) =>
    apiClient.get<AddressResponse>(
      `/explorer/addresses/${address}`,
      params
    ),
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get recent transactions (convenience function)
 * Uses explorerApi.getTransactions() which calls /api/explorer/transactions
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to transactions array
 */
export async function getExplorerTransactions(
  params?: GetExplorerTransactionsParams
): Promise<Transaction[]> {
  const response = await explorerApi.getTransactions(params);
  // Debug: log response structure
  console.log("[getExplorerTransactions] Response structure:", {
    hasData: !!response.data,
    isArray: Array.isArray(response.data),
    hasNestedData: !!response.data?.data,
    nestedIsArray: Array.isArray(response.data?.data),
    dataKeys: response.data ? Object.keys(response.data) : [],
  });
  // Handle different response structures
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data?.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  return [];
}

/**
 * Get a single transaction by hash (convenience function)
 * Uses explorerApi.getTransaction() which calls /api/explorer/transactions/[hash]
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
 * Uses explorerApi.getBlocks() which calls /api/explorer/blocks
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to blocks array
 */
export async function getExplorerBlocks(
  params?: GetExplorerBlocksParams
): Promise<Block[]> {
  const response = await explorerApi.getBlocks(params);
  // Debug: log response structure
  console.log("[getExplorerBlocks] Response structure:", {
    hasData: !!response.data,
    isArray: Array.isArray(response.data),
    hasNestedData: !!response.data?.data,
    nestedIsArray: Array.isArray(response.data?.data),
    dataKeys: response.data ? Object.keys(response.data) : [],
  });
  // Handle different response structures
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data?.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  return [];
}

/**
 * Get a single block by height (convenience function)
 * Uses explorerApi.getBlock() which calls /api/explorer/blocks/[height]
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

/**
 * Get trending chains (convenience function)
 * Uses explorerApi.getTrendingChains() which calls /api/explorer/trending
 *
 * @param params - Query parameters for pagination/filtering
 * @returns Promise resolving to trending chains array
 */
export async function getExplorerTrendingChains(
  params?: { limit?: number }
): Promise<ExplorerTrendingChain[]> {
  try {
    const response = await explorerApi.getTrendingChains(params);
    // Handle different response structures
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("[getExplorerTrendingChains] Error fetching trending:", error);
    return [];
  }
}

// ============================================================================
// EXPLORER SEARCH
// ============================================================================

export interface ExplorerSearchResponse {
  data: ExplorerSearchResult[];
}

/**
 * Search explorer entities by hash/address/height.
 * Uses /api/explorer/search endpoint
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
      "/explorer/search",
      { q: trimmedQuery }
    );
    return response.data?.data || [];
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
  market_cap?: number;
  market_cap_formatted?: string;
  market_cap_change_24h?: number;
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
  tvl_history?: Array<{ time: number; value: number }>;
  volume_history?: Array<{ time: number; value: number }>;
}

/**
 * Explorer overview API response
 */
export interface ExplorerOverviewResponse {
  data: ExplorerOverview;
}

/**
 * Get network-wide statistics overview
 * Uses explorerApi.getOverview() which calls /api/explorer/overview
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
    // Handle different response structures
    if (response.data && !response.data.data && typeof response.data === 'object' && 'tvl' in response.data) {
      // Direct ExplorerOverview object
      return response.data as unknown as ExplorerOverview;
    }
    if (response.data?.data && typeof response.data.data === 'object' && 'tvl' in response.data.data) {
      // Nested structure: { data: { data: ExplorerOverview } }
      return response.data.data as unknown as ExplorerOverview;
    }
    return null;
  } catch (error) {
    console.error("[getExplorerOverview] Error fetching overview:", error);
    return null;
  }
}

/**
 * Get address information (convenience function)
 * Uses explorerApi.getAddress() which calls /api/explorer/addresses/[address]
 *
 * @param address - Address to lookup
 * @param includeTransactions - Whether to include transactions (default: true)
 * @param transactionLimit - Max transactions per chain (default: 10)
 * @returns Promise resolving to address data
 */
export async function getExplorerAddress(
  address: string,
  includeTransactions: boolean = true,
  transactionLimit: number = 10
): Promise<AddressResponse | null> {
  try {
    const response = await explorerApi.getAddress(address, {
      include_transactions: includeTransactions,
      transaction_limit: transactionLimit,
    });
    return response.data as AddressResponse;
  } catch (error) {
    console.error("[getExplorerAddress] Error fetching address:", error);
    return null;
  }
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * React Query hook for fetching explorer transactions
 * Uses /api/explorer/transactions endpoint
 * 
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns UseQueryResult with transactions data
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error } = useExplorerTransactions({
 *   chain_id: 1,
 *   limit: 20
 * });
 * ```
 */
export function useExplorerTransactions(
  params?: GetExplorerTransactionsParams,
  options?: Omit<UseQueryOptions<Transaction[], Error>, "queryKey" | "queryFn">
): UseQueryResult<Transaction[], Error> {
  return useQuery({
    queryKey: ["explorer", "transactions", params],
    queryFn: () => getExplorerTransactions(params),
    staleTime: 10000, // 10 seconds
    ...options,
  });
}

/**
 * React Query hook for fetching a single transaction
 * Uses /api/explorer/transactions/[hash] endpoint
 * 
 * @param hash - Transaction hash
 * @param chainId - Optional chain ID
 * @param options - React Query options
 * @returns UseQueryResult with transaction data
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useExplorerTransaction("0xabc123...");
 * ```
 */
export function useExplorerTransaction(
  hash: string,
  chainId?: number,
  options?: Omit<UseQueryOptions<Transaction, Error>, "queryKey" | "queryFn">
): UseQueryResult<Transaction, Error> {
  return useQuery({
    queryKey: ["explorer", "transaction", hash, chainId],
    queryFn: () => getExplorerTransaction(hash, chainId),
    enabled: !!hash,
    staleTime: 30000, // 30 seconds
    ...options,
  });
}

/**
 * React Query hook for fetching explorer blocks
 * Uses /api/explorer/blocks endpoint
 * 
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 * @returns UseQueryResult with blocks data
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useExplorerBlocks({ chain_id: 1, limit: 10 });
 * ```
 */
export function useExplorerBlocks(
  params?: GetExplorerBlocksParams,
  options?: Omit<UseQueryOptions<Block[], Error>, "queryKey" | "queryFn">
): UseQueryResult<Block[], Error> {
  return useQuery({
    queryKey: ["explorer", "blocks", params],
    queryFn: () => getExplorerBlocks(params),
    staleTime: 10000, // 10 seconds
    ...options,
  });
}

/**
 * React Query hook for fetching a single block
 * Uses /api/explorer/blocks/[height] endpoint
 * 
 * @param height - Block height
 * @param chainId - Optional chain ID
 * @param options - React Query options
 * @returns UseQueryResult with block data
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useExplorerBlock(12345);
 * ```
 */
export function useExplorerBlock(
  height: number,
  chainId?: number,
  options?: Omit<UseQueryOptions<Block, Error>, "queryKey" | "queryFn">
): UseQueryResult<Block, Error> {
  return useQuery({
    queryKey: ["explorer", "block", height, chainId],
    queryFn: () => getExplorerBlock(height, chainId),
    enabled: !!height,
    staleTime: 30000, // 30 seconds
    ...options,
  });
}

/**
 * React Query hook for fetching network overview
 * Uses /api/explorer/overview endpoint
 * 
 * @param options - React Query options
 * @returns UseQueryResult with overview data
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useExplorerOverview();
 * ```
 */
export function useExplorerOverview(
  options?: Omit<UseQueryOptions<ExplorerOverview | null, Error>, "queryKey" | "queryFn">
): UseQueryResult<ExplorerOverview | null, Error> {
  return useQuery({
    queryKey: ["explorer", "overview"],
    queryFn: getExplorerOverview,
    staleTime: 30000, // 30 seconds
    ...options,
  });
}

/**
 * React Query hook for fetching trending chains
 * Uses /api/explorer/trending endpoint
 * 
 * @param params - Query parameters for pagination/filtering
 * @param options - React Query options
 * @returns UseQueryResult with trending chains data
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useExplorerTrendingChains({ limit: 10 });
 * ```
 */
export function useExplorerTrendingChains(
  params?: { limit?: number },
  options?: Omit<UseQueryOptions<ExplorerTrendingChain[], Error>, "queryKey" | "queryFn">
): UseQueryResult<ExplorerTrendingChain[], Error> {
  return useQuery({
    queryKey: ["explorer", "trending", params],
    queryFn: () => getExplorerTrendingChains(params),
    staleTime: 30000, // 30 seconds
    ...options,
  });
}

/**
 * React Query hook for fetching address information
 * Uses /api/explorer/addresses/[address] endpoint
 * 
 * @param address - Address to lookup
 * @param includeTransactions - Whether to include transactions (default: true)
 * @param transactionLimit - Max transactions per chain (default: 10)
 * @param options - React Query options
 * @returns UseQueryResult with address data
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useExplorerAddress("0x1234...", true, 20);
 * ```
 */
export function useExplorerAddress(
  address: string,
  includeTransactions: boolean = true,
  transactionLimit: number = 10,
  options?: Omit<UseQueryOptions<AddressResponse | null, Error>, "queryKey" | "queryFn">
): UseQueryResult<AddressResponse | null, Error> {
  return useQuery({
    queryKey: ["explorer", "address", address, includeTransactions, transactionLimit],
    queryFn: () => getExplorerAddress(address, includeTransactions, transactionLimit),
    enabled: !!address,
    staleTime: 30000, // 30 seconds
    ...options,
  });
}

/**
 * React Query hook for searching explorer entities
 * Uses /api/explorer/search endpoint
 * 
 * @param query - Search query string
 * @param options - React Query options
 * @returns UseQueryResult with search results
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useExplorerSearch("0xabc123");
 * ```
 */
export function useExplorerSearch(
  query: string,
  options?: Omit<UseQueryOptions<ExplorerSearchResult[], Error>, "queryKey" | "queryFn">
): UseQueryResult<ExplorerSearchResult[], Error> {
  return useQuery({
    queryKey: ["explorer", "search", query],
    queryFn: () => searchExplorerEntities(query),
    enabled: !!query && query.trim().length > 0,
    staleTime: 60000, // 1 minute
    ...options,
  });
}
