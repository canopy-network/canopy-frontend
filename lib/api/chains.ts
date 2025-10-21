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
} from "@/types/chains";

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
   *   include: ['template', 'creator'],
   *   page: 1,
   *   limit: 20
   * });
   * ```
   */
  getChains: (params?: GetChainsParams) =>
    apiClient.get<Chain[]>("/api/v1/chains", params),

  /**
   * Get a single chain by ID with optional related data
   *
   * @param id - Chain ID
   * @param include - Array of related data to include (template, creator, etc.)
   * @returns Promise resolving to chain data
   *
   * @example
   * ```typescript
   * // Get chain with template and creator info
   * const chain = await chainsApi.getChain('chain-id', ['template', 'creator']);
   * ```
   */
  getChain: (id: string, include?: string[]) =>
    apiClient.get<Chain>(`/api/v1/chains/${id}`, { include }),

  /**
   * Create a new chain
   *
   * @param data - Chain creation data
   * @returns Promise resolving to created chain data
   *
   * @example
   * ```typescript
   * const newChain = await chainsApi.createChain({
   *   chain_name: 'My DeFi Chain',
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
 *
 * @param params - Query parameters
 * @returns Promise resolving to chains with template data
 */
export async function getChainsWithTemplates(params?: GetChainsParams) {
  return chainsApi.getChains({
    ...params,
    include: [...(params?.include || []), "template"],
  });
}

/**
 * Get chains with creator information included
 *
 * @param params - Query parameters
 * @returns Promise resolving to chains with creator data
 */
export async function getChainsWithCreators(params?: GetChainsParams) {
  return chainsApi.getChains({
    ...params,
    include: [...(params?.include || []), "creator"],
  });
}

/**
 * Get chains with both template and creator information
 *
 * @param params - Query parameters
 * @returns Promise resolving to chains with full related data
 */
export async function getChainsWithRelations(params?: GetChainsParams) {
  return chainsApi.getChains({
    ...params,
    include: [...(params?.include || []), "template", "creator"],
  });
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
  params?: Omit<GetChainsParams, "created_by">
) {
  return chainsApi.getChains({
    ...params,
    created_by: creatorId,
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
