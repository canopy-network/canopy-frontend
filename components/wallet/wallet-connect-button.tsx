"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "./wallet-provider";
import { Wallet, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function WalletConnectButton({
  isCondensed = false,
}: {
  isCondensed?: boolean;
}) {
  const { currentAccount, isConnecting, connectWallet, togglePopup } =
    useWallet();

  if (currentAccount) {
    return (
      <Button
        variant="outline"
        onClick={togglePopup}
        className="gap-2 bg-transparent border-[#2a2a2a] text-white hover:bg-[#1a1a1a] w-full justify-start"
      >
        <Wallet className="h-4 w-4" />
        {currentAccount.address.slice(0, 6)}...
        {currentAccount.address.slice(-4)}
      </Button>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className={cn(
        "gap-2 w-full bg-transparent border-green-600/50 text-green-500 hover:bg-green-950/30 hover:border-green-600 h-12 rounded-2xl font-medium",
        isCondensed ? "h-10 w-10" : "h-12"
      )}
      variant="outline"
    >
      {isConnecting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="h-4 w-4" />
      )}
      {isCondensed ? null : isConnecting ? "Connecting..." : "Connect wallet"}
    </Button>
  );
}
