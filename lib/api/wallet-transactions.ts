/**
 * Wallet Transaction API endpoints
 *
 * Provides methods to interact with wallet transaction backend endpoints
 * Based on: https://github.com/canopy-network/launchpad/blob/main/internal/handlers/transaction.go
 */

import { apiClient } from "./client";
import {
  SendTransactionRequest,
  SendTransactionResponse,
  EstimateFeeRequest,
  EstimateFeeResponse,
  TransactionHistoryRequest,
  TransactionHistoryResponse,
  TransactionDetail,
  SendRawTransactionRequest,
  SendRawTransactionResponse,
  PendingTransactionsRequest,
  PendingTransactionsResponse,
  BatchStatusRequest,
  BatchStatusResponse,
} from "@/types/wallet";

/**
 * Wallet Transaction API methods
 */
export const walletTransactionApi = {
  /**
   * Send a transaction
   * POST /api/v1/wallet/transactions/send
   *
   * @param data - Transaction request data
   * @returns Transaction response with hash and status
   */
  sendTransaction: async (
    data: SendTransactionRequest
  ): Promise<SendTransactionResponse> => {
    const response = await apiClient.post<SendTransactionResponse>(
      "/api/v1/wallet/transactions/send",
      data
    );
    return response.data;
  },

  /**
   * Estimate transaction fee
   * POST /api/v1/wallet/transactions/estimate-fee
   *
   * @param data - Fee estimation request
   * @returns Estimated fee information
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
   * POST /api/v1/wallet/transactions/history
   *
   * @param data - Transaction history request with filters
   * @returns Paginated transaction history
   */
  getTransactionHistory: async (
    data: TransactionHistoryRequest
  ): Promise<TransactionHistoryResponse> => {
    const response = await apiClient.post<TransactionHistoryResponse>(
      "/api/v1/wallet/transactions/history",
      data
    );
    return response.data;
  },

  /**
   * Get transaction details by hash
   * GET /api/v1/wallet/transactions/:hash
   *
   * @param hash - Transaction hash
   * @param chainId - Optional chain ID (defaults to "0")
   * @returns Transaction details
   */
  getTransactionDetails: async (
    hash: string,
    chainId?: string
  ): Promise<TransactionDetail> => {
    const params = chainId ? { chain_id: chainId } : undefined;
    const response = await apiClient.get<TransactionDetail>(
      `/api/v1/wallet/transactions/${hash}`,
      params
    );
    return response.data;
  },

  /**
   * Get transaction status by hash
   * GET /api/v1/wallet/transactions/:hash/status
   *
   * @param hash - Transaction hash
   * @param chainId - Optional chain ID (defaults to "0")
   * @returns Transaction status
   */
  getTransactionStatus: async (
    hash: string,
    chainId?: string
  ): Promise<{ status: string; transaction_hash: string }> => {
    const params = chainId ? { chain_id: chainId } : undefined;
    const response = await apiClient.get<{ status: string; transaction_hash: string }>(
      `/api/v1/wallet/transactions/${hash}/status`,
      params
    );
    return response.data;
  },

  /**
   * Get pending transactions
   * POST /api/v1/wallet/transactions/pending
   *
   * @param data - Pending transactions request
   * @returns List of pending transactions
   */
  getPendingTransactions: async (
    data: PendingTransactionsRequest
  ): Promise<PendingTransactionsResponse> => {
    const response = await apiClient.post<PendingTransactionsResponse>(
      "/api/v1/wallet/transactions/pending",
      data
    );
    return response.data;
  },

  /**
   * Get batch transaction status
   * POST /api/v1/wallet/transactions/batch-status
   *
   * @param data - Batch status request with transaction hashes
   * @param chainId - Optional chain ID query parameter
   * @returns Batch status results
   */
  getBatchStatus: async (
    data: BatchStatusRequest,
    chainId?: string
  ): Promise<BatchStatusResponse> => {
    const params = chainId ? { chain_id: chainId } : undefined;
    const response = await apiClient.post<BatchStatusResponse>(
      "/api/v1/wallet/transactions/batch-status",
      data,
      { params }
    );
    return response.data;
  },

  /**
   * Send raw transaction
   * POST /api/v1/wallet/transactions/send-raw
   *
   * Submits a pre-signed transaction to the blockchain via the launchpad backend.
   * The backend will validate the signature and forward to the blockchain node.
   *
   * @param data - Raw transaction request containing serialized transaction
   * @returns Transaction response with hash and status
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
};

/**
 * Convenience function to poll transaction status until completion
 *
 * @param hash - Transaction hash to monitor
 * @param chainId - Optional chain ID
 * @param maxAttempts - Maximum polling attempts (default: 30)
 * @param intervalMs - Polling interval in milliseconds (default: 2000)
 * @returns Final transaction status
 */
export async function waitForTransactionCompletion(
  hash: string,
  chainId?: string,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const statusResponse = await walletTransactionApi.getTransactionStatus(hash, chainId);
      const status = statusResponse.status.toLowerCase();

      // Check if transaction is in final state
      if (status === "completed" || status === "success" || status === "confirmed") {
        return "completed";
      }
      if (status === "failed" || status === "error") {
        return "failed";
      }

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    } catch (error) {
      console.error(`Failed to check transaction status (attempt ${i + 1}):`, error);

      // Continue polling even on error (transaction might be pending in mempool)
      if (i < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
  }

  // Timeout reached
  return "pending";
}
