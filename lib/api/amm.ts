/**
 * AMM (Automated Market Maker) API endpoints
 *
 * Provides methods for DEX liquidity operations including deposits and withdrawals
 * Base URL: http://localhost:3001
 * API Prefix: /api/v1/amm
 */

import { apiClient } from "./client";
import {
  DepositLiquidityRequest,
  DepositLiquidityResponse,
} from "@/types/wallet";

/**
 * AMM API methods
 */
export const ammApi = {
  /**
   * Deposit liquidity into a DEX pool (committee)
   * POST /api/v1/amm/deposit
   *
   * Creates a one-sided liquidity deposit transaction on the Canopy blockchain.
   * The transaction is submitted immediately and returns a pending status.
   *
   * @param data - Deposit request data
   * @returns Transaction response with hash and status
   *
   * @example
   * ```typescript
   * const response = await ammApi.depositLiquidity({
   *   wallet_id: "550e8400-e29b-41d4-a716-446655443001",
   *   amount: "1000000", // 1 token in microunits (1e6)
   *   committee_id: 2,
   *   password: "wallet-password",
   *   memo: "Adding liquidity to DeFi Hub"
   * });
   * ```
   */
  depositLiquidity: async (
    data: DepositLiquidityRequest
  ): Promise<DepositLiquidityResponse> => {
    const response = await apiClient.post<DepositLiquidityResponse>(
      "/api/v1/amm/deposit",
      data
    );
    return response.data;
  },
};
