"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "./wallet-provider";
import { Wallet, Loader2, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";

export function WalletConnectButton() {
  const { isAuthenticated } = useAuthStore();
  const { currentWallet, isConnecting, connectWallet, togglePopup } =
    useWallet();

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "";
    // Add 0x prefix if not present
    const fullAddress = address.startsWith("0x") ? address : `0x${address}`;
    return `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`;
  };

  // If user is not authenticated, don't show wallet button
  if (!isAuthenticated) {
    return null;
  }

  // If wallet is connected, show wallet info button
  if (currentWallet) {
    return (
      <Button
        variant="outline"
        onClick={togglePopup}
        className="gap-2 bg-transparent border-[#2a2a2a] text-white hover:bg-[#1a1a1a] w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span className="font-mono text-sm">
            {formatAddress(currentWallet.address)}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Connect wallet
        </>
      )}
    </Button>
  );
}
