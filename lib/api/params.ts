/**
 * @fileoverview Blockchain Parameters API
 *
 * API module for fetching blockchain configuration parameters.
 * These parameters are read directly from the blockchain via RPC.
 *
 * Endpoints:
 * - GET /api/v1/params/fee - Fee parameters
 * - GET /api/v1/params/governance - Governance parameters
 * - GET /api/v1/params/consensus - Consensus parameters
 * - GET /api/v1/params/validator - Validator parameters
 */

import { apiClient } from "./client";
import type { FeeParams } from "@/types/params";

export interface GetParamsOptions {
  /** Block height to query (default: latest) */
  height?: number;
}

/**
 * Blockchain parameters API
 */
export const paramsApi = {
  /**
   * Get fee parameters from the blockchain
   *
   * Returns all transaction fee amounts in uCNPY (micro units)
   *
   * @param options - Optional query parameters
   * @returns Promise resolving to fee parameters
   *
   * @example
   * ```typescript
   * const response = await paramsApi.getFeeParams();
   * console.log('Send fee:', response.data.sendFee);
   * console.log('Create order fee:', response.data.createOrderFee);
   * ```
   */
  getFeeParams: (options?: GetParamsOptions) =>
    apiClient.get<FeeParams>(
      "/api/v1/params/fee",
      options?.height ? { height: options.height } : undefined
    ),
};
