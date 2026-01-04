/**
 * Portfolio API endpoints
 *
 * Provides methods to interact with portfolio backend endpoints
 * Based on: https://github.com/canopy-network/launchpad/blob/main/internal/handlers/portfolio.go
 */

import { apiClient } from "./client";
import {
  PortfolioOverviewRequest,
  PortfolioOverviewResponse,
  AccountBalancesRequest,
  AccountBalancesResponse,
  PortfolioPerformanceRequest,
  PortfolioPerformanceResponse,
  AssetAllocationRequest,
  AssetAllocationResponse,
  MultiChainBalanceRequest,
  MultiChainBalanceResponse,
} from "@/types/wallet";

/**
 * Portfolio API methods
 */
export const portfolioApi = {
  /**
   * Get portfolio overview
   * POST /api/v1/wallet/portfolio/overview
   *
   * @param data - Portfolio overview request
   * @returns Portfolio overview with balances, allocation, and performance
   */
  getPortfolioOverview: async (
    data: PortfolioOverviewRequest
  ): Promise<PortfolioOverviewResponse> => {
    const response = await apiClient.post<PortfolioOverviewResponse>(
      "/api/v1/wallet/portfolio/overview/",
      data
    );
    return response.data;
  },

  /**
   * Get account balances
   * POST /api/v1/wallet/portfolio/balances
   *
   * @param data - Account balances request
   * @returns Detailed balance information for each account
   */
  getAccountBalances: async (
    data: AccountBalancesRequest
  ): Promise<AccountBalancesResponse> => {
    const response = await apiClient.post<AccountBalancesResponse>(
      "/api/v1/wallet/portfolio/balances",
      data
    );
    return response.data;
  },

  /**
   * Get portfolio performance
   * POST /api/v1/wallet/portfolio/performance
   *
   * @param data - Portfolio performance request
   * @returns Performance metrics with P&L and time series data
   */
  getPortfolioPerformance: async (
    data: PortfolioPerformanceRequest
  ): Promise<PortfolioPerformanceResponse> => {
    const response = await apiClient.post<PortfolioPerformanceResponse>(
      "/api/v1/wallet/portfolio/performance",
      data
    );
    return response.data;
  },

  /**
   * Get asset allocation
   * POST /api/v1/wallet/portfolio/allocation
   *
   * @param data - Asset allocation request
   * @returns Asset allocation breakdown by specified dimensions
   */
  getAssetAllocation: async (
    data: AssetAllocationRequest
  ): Promise<AssetAllocationResponse> => {
    const response = await apiClient.post<AssetAllocationResponse>(
      "/api/v1/wallet/portfolio/allocation",
      data
    );
    return response.data;
  },

  /**
   * Get multi-chain balance
   * POST /api/v1/wallet/portfolio/chains
   *
   * @param data - Multi-chain balance request
   * @returns Balance information across multiple chains
   */
  getMultiChainBalance: async (
    data: MultiChainBalanceRequest
  ): Promise<MultiChainBalanceResponse> => {
    const response = await apiClient.post<MultiChainBalanceResponse>(
      "/api/v1/wallet/portfolio/chains",
      data
    );
    return response.data;
  },
};
