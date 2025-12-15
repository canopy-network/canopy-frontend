/**
 * Validators API endpoints
 *
 * Provides methods to interact with validator backend endpoints
 */

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
  status: "active" | "unstaking" | "paused";
  delegate: boolean;
  compound: boolean;
  voting_power: string; // Percentage (e.g., "100.00")
  committees: number[] | null;
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Cross-chain validator stake info
 */
export interface CrossChainStake {
  chain_id: number;
  staked_amount: number; // In micro units
  status: "active" | "unstaking" | "paused";
  committees: number[] | null;
  updated_at: string;
}

/**
 * Slashing history information
 */
export interface SlashingHistory {
  evidence_count: number;
  height: number;
  updated_at: string;
}

/**
 * Detailed validator data structure from API (single validator endpoint)
 */
export interface ValidatorDetailData {
  address: string;
  public_key: string;
  net_address: string; // TCP address
  staked_amount: number; // In micro units
  output: string; // Output address
  committees: number[] | null;
  status: "active" | "unstaking" | "paused";
  delegate: boolean;
  compound: boolean;
  slashing_history: SlashingHistory;
  cross_chain: CrossChainStake[];
  updated_at: string;
}

/**
 * Validators API response
 * Note: apiClient.get already unwraps response.data, so this is the direct structure returned
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
    const response = await apiClient.get<ValidatorsResponse>(
      "/api/v1/validators",
      params
    );
    return response.data;
  },

  /**
   * Get a single validator by address
   * GET /api/v1/validators/:address
   *
   * @param address - Validator address
   * @returns Detailed validator information
   */
  getValidator: async (address: string): Promise<ValidatorDetailData> => {
    const response = await apiClient.get<ValidatorDetailResponse>(
      `/api/v1/validators/${address}`
    );
    return response.data; // API wraps in { data: {...} }
  },
};
