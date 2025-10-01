"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "./wallet-provider"
import { Wallet, Loader2 } from "lucide-react"

export function WalletConnectButton() {
  const { currentAccount, isConnecting, connectWallet, disconnectWallet } = useWallet()

  if (currentAccount) {
    return (
      <Button
        variant="outline"
        onClick={disconnectWallet}
        className="gap-2 bg-transparent border-[#2a2a2a] text-white hover:bg-[#1a1a1a] w-full justify-start"
      >
        <Wallet className="h-4 w-4" />
        {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="gap-2 w-full bg-primary hover:bg-primary/90 text-black font-medium"
      >
        {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
        {isConnecting ? "Connecting..." : "Sign up"}
      </Button>
      <div className="text-center">
        <span className="text-sm text-muted-foreground">or </span>
        <button className="text-sm text-white hover:text-primary transition-colors">Login</button>
      </div>
    </div>
  )
}
