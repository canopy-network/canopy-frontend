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
  hideBalance?: boolean;
}

export function WalletConnectButton({
  isCondensed = false,
  hideBalance = false,
}: WalletConnectButtonProps) {
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
    const maxVisible = 15;
    if (address.length <= maxVisible) return address;
    const addr = address.startsWith("0x") ? address : `0x${address}`;
    return `${addr.slice(0, 8)}…${addr.slice(-5)}`;
  };

  // If user is not authenticated, don't show wallet button
  if (!isAuthenticated) {
    return null;
  }

  // If wallet is connected, show wallet info button
  if (currentWallet) {
    const displayBalance = balance?.total || "0.00";
    const contentAlignment = hideBalance ? "items-center" : "items-start";

    if (isCondensed) {
      return (
        <Button
          variant="ghost"
          onClick={togglePopup}
          className="w-10 h-10 p-0 bg-black/30 border border-[#36d26a] rounded-full text-[#7cff9d] shadow-[0_0_12px_2px_rgba(124,255,157,0.3)] hover:shadow-[0_0_16px_3px_rgba(124,255,157,0.45)]"
        >
          <img
            src="/images/canopy-icon.svg"
            alt="Canopy"
            className="h-4 w-4 object-contain drop-shadow-[0_0_8px_rgba(124,255,157,0.8)]"
          />
        </Button>
      );
    }

    return (
      <Button
        variant="ghost"
        onClick={togglePopup}
        className="bg-black/30 text-white hover:bg-black/40 w-full h-auto py-3 px-2 border border-[#36d26a] rounded-md shadow-[0_0_14px_rgba(124,255,157,0.4)]"
      >
        <div className={`flex ${contentAlignment} gap-2 w-full`}>
          <div className="shrink-0 h-8 w-8 rounded bg-linear-to-br from-[#0a2a12] via-[#103a1b] to-[#164c25] border border-[#36d26a] shadow-[0_0_12px_rgba(124,255,157,0.45)] flex items-center justify-center">
            <img
              src="/images/canopy-icon.svg"
              alt="Canopy"
              className="h-4 w-4 object-contain drop-shadow-[0_0_6px_rgba(124,255,157,0.6)]"
            />
          </div>
          <div className="flex-1 min-w-0 text-left space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm text-white truncate">
                {formatAddress(currentWallet.address)}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
            </div>
            {!hideBalance && (
              <div className="text-lg font-semibold text-[#7cff9d] truncate">
                {formatBalanceWithCommas(displayBalance)} CNPY
              </div>
            )}
          </div>
        </div>
      </Button>
    );
  }

  // Otherwise, show connect button (Canopy wallet) with gray gradient style
  if (isCondensed) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        variant="default"
        size="icon"
        className="bg-black/30 text-[#7cff9d] border border-[#36d26a] shadow-[0_0_12px_2px_rgba(124,255,157,0.3)] hover:shadow-[0_0_16px_3px_rgba(124,255,157,0.45)] transition-transform hover:-translate-y-px rounded-full"
        aria-label="Connect Wallet"
      >
        {isConnecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <img
            src="/images/canopy-icon.svg"
            alt="Canopy"
            className="h-4 w-4 object-contain drop-shadow-[0_0_8px_rgba(124,255,157,0.8)]"
          />
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      variant="ghost"
      size="sm"
      className="w-full text-sm font-semibold text-[#7cff9d] border border-[#36d26a] bg-black/30 rounded-md shadow-[0_0_14px_rgba(124,255,157,0.4)] hover:shadow-[0_0_18px_rgba(124,255,157,0.55)] transition-transform hover:-translate-y-px gap-2"
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <img
            src="/images/canopy-icon.svg"
            alt="Canopy"
            className="h-4 w-4 object-contain drop-shadow-[0_0_8px_rgba(124,255,157,0.8)]"
          />
          Connect Wallet
        </>
      )}
    </Button>
  );
}
