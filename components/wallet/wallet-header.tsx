"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Copy, Settings, LogOut } from "lucide-react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { useWallet } from "@/components/wallet/wallet-provider";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatAddress } from "@/lib/utils/wallet-helpers";
import { toast } from "sonner";
import { SwitchWalletDialog } from "@/components/wallet/switch-wallet-dialog";
import { OrderTracker } from "@/components/trading/order-tracker";

export function WalletHeader() {
  const router = useRouter();
  const { currentWallet } = useWallet();
  const { wallets, selectWallet } = useWalletStore();
  const { logout } = useAuthStore();
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);

  if (!currentWallet) {
    return null;
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(currentWallet.address);
    toast.success("Address copied to clipboard");
  };

  const handleDisconnect = () => {
    // Logout from auth
    logout();
    toast.success("Logged out successfully");
    // Redirect to home
    router.push("/");
  };

  const handleSwitchWallet = async (walletId: string) => {
    await selectWallet(walletId);
  };

  // Get wallet name or default to "My Wallet"
  const walletName = currentWallet.wallet_name || "My Wallet";

  // Get first letter of wallet name for avatar
  const avatarLetter = walletName.charAt(0).toUpperCase();

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Avatar */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1dd13a] flex items-center justify-center shrink-0">
              <span className="text-base sm:text-lg font-bold text-white">{avatarLetter}</span>
            </div>

            {/* Wallet Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="text-sm sm:text-base font-semibold text-foreground truncate">
                  {formatAddress(currentWallet.address)}
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 hover:bg-muted" onClick={copyAddress}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                <button
                  onClick={() => {
                    // "My Wallet" - could navigate to wallet settings or do nothing
                  }}
                  className="hover:text-foreground transition-colors"
                >
                  {walletName}
                </button>
                <span className="text-muted-foreground">•</span>
                <button onClick={() => setShowSwitchDialog(true)} className="hover:text-foreground transition-colors">
                  Switch Wallet
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Order Tracker */}
            <OrderTracker />

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-muted"
              onClick={() => router.push("/settings")}
            >
              <Settings className="w-4 h-4 sm:w-5 sm:w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-red-500 hover:text-red-500 hover:bg-red-500/10"
              onClick={handleDisconnect}
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Switch Wallet Dialog */}
      <SwitchWalletDialog
        open={showSwitchDialog}
        onOpenChange={setShowSwitchDialog}
        wallets={wallets}
        currentWallet={currentWallet}
        onSelectWallet={handleSwitchWallet}
      />
    </>
  );
}
