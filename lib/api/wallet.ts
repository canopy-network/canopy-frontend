/**
 * Wallet API endpoints
 *
 * Provides methods to interact with wallet backend endpoints
 * Based on: https://github.com/canopy-network/launchpad/blob/main/docs/endpoints/wallet-endpoints.md
 */

import { apiClient } from "./client";
import {
  Wallet,
  UpdateWalletRequest,
  ImportWalletRequest,
  ImportWalletResponse,
  ExportWalletResponse,
} from "@/types/wallet";

/**
 * Wallet API methods
 */
export const walletApi = {
  /**
   * Create a new wallet (import with seedphrase)
   * POST /api/v1/wallet/import
   *
   * Note: The password should be the seedphrase WITHOUT SPACES (all concatenated)
   * and the keystore should be generated on the frontend using lib/crypto/wallet.ts
   *
   * @param data - Wallet creation data
   * @returns Import results with wallet IDs
   */
  importWallet: async (data: ImportWalletRequest): Promise<ImportWalletResponse> => {
    const response = await apiClient.post<ImportWalletResponse>("/api/v1/wallet/import", data);
    return response.data;
  },

  /**
   * Update wallet metadata (name, description, active status)
   * PUT /api/v1/wallet/:id
   *
   * Note: Does not modify cryptographic keys or password
   *
   * @param id - Wallet UUID
   * @param data - Updated wallet metadata
   * @returns Updated wallet
   */
  updateWallet: async (id: string, data: UpdateWalletRequest): Promise<Wallet> => {
    const response = await apiClient.put<Wallet>(`/api/v1/wallet/${id}`, data);
    return response.data;
  },

  /**
   * Delete a wallet
   * DELETE /api/v1/wallet/:id
   *
   * @param id - Wallet UUID
   * @returns Success response
   */
  deleteWallet: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/wallet/${id}`);
  },

  /**
   * Export wallets in keystore format with encryption data
   * POST /api/v1/wallet/export (fallback to GET for backwards compatibility)
   *
   * This endpoint returns all wallets with their encrypted private keys,
   * salts, and public keys - necessary for unlocking wallets locally.
   *
   * @returns Wallets in keystore format (addressMap)
   */
  exportWallets: async (): Promise<ExportWalletResponse> => {
    try {
      const response = await apiClient.get<ExportWalletResponse>("/api/v1/wallet/export");
      return response.data;
    } catch (error) {
      console.error("There was an error retrieving wallets");
      throw new Error("There was an error retrieving wallets");
    }
  },
};
