"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, Check, Info, Wallet, X } from "lucide-react";
import { formatBalance } from "@/lib/utils/wallet-helpers";

export interface EarnRewardsStake {
  id: number;
  chain: string;
  chainId: number;
  symbol: string;
  apy: number;
  amount: number;
  price: number;
  balance: number;
  color: string;
  restakeRewards?: boolean;
}

interface EarnRewardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stake: EarnRewardsStake | null;
  onConfirm: (amount: number, autoCompound: boolean) => void;
}

export function EarnRewardsDialog({
  open,
  onOpenChange,
  stake,
  onConfirm,
}: EarnRewardsDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState("");
  const [autoCompound, setAutoCompound] = useState(true);

  useEffect(() => {
    if (open && stake) {
      setAutoCompound(stake.restakeRewards ?? true);
      setAmount("");
      setStep(1);
    }
  }, [open, stake]);

  const amountNum = parseFloat(amount) || 0;
  const availableBalance = stake?.balance ?? 0;
  const isAddingMore = (stake?.amount ?? 0) > 0;
  const projectedYearlyInterest = useMemo(() => {
    if (!stake) return 0;
    return amountNum * (stake.apy / 100);
  }, [amountNum, stake]);

  const projectedYearlyInterestUSD = useMemo(() => {
    if (!stake) return 0;
    return projectedYearlyInterest * (stake.price || 0);
  }, [projectedYearlyInterest, stake]);

  const isValid = amountNum > 0 && amountNum <= availableBalance;

  const handleMax = () => {
    setAmount(availableBalance.toString());
  };

  const handlePercent = (pct: number) => {
    setAmount(((availableBalance * pct) / 100).toString());
  };

  const handleClose = () => {
    setStep(1);
    setAmount("");
    onOpenChange(false);
  };

  const handleContinue = () => {
    if (step === 1 && isValid) {
      setStep(2);
    } else if (step === 2) {
      onConfirm(amountNum, autoCompound);
      handleClose();
    }
  };

  if (!stake) return null;

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] p-0" hideClose>
          <DialogHeader className="sr-only" />

          {step === 1 && (
            <>
              <div className="relative px-6 py-3 border-b">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={handleClose}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">
                    {isAddingMore ? `Add More ${stake.symbol}` : "Earn Rewards"}
                  </h2>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-6">
                <div className="p-4 mt-2 bg-muted/30 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: stake.color }}
                      >
                        <span className="text-sm font-bold text-white">
                          {stake.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{stake.chain}</p>
                        <p className="text-sm text-muted-foreground">
                          {stake.symbol}
                        </p>
                      </div>
                    </div>
                    {isAddingMore ? (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Currently staked
                        </p>
                        <p className="font-semibold">
                          {formatBalance(stake.amount, 2)} {stake.symbol}
                        </p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-2xl font-bold">{stake.apy}%</p>
                        <p className="text-xs text-muted-foreground">APY</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="block text-sm font-medium">Source</Label>
                  <div className="flex items-center gap-3 h-auto py-3 px-3 border rounded-md bg-background">
                    <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">Wallet balance</span>
                      <span className="text-xs text-muted-foreground">
                        {formatBalance(availableBalance, 2)} {stake.symbol}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-8"
                      onClick={handleMax}
                    >
                      Max
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="block text-sm font-medium">Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  <div className="flex gap-2 flex-wrap">
                    {[25, 50, 75, 100].map((pct) => (
                      <Button
                        key={pct}
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => handlePercent(pct)}
                      >
                        {pct}%
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ~${(amountNum * (stake.price || 0)).toFixed(2)} USD
                  </p>
                  {isAddingMore && (
                    <p className="text-xs text-muted-foreground">
                      Top-ups only. To reduce your position, initiate a full unstake (~7 days).
                    </p>
                  )}
                </div>

                <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Auto-compound rewards</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Rewards will be automatically restaked to grow your position.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      checked={autoCompound}
                      onCheckedChange={setAutoCompound}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Projected yearly rewards</span>
                    <span className="font-semibold">
                      {formatBalance(projectedYearlyInterest, 2)} {stake.symbol}{" "}
                      <span className="text-xs text-muted-foreground">
                        (${projectedYearlyInterestUSD.toFixed(2)})
                      </span>
                    </span>
                  </div>
                  {!autoCompound && (
                    <div className="flex items-start gap-2 text-xs p-3 border border-yellow-500/30 bg-yellow-500/10 rounded-md">
                      <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <p className="text-muted-foreground">
                        Disabling auto-compound incurs a 20% penalty on rewards to help maintain network stability.
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  disabled={!isValid}
                  onClick={handleContinue}
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="relative px-6 py-3 border-b">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={handleClose}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-xl font-bold">Review</h2>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-6">
                <div className="p-4 bg-muted/30 rounded-lg border space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: stake.color }}
                    >
                      <span className="text-sm font-bold text-white">
                        {stake.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{stake.chain}</p>
                      <p className="text-sm text-muted-foreground">{stake.symbol}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-sm text-muted-foreground">APY</p>
                      <p className="font-semibold">{stake.apy}%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stake amount</span>
                    <span className="font-semibold">
                      {formatBalance(amountNum, 2)} {stake.symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Projected yearly rewards</span>
                    <span className="font-semibold">
                      {formatBalance(projectedYearlyInterest, 2)} {stake.symbol}{" "}
                      <span className="text-xs text-muted-foreground">
                        (${projectedYearlyInterestUSD.toFixed(2)})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Auto-compound</span>
                    <span className="font-semibold flex items-center gap-1">
                      {autoCompound ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          Enabled
                        </>
                      ) : (
                        "Disabled (20% penalty)"
                      )}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground leading-relaxed">
                  By confirming, you agree to lock these tokens for staking. Unstake is all-or-nothing and takes ~7 days.
                </div>

                <div className="space-y-2">
                  <Button className="w-full" onClick={handleContinue}>
                    Confirm
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
