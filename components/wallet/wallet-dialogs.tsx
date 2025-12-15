"use client";

import { useWalletStore } from "@/lib/stores/wallet-store";
import { SendTransactionDialog } from "@/components/wallet/send-transaction-dialog";
import { ReceiveDialog } from "@/components/wallet/receive-dialog";
import { StakeDialog } from "@/components/wallet/stake-dialog";

export function WalletDialogs() {
  const {
    showSendDialog,
    showReceiveDialog,
    showStakeDialog,
    closeSendDialog,
    closeReceiveDialog,
    closeStakeDialog,
  } = useWalletStore();

  return (
    <>
      <SendTransactionDialog
        open={showSendDialog}
        onOpenChange={(open) => {
          if (!open) closeSendDialog();
        }}
      />
      <ReceiveDialog
        open={showReceiveDialog}
        onOpenChange={(open) => {
          if (!open) closeReceiveDialog();
        }}
      />
      <StakeDialog
        open={showStakeDialog}
        onOpenChange={(open) => {
          if (!open) closeStakeDialog();
        }}
      />
    </>
  );
}
