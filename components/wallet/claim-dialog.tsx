"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { formatBalance, formatUSD } from "@/lib/utils/wallet-helpers";

interface ClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stake?: {
    chain: string;
    symbol: string;
    rewards: number;
    price: number;
    color: string;
  };
  onClaim?: () => void;
}

export function ClaimDialog({
  open,
  onOpenChange,
  stake,
  onClaim,
}: ClaimDialogProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const handleClaim = async () => {
    setIsClaiming(true);
    setClaimSuccess(false);

    // Simulate claim delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsClaiming(false);
    setClaimSuccess(true);

    // Wait to show success state
    setTimeout(() => {
      setClaimSuccess(false);
      onClaim?.();
      onOpenChange(false);
    }, 1500);
  };

  if (!stake) return null;

  const usdValue = stake.rewards * stake.price;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Claim Rewards</DialogTitle>
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
              <p className="text-sm text-muted-foreground">{stake.symbol}</p>
            </div>
          </div>

          {/* Rewards Amount */}
          <div className="p-6 bg-muted/30 rounded-xl space-y-2">
            <p className="text-sm text-muted-foreground">Rewards Available</p>
            <p className="text-3xl font-bold">
              {formatBalance(stake.rewards, 4)} {stake.symbol}
            </p>
            <p className="text-lg text-muted-foreground">
              ≈ {formatUSD(usdValue)}
            </p>
          </div>

          {/* Info */}
          <p className="text-sm text-muted-foreground text-center">
            Rewards will be added to your wallet balance immediately
          </p>

          {/* Action Button */}
          <Button
            className={`w-full h-11 ${
              claimSuccess ? "bg-green-600 hover:bg-green-600" : ""
            }`}
            onClick={handleClaim}
            disabled={isClaiming || claimSuccess}
          >
            {isClaiming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Claiming...
              </>
            ) : claimSuccess ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Claimed!
              </>
            ) : (
              "Claim Rewards"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
