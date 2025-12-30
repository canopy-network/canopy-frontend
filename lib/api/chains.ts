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
import { localApiClient } from "./local-client";
import {
  Chain,
  CreateChainRequest,
  ActivateChainRequest,
  GetChainsParams,
  GetTransactionsParams,
  VirtualPool,
  Transaction,
  CreateAssetRequest,
  ChainHolder,
  GetHoldersParams,
  Accolade,
  ChainHeight,
} from "@/types/chains";

export interface ChainSearchItem {
  id: number;
  ticker: string;
  chain_name: string;
  token_name: string;
  updated_at?: string;
  branding?: string | null;
}

export interface ChainSearchResponse {
  success: boolean;
  chains?: ChainSearchItem[];
  count?: number;
  error?: string;
}

export interface ChainValidationResponse {
  success: boolean;
  available?: boolean;
  field?: string;
  value?: string;
  message?: string;
  error?: string;
}

/**
 * Response from backend /api/v1/chains/validate endpoint
 * Returns availability status for each field provided
 */
export interface ChainValidationResult {
  name_available?: boolean;
  symbol_available?: boolean;
  token_name_available?: boolean;
}

export interface ChainStoreRequest {
  ticker: string;
  chain_name: string;
  token_name?: string;
}

export interface ChainStoreResponse {
  success: boolean;
  message?: string;
  data?: {
    ticker: string;
    chain_name: string;
    token_name: string;
  };
  error?: string;
}

// ============================================================================
// CHAINS API
// ============================================================================

/**
 * Chains API client
 */
export const chainsApi = {
  /**
   * Get all chains with optional filtering and pagination
   */
  getChains: (params?: GetChainsParams) => apiClient.get<Chain[]>("/api/v1/chains", params),

  /**
   * Get a single chain by ID
   */
  getChain: (id: string, params?: { include?: string }) => apiClient.get<Chain>(`/api/v1/chains/${id}`, params),

  /**
   * Create a new chain
   */
  createChain: (data: CreateChainRequest) => apiClient.post<Chain>("/api/v1/chains", data),

  /**
   * Activate a chain after payment verification
   *
   * @param id - Chain ID
   * @param txHash - Transaction hash of the payment
   * @returns Promise resolving to activated chain data
   *
   * @example
   * ```typescript
   * // Activate chain after payment
   * const chain = await chainsApi.activateChain('123', 'abc123def456...');
   * console.log(chain.status); // 'virtual_active'
   * ```
   */
  activateChain: (id: string, txHash: string) =>
    apiClient.patch<Chain>(`/api/v1/chains/${id}`, {
      status: "virtual_active",
      tx_hash: txHash,
    } as ActivateChainRequest),

  /**
   * Activate a chain with status check
   * Returns whether activation is confirmed (200) or pending (202)
   *
   * @param id - Chain ID
   * @param txHash - Transaction hash of the payment
   * @returns Promise resolving to { confirmed: boolean, chain?: Chain }
   */
  activateChainWithStatus: async (id: string, txHash: string): Promise<{ confirmed: boolean; chain?: Chain }> => {
    const axios = apiClient.getAxiosInstance();
    const response = await axios.patch(`/api/v1/chains/${id}`, {
      status: "virtual_active",
      tx_hash: txHash,
    } as ActivateChainRequest);

    return {
      confirmed: response.status === 200,
      chain: response.status === 200 ? response.data?.data : undefined,
    };
  },

  /**
   * Activate a chain after payment verification
   *
   * @param id - Chain ID
   * @param txHash - Transaction hash of the payment
   * @returns Promise resolving to activated chain data
   *
   * @example
   * ```typescript
   * // Activate chain after payment
   * const chain = await chainsApi.activateChain('123', 'abc123def456...');
   * console.log(chain.status); // 'virtual_active'
   * ```
   */
  activateChain: (id: string, txHash: string) =>
    apiClient.patch<Chain>(`/api/v1/chains/${id}`, {
      status: "virtual_active",
      tx_hash: txHash,
    } as ActivateChainRequest),

  /**
   * Activate a chain with status check
   * Returns whether activation is confirmed (200) or pending (202)
   *
   * @param id - Chain ID
   * @param txHash - Transaction hash of the payment
   * @returns Promise resolving to { confirmed: boolean, chain?: Chain }
   */
  activateChainWithStatus: async (id: string, txHash: string): Promise<{ confirmed: boolean; chain?: Chain }> => {
    const axios = apiClient.getAxiosInstance();
    const response = await axios.patch(`/api/v1/chains/${id}`, {
      status: "virtual_active",
      tx_hash: txHash,
    } as ActivateChainRequest);

    return {
      confirmed: response.status === 200,
      chain: response.status === 200 ? response.data?.data : undefined,
    };
  },

  /**
   * Delete a chain (only allowed in draft status)
   */
  deleteChain: (id: string) => apiClient.delete<{ message: string }>(`/api/v1/chains/${id}`),

  /**
   * Update chain data
   */
  updateChain: (chainId: string, data: Partial<Chain>) => apiClient.patch<Chain>(`/api/v1/chains/${chainId}`, data),

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
   */
  getChainAssets: (chainId: string) =>
    apiClient.get<import("@/types/chains").ChainAsset[]>(`/api/v1/chains/${chainId}/assets`),

  /**
   * Create an asset for a chain (logo, banner, screenshot, etc.)
   */
  createAsset: (chainId: string, data: CreateAssetRequest) =>
    apiClient.post<any>(`/api/v1/chains/${chainId}/assets`, data),

  /**
   * Update an existing chain asset
   */
  updateAsset: (chainId: string, assetId: string, data: Partial<CreateAssetRequest>) =>
    apiClient.put<any>(`/api/v1/chains/${chainId}/assets/${assetId}`, data),

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
   */
  getAccolades: (chainId: string) => apiClient.get<Accolade[]>(`/api/v1/chains/${chainId}/accolades`),

  /**
   * Get current block height for a chain
   *
   * @param id - Chain ID
   * @returns Promise resolving to chain height data
   *
   * @example
   * ```typescript
   * const heightData = await chainsApi.getChainHeight('chain-id');
   * console.log(`Current height: ${heightData.data.height}`);
   * ```
   */
  getChainHeight: (id: string) => apiClient.get<ChainHeight>(`/api/v1/chains/${id}/height`),

  /**
   * Validate chain name, token symbol, and token name availability
   *
   * Performs case-insensitive checks against existing chains.
   * At least one parameter must be provided.
   *
   * @param params - Validation parameters
   * @param params.name - Chain name to validate (optional)
   * @param params.symbol - Token symbol/ticker to validate (optional)
   * @param params.token_name - Token name to validate (optional)
   * @returns Promise resolving to validation results for each field
   *
   * @example
   * ```typescript
   * // Validate all fields at once
   * const result = await chainsApi.validateChainNames({
   *   name: 'MyChain',
   *   symbol: 'MYC',
   *   token_name: 'MyToken'
   * });
   *
   * // Check individual availability
   * if (result.data.name_available) {
   *   console.log('Chain name is available!');
   * }
   * if (result.data.symbol_available) {
   *   console.log('Symbol is available!');
   * }
   * if (result.data.token_name_available) {
   *   console.log('Token name is available!');
   * }
   * ```
   */
  validateChainNames: (params: { name?: string; symbol?: string; token_name?: string }) =>
    apiClient.get<ChainValidationResult>("/api/v1/chains/validate", params),
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
  getVirtualPool: (chainId: string) => apiClient.get<VirtualPool>(`/api/v1/virtual-pools/${chainId}`),

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
    apiClient.get<Transaction[]>(`/api/v1/chains/${chainId}/transactions`, params),
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
 * Fetch all chains across pages using provided filters.
 *
 * @param params - Query parameters (status, include, etc.)
 * @returns Promise resolving to the full list of chains
 */
export async function getAllChains(params?: GetChainsParams): Promise<Chain[]> {
  const limit = params?.limit ?? 50;
  let page = params?.page ?? 1;
  let totalPages = 1;
  const chains: Chain[] = [];

  while (page <= totalPages) {
    const response = await chainsApi.getChains({ ...params, page, limit });
    const payload = response?.data;

    let pageData: Chain[] = [];

    if (Array.isArray(payload)) {
      pageData = payload as Chain[];
    } else if (payload && typeof payload === "object" && Array.isArray((payload as any).data)) {
      pageData = (payload as any).data as Chain[];
    }

    chains.push(...pageData);

    const pagination = (response as any).pagination || (payload as any)?.pagination;

    if (pagination?.pages) {
      totalPages = pagination.pages;
    } else if (pageData.length < limit) {
      totalPages = page; // No more pages if fewer results than limit
    }

    page += 1;
  }

  return chains;
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
export async function getActiveChains(params?: Omit<GetChainsParams, "status">) {
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
export async function getGraduatedChains(params?: Omit<GetChainsParams, "status">) {
  return chainsApi.getChains({
    ...params,
    status: "graduated",
  });
}

/**
 * Get all graduated chains across pages
 *
 * @param params - Additional query parameters
 * @returns Promise resolving to all graduated chains
 */
export async function getAllGraduatedChains(params?: Omit<GetChainsParams, "status">): Promise<Chain[]> {
  return getAllChains({
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
export async function getChainsByCreator(creatorId: string, params?: Omit<GetChainsParams, "creator">) {
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
export async function getChainsByTemplate(templateId: string, params?: Omit<GetChainsParams, "template_id">) {
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
export async function getChainHolders(chainId: string, params?: GetHoldersParams) {
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

// ============================================================================
// LOCAL CHAIN ROUTES (NEXT API)
// ============================================================================

export async function searchChains(query: string, signal?: AbortSignal) {
  return localApiClient.getRaw<ChainSearchResponse>("/chains/search", { q: query }, signal ? { signal } : undefined);
}

export async function validateChainField(field: "chain_name" | "token_name" | "ticker", value: string) {
  return localApiClient.getRaw<ChainValidationResponse>("/chains/validate", {
    field,
    value,
  });
}

export async function storeChainListing(payload: ChainStoreRequest) {
  return localApiClient.postRaw<ChainStoreResponse>("/chains/store", payload);
}
