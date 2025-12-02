"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Cancel Unstaking?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p>
              Are you sure you want to cancel the unstaking process for{" "}
              <span className="font-semibold text-foreground">
                {unstakingItem?.amount} {unstakingItem?.symbol}
              </span>
              ?
            </p>
            <p>
              This will return your funds to active staking and you will continue
              earning rewards.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Unstaking</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Cancel Unstake
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
