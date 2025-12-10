"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { formatBalance } from "@/lib/utils/wallet-helpers";

interface UnstakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stake?: {
    id: number;
    chain: string;
    symbol: string;
    amount: number;
    price: number;
    color: string;
    apy: number;
  };
  onUnstakeSuccess?: (stake: any, amount: number) => void;
}

export function UnstakeDialog({
  open,
  onOpenChange,
  stake,
  onUnstakeSuccess,
}: UnstakeDialogProps) {
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [unstakeSuccess, setUnstakeSuccess] = useState(false);

  const handleUnstake = async () => {
    if (!stake) return;
    const amount = stake.amount;

    setIsUnstaking(true);
    setUnstakeSuccess(false);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsUnstaking(false);
    setUnstakeSuccess(true);

    setTimeout(() => {
      setUnstakeSuccess(false);
      onUnstakeSuccess?.(stake, amount);
      onOpenChange(false);
    }, 1500);
  };

  if (!stake) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Unstake {stake.symbol}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Chain Info */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${stake.color}20` }}
            >
              <span
                className="text-lg font-bold"
                style={{ color: stake.color }}
              >
                {stake.symbol[0]}
              </span>
            </div>
            <div>
              <p className="font-semibold">{stake.chain}</p>
              <p className="text-sm text-muted-foreground">
                Staked: {formatBalance(stake.amount, 2)} {stake.symbol}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2 p-4 bg-muted/30 rounded-xl border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">You will unstake</span>
              <span className="font-semibold">
                {formatBalance(stake.amount, 2)} {stake.symbol}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Unstaking is all-or-nothing. Your full position on this chain will move to the
              unstaking queue.
            </p>
          </div>

          {/* Warning */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">7-Day Unstaking Period</p>
                <p className="text-sm text-muted-foreground">
                  Your tokens will be available to withdraw after 7 days. You can cancel the
                  unstaking process at any time during this period.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            className={`w-full h-11 ${
              unstakeSuccess ? "bg-green-600 hover:bg-green-600" : ""
            }`}
            onClick={handleUnstake}
            disabled={isUnstaking || unstakeSuccess}
          >
            {isUnstaking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Unstaking...
              </>
            ) : unstakeSuccess ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Unstaked!
              </>
            ) : (
              "Unstake All"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

