"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "./wallet-provider";
import { Wallet, Loader2, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWalletStore } from "@/lib/stores/wallet-store";
import {formatBalanceWithCommas} from "@/lib/utils/denomination";
import { useEffect } from "react";

interface WalletConnectButtonProps {
  isCondensed?: boolean;
}

export function WalletConnectButton({ isCondensed = false }: WalletConnectButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const { currentWallet, isConnecting, connectWallet, togglePopup } =
    useWallet();
  const { balance, fetchBalance } = useWalletStore();

  // Fetch balance when wallet is connected
  useEffect(() => {
    if (currentWallet) {
      fetchBalance(currentWallet.id);
    }
  }, [currentWallet]);

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "";
    // Add 0x prefix if not present

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // If user is not authenticated, don't show wallet button
  if (!isAuthenticated) {
    return null;
  }

  // If wallet is connected, show wallet info button
  if (currentWallet) {
    const displayBalance = balance?.total || "0.00";

    if (isCondensed) {
      return (
        <Button
          variant="outline"
          onClick={togglePopup}
          className="w-10 h-10 p-0 bg-transparent border-[#2a2a2a] text-white hover:bg-[#1a1a1a]"
        >
          <Wallet className="h-4 w-4" />
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        onClick={togglePopup}
        className="bg-transparent border-[#2a2a2a] text-white hover:bg-[#1a1a1a] w-full h-auto py-3 px-3"
      >
        <div className="flex items-start gap-3 w-full">
          <div className="flex-shrink-0">
            <Wallet className="h-4 w-4 mt-0.5" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-xs text-muted-foreground truncate">
                {formatAddress(currentWallet.address)}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </div>
            <div className="text-sm font-medium truncate">
              {formatBalanceWithCommas(displayBalance)} CNPY
            </div>
          </div>
        </div>
      </Button>
    );
  }

  // Otherwise, show connect button
  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="gap-2 w-full bg-transparent border-green-600/50 text-green-500 hover:bg-green-950/30 hover:border-green-600 h-12 rounded-2xl font-medium"
      variant="outline"
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {!isCondensed && 'Connecting...'}
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          {!isCondensed && 'Connect wallet'}

        </>
      )}
    </Button>
  );
}
