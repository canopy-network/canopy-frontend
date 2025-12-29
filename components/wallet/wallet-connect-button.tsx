"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "./wallet-provider";
import { Wallet, Loader2, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { formatBalanceWithCommas } from "@/lib/utils/denomination";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface WalletConnectButtonProps {
  isCondensed?: boolean;
  hideBalance?: boolean;
}

export function WalletConnectButton({ isCondensed = false, hideBalance = false }: WalletConnectButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { currentWallet, isConnecting, connectWallet } = useWallet();
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
          onClick={() => router.push('/wallet')}
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
        size="freeflow"
        onClick={() => router.push('/wallet')}
        className="w-full rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 p-4 transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col items-start"
      >
        <div className={`flex justify-between w-full`}>
          <span className="text-xs">Balance</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-wallet w-4 h-4 text-white/70"
            aria-hidden={true}
          >
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
            <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
          </svg>
        </div>
        <span className="text-xl text-left font-bold text-white ">{formatBalanceWithCommas(displayBalance)} CNPY</span>
        <div className="flex-1 min-w-0 text-left space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="w-5 h-5 rounded-full bg-[#1dd13a] flex items-center justify-center shrink-0 text-xs font-bold text-white">
              {currentWallet.wallet_name.charAt(0).toUpperCase()}
            </div>
            <span className="font-mono text-sm text-white truncate">{formatAddress(currentWallet.address)}</span>
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
        className="w-10 h-10 p-0 bg-black/30 border border-[#36d26a] rounded-full text-[#7cff9d] shadow-[0_0_12px_2px_rgba(124,255,157,0.3)] hover:shadow-[0_0_16px_3px_rgba(124,255,157,0.45)] transition-transform hover:-translate-y-px"
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
