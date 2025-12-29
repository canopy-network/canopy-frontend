"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Info, X, Sparkles } from "lucide-react";
import { formatBalance } from "@/lib/utils/wallet-helpers";
import type { MockAvailableChain, MockCommittee, MockStake } from "@/lib/mockdata/staking";

interface ManageCnpyStakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stake: (MockStake & { availableChains?: MockAvailableChain[] }) | null;
  onConfirm: (payload: { amountToAdd: number; committees: number[]; autoCompound: boolean }) => void;
}

export function ManageCnpyStakeDialog({ open, onOpenChange, stake, onConfirm }: ManageCnpyStakeDialogProps) {
  const [amount, setAmount] = useState("");
  const [autoCompound, setAutoCompound] = useState(true);
  const [selectedCommittees, setSelectedCommittees] = useState<number[]>([]);
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (open && stake) {
      setAmount("");
      setAutoCompound(stake.restakeRewards ?? true);
      const initial = new Set<number>();
      (stake.committees ?? []).forEach((c) => initial.add(c.chainId));
      // Always include main chain
      initial.add(stake.chainId);
      setSelectedCommittees(Array.from(initial));
      setStep(1);
    }
  }, [open, stake]);

  const fallbackStake: MockStake & { availableChains?: MockAvailableChain[] } = {
    id: 0,
    chain: "",
    chainId: 0,
    symbol: "CNPY",
    apy: 0,
    amount: 0,
    price: 0,
    balance: 0,
    color: "#1dd13a",
    restakeRewards: true,
    committees: [],
    availableChains: [],
    rewards: 0,
    rewardsUSD: 0,
    isCnpy: true,
  };

  const safeStake = stake ?? fallbackStake;

  const availableChains: MockCommittee[] = useMemo(() => {
    const existing = safeStake.committees ?? [];
    const extras =
      safeStake.availableChains?.map((c) => ({
        chainId: c.chainId,
        chain: c.chain,
        symbol: c.symbol,
        color: c.color,
        rewards: 0,
      })) ?? [];
    // main chain entry
    const main = {
      chainId: safeStake.chainId,
      chain: safeStake.chain,
      symbol: safeStake.symbol,
      color: safeStake.color,
      rewards: safeStake.rewards,
    };
    const unique = new Map<number, MockCommittee>();
    [main, ...existing, ...extras].forEach((c) => {
      unique.set(c.chainId, c);
    });
    return Array.from(unique.values());
  }, [safeStake]);

  const amountNum = parseFloat(amount) || 0;
  const isValid = !!stake && amountNum >= 0 && selectedCommittees.length > 0;
  const isReady = Boolean(stake);

  const toggleCommittee = (id: number) => {
    // main chain always selected
    if (id === safeStake.chainId) return;
    setSelectedCommittees((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onConfirm({
        amountToAdd: amountNum,
        committees: selectedCommittees,
        autoCompound,
      });
      onOpenChange(false);
    }
  };

  if (!isReady) return null;

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[640px] p-0" hideClose>
          <DialogHeader className="sr-only">
            <DialogTitle>Manage CNPY Staking</DialogTitle>
          </DialogHeader>

          {step === 1 && (
            <>
              <div className="relative px-6 py-4 border-b">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">Manage CNPY staking</h2>
                  <p className="text-sm text-muted-foreground">
                    Add more CNPY and choose the baby chains you want to earn from. Unstake is all-or-nothing (7 days).
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-6">
                <div className="p-4 bg-muted/30 rounded-lg border flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: stake.color }}
                  >
                    <span className="text-sm font-bold text-white">{stake.symbol.slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{stake.chain} (Main)</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Current stake: {formatBalance(stake.amount, 2)} {stake.symbol}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{stake.apy}% APY</p>
                    <p className="text-xs text-muted-foreground">CNPY rewards</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Add CNPY (optional)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setAmount((stake.balance || 0).toString())}
                    >
                      Max
                    </Button>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Top-ups only. To reduce your stake, initiate a full unstake (7-day period).
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Select baby chains</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Stake CNPY once and earn CNPY plus native tokens from each selected chain.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {availableChains.map((chain) => {
                      const checked = selectedCommittees.includes(chain.chainId);
                      const isMain = chain.chainId === stake.chainId;
                      return (
                        <label
                          key={chain.chainId}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                            checked ? "border-primary/40 bg-primary/5" : "border-border"
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleCommittee(chain.chainId)}
                            disabled={isMain}
                          />
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: chain.color }}
                          >
                            <span className="text-sm font-bold text-white">{chain.symbol.slice(0, 2)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{chain.chain}</p>
                            <p className="text-xs text-muted-foreground">
                              {chain.symbol}
                              {isMain ? " - Main chain" : ""}
                            </p>
                          </div>
                          {!isMain && (
                            <span className="text-xs text-muted-foreground">{chain.rewards ? "Earning" : "Earn"}</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg flex gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Multichain rewards</p>
                    <p className="text-muted-foreground">
                      You&apos;ll earn CNPY plus native rewards (GAME, DEFI, etc.) for each selected chain. Those baby
                      tokens can also be staked on their own chains.
                    </p>
                  </div>
                </div>

                <Button className="w-full h-11" disabled={!isValid} onClick={handleContinue}>
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="relative px-6 py-4 border-b">
                <Button variant="ghost" size="icon" className="absolute left-2 top-2" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-bold text-center">Review & Confirm</h2>
              </div>

              <div className="px-6 pb-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">
                      {formatBalance(amountNum, 2)} {stake.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chains selected</span>
                    <span className="font-semibold">
                      {selectedCommittees.length} chain{selectedCommittees.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Auto-compound</span>
                    <span className="font-semibold">{autoCompound ? "Enabled" : "Disabled (20% penalty)"}</span>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground leading-relaxed">
                  By confirming, you apply your CNPY stake to the selected chains. Unstaking is full-position and takes
                  ~7 days. Baby chain rewards can be staked separately to compound further.
                </div>

                <div className="space-y-2">
                  <Button className="w-full h-11" onClick={handleContinue}>
                    Confirm
                  </Button>
                  <Button variant="ghost" className="w-full h-10" onClick={() => setStep(1)}>
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
