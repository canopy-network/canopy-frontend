"use client";
import { useWallet } from "@/components/wallet/wallet-provider";
import { Button } from "@/components/ui/button";

export function Header() {
  const { togglePopup } = useWallet();
  return (
    <header>
      <Button onClick={() => togglePopup()}>Open Wallet</Button>
    </header>
  );
}
