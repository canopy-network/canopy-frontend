"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useWallet } from "./wallet-provider";
import { WalletContent } from "./wallet-content";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  balanceUSD: string;
  icon: string;
}

export function WalletPopup() {
  const { isPopupOpen, closePopup } = useWallet();

  return (
    <Dialog open={isPopupOpen} onOpenChange={closePopup}>
      <DialogContent className="sm:max-w-[420px] bg-[#0e0e0e] border-[#2a2a2a] text-white p-0 overflow-hidden !top-[5%] !right-[2%] !left-auto !translate-x-0 !translate-y-0 p-4">
        <WalletContent />
      </DialogContent>
    </Dialog>
  );
}
