"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Check, Loader2, X } from "lucide-react";
import type { StakingPosition } from "@/types/api";
import { walletTransactionApi, chainsApi } from "@/lib/api";
import { createUnstakeMessage, createAndSignTransaction } from "@/lib/crypto/transaction";
import { useWalletStore } from "@/lib/stores/wallet-store";

interface UnstakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: StakingPosition | null;
  onUnstakeSuccess?: (position: StakingPosition, amount: number) => void;
}

type UnstakeStep = 1 | 2 | 3;

// Parse staked_cnpy which comes formatted like "1,000" to number
function parseCNPY(value: string | number | undefined) {
  if (typeof value === "number") return value;
  return parseFloat((value || "0").toString().replace(/,/g, "")) || 0;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// Get color for chain based on chain ID
function getChainColor(chainId: number): string {
  const colors = [
    "#F97316", // orange
    "#10B981", // green
    "#EC4899", // pink
    "#3B82F6", // blue
    "#EAB308", // yellow
    "#6366F1", // indigo
    "#EF4444", // red
    "#8B5CF6", // purple
  ];

  return colors[chainId % colors.length];
}

export function UnstakeDialog({
  open,
  onOpenChange,
  position,
  onUnstakeSuccess,
}: UnstakeDialogProps) {
  const [step, setStep] = useState<UnstakeStep>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null);
  const [isEstimatingFee, setIsEstimatingFee] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { currentWallet } = useWalletStore();

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1);
        setIsProcessing(false);
        setEstimatedFee(null);
        setIsEstimatingFee(false);
        setError(null);
        setTxHash(null);
      }, 200);
    }
  }, [open]);

  if (!position) return null;

  const stakedAmount = parseCNPY(position.staked_amount);
  const chainColor = getChainColor(position.chain_id);
  const chainName = position.chain_name || `Chain ${position.chain_id}`;
  const unstakingPeriod = 7;

  const handleClose = () => {
    setStep(1);
    setIsProcessing(false);
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (!currentWallet) {
        setError("Connect a wallet to unstake.");
        return;
      }
      if (!currentWallet.isUnlocked || !currentWallet.privateKey) {
        setError("Wallet is locked. Please unlock to unstake.");
        return;
      }
      setError(null);
      setIsEstimatingFee(true);
      try {
        const chainIdNum = Number(position.chain_id);
        const feeRes = await walletTransactionApi.estimateFee({
          transaction_type: "unstake",
          from_address: currentWallet.address,
          to_address: currentWallet.address,
          amount: String(stakedAmount),
          chain_id: chainIdNum,
        });
        setEstimatedFee(feeRes.estimated_fee);
      } catch (err: any) {
        setEstimatedFee(null);
        setError(err?.message || "Failed to estimate fee");
      } finally {
        setIsEstimatingFee(false);
        setStep(2);
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!currentWallet) {
        setError("Connect a wallet to unstake.");
        return;
      }
      if (!currentWallet.isUnlocked || !currentWallet.privateKey) {
        setError("Wallet is locked. Please unlock to unstake.");
        return;
      }
      setIsProcessing(true);
      setError(null);
      try {
        const chainIdNum = Number(position.chain_id);
        const heightRes = await chainsApi.getChainHeight(String(chainIdNum));
        const currentHeight = heightRes.data.height;

        const msg = createUnstakeMessage(currentWallet.address);
        const signedTx = createAndSignTransaction(
          {
            type: "unstake",
            msg,
            fee: Number(estimatedFee) || 0,
            memo: " ",
            networkID: 1,
            chainID: chainIdNum,
            height: currentHeight,
          },
          currentWallet.privateKey,
          currentWallet.public_key,
          currentWallet.curveType as any
        );

        const resp = await walletTransactionApi.sendRawTransaction(signedTx);
        setTxHash((resp as any)?.transaction_hash || null);
        setStep(3);
        onUnstakeSuccess?.(position, stakedAmount);
      } catch (err: any) {
        setError(err?.message || "Unstake failed");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDone = () => {
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0" hideClose>
        {/* Step 1: Unstake review */}
        {step === 1 && (
          <>
            <div className="relative p-6 pb-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="px-6 pb-6 space-y-6">
              <div className="flex flex-col items-center space-y-3">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: chainColor }}
                >
                  <span className="text-xl font-bold text-white">
                    {position.chain_id}
                  </span>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">Unstake {chainName}</h2>
                  <p className="text-sm text-muted-foreground">Chain {position.chain_id}</p>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount to Unstake</span>
                  <span className="font-medium">{formatNumber(stakedAmount)} CNPY</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Unstaking is all-or-nothing. Your full position on this chain will move to the
                  unstaking queue.
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-yellow-500">Unstaking Period</p>
                  <p className="text-xs text-muted-foreground">
                    Your funds will be available after {unstakingPeriod} days. You will stop earning
                    rewards immediately. Your entire staked position will be unstaked.
                  </p>
                </div>
              </div>

              <Button className="w-full h-12" onClick={handleContinue}>
                Continue
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Confirmation */}
        {step === 2 && (
          <>
            <div className="relative p-6 pb-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-2"
                onClick={handleBack}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-bold text-center pt-8">Unstake confirmation</h2>
            </div>

            <div className="px-6 pb-6 space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Summary</h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">From</span>
                    <span className="text-sm font-medium">Staking</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">To</span>
                    <span className="text-sm font-medium">Wallet balance</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Unstaking period</span>
                    <span className="text-sm font-medium">{unstakingPeriod} days</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm font-semibold">Total</span>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatNumber(stakedAmount)} CNPY</p>
                      <p className="text-xs text-muted-foreground">Full position</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By unstaking, you will stop earning rewards immediately. Your funds will be
                  available in your wallet after {unstakingPeriod} days. This action cannot be
                  undone.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full h-12"
                  onClick={handleContinue}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Unstaking...
                    </>
                  ) : (
                    "Confirm Unstake"
                  )}
                </Button>
                <Button variant="ghost" className="w-full" onClick={handleBack} disabled={isProcessing}>
                  Cancel
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <>
            <div className="relative p-6 pb-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="px-6 pb-6 space-y-6">
              <div className="flex flex-col items-center space-y-4 py-8">
                <div className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold">Unstaking initiated!</h2>
                <p className="text-center text-muted-foreground">
                  Your{" "}
                  <span className="font-semibold text-foreground">
                    {formatNumber(stakedAmount)} CNPY
                  </span>{" "}
                  will be available in {unstakingPeriod} days.
                </p>
                <p className="text-sm text-center text-muted-foreground">
                  You can view the unstaking progress in the queue below.
                </p>
              </div>

              <div className="space-y-3">
                <Button className="w-full h-12" onClick={handleDone}>
                  Done
                </Button>
                <Button variant="ghost" className="w-full" onClick={handleDone}>
                  View Portfolio
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
