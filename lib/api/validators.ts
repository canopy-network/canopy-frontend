/**
 * Validators API endpoints with React Query hooks
 *
 * Provides methods to interact with validator backend endpoints.
 * Includes React Query hooks for data fetching with caching and automatic refetching.
 */

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "./client";

/**
 * Validator data structure from API (list endpoint)
 */
export interface ValidatorData {
  address: string;
  public_key: string;
  chain_id: number;
  chain_name: string;
  staked_amount: string; // In micro units (e.g., "1000000000")
  staked_cnpy: string; // Formatted (e.g., "1,000")
  staked_usd?: string; // Formatted USD value (e.g., "1,000.00")
  rewards?: string; // Rewards in micro units
  rewards_cnpy?: string; // Formatted rewards in CNPY (e.g., "109,074")
  reward_count?: number; // Number of reward events (can be used as blocks approximation)
  status: "active" | "unstaking" | "paused";
  delegate: boolean;
  compound: boolean;
  voting_power: string; // Percentage (e.g., "100.00")
  apy?: number; // Annual percentage yield from backend
  uptime?: number;
  missed_blocks?: number | null;
  committees: number[] | null;
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Cross-chain validator stake info
 */
export interface CrossChainStake {
  chain_id: number;
  net_address?: string; // TCP address
  staked_amount: number; // In micro units
  staked_cnpy?: string; // Formatted CNPY value
  staked_usd?: string; // Formatted USD value
  output?: string; // Output address
  status: "active" | "unstaking" | "paused";
  committees: number[] | null;
  max_paused_height?: number;
  unstaking_height?: number;
  delegate?: boolean;
  compound?: boolean;
  apy?: number;
  rewards?: string; // Rewards in micro units
  rewards_cnpy?: string; // Formatted rewards in CNPY
  reward_count?: number; // Number of reward events
  updated_at: string;
}

/**
 * Slashing history information
 */
export interface SlashingHistory {
  evidence_count: number;
  first_evidence_height?: number;
  last_evidence_height?: number;
  height: number;
  updated_at: string;
}

/**
 * Detailed validator data structure from API (single validator endpoint)
 */
export interface ValidatorDetailData {
  address: string;
  public_key: string;
  apy?: number;
  rewards?: string; // Total rewards in micro units
  rewards_cnpy?: string; // Total rewards formatted in CNPY
  reward_count?: number; // Total number of reward events
  commission_rate?: number | null; // Commission rate percentage
  commission_rate_history?: any | null; // Commission rate history
  validator_url?: string; // Validator website URL
  github_url?: string; // GitHub URL
  performance?: any | null; // Performance data
  slashing_history: SlashingHistory;
  cross_chain: CrossChainStake[];
  updated_at: string;
}

/**
 * Validators API response wrapper
 */
export interface ValidatorsResponseWrapper {
  data: {
    validators: ValidatorData[];
    metadata: {
      total: number;
      has_more: boolean;
      limit: number;
      offset: number;
      chain_stats?: any;
    };
  };
  pagination: any;
}

/**
 * Validators API response (unwrapped)
 */
export interface ValidatorsResponse {
  validators: ValidatorData[];
  metadata: {
    total: number;
    has_more: boolean;
    limit: number;
    offset: number;
  };
}

/**
 * Single validator API response
 */
export interface ValidatorDetailResponse {
  data: ValidatorDetailData;
}

/**
 * Validators API query parameters
 */
export interface ValidatorsRequest {
  chain_id?: number;
  status?: "active" | "unstaking" | "paused";
  delegate?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Validators API methods
 * Uses /api/v1/validators/* endpoints as per documentation
 */
export const validatorsApi = {
  /**
   * Get all validators
   * GET /api/v1/validators
   *
   * @param params - Query parameters for filtering validators
   * @returns List of validators with metadata
   */
  getValidators: async (
    params?: ValidatorsRequest
  ): Promise<ValidatorsResponse> => {
    const response = await apiClient.get<ValidatorsResponseWrapper>(
      "/validators",
      params
    );
    // API returns: { data: { validators, metadata }, pagination }
    // apiClient.get returns: { data: ValidatorsResponseWrapper, pagination }
    // So response.data is ValidatorsResponseWrapper which has { data: { validators, metadata }, pagination }
    const responseData = response.data as any;
    if (responseData?.data?.validators) {
      return {
        validators: responseData.data.validators,
        metadata: responseData.data.metadata,
      };
    }
    // Fallback: if structure is different, try direct access
    if (responseData?.validators) {
      return {
        validators: responseData.validators,
        metadata: responseData.metadata || {
          total: responseData.validators.length,
          has_more: false,
          limit: params?.limit || 50,
          offset: params?.offset || 0,
        },
      };
    }
    // Last fallback
    return {
      validators: [],
      metadata: {
        total: 0,
        has_more: false,
        limit: params?.limit || 50,
        offset: params?.offset || 0,
      },
    };
  },

  /**
   * Get a single validator by address
   * GET /api/v1/validators/{address}
   *
   * @param address - Validator address
   * @returns Detailed validator information
   */
  getValidator: async (address: string): Promise<ValidatorDetailData> => {
    const response = await apiClient.get<ValidatorDetailResponse>(
      `/validators/${address}`
    );
    // API response structure: { data: { data: ValidatorDetailData } }
    const responseData = response.data as unknown as ValidatorDetailResponse | ValidatorDetailData;
    if (responseData && typeof responseData === "object" && "data" in responseData) {
      return (responseData as ValidatorDetailResponse).data;
    }
    return responseData as ValidatorDetailData;
  },

  /**
   * Export validator data
   * GET /api/v1/validators/{address}/export
   *
   * @param address - Validator address
   * @param format - Export format: "json" or "csv" (default: "json")
   * @returns Validator data in requested format
   */
  exportValidatorData: async (
    address: string,
    format: "json" | "csv" = "json"
  ): Promise<ValidatorDetailData | string> => {
    const response = await apiClient.get<ValidatorDetailResponse | string>(
      `/validators/${address}/export`,
      { format }
    );
    return response.data as ValidatorDetailData | string;
  },
};

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * React Query hook for fetching validators list
 * 
 * @param params - Query parameters for filtering validators
 * @param options - React Query options
 * @returns UseQueryResult with validators data
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error } = useValidators({
 *   status: "active",
 *   limit: 50
 * });
 * ```
 */
export function useValidators(
  params?: ValidatorsRequest,
  options?: Omit<UseQueryOptions<ValidatorsResponse, Error>, "queryKey" | "queryFn">
): UseQueryResult<ValidatorsResponse, Error> {
  return useQuery({
    queryKey: ["validators", "list", params],
    queryFn: () => validatorsApi.getValidators(params),
    staleTime: 30000, // 30 seconds
    ...options,
  });
}

/**
 * React Query hook for fetching a single validator detail
 * 
 * @param address - Validator address
 * @param options - React Query options
 * @returns UseQueryResult with validator detail data
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useValidator("validator_address_123");
 * ```
 */
export function useValidator(
  address: string,
  options?: Omit<UseQueryOptions<ValidatorDetailData, Error>, "queryKey" | "queryFn">
): UseQueryResult<ValidatorDetailData, Error> {
  return useQuery({
    queryKey: ["validators", "detail", address],
    queryFn: () => validatorsApi.getValidator(address),
    enabled: !!address,
    staleTime: 30000, // 30 seconds
    ...options,
  });
}

/**
 * React Query hook for exporting validator data
 * Uses /api/validators/[address]/export endpoint
 * 
 * @param address - Validator address
 * @param format - Export format: "json" or "csv" (default: "json")
 * @param options - React Query options
 * @returns UseQueryResult with exported validator data
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useValidatorExport("validator_address_123", "csv");
 * ```
 */
export function useValidatorExport(
  address: string,
  format: "json" | "csv" = "json",
  options?: Omit<UseQueryOptions<ValidatorDetailData | string, Error>, "queryKey" | "queryFn">
): UseQueryResult<ValidatorDetailData | string, Error> {
  return useQuery({
    queryKey: ["validators", "export", address, format],
    queryFn: () => validatorsApi.exportValidatorData(address, format),
    enabled: !!address,
    staleTime: 60000, // 1 minute
    ...options,
  });
}
