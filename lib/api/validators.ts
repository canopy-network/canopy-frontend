/**
 * Validators API endpoints
 *
 * Provides methods to interact with validator backend endpoints
 */

import { apiClient } from "./client";

/**
 * Validator data structure from API
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
};
