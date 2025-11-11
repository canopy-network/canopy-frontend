/**
 * @fileoverview Chains API client
 *
 * This module provides type-safe methods for interacting with the chains API endpoints.
 * All methods return properly typed responses and handle errors gracefully.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { apiClient } from "./client";
import {
  Chain,
  CreateChainRequest,
  GetChainsParams,
  GetTransactionsParams,
  VirtualPool,
  Transaction,
  CreateAssetRequest,
  ChainHolder,
  GetHoldersParams,
  Accolade,
} from "@/types/chains";
import { PaginatedResponse } from "@/types/api";

// ============================================================================
// CHAINS API
// ============================================================================

/**
 * Chains API client
 */
export const chainsApi = {
  /**
   * Get all chains with optional filtering and pagination
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to chains data
   *
   * @example
   * ```typescript
   * // Get all chains
   * const chains = await chainsApi.getChains();
   *
   * // Get chains with filters
   * const activeChains = await chainsApi.getChains({
   *   status: 'virtual_active',
   *   include: 'template,creator',
   *   page: 1,
   *   limit: 20
   * });
   * ```
   */
  getChains: (params?: GetChainsParams) =>
    apiClient.get<Chain[]>("/api/v1/chains", params),

  /**
   * Get a single chain by ID
   *
   * @param id - Chain ID
   * @param params - Optional query parameters (e.g., include)
   * @returns Promise resolving to chain data with all related data when include params are provided
   *
   * @example
   * ```typescript
   * // Get chain by ID
   * const chain = await chainsApi.getChain('chain-id');
   *
   * // Get chain with all related data (optimized for detail pages)
   * const chain = await chainsApi.getChain('chain-id', {
   *   include: 'creator,template,assets,graduation,repository,social_links,graduated_pool,virtual_pool'
   * });
   * ```
   */
  getChain: (id: string, params?: { include?: string }) =>
    apiClient.get<Chain>(`/api/v1/chains/${id}`, params),

  /**
   * Create a new chain
   *
   * @param data - Chain creation data
   * @returns Promise resolving to created chain data
   *
   * @example
   * ```typescript
   * const newChain = await chainsApi.createChain({
   *   token_name: 'My DeFi Chain',
   *   token_symbol: 'DEFI',
   *   chain_description: 'A revolutionary DeFi protocol',
   *   template_id: 'template-id'
   * });
   * ```
   */
  createChain: (data: CreateChainRequest) =>
    apiClient.post<Chain>("/api/v1/chains", data),

  /**
   * Delete a chain (only allowed in draft status)
   *
   * @param id - Chain ID to delete
   * @returns Promise resolving to deletion confirmation
   *
   * @example
   * ```typescript
   * await chainsApi.deleteChain('chain-id');
   * ```
   */
  deleteChain: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/v1/chains/${id}`),

  /**
   * Create chain repository configuration
   *
   * @param chainId - Chain ID
   * @param data - Repository creation data
   * @returns Promise resolving to created repository data
   *
   * @example
   * ```typescript
   * const repo = await chainsApi.createRepository('chain-id', {
   *   github_url: 'https://github.com/user/repo',
   *   repository_name: 'repo',
   *   repository_owner: 'user',
   *   default_branch: 'main'
   * });
   * ```
   */
  createRepository: (
    chainId: string,
    data: {
      github_url: string;
      repository_name: string;
      repository_owner: string;
      default_branch: string;
    }
  ) => apiClient.post<any>(`/api/v1/chains/${chainId}/repository`, data),

  /**
   * Update chain repository configuration
   *
   * @param chainId - Chain ID
   * @param data - Repository update data
   * @returns Promise resolving to updated repository data
   *
   * @example
   * ```typescript
   * const repo = await chainsApi.updateRepository('chain-id', {
   *   github_url: 'https://github.com/user/repo',
   *   repository_name: 'repo',
   *   repository_owner: 'user',
   *   default_branch: 'main'
   * });
   * ```
   */
  updateRepository: (
    chainId: string,
    data: {
      github_url?: string;
      repository_name?: string;
      repository_owner?: string;
      default_branch?: string;
    }
  ) => apiClient.put<any>(`/api/v1/chains/${chainId}/repository`, data),

  /**
   * Get all assets for a chain
   *
   * @param chainId - Chain ID
   * @returns Promise resolving to chain assets
   *
   * @example
   * ```typescript
   * const assets = await chainsApi.getChainAssets('chain-id');
   * ```
   */
  getChainAssets: (chainId: string) =>
    apiClient.get<import("@/types/chains").ChainAsset[]>(
      `/api/v1/chains/${chainId}/assets`
    ),

  /**
   * Create an asset for a chain (logo, banner, screenshot, etc.)
   *
   * @param chainId - Chain ID to add the asset to
   * @param data - Asset creation data
   * @returns Promise resolving to created asset data
   *
   * @example
   * ```typescript
   * const asset = await chainsApi.createAsset('chain-id', {
   *   asset_type: 'logo',
   *   file_name: 'logo.png',
   *   file_url: 'https://s3.amazonaws.com/...',
   *   is_primary: true
   * });
   * ```
   */
  createAsset: (chainId: string, data: CreateAssetRequest) =>
    apiClient.post<any>(`/api/v1/chains/${chainId}/assets`, data),

  /**
   * Update an existing chain asset
   *
   * @param chainId - Chain ID
   * @param assetId - Asset ID to update
   * @param data - Updated asset data
   * @returns Promise resolving to updated asset data
   *
   * @example
   * ```typescript
   * const asset = await chainsApi.updateAsset('chain-id', 'asset-id', {
   *   file_url: 'https://s3.amazonaws.com/new-logo.png',
   *   is_primary: true
   * });
   * ```
   */
  updateAsset: (
    chainId: string,
    assetId: string,
    data: Partial<CreateAssetRequest>
  ) => apiClient.put<any>(`/api/v1/chains/${chainId}/assets/${assetId}`, data),

  /**
   * Create a social link for a chain
   *
   * @param chainId - Chain ID
   * @param data - Social link data
   * @returns Promise resolving to created social link data
   *
   * @example
   * ```typescript
   * const social = await chainsApi.createSocial('chain-id', {
   *   platform: 'twitter',
   *   url: 'https://twitter.com/mychain',
   *   display_name: '@mychain',
   *   display_order: 0
   * });
   * ```
   */
  createSocial: (
    chainId: string,
    data: {
      platform: string;
      url: string;
      display_name?: string;
      display_order?: number;
    }
  ) => apiClient.post<any>(`/api/v1/chains/${chainId}/socials`, data),

  /**
   * Get accolades for a chain
   *
   * @param chainId - Chain ID
   * @returns Promise resolving to accolades data
   *
   * @example
   * ```typescript
   * const accolades = await chainsApi.getAccolades('chain-id');
   * ```
   */
  getAccolades: (chainId: string) =>
    apiClient.get<Accolade[]>(`/api/v1/chains/${chainId}/accolades`),
};

// ============================================================================
// VIRTUAL POOLS API
// ============================================================================

/**
 * Virtual pools API client
 */
export const virtualPoolsApi = {
  /**
   * Get virtual pool data for a chain
   *
   * @param chainId - Chain ID
   * @returns Promise resolving to virtual pool data
   *
   * @example
   * ```typescript
   * const pool = await virtualPoolsApi.getVirtualPool('chain-id');
   * console.log(`Current price: ${pool.data.current_price_cnpy} CNPY`);
   * ```
   */
  getVirtualPool: (chainId: string) =>
    apiClient.get<VirtualPool>(`/api/v1/virtual-pools/${chainId}`),

  /**
   * Get transaction history for a chain's virtual pool
   *
   * @param chainId - Chain ID
   * @param params - Query parameters for filtering transactions
   * @returns Promise resolving to transactions data
   *
   * @example
   * ```typescript
   * // Get all transactions
   * const transactions = await virtualPoolsApi.getTransactions('chain-id');
   *
   * // Get buy transactions only
   * const buyTransactions = await virtualPoolsApi.getTransactions('chain-id', {
   *   transaction_type: 'buy',
   *   page: 1,
   *   limit: 50
   * });
   * ```
   */
  getTransactions: (chainId: string, params?: GetTransactionsParams) =>
    apiClient.get<Transaction[]>(
      `/api/v1/chains/${chainId}/transactions`,
      params
    ),
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get chains with template information included
 * Note: API returns all related data by default
 *
 * @param params - Query parameters
 * @returns Promise resolving to chains with template data
 */
export async function getChainsWithTemplates(params?: GetChainsParams) {
  return chainsApi.getChains(params);
}

/**
 * Get chains with creator information included
 * Note: API returns all related data by default
 *
 * @param params - Query parameters
 * @returns Promise resolving to chains with creator data
 */
export async function getChainsWithCreators(params?: GetChainsParams) {
  return chainsApi.getChains(params);
}

/**
 * Get chains with both template and creator information
 * Note: API returns all related data by default
 *
 * @param params - Query parameters
 * @returns Promise resolving to chains with full related data
 */
export async function getChainsWithRelations(params?: GetChainsParams) {
  return chainsApi.getChains(params);
}

/**
 * Get active chains (virtual_active status)
 *
 * @param params - Additional query parameters
 * @returns Promise resolving to active chains
 */
export async function getActiveChains(
  params?: Omit<GetChainsParams, "status">
) {
  return chainsApi.getChains({
    ...params,
    status: "virtual_active",
  });
}

/**
 * Get graduated chains
 *
 * @param params - Additional query parameters
 * @returns Promise resolving to graduated chains
 */
export async function getGraduatedChains(
  params?: Omit<GetChainsParams, "status">
) {
  return chainsApi.getChains({
    ...params,
    status: "graduated",
  });
}

/**
 * Get chains by creator
 *
 * @param creatorId - Creator user ID
 * @param params - Additional query parameters
 * @returns Promise resolving to creator's chains
 */
export async function getChainsByCreator(
  creatorId: string,
  params?: Omit<GetChainsParams, "creator">
) {
  return chainsApi.getChains({
    ...params,
    creator: creatorId,
  });
}

/**
 * Get chains by template
 *
 * @param templateId - Template ID
 * @param params - Additional query parameters
 * @returns Promise resolving to chains using the template
 */
export async function getChainsByTemplate(
  templateId: string,
  params?: Omit<GetChainsParams, "template_id">
) {
  return chainsApi.getChains({
    ...params,
    template_id: templateId,
  });
}

/**
 * Get holders for a specific chain
 *
 * @param chainId - Chain ID
 * @param params - Optional pagination parameters
 * @returns Promise resolving to paginated holders data
 *
 * @example
 * ```typescript
 * // Get first page of holders
 * const holders = await getChainHolders('chain-id');
 *
 * // Get specific page
 * const holdersPage2 = await getChainHolders('chain-id', { page: 2, limit: 20 });
 * ```
 */
export async function getChainHolders(
  chainId: string,
  params?: GetHoldersParams
) {
  return apiClient.get<{
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    data: ChainHolder[];
  }>(`/api/v1/chains/${chainId}/holders`, params);
}
