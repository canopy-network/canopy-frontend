"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "./wallet-provider";
import { Wallet, Loader2 } from "lucide-react";

export function WalletConnectButton() {
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
      className="gap-2 w-full bg-transparent border-[#2a2a2a] text-white hover:bg-[#1a1a1a]"
      variant="outline"
    >
      {isConnecting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="h-4 w-4" />
      )}
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
