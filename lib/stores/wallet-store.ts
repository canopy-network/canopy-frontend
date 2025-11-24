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
  LocalWallet,
  UpdateWalletRequest,
  WalletBalance,
  WalletTransaction, ImportWalletRequest, WalletTransactionStatus,
} from "@/types/wallet";
import {walletApi, portfolioApi, walletTransactionApi, chainsApi} from "@/lib/api";
import type {
  SendTransactionRequest,
  TransactionHistoryRequest,
  EstimateFeeRequest,
} from "@/types/wallet";
import {
  generateEncryptedKeyPair,
  decryptPrivateKey,
  EncryptedKeyPair,
} from "@/lib/crypto/wallet";
import { bytesToHex } from '@noble/hashes/utils.js';
import { validateSeedphrase } from "@/lib/crypto/seedphrase";
import {
  storeMasterSeedphrase,
  retrieveMasterSeedphrase,
  hasMasterSeedphrase,
  clearMasterSeedphrase
} from "@/lib/crypto/seed-storage";
import {
  fromMicroUnits,
  toMicroUnits
} from "@/lib/utils/denomination";

/**
 * Generate a 4-character symbol for a chain based on chain_id
 * Format: C + 3-digit padded chain_id (e.g., C001, C002, C123)
 */
function generateChainSymbol(chainId: number): string {
  return `C${chainId.toString().padStart(3, '0')}`;
}
import {
  createSendMessage,
  createAndSignTransaction,
  validateTransactionParams,
} from "@/lib/crypto/transaction";
import { detectPublicKeyCurve } from "@/lib/crypto/curve-detection";
import { CurveType } from "@/lib/crypto/types";
import { symbol } from "zod";

export interface WalletState {
  // State
  wallets: LocalWallet[];
  currentWallet: LocalWallet | null;
  isLoading: boolean;
  error: string | null;

  // Balance and transactions (cached)
  balance: WalletBalance | null;
  transactions: WalletTransaction[];

  // Portfolio data (cached)
  portfolioOverview: any | null; // Full portfolio overview
  multiChainBalance: any | null; // Balance across all chains
  availableAssets: { chainId: string; symbol: string; name: string; balance: string }[]

  // Actions - Wallet Management
  fetchWallets: () => Promise<void>;
  selectWallet: (walletId: string) => void;
  createWallet: (
    seedphrase: string,
    walletName?: string,
  ) => Promise<{ wallet: LocalWallet; seedphrase: string }>;
  updateWallet: (walletId: string, data: UpdateWalletRequest) => Promise<void>;
  deleteWallet: (walletId: string) => Promise<void>;

  // Actions - Wallet Unlock/Lock
  unlockWallet: (walletId: string, password: string) => Promise<void>;
  lockWallet: (walletId: string) => void;
  lockAllWallets: () => void;

  // Actions - Balance & Transactions
  fetchBalance: (walletId: string) => Promise<void>;
  fetchTransactions: (walletId: string) => Promise<void>;
  fetchPortfolioOverview: (addresses?: string[]) => Promise<void>;
  fetchMultiChainBalance: (addresses?: string[]) => Promise<void>;

  // Actions - Send Transactions
  sendTransaction: (request: SendTransactionRequest) => Promise<string>;
  estimateFee: (request: EstimateFeeRequest) => Promise<string>;

  // Actions - Utilities
  clearError: () => void;
  resetWalletState: () => void;
  migrateWalletCurveTypes: () => void; // Migrate existing wallets to include curve type
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

const MIN_DEFAULT_FEE = 1000;
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
      portfolioOverview: null,
      multiChainBalance: null,
      availableAssets: [],

      // Fetch all wallets for the current user
      // Uses only exportWallets endpoint which contains all necessary data
      fetchWallets: async () => {
        try {
          set({ isLoading: true, error: null });

          console.log('🔄 Fetching wallets from export endpoint...');

          const exportResponse = await walletApi.exportWallets();

          const addressMap = exportResponse?.addressMap  || {};

          // Convert addressMap to LocalWallet array
          const wallets: LocalWallet[] = Object.entries(addressMap).map(([address, data]) => {
            // Detect curve type from public key
            let curveType: string;
            try {
              curveType = detectPublicKeyCurve(data.publicKey);
              console.log(`✅ Detected curve type for ${address}: ${curveType}`);
            } catch (error) {
              console.warn(`⚠️ Failed to detect curve type for ${address}, defaulting to ed25519:`, error);
              curveType = CurveType.ED25519; // Default to Ed25519
            }

            return {
              // From export endpoint
              id: address,
              address: data.keyAddress || address,
              public_key: data.publicKey,
              encrypted_private_key: data.encrypted,
              salt: data.salt,
              wallet_name: data.keyNickname || 'Unnamed Wallet',
              curveType, // ✅ Store detected curve type

              // Local state only
              isUnlocked: false,
            };
          });

          console.log('✅ Populated', wallets.length, 'wallets successfully');

          set({ wallets, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch wallets";
          console.error('❌ Failed to fetch wallets:', error);
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

          // Normalize seedphrase (trim and collapse multiple spaces)
          const normalizedSeedphrase = seedphrase.trim().replace(/\s+/g, " ");

          // Validate seedphrase
          if (!validateSeedphrase(normalizedSeedphrase)) {
            throw new Error("Invalid seedphrase");
          }

          // Store master seed phrase if not already stored
          if (!hasMasterSeedphrase()) {
            storeMasterSeedphrase(normalizedSeedphrase);
          }

          // Remove spaces from seedphrase (backend expects it without spaces)
          const seedphraseNoSpaces = normalizedSeedphrase.replace(/\s+/g, "");

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

          // Detect curve type from public key
          let curveType: string;
          try {
            curveType = detectPublicKeyCurve(encrypted.publicKey);
            console.log(`✅ Created wallet with curve type: ${curveType}`);
          } catch (error) {
            console.warn(`⚠️ Failed to detect curve type, defaulting to ed25519:`, error);
            curveType = CurveType.ED25519; // Default to Ed25519
          }

          // Create LocalWallet from the data we already have
          const localWallet: LocalWallet = {
            id: firstSuccess.address,
            address: encrypted.address,
            public_key: encrypted.publicKey,
            encrypted_private_key: encrypted.encryptedPrivateKey,
            salt: encrypted.salt,
            wallet_name: walletName || 'Unnamed Wallet',
            curveType, // ✅ Store detected curve type
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

      /**
       * Unlock wallet by decrypting the private key
       *
       * SECURITY:
       * - Private key is RECALCULATED each time (never stored)
       * - Decryption happens locally using encrypted_private_key + salt + password
       * - Private key only exists in memory (never persisted to localStorage)
       * - On page refresh, wallet resets to locked state
       */
      unlockWallet: async (walletId: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          // Find wallet in local state
          const { wallets } = get();
          const wallet = wallets.find((w) => w.id === walletId);

          if (!wallet) {
            throw new Error("Wallet not found");
          }

          // Verify we have encryption data (should be available from export)
          if (!wallet.encrypted_private_key || !wallet.salt) {
            throw new Error("Wallet encryption data not available. Please refresh your wallets.");
          }

          // Normalize and remove spaces from password/seedphrase
          const passwordNoSpaces = password.trim().replace(/\s+/g, "");

          // Build EncryptedKeyPair from wallet data
          const encryptedKeyPair: EncryptedKeyPair = {
            publicKey: wallet.public_key,
            encryptedPrivateKey: wallet.encrypted_private_key,
            salt: wallet.salt,
            address: wallet.address,
          };

          // RECALCULATE private key by decrypting (never read from storage)
          const privateKeyBytes = await decryptPrivateKey(
            encryptedKeyPair,
            passwordNoSpaces
          );

          // Convert bytes to hex string
          const privateKeyHex = bytesToHex(privateKeyBytes);

          // Ensure curveType is set (detect if missing)
          let curveType = wallet.curveType;
          if (!curveType) {
            try {
              curveType = detectPublicKeyCurve(wallet.public_key);
              console.log(`✅ Detected curve type on unlock: ${curveType}`);
            } catch (error) {
              console.warn(`⚠️ Failed to detect curve type on unlock, defaulting to ed25519:`, error);
              curveType = CurveType.ED25519;
            }
          }

          // Store private key in memory only (partialize will remove it before persisting)
          set((state) => ({
            wallets: state.wallets.map((w) =>
              w.id === walletId
                ? {
                    ...w,
                    privateKey: privateKeyHex,
                    curveType, // ✅ Ensure curve type is set
                    isUnlocked: true,
                  }
                : w
            ),
            currentWallet:
              state.currentWallet?.id === walletId
                ? {
                    ...state.currentWallet,
                    privateKey: privateKeyHex,
                    curveType, // ✅ Ensure curve type is set
                    isUnlocked: true,
                  }
                : state.currentWallet,
            isLoading: false,
          }));
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
      // Fetch balance for a wallet using portfolio overview API
      fetchBalance: async (walletId: string) => {
        try {
          const { wallets } = get();
          const wallet = wallets.find((w) => w.id === walletId);

          if (!wallet) {
            console.warn("Wallet not found:", walletId);
            return;
          }

          // Fetch portfolio overview from API
          const overview = await portfolioApi.getPortfolioOverview({
            addresses: [wallet.address],
          });

          if (!overview || !overview.accounts || overview.accounts.length === 0) {
            // No balance data available, set empty balance
            set({
              balance: {
                total: "0.00",
                tokens: [],
              }
            });
            return;
          }

          // Build tokens array - one token per chain
          // Note: API already returns balances in standard units (not micro)
          // Store raw values - formatting happens in the view layer
          const tokens: WalletBalance['tokens'] = overview.accounts.map((account) => ({
            symbol: generateChainSymbol(account.chain_id),
            name: account.chain_name,
            balance: account.balance, // Raw value from API
            usdValue: undefined, // USD value not provided in current response
            logo: undefined,
            chainId: account.chain_id,
            distribution: {
              liquid: account.available_balance, // Raw value
              staked: account.staked_balance, // Raw value
              delegated: account.delegated_balance, // Raw value
            },
          }));

          // API already returns total in standard units (not micro)
          // Store raw value - formatting happens in the view layer
          const walletBalance: WalletBalance = {
            total: overview.total_value_cnpy || "0", // Raw value from API
            tokens,
          };

          set({ balance: walletBalance });


          const availableAssets = tokens.map(token => ({
            chainId: String(token.chainId),
            symbol: token.symbol,
            name: token.name,
            balance: token.balance,
          }))

          console.log("Available assets:", availableAssets);
          set({ availableAssets: availableAssets })
        } catch (error) {
          console.error("Failed to fetch balance:", error);

          // Set empty balance on error to avoid showing stale data
          set({
            balance: {
              total: "0.00",
              tokens: [],
            }
          });
        }
      },

      // Fetch transactions for a wallet using transaction history API
      fetchTransactions: async (walletId: string) => {
        try {
          const { wallets } = get();
          const wallet = wallets.find((w) => w.id === walletId);

          if (!wallet) {
            console.warn("Wallet not found:", walletId);
            return;
          }

          // Fetch transaction history from API
          const historyResponse = await walletTransactionApi.getTransactionHistory({
            addresses: [wallet.address],
            limit: 50,
            sort: "desc",
          });

          // Convert API response to WalletTransaction format
          // Amounts are converted from micro (uCNPY) to CNPY
          const walletTransactions: WalletTransaction[] = historyResponse.transactions.map(
            (tx) => ({
              id: tx.transaction_hash,
              type: tx.type.toLowerCase() as any,
              amount: fromMicroUnits(tx.amount), // Convert from micro units to standard units
              token: "CNPY", // Default to CNPY, could be extracted from transaction
              from: tx.from_address,
              to: tx.to_address,
              status: tx.status.toLowerCase() as WalletTransactionStatus,
              timestamp: tx.timestamp,
              txHash: tx.transaction_hash,
            })
          );

          set({ transactions: walletTransactions });
        } catch (error) {
          console.error("Failed to fetch transactions:", error);
          set({ transactions: [] });
        }
      },

      // Fetch portfolio overview for all wallets or specific addresses
      fetchPortfolioOverview: async (addresses?: string[]) => {
        try {
          const { wallets } = get();

          // Use provided addresses or all wallet addresses
          const targetAddresses = addresses || wallets.map((w) => w.address);

          if (targetAddresses.length === 0) {
            console.warn("No wallet addresses available for portfolio overview");
            return;
          }

          // Fetch portfolio overview from API
          const overview = await portfolioApi.getPortfolioOverview({
            addresses: targetAddresses,
          });

          set({ portfolioOverview: overview });
        } catch (error) {
          console.error("Failed to fetch portfolio overview:", error);
          set({ portfolioOverview: null });
        }
      },

      // Fetch multi-chain balance for all wallets or specific addresses
      fetchMultiChainBalance: async (addresses?: string[]) => {
        try {
          const { wallets } = get();

          // Use provided addresses or all wallet addresses
          const targetAddresses = addresses || wallets.map((w) => w.address);

          if (targetAddresses.length === 0) {
            console.warn("No wallet addresses available for multi-chain balance");
            return;
          }

          // Fetch multi-chain balance from API
          const balance = await portfolioApi.getMultiChainBalance({
            addresses: targetAddresses,
          });

          set({ multiChainBalance: balance });
        } catch (error) {
          console.error("Failed to fetch multi-chain balance:", error);
          set({ multiChainBalance: null });
        }
      },

      // Send a transaction using send-raw endpoint with locally signed transaction
      sendTransaction: async (request: SendTransactionRequest): Promise<string> => {
        try {
          set({ isLoading: true, error: null });

          // Find the wallet to get the private key
          const { wallets } = get();
          const wallet = wallets.find((w) => w.address === request.from_address);

          if (!wallet) {
            throw new Error("Wallet not found for address: " + request.from_address);
          }

          if (!wallet.privateKey || !wallet.isUnlocked) {
            throw new Error("Wallet is locked. Please unlock the wallet first.");
          }

          // Ensure curveType is set
          if (!wallet.curveType) {
            throw new Error("Wallet curve type not detected. Please refresh your wallets.");
          }


          // Convert amount from denom to udenom
          const amountInMicro = parseInt(toMicroUnits(request.amount));

          // Get current blockchain height from explorer API
          const chainId = request.chain_id || 1;
          const currentHeight = await chainsApi.getChainHeight(String(chainId));

          // Create send message
          const msg = createSendMessage(
            wallet.address,       // From address
            request.to_address,   // To address
            amountInMicro         // Amount in micro units
          );

          // Validate transaction parameters
          const txParams = {
            type: 'send',
            msg,
            fee: request.fee ?? MIN_DEFAULT_FEE,
            memo: request.memo,
            networkID: request.network_id || 1,
            chainID: chainId,
            height: currentHeight.data.height,
          };

          try {
            validateTransactionParams(txParams);
          } catch (validationError) {
            console.error("❌ Transaction validation failed:", validationError);
            throw validationError;
          }

          // Create and sign the transaction with multi-curve support
          console.log("🔐 Signing transaction with protobuf...");
          const signedTx = createAndSignTransaction(
            txParams,
            wallet.privateKey,    // ✅ Private key
            wallet.public_key,    // ✅ Public key
            wallet.curveType as CurveType // ✅ Curve type determines signing algorithm!
          );

          console.log("✅ Transaction signed locally with", wallet.curveType);
          console.log("📤 Submitting raw transaction to backend...");

          // Submit the raw transaction to the backend
          const response = await walletTransactionApi.sendRawTransaction(signedTx);

          console.log("✅ Transaction sent:", response.transaction_hash);

          // Refresh balance and transactions after sending
          const { currentWallet, fetchBalance, fetchTransactions } = get();
          if (currentWallet) {
            await Promise.all([
              fetchBalance(currentWallet.id),
              fetchTransactions(currentWallet.id),
            ]);
          }

          set({ isLoading: false });
          return response.transaction_hash;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to send transaction";
          console.error("❌ Failed to send transaction:", error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Estimate transaction fee
      estimateFee: async (request: EstimateFeeRequest): Promise<string> => {
        try {
          // Convert amount from CNPY to uCNPY before sending to backend
          const requestWithMicro = {
            ...request,
            amount: toMicroUnits(request.amount),
          };

          const response = await walletTransactionApi.estimateFee(requestWithMicro);

          // Convert estimated fee from uCNPY to CNPY
          return fromMicroUnits(response.estimated_fee);
        } catch (error) {
          console.error("Failed to estimate fee:", error);
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Migrate existing wallets to include curve type
      migrateWalletCurveTypes: () => {
        console.log('🔄 Migrating wallets to include curve types...');

        set((state) => ({
          wallets: state.wallets.map((wallet) => {
            // Skip if already has curve type
            if (wallet.curveType) {
              return wallet;
            }

            // Detect curve type from public key
            try {
              const curveType = detectPublicKeyCurve(wallet.public_key);
              console.log(`✅ Migrated wallet ${wallet.id}: detected ${curveType}`);

              return {
                ...wallet,
                curveType,
              };
            } catch (error) {
              console.error(`❌ Failed to migrate wallet ${wallet.id}:`, error);
              // Default to Ed25519 if detection fails
              return {
                ...wallet,
                curveType: CurveType.ED25519,
              };
            }
          }),
          currentWallet: state.currentWallet && !state.currentWallet.curveType
            ? (() => {
                try {
                  const curveType = detectPublicKeyCurve(state.currentWallet.public_key);
                  console.log(`✅ Migrated current wallet: detected ${curveType}`);
                  return {
                    ...state.currentWallet,
                    curveType,
                  };
                } catch (error) {
                  console.error(`❌ Failed to migrate current wallet:`, error);
                  return {
                    ...state.currentWallet,
                    curveType: CurveType.ED25519,
                  };
                }
              })()
            : state.currentWallet,
        }));

        console.log('✅ Wallet migration complete');
      },

      // Reset wallet state (clears seed phrase on logout)
      resetWalletState: () => {
        // Clear stored master seed phrase
        clearMasterSeedphrase();

        set({
          wallets: [],
          currentWallet: null,
          isLoading: false,
          error: null,
          balance: null,
          transactions: [],
          portfolioOverview: null,
          multiChainBalance: null,
        });
      },
    }),
    {
      name: "canopy-wallet-storage",
      storage: createJSONStorage(() => zustandStorage),
      skipHydration: true,
      /**
       * SECURITY: Only persist wallet metadata, NEVER persist private keys
       * - privateKey is always set to undefined before saving
       * - privateKey is recalculated on each unlock by decrypting encrypted_private_key
       * - On page refresh, all wallets reset to locked state (isUnlocked: false)
       * - curveType IS persisted (needed for signing)
       */
      partialize: (state) => ({
        wallets: state.wallets.map((w) => ({
          id: w.id,
          address: w.address,
          public_key: w.public_key,
          encrypted_private_key: w.encrypted_private_key,
          salt: w.salt,
          wallet_name: w.wallet_name,
          curveType: w.curveType, // ✅ Persist curve type
          privateKey: undefined,  // NEVER persist decrypted private keys
          isUnlocked: false,      // Always reset to locked on persist
        })),
        currentWallet: state.currentWallet
          ? {
              id: state.currentWallet.id,
              address: state.currentWallet.address,
              public_key: state.currentWallet.public_key,
              encrypted_private_key: state.currentWallet.encrypted_private_key,
              salt: state.currentWallet.salt,
              wallet_name: state.currentWallet.wallet_name,
              curveType: state.currentWallet.curveType, // ✅ Persist curve type
              privateKey: undefined,  // NEVER persist decrypted private keys
              isUnlocked: false,      // Always reset to locked on persist
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

/**
 * Helper function to check if master seed phrase is stored
 */
export function hasStoredSeedphrase(): boolean {
  return hasMasterSeedphrase();
}

/**
 * Helper function to get stored master seed phrase
 */
export function getStoredSeedphrase(): string | null {
  return retrieveMasterSeedphrase();
}
