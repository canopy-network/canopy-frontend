/**
 * @fileoverview Transactions API Client
 *
 * This file contains API functions for fetching chain transactions.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { apiClient } from "./client";
import type { PaginatedResponse } from "@/types/api";
import {
  SendRawTransactionRequest,
  SendRawTransactionResponse,
  EstimateFeeRequest,
  EstimateFeeResponse,
  TransactionHistoryRequest,
  TransactionHistoryResponse,
  PendingTransactionsRequest,
  PendingTransactionsResponse,
  TransactionDetail,
  TransactionStatusResponse,
  BatchStatusRequest,
  BatchStatusResponse,
} from "@/types/api";

/**
 * Transaction data from chain API (for chain-specific transactions)
 */
export interface ChainTransaction {
  id: string;
  virtual_pool_id: string;
  chain_id: string;
  user_id: string;
  transaction_type: "buy" | "sell";
  cnpy_amount: number;
  token_amount: number;
  price_per_token_cnpy: number;
  trading_fee_cnpy: number;
  slippage_percent: number;
  transaction_hash: string | null;
  block_height: number | null;
  gas_used: number | null;
  pool_cnpy_reserve_after: number;
  pool_token_reserve_after: number;
  market_cap_after_usd: number;
  created_at: string;
}

/**
 * Parameters for fetching chain transactions
 */
export interface GetTransactionsParams {
  page?: number;
  limit?: number;
}

/**
 * Fetches transactions for a specific chain
 * @param chainId - The chain ID
 * @param params - Query parameters (page, limit)
 * @returns Promise with paginated transaction data
 */
export async function getChainTransactions(
  chainId: string,
  params?: GetTransactionsParams
): Promise<PaginatedResponse<ChainTransaction>> {
  const url = `/api/v1/chains/${chainId}/transactions`;
  const response: any = await apiClient.get<any>(url, params);

  if (response.data && Array.isArray(response.data.data)) {
    return response.data as PaginatedResponse<ChainTransaction>;
  } else if (Array.isArray(response.data)) {
    return response as PaginatedResponse<ChainTransaction>;
  }

  return response as PaginatedResponse<ChainTransaction>;
}

/**
 * Wallet Transactions API methods
 * Based on: launchpad/internal/handlers/transactions.go
 */
export const transactionsApi = {
  /**
   * Send a pre-signed transaction
   * POST /api/v1/wallet/transactions/send-raw
   *
   * @param data - Raw transaction data with signature
   * @returns Transaction hash and status
   */
  sendRawTransaction: async (
    data: SendRawTransactionRequest
  ): Promise<SendRawTransactionResponse> => {
    const response = await apiClient.post<SendRawTransactionResponse>(
      "/api/v1/wallet/transactions/send-raw",
      data
    );
    return response.data;
  },

  /**
   * Estimate transaction fee
   * POST /api/v1/wallet/transactions/estimate-fee
   *
   * @param data - Transaction details for fee estimation
   * @returns Estimated fee amount
   */
  estimateFee: async (
    data: EstimateFeeRequest
  ): Promise<EstimateFeeResponse> => {
    const response = await apiClient.post<EstimateFeeResponse>(
      "/api/v1/wallet/transactions/estimate-fee",
      data
    );
    return response.data;
  },

  /**
   * Get transaction history
   * GET /api/v1/wallet/transactions/history
   *
   * @param data - Filter parameters for transaction history
   * @returns Paginated list of transactions
   */
  getHistory: async (
    data: TransactionHistoryRequest
  ): Promise<TransactionHistoryResponse> => {
    const params: Record<string, any> = {};

    // Convert TransactionHistoryRequest to query parameters
    if (data.addresses && data.addresses.length > 0) {
      params.addresses = data.addresses.join(',');
    }
    if (data.chain_ids && data.chain_ids.length > 0) {
      params.chain_ids = data.chain_ids.join(',');
    }
    if (data.transaction_types && data.transaction_types.length > 0) {
      params.transaction_types = data.transaction_types.join(',');
    }
    if (data.start_date) {
      params.start_date = data.start_date;
    }
    if (data.end_date) {
      params.end_date = data.end_date;
    }
    if (data.page) {
      params.page = data.page;
    }
    if (data.limit) {
      params.limit = data.limit;
    }
    if (data.sort) {
      params.sort = data.sort;
    }

    const response = await apiClient.get<TransactionHistoryResponse>(
      "/api/v1/wallet/transactions/history",
      params
    );
    return response.data;
  },

  /**
   * Get pending transactions
   * GET /api/v1/wallet/transactions/pending
   *
   * @param data - Request with addresses to check
   * @returns List of pending transactions
   */
  getPending: async (
    data: PendingTransactionsRequest
  ): Promise<PendingTransactionsResponse> => {
    const params: Record<string, any> = {};

    // Convert PendingTransactionsRequest to query parameters
    if (data.addresses && data.addresses.length > 0) {
      params.addresses = data.addresses.join(',');
    }
    if (data.chain_ids && data.chain_ids.length > 0) {
      params.chain_ids = data.chain_ids.join(',');
    }

    const response = await apiClient.get<PendingTransactionsResponse>(
      "/api/v1/wallet/transactions/pending",
      params
    );
    return response.data;
  },

  /**
   * Get transaction details
   * GET /api/v1/wallet/transactions/:hash
   *
   * @param hash - Transaction hash
   * @param chainId - Chain ID (default: 1)
   * @returns Transaction details
   */
  getDetails: async (
    hash: string,
    chainId: number = 1
  ): Promise<TransactionDetail> => {
    const response = await apiClient.get<TransactionDetail>(
      `/api/v1/wallet/transactions/${hash}`,
      { chain_id: chainId }
    );
    return response.data;
  },

  /**
   * Get transaction status
   * GET /api/v1/wallet/transactions/:hash/status
   *
   * @param hash - Transaction hash
   * @param chainId - Chain ID (default: 1)
   * @returns Transaction status
   */
  getStatus: async (
    hash: string,
    chainId: number = 1
  ): Promise<TransactionStatusResponse> => {
    const response = await apiClient.get<TransactionStatusResponse>(
      `/api/v1/wallet/transactions/${hash}/status`,
      { chain_id: chainId }
    );
    return response.data;
  },

  /**
   * Get batch transaction statuses
   * GET /api/v1/wallet/transactions/batch-status
   *
   * @param data - List of transaction hashes
   * @param chainId - Optional chain ID
   * @returns Batch status response with all statuses
   */
  getBatchStatus: async (
    data: BatchStatusRequest,
    chainId?: number
  ): Promise<BatchStatusResponse> => {
    const params: Record<string, any> = {};

    // Convert BatchStatusRequest to query parameters
    if (data.transaction_hashes && data.transaction_hashes.length > 0) {
      params.hashes = data.transaction_hashes.join(',');
    }
    if (chainId) {
      params.chain_id = chainId;
    }

    const response = await apiClient.get<BatchStatusResponse>(
      "/api/v1/wallet/transactions/batch-status",
      params
    );
    return response.data;
  },
};
