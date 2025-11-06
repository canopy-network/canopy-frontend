/**
 * @fileoverview Wallet Store
 *
 * This store manages wallet state including:
 * - List of user wallets
 * - Currently selected wallet
 * - Wallet creation and management
 * - Private key handling (in-memory only)
 *
 * @author Canopy Development Team
 * @version 1.0.0
 */

import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import {
    Wallet,
    LocalWallet,
    UpdateWalletRequest,
    WalletBalance,
    WalletTransaction, ImportWalletRequest,
} from "@/types/wallet";
import { walletApi } from "@/lib/api";
import {
  generateEncryptedKeyPair,
} from "@/lib/crypto/wallet";
import { validateSeedphrase } from "@/lib/crypto/seedphrase";

export interface WalletState {
  // State
  wallets: LocalWallet[];
  currentWallet: LocalWallet | null;
  isLoading: boolean;
  error: string | null;

  // Balance and transactions (cached)
  balance: WalletBalance | null;
  transactions: WalletTransaction[];

  // Actions - Wallet Management
  fetchWallets: () => Promise<void>;
  selectWallet: (walletId: string) => void;
  createWallet: (
    seedphrase: string,
    walletName?: string,
  ) => Promise<{ wallet: Wallet; seedphrase: string }>;
  updateWallet: (walletId: string, data: UpdateWalletRequest) => Promise<void>;
  deleteWallet: (walletId: string) => Promise<void>;

  // Actions - Wallet Unlock/Lock
  unlockWallet: (walletId: string, password: string) => Promise<void>;
  lockWallet: (walletId: string) => void;
  lockAllWallets: () => void;

  // Actions - Balance & Transactions
  fetchBalance: (walletId: string) => Promise<void>;
  fetchTransactions: (walletId: string) => Promise<void>;

  // Actions - Utilities
  clearError: () => void;
  resetWalletState: () => void;
}

// Custom storage for Zustand
const zustandStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      wallets: [],
      currentWallet: null,
      isLoading: false,
      error: null,
      balance: null,
      transactions: [],

      // Fetch all wallets for the current user
      fetchWallets: async () => {
        try {
          set({ isLoading: true, error: null });

          const response = await walletApi.getWallets();
          const wallets: LocalWallet[] = response.data.map((wallet) => ({
            ...wallet,
            isUnlocked: false,
          }));

          set({ wallets, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch wallets";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Select a wallet as the current wallet
      selectWallet: (walletId: string) => {
        const { wallets } = get();
        const wallet = wallets.find((w) => w.id === walletId);

        if (wallet) {
          set({ currentWallet: wallet });

          // Fetch balance and transactions for the selected wallet
          get().fetchBalance(walletId);
          get().fetchTransactions(walletId);
        }
      },

      // Create a new wallet with seedphrase
      createWallet: async (
        seedphrase: string,
        walletName?: string,
        walletDescription?: string
      ) => {
        try {
          set({ isLoading: true, error: null });

          // Validate seedphrase
          if (!validateSeedphrase(seedphrase)) {
            throw new Error("Invalid seedphrase");
          }

          // Remove spaces from seedphrase (backend expects it without spaces)
          const seedphraseNoSpaces = seedphrase.replace(/\s+/g, "");

          // Generate encrypted keypair using seedphrase as password
          const { encrypted } = await generateEncryptedKeyPair(
            seedphraseNoSpaces
          );

          // Create wallet request with seedphrase WITHOUT SPACES
          // The ImportWalletRequest is a map of addresses to their encrypted data
          const importRequest: ImportWalletRequest = {
              addressMap:{
                  [encrypted.address]: {
                      publicKey: encrypted.publicKey,
                      salt: encrypted.salt,
                      encrypted: encrypted.encryptedPrivateKey,
                      keyAddress: encrypted.address,
                      keyNickName: walletName || "Main Wallet",
                  }
              }
          };

          // Send to backend
          const importResponse = await walletApi.importWallet(importRequest);

          // Check if import was successful
          if (importResponse.summary.successful === 0) {
            const errors = importResponse.results
              .filter(r => !r.success)
              .map(r => r.error)
              .join(", ");
            throw new Error(`Failed to import wallet: ${errors}`);
          }

          // Get the first successful wallet
          const firstSuccess = importResponse.results.find(r => r.success);
          if (!firstSuccess) {
            throw new Error("No successful wallet imports");
          }

          // Fetch the complete wallet data using the wallet_id
          const wallet = await walletApi.getWallet(firstSuccess.wallet_id);

          // Add to local state
          const localWallet: LocalWallet = {
            ...wallet,
            isUnlocked: false,
          };

          set((state) => ({
            wallets: [...state.wallets, localWallet],
            currentWallet: localWallet,
            isLoading: false,
          }));

          return { wallet: localWallet, seedphrase };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create wallet";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Update wallet metadata
      updateWallet: async (walletId: string, data: UpdateWalletRequest) => {
        try {
          set({ isLoading: true, error: null });

          const updatedWallet = await walletApi.updateWallet(walletId, data);

          set((state) => ({
            wallets: state.wallets.map((w) =>
              w.id === walletId ? { ...w, ...updatedWallet } : w
            ),
            currentWallet:
              state.currentWallet?.id === walletId
                ? { ...state.currentWallet, ...updatedWallet }
                : state.currentWallet,
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update wallet";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Delete a wallet
      deleteWallet: async (walletId: string) => {
        try {
          set({ isLoading: true, error: null });

          await walletApi.deleteWallet(walletId);

          set((state) => ({
            wallets: state.wallets.filter((w) => w.id !== walletId),
            currentWallet:
              state.currentWallet?.id === walletId
                ? null
                : state.currentWallet,
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete wallet";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Unlock wallet with password (decrypt private key)
      // TODO: Enable this once backend provides encryption data
      unlockWallet: async (walletId: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          // Find wallet in local state
          const { wallets } = get();
          const wallet = wallets.find((w) => w.id === walletId);

          if (!wallet) {
            throw new Error("Wallet not found");
          }

          // TODO: Uncomment when backend provides these fields in GET /wallet response
          /*
          // Remove spaces from password/seedphrase
          const passwordNoSpaces = password.replace(/\s+/g, "");

          // Build EncryptedKeyPair from wallet data
          const encryptedKeyPair: EncryptedKeyPair = {
            publicKey: wallet.public_key,
            encryptedPrivateKey: wallet.encrypted_private_key,
            salt: wallet.salt,
            address: wallet.address,
          };

          // Decrypt private key locally using crypto functions
          const privateKeyBytes = await decryptPrivateKey(
            encryptedKeyPair,
            passwordNoSpaces
          );

          // Convert bytes to hex string
          const privateKeyHex = bytesToHex(privateKeyBytes);

          // Update wallet state with private key (in-memory only)
          set((state) => ({
            wallets: state.wallets.map((w) =>
              w.id === walletId
                ? {
                    ...w,
                    privateKey: privateKeyHex,
                    isUnlocked: true,
                  }
                : w
            ),
            currentWallet:
              state.currentWallet?.id === walletId
                ? {
                    ...state.currentWallet,
                    privateKey: privateKeyHex,
                    isUnlocked: true,
                  }
                : state.currentWallet,
            isLoading: false,
          }));
          */

          // Temporary error until backend provides encryption data
          set({ isLoading: false });
          throw new Error(
            "Wallet unlock not available yet. Backend needs to provide encryption data (public_key, encrypted_private_key, salt) in GET /wallet or GET /wallet/export endpoint."
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to unlock wallet";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Lock a wallet (remove private key from memory)
      lockWallet: (walletId: string) => {
        set((state) => ({
          wallets: state.wallets.map((w) =>
            w.id === walletId
              ? {
                  ...w,
                  privateKey: undefined,
                  isUnlocked: false,
                }
              : w
          ),
          currentWallet:
            state.currentWallet?.id === walletId
              ? {
                  ...state.currentWallet,
                  privateKey: undefined,
                  isUnlocked: false,
                }
              : state.currentWallet,
        }));
      },

      // Lock all wallets
      lockAllWallets: () => {
        set((state) => ({
          wallets: state.wallets.map((w) => ({
            ...w,
            privateKey: undefined,
            isUnlocked: false,
          })),
          currentWallet: state.currentWallet
            ? {
                ...state.currentWallet,
                privateKey: undefined,
                isUnlocked: false,
              }
            : null,
        }));
      },

      // Fetch balance for a wallet (placeholder - implement with blockchain API)
      fetchBalance: async (walletId: string) => {
        try {
          // TODO: Implement actual blockchain balance fetching
          // For now, return mock data
          const mockBalance: WalletBalance = {
            total: "0.00",
            tokens: [],
          };

          set({ balance: mockBalance });
        } catch (error) {
          console.error("Failed to fetch balance:", error);
        }
      },

      // Fetch transactions for a wallet (placeholder - implement with blockchain API)
      fetchTransactions: async (walletId: string) => {
        try {
          // TODO: Implement actual blockchain transaction fetching
          // For now, return empty array
          set({ transactions: [] });
        } catch (error) {
          console.error("Failed to fetch transactions:", error);
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Reset wallet state
      resetWalletState: () => {
        set({
          wallets: [],
          currentWallet: null,
          isLoading: false,
          error: null,
          balance: null,
          transactions: [],
        });
      },
    }),
    {
      name: "canopy-wallet-storage",
      storage: createJSONStorage(() => zustandStorage),
      skipHydration: true,
      // Only persist wallets list and currentWallet (not private keys!)
      partialize: (state) => ({
        wallets: state.wallets.map((w) => ({
          ...w,
          privateKey: undefined, // Never persist private keys
          isUnlocked: false,
        })),
        currentWallet: state.currentWallet
          ? {
              ...state.currentWallet,
              privateKey: undefined, // Never persist private keys
              isUnlocked: false,
            }
          : null,
      }),
    }
  )
);

/**
 * Helper function to get persisted wallet data from localStorage
 */
export function getPersistedWalletData() {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("canopy-wallet-storage");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return parsed.state;
  } catch (error) {
    console.error("Failed to parse persisted wallet data:", error);
    return null;
  }
}
