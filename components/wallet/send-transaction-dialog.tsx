"use client";

import { useState, useEffect } from "react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { retrieveMasterSeedphrase } from "@/lib/crypto/seed-storage";
import { formatCnpy, isValidAmount } from "@/lib/utils/denomination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Send, Loader2, AlertCircle, Info } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/utils/error-handler";
import type { SendTransactionRequest } from "@/types/wallet";

interface SendTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendTransactionDialog({
  open,
  onOpenChange,
}: SendTransactionDialogProps) {
  const { currentWallet, sendTransaction, estimateFee, isLoading } =
    useWalletStore();

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  // Auto-estimate fee when form values change
  useEffect(() => {
    const estimateFeeAuto = async () => {
      if (!toAddress || !amount || !currentWallet) {
        setEstimatedFee(null);
        return;
      }

      // Validate amount is a number
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setEstimatedFee(null);
        return;
      }

      try {
        setIsEstimating(true);
        const fee = await estimateFee({
          transaction_type: "send",
          from_address: currentWallet.address,
          to_address: toAddress,
          amount: amount,
          chain_id: 0,
        });
        setEstimatedFee(fee);
      } catch (error) {
        console.error("Failed to estimate fee:", error);
        setEstimatedFee(null);
      } finally {
        setIsEstimating(false);
      }
    };

    // Debounce the estimation
    const timeoutId = setTimeout(() => {
      estimateFeeAuto();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [toAddress, amount, currentWallet, estimateFee]);

  const handleSend = async () => {
    if (!currentWallet || !toAddress || !amount) {
      showErrorToast(new Error("Please fill in all required fields"), "Validation Error");
      return;
    }

    // Check if wallet is unlocked (required for signing transactions locally)
    if (!currentWallet.isUnlocked || !currentWallet.privateKey) {
      showErrorToast(
        new Error("Wallet is locked. Please unlock your wallet first to send transactions."),
        "Wallet Locked"
      );
      return;
    }

    try {
      const request: SendTransactionRequest = {
        from_address: currentWallet.address,
        to_address: toAddress,
        amount: amount,
        chain_id: 0, // Default chain ID
        password: "", // Not needed anymore - signing happens locally with privateKey
        memo: memo || undefined,
      };

      const txHash = await sendTransaction(request);

      showSuccessToast(`Transaction sent successfully! Hash: ${txHash.slice(0, 10)}...`);

      // Reset form
      setToAddress("");
      setAmount("");
      setMemo("");
      setEstimatedFee(null);

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to send transaction:", error);
      showErrorToast(error, "Failed to send transaction");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Transaction
          </DialogTitle>
          <DialogDescription>
            Send CNPY tokens from your wallet to another address
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* From Address (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="from-address">From Address</Label>
            <Input
              id="from-address"
              value={currentWallet?.address || ""}
              disabled
              className="font-mono text-sm"
            />
          </div>

          {/* To Address */}
          <div className="space-y-2">
            <Label htmlFor="to-address">
              To Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="to-address"
              placeholder="Enter recipient address"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount (CNPY) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>

          {/* Memo (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="memo">Memo (Optional)</Label>
            <Textarea
              id="memo"
              placeholder="Add a note to this transaction"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
            />
          </div>

          {/* Transaction Details Section */}
          {(toAddress && amount && parseFloat(amount) > 0) && (
            <>
              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Info className="h-4 w-4 text-primary" />
                  Transaction Details
                </div>

                {/* Fee Estimation */}
                <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Fee</span>
                    {isEstimating ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-sm">Calculating...</span>
                      </div>
                    ) : estimatedFee ? (
                      <span className="text-sm font-medium">{formatCnpy(estimatedFee)} CNPY</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">--</span>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">You will send</span>
                    <span className="text-sm font-medium">{formatCnpy(amount)} CNPY</span>
                  </div>

                  {estimatedFee && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Total Cost</span>
                        <span className="text-sm font-semibold">
                          {formatCnpy((parseFloat(amount) + parseFloat(estimatedFee)).toString())} CNPY
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Wallet Locked Warning */}
          {currentWallet && !currentWallet.isUnlocked && (
            <div className="flex gap-2 p-3 border border-red-500/20 bg-red-500/5 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-red-500">Wallet Locked</p>
                <p className="text-muted-foreground">
                  Your wallet must be unlocked to send transactions. Please unlock your
                  wallet before proceeding.
                </p>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="flex gap-2 p-3 border border-yellow-500/20 bg-yellow-500/5 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-yellow-500">Confirm Transaction</p>
              <p className="text-muted-foreground">
                Please review all details carefully. Transactions cannot be reversed
                once confirmed on the blockchain.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={
              !toAddress ||
              !amount ||
              !currentWallet ||
              !currentWallet.isUnlocked ||
              isLoading ||
              parseFloat(amount) <= 0
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Confirm & Send
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
