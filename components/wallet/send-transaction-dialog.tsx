"use client";

import { useState, useEffect } from "react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { retrieveMasterSeedphrase } from "@/lib/crypto/seed-storage";
import {convertApiAmountsToStandard, formatTokenAmount, fromMicroUnits, isValidAmount} from "@/lib/utils/denomination";
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
import {Send, Loader2, AlertCircle, Info, Shield, Copy, ArrowLeft, X, CheckCircle, Check} from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/utils/error-handler";
import type { SendTransactionRequest } from "@/types/wallet";
import {toast} from "sonner";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface SendTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SendTransactionStep =
    | "chain-selection"
    | "to-address"
    | "confirm"
    | "loading"
    | "success";

export function SendTransactionDialog({
  open,
  onOpenChange,
}: SendTransactionDialogProps) {
  const { currentWallet, sendTransaction, estimateFee, isLoading, balance } =
    useWalletStore();

  // Get available assets from balance.tokens
  const availableAssets = balance?.tokens || [];

  const [selectedAsset, setSelectedAsset] = useState<{ chainId: number, name:string,  symbol: string, balance: string } | null>(null);
  const [step, setStep] = useState<SendTransactionStep>("chain-selection");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const handleAssetSelect = (assetId: string) => {
    const asset = availableAssets.find(a => String(a.chainId) === assetId);
    if (asset) {
      setSelectedAsset({
        chainId: asset.chainId,
        name: asset.name,
        symbol: asset.symbol,
        balance: asset.balance
      });
    }
  }

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


  useEffect(() => {
    if(!open) {
      setStep("chain-selection");
      setSelectedAsset(null);
    }
  }, [open]);

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

  const renderStepContent = () => {

    switch (step) {
      case "chain-selection":
        return (
            <>
              <div className="space-y-2 w-full ">
                <Label className="block text-sm font-medium">Select asset to send</Label>
                <Select value={selectedAsset?.chainId?.toString()} onValueChange={handleAssetSelect}>
                  <SelectTrigger className="h-auto w-full " size={"md"}>
                    <SelectValue placeholder="Choose an asset to send">
                      {selectedAsset ? (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary"
                              >
                                  <span className="text-sm font-bold text-white">
                                    {selectedAsset?.symbol.slice(0, 1)}
                                  </span>
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="font-medium text-sm">{selectedAsset?.name}</span>
                                <span className="text-xs text-muted-foreground">
                                     {fromMicroUnits(selectedAsset?.balance).toLocaleString()} {selectedAsset.symbol}
                                  </span>
                              </div>
                            </div>
                          </div>
                      ) : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {currentWallet && (
                        <>
                          {availableAssets.map((asset) => (
                              <SelectItem key={asset.chainId} value={String(asset.chainId)} className="h-auto py-3">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                    >
                                  <span className="text-sm font-bold text-white">
                                    {asset.symbol.slice(0, 1)}
                                  </span>
                                    </div>
                                    <div className="flex flex-col items-start gap-1">
                                      <span className="font-medium">{asset.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                     {asset.balance.toLocaleString()} {asset.symbol}
                                  </span>
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                          ))}
                        </>
                    )}

                  </SelectContent>
                </Select>
              </div>

              <Button variant="default"  disabled={!selectedAsset} onClick={() => setStep("to-address")} className="w-full">Continue</Button>

            </>
      );

      case "to-address":
        return (
            <></>
        );

      case "confirm":
        return (
           <></>
        );

      case "loading":
        return (
           <></>
        );

      case "success":
        return (
            <></>
        );

      default:
        return null;
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className={'border-b pb-2'}>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send
          </DialogTitle>
        </DialogHeader>

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
