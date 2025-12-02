"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatBalance, formatTimeRemaining } from "@/lib/utils/wallet-helpers";
import { useEffect, useState } from "react";

interface UnstakingDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unstakingItem?: {
    id: number;
    chain: string;
    symbol: string;
    amount: number;
    availableAt: number; // timestamp
    color: string;
  };
  onCancelUnstake: () => void;
}

export function UnstakingDetailSheet({
  open,
  onOpenChange,
  unstakingItem,
  onCancelUnstake,
}: UnstakingDetailSheetProps) {
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    if (!unstakingItem) return;

    const updateTime = () => {
      setTimeRemaining(formatTimeRemaining(unstakingItem.availableAt));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [unstakingItem]);

  if (!unstakingItem) return null;

  const isAvailable = Date.now() >= unstakingItem.availableAt;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[420px]">
        <SheetHeader>
          <SheetTitle>Unstaking Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Chain Info */}
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${unstakingItem.color}20` }}
            >
              <span
                className="text-2xl font-bold"
                style={{ color: unstakingItem.color }}
              >
                {unstakingItem.symbol[0]}
              </span>
            </div>
            <div>
              <p className="font-semibold text-lg">{unstakingItem.chain}</p>
              <Badge variant="secondary" className="mt-1">
                Pending
              </Badge>
            </div>
          </div>

          {/* Amount */}
          <div className="p-6 bg-muted/30 rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">Unstaking Amount</p>
            <p className="text-3xl font-bold">
              {formatBalance(unstakingItem.amount, 2)} {unstakingItem.symbol}
            </p>
          </div>

          {/* Time Remaining */}
          <div className="p-6 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isAvailable ? "Available" : "Available In"}
              </p>
            </div>
            <p className="text-2xl font-bold">
              {isAvailable ? "Now" : timeRemaining}
            </p>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-sm">
              {isAvailable
                ? "Your tokens are now available to withdraw to your wallet."
                : "You can cancel the unstaking process at any time to return your tokens to active staking."}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {!isAvailable && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={onCancelUnstake}
              >
                Cancel Unstaking
              </Button>
            )}
            {isAvailable && (
              <Button className="w-full">
                Withdraw to Wallet
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
