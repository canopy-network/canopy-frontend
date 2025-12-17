"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { LocalWallet } from "@/types/wallet";
import { SelectWalletDialog } from "./select-wallet-dialog";
import { WalletConnectionDialog } from "./wallet-connection-dialog";
import { showErrorToast } from "@/lib/utils/error-handler";

interface WalletContextType {
  // Wallet State
  currentWallet: LocalWallet | null;
  wallets: LocalWallet[];
  isConnecting: boolean;
  isPopupOpen: boolean;

  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchWallet: (walletId: string) => void;
  openPopup: () => void;
  closePopup: () => void;
  togglePopup: () => void;

  // Dialog State
  showSelectDialog: boolean;
  showCreateDialog: boolean;
  setShowSelectDialog: (show: boolean) => void;
  setShowCreateDialog: (show: boolean) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Ensure we're on the client before using stores
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isAuthenticated } = useAuthStore();
  const walletStore = useWalletStore();
  
  // Safe destructure with defaults for SSR
  const currentWallet = walletStore?.currentWallet ?? null;
  const wallets = walletStore?.wallets ?? [];
  const isLoading = walletStore?.isLoading ?? false;
  const fetchWallets = walletStore?.fetchWallets ?? (() => Promise.resolve());
  const selectWallet = walletStore?.selectWallet ?? (() => {});
  const resetWalletState = walletStore?.resetWalletState ?? (() => {});

  // Rehydrate wallet store on mount (restore persisted state)
  useEffect(() => {
    if (!isClient) return;
    
    console.log('🔄 Rehydrating wallet store from localStorage...');
    useWalletStore.persist?.rehydrate?.();
    setHasHydrated(true);

    // Log rehydrated state
    const state = useWalletStore.getState?.();
    if (state) {
      console.log('✅ Wallet store rehydrated:', {
        walletsCount: state.wallets.length,
        currentWallet: state.currentWallet?.address,
        hasCurrentWallet: !!state.currentWallet,
      });
    }
  }, [isClient]);

  // Fetch wallets when user is authenticated and store is hydrated
  useEffect(() => {
    if (!isClient || !hasHydrated) {
      console.log('⏳ Waiting for wallet store hydration...');
      return; // Wait for hydration
    }

    if (isAuthenticated) {
      console.log('🔐 User authenticated, fetching wallets from API...');
      fetchWallets().catch((error) => {
        console.error("Failed to fetch wallets:", error);
      });
    } else {
      console.log('🔓 User not authenticated, resetting wallet state...');
      // Reset wallet state when user logs out
      resetWalletState();
    }
  }, [isClient, isAuthenticated, hasHydrated, fetchWallets, resetWalletState]);

  /**
   * Connect wallet flow:
   * 1. Check if user is authenticated
   * 2. Fetch user's wallets
   * 3. If no wallets, show create dialog
   * 4. If has wallets, show select dialog
   */
  const connectWallet = async () => {
    try {
      setIsConnecting(true);

      // Check if user is authenticated
      if (!isAuthenticated) {
        showErrorToast(
          new Error("Please log in first to connect your wallet"),
          "Authentication Required"
        );
        setIsConnecting(false);
        return;
      }

      // Fetch wallets
      await fetchWallets();

      // Determine which dialog to show
      if (wallets.length === 0) {
        // No wallets, show create dialog
        setShowCreateDialog(true);
      } else {
        // Has wallets, show select dialog
        setShowSelectDialog(true);
      }
    } catch (error) {
      showErrorToast(error, "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect wallet
   */
  const disconnectWallet = () => {
    // Lock all wallets (remove private keys from memory)
    useWalletStore.getState().lockAllWallets();

    // Reset current wallet selection
    useWalletStore.setState({ currentWallet: null });

    // Close popup
    setIsPopupOpen(false);
  };

  /**
   * Switch to a different wallet
   */
  const switchWallet = (walletId: string) => {
    selectWallet(walletId);
  };

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);
  const togglePopup = () => setIsPopupOpen((prev) => !prev);

  const handleSelectSuccess = () => {
    setShowSelectDialog(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    // Fetch wallets to update the list
    fetchWallets();
  };

  return (
    <WalletContext.Provider
      value={{
        currentWallet,
        wallets,
        isConnecting: isConnecting || isLoading,
        isPopupOpen,
        connectWallet,
        disconnectWallet,
        switchWallet,
        openPopup,
        closePopup,
        togglePopup,
        showSelectDialog,
        showCreateDialog,
        setShowSelectDialog,
        setShowCreateDialog,
      }}
    >
      {children}

      {/* Wallet Dialogs */}
      <SelectWalletDialog
        open={showSelectDialog}
        onOpenChange={setShowSelectDialog}
        onSuccess={handleSelectSuccess}
      />

      <WalletConnectionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
