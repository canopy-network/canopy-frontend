/**
 * Wallet API endpoints
 *
 * Provides methods to interact with wallet backend endpoints
 * Based on: https://github.com/canopy-network/launchpad/blob/main/docs/endpoints/wallet-endpoints.md
 */

import { apiClient } from "./client";
import { ApiClientError } from "./client";
import {
    Wallet,
    UpdateWalletRequest,
    DecryptWalletRequest,
    DecryptWalletResponse,
    GetWalletsParams,
    WalletsListResponse,
    ImportWalletRequest,
    ImportWalletResponse,
    ExportWalletResponse,
} from "@/types/wallet";

/**
 * Wallet API methods
 */
export const walletApi = {
  /**
   * Get list of wallets with optional filtering
   * GET /api/v1/wallet
   *
   * @param params - Query parameters for filtering
   * @returns Paginated list of wallets
   */
  getWallets: async (params?: GetWalletsParams): Promise<WalletsListResponse> => {
    const response = await apiClient.get<Wallet[]>("/api/v1/wallet", params);

    // Handle pagination from response
    return {
      data: response.data as unknown as Wallet[],
      pagination: response.pagination || {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: Array.isArray(response.data) ? response.data.length : 0,
        pages: 1,
      },
    };
  },

  /**
   * Get a specific wallet by ID
   * GET /api/v1/wallet/:id
   *
   * @param id - Wallet UUID
   * @returns Wallet details
   */
  getWallet: async (id: string): Promise<Wallet> => {
    const response = await apiClient.get<Wallet>(`/api/v1/wallet/${id}`);
    return response.data;
  },

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
  updateWallet: async (
    id: string,
    data: UpdateWalletRequest
  ): Promise<Wallet> => {
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
   * Decrypt wallet private key using password
   * POST /api/v1/wallet/:id/decrypt
   *
   * @param id - Wallet UUID
   * @param data - Decryption request with password
   * @returns Decrypted private key and wallet details
   */
  decryptWallet: async (
    id: string,
    data: DecryptWalletRequest
  ): Promise<DecryptWalletResponse> => {
    const response = await apiClient.post<DecryptWalletResponse>(
      `/api/v1/wallet/${id}/decrypt`,
      data
    );
    return response.data;
  },

  /**
   * Unlock a temporarily locked wallet
   * POST /api/v1/wallet/:id/unlock
   *
   * @param id - Wallet UUID
   * @returns Success response
   */
  unlockWallet: async (id: string): Promise<void> => {
    await apiClient.post(`/api/v1/wallet/${id}/unlock`);
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
      const response = await apiClient.post<ExportWalletResponse>(
        "/api/v1/wallet/export",
        undefined,
        { skipErrorToast: true } as any
      );
      return response.data;
    } catch (error) {
      // Older launchpad versions expose export as GET.
      if (
        error instanceof ApiClientError &&
        (error.status === 404 || error.status === 405)
      ) {
        const response = await apiClient.get<ExportWalletResponse>(
          "/api/v1/wallet/export"
        );
        return response.data;
      }

      throw error;
    }
  },
};
