"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { formatBalance, formatUSD } from "@/lib/utils/wallet-helpers";

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

const PERCENTAGE_OPTIONS = [25, 50, 75, 100];

export function UnstakeDialog({
  open,
  onOpenChange,
  stake,
  onUnstakeSuccess,
}: UnstakeDialogProps) {
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [unstakeSuccess, setUnstakeSuccess] = useState(false);

  const handlePercentageClick = (percentage: number) => {
    if (!stake) return;
    setSelectedPercentage(percentage);
    const amount = (stake.amount * percentage) / 100;
    setUnstakeAmount(amount.toString());
  };

  const handleAmountChange = (value: string) => {
    setUnstakeAmount(value);
    setSelectedPercentage(null);
  };

  const handleUnstake = async () => {
    if (!stake || !unstakeAmount) return;

    const amount = parseFloat(unstakeAmount);
    if (isNaN(amount) || amount <= 0 || amount > stake.amount) return;

    setIsUnstaking(true);
    setUnstakeSuccess(false);

    // Simulate unstake delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsUnstaking(false);
    setUnstakeSuccess(true);

    // Wait to show success state
    setTimeout(() => {
      setUnstakeSuccess(false);
      onUnstakeSuccess?.(stake, amount);
      onOpenChange(false);
      setUnstakeAmount("");
      setSelectedPercentage(null);
    }, 1500);
  };

  if (!stake) return null;

  const amount = parseFloat(unstakeAmount) || 0;
  const usdValue = amount * stake.price;
  const isValid = amount > 0 && amount <= stake.amount;

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

          {/* Percentage Buttons */}
          <div>
            <Label className="mb-3 block">Quick Select</Label>
            <div className="grid grid-cols-4 gap-2">
              {PERCENTAGE_OPTIONS.map((percentage) => (
                <Button
                  key={percentage}
                  variant={selectedPercentage === percentage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePercentageClick(percentage)}
                >
                  {percentage}%
                </Button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="unstake-amount">Amount to Unstake</Label>
            <div className="relative">
              <Input
                id="unstake-amount"
                type="number"
                placeholder="0.00"
                value={unstakeAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                max={stake.amount}
                step="0.01"
                className="pr-16"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {stake.symbol}
              </div>
            </div>
            {amount > 0 && (
              <p className="text-sm text-muted-foreground">
                ≈ {formatUSD(usdValue)}
              </p>
            )}
          </div>

          {/* Warning */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">7-Day Unstaking Period</p>
                <p className="text-sm text-muted-foreground">
                  Your tokens will be available to withdraw after 7 days. You can
                  cancel the unstaking process at any time during this period.
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
            disabled={!isValid || isUnstaking || unstakeSuccess}
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
              "Unstake"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
