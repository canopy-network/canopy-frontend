"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";

interface WalletAccount {
  address: string;
  balance: string;
  chain: string;
  isConnected: boolean;
}

interface WalletContextType {
  accounts: WalletAccount[];
  currentAccount: WalletAccount | null;
  isConnecting: boolean;
  isPopupOpen: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchAccount: (address: string) => void;
  addAccount: (chain: string) => Promise<void>;
  openPopup: () => void;
  closePopup: () => void;
  togglePopup: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<WalletAccount | null>(
    null
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockAccount: WalletAccount = {
        address: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        balance: "1,234.56",
        chain: "Ethereum",
        isConnected: true,
      };

      setAccounts([mockAccount]);
      setCurrentAccount(mockAccount);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccounts([]);
    setCurrentAccount(null);
    setIsPopupOpen(false);
  };

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);
  const togglePopup = () => setIsPopupOpen((prev) => !prev);

  const switchAccount = (address: string) => {
    const account = accounts.find((acc) => acc.address === address);
    if (account) {
      setCurrentAccount(account);
    }
  };

  const addAccount = async (chain: string) => {
    const newAccount: WalletAccount = {
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      balance: "0.00",
      chain,
      isConnected: true,
    };

    setAccounts((prev) => [...prev, newAccount]);
  };

  return (
    <WalletContext.Provider
      value={{
        accounts,
        currentAccount,
        isConnecting,
        isPopupOpen,
        connectWallet,
        disconnectWallet,
        switchAccount,
        addAccount,
        openPopup,
        closePopup,
        togglePopup,
      }}
    >
      {children}
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
