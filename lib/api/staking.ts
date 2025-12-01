/**
 * Staking API endpoints
 *
 * Provides methods to interact with staking backend endpoints
 * Based on: launchpad/internal/handlers/staking.go
 */

import { apiClient } from "./client";
import {
  StakingPositionsRequest,
  StakingPositionsResponse,
  StakingRewardsRequest,
  StakingRewardsResponse,
  UnstakingQueueRequest,
  UnstakingQueueResponse,
} from "@/types/api";

/**
 * Staking API methods
 */
export const stakingApi = {
  /**
   * Get staking positions
   * GET /api/v1/staking/positions
   *
   * @param params - Query parameters for filtering staking positions
   * @returns List of staking positions with metadata
   */
  getPositions: async (
    params?: StakingPositionsRequest
  ): Promise<StakingPositionsResponse> => {
    const response = await apiClient.get<StakingPositionsResponse>(
      "/api/v1/staking/positions",
      params
    );
    return response.data;
  },

  /**
   * Get staking rewards
   * GET /api/v1/staking/rewards
   *
   * @param params - Query parameters for filtering rewards
   * @returns List of validator rewards with totals and metadata
   */
  getRewards: async (
    params?: StakingRewardsRequest
  ): Promise<StakingRewardsResponse> => {
    const response = await apiClient.get<StakingRewardsResponse>(
      "/api/v1/staking/rewards",
      params
    );
    return response.data;
  },

  /**
   * Get unstaking queue
   * GET /api/v1/staking/unstaking
   *
   * @param params - Query parameters for filtering unstaking entries
   * @returns List of unstaking entries with countdown information
   */
  getUnstakingQueue: async (
    params?: UnstakingQueueRequest
  ): Promise<UnstakingQueueResponse> => {
    const response = await apiClient.get<UnstakingQueueResponse>(
      "/api/v1/staking/unstaking",
      params
    );
    return response.data;
  },
};
