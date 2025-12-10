"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface CancelUnstakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  unstakingItem?: {
    chain: string;
    symbol: string;
    amount: number;
  };
}

export function CancelUnstakeDialog({
  open,
  onOpenChange,
  onConfirm,
  unstakingItem,
}: CancelUnstakeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Cancel Unstaking?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to cancel the unstaking process for{" "}
            <span className="font-semibold text-foreground">
              {unstakingItem?.amount} {unstakingItem?.symbol}
            </span>{" "}
            on {unstakingItem?.chain}?
          </p>
          <p className="text-sm text-muted-foreground">
            This will return your funds to active staking and you will continue earning rewards.
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Keep Unstaking
            </Button>
            <Button onClick={onConfirm}>Cancel Unstake</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
