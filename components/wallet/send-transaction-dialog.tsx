"use client";

import { useState, useEffect } from "react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Send,
  Loader2,
  AlertCircle,
  Copy,
  ArrowLeft,
  X,
  Check,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SendTransactionRequest } from "@/types/wallet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {isValidAddress} from "@/lib/crypto/wallet";
import { formatBalanceWithCommas, fromMicroUnits } from "@/lib/utils/denomination";
import { walletTransactionApi } from "@/lib/api/wallet-transactions";

interface SendTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SendStep = 1 | 2 | 3 | 4;

export function SendTransactionDialog({
  open,
  onOpenChange,
}: SendTransactionDialogProps) {
  const { currentWallet, sendTransaction, balance } = useWalletStore();

  // Get available assets from balance.tokens
  const availableAssets = balance?.tokens || [];

  const [step, setStep] = useState<SendStep>(1);
  const [selectedAsset, setSelectedAsset] = useState<{
    chainId: number;
    name: string;
    symbol: string;
    balance: string;
  } | null>(null);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation errors
  const [addressError, setAddressError] = useState("");
  const [amountError, setAmountError] = useState("");

  // Fee estimation
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null);
  const [isEstimatingFee, setIsEstimatingFee] = useState(false);
  const [feeError, setFeeError] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1);
        setSelectedAsset(null);
        setToAddress("");
        setAmount("");
        setMemo("");
        setTxHash(null);
        setError(null);
        setAddressError("");
        setAmountError("");
        setIsSending(false);
        setEstimatedFee(null);
        setIsEstimatingFee(false);
        setFeeError(null);
      }, 300);
    }
  }, [open]);

  const handleAssetSelect = (assetId: string) => {
    const asset = availableAssets.find((a) => String(a.chainId) === assetId);
    if (asset) {
      setSelectedAsset({
        chainId: asset.chainId,
        name: asset.name,
        symbol: asset.symbol,
        balance: asset.balance,
      });
    }
  };

  const validateAddress = (addr: string) => {
    if (!addr) {
      setAddressError("Recipient address is required");
      return false;
    }

    if (!isValidAddress(addr)) {
      setAddressError("Invalid address format");
      return false;
    }
    setAddressError("");
    return true;
  };

  const validateAmount = () => {
    const amountNum = parseFloat(amount);
    const availableBalance = selectedAsset
      ? parseFloat(selectedAsset.balance)
      : 0;

    if (!amountNum || amountNum <= 0) {
      setAmountError("Amount must be greater than 0");
      return false;
    }
    if (amountNum > availableBalance) {
      setAmountError("Insufficient balance");
      return false;
    }
    setAmountError("");
    return true;
  };

  const handleMaxClick = () => {
    if (selectedAsset) {
      setAmount(selectedAsset.balance);
      setAmountError("");
    }
  };

  const handleContinueFromStep1 = () => {
    if (selectedAsset) setStep(2);
  };

  const handleContinueFromStep2 = async () => {
    const isAddressValid = validateAddress(toAddress);
    const isAmountValid = validateAmount();

    if (!isAddressValid || !isAmountValid || !selectedAsset || !currentWallet) {
      return;
    }

    // Estimate fee before showing confirmation
    setIsEstimatingFee(true);
    setFeeError(null);

    try {
      const feeResponse = await walletTransactionApi.estimateFee({
        transaction_type: "send",
        from_address: currentWallet.address,
        to_address: toAddress,
        amount: amount,
        chain_id: selectedAsset.chainId,
      });

      setEstimatedFee(feeResponse.estimated_fee);
      setIsEstimatingFee(false);
      setStep(3);
    } catch (err) {
      setIsEstimatingFee(false);
      setFeeError(err instanceof Error ? err.message : "Failed to estimate fee");
      toast.error("Failed to estimate transaction fee. Please try again.");
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setToAddress("");
      setAmount("");
      setMemo("");
      setAddressError("");
      setAmountError("");
    } else if (step === 3) {
      setStep(2);
      setEstimatedFee(null);
      setFeeError(null);
    }
  };

  const handleConfirmSend = async () => {
    if (!currentWallet || !selectedAsset) return;

    // Check if wallet is unlocked
    if (!currentWallet.isUnlocked || !currentWallet.privateKey) {
      setError("Wallet is locked. Please unlock your wallet first.");
      return;
    }

    // Check if fee is available
    if (!estimatedFee) {
      setError("Transaction fee not estimated. Please try again.");
      return;
    }

    setStep(4);
    setIsSending(true);
    setError(null);

    try {
      const feeNumber = parseFloat(estimatedFee);

      if (isNaN(feeNumber)) {
        throw new Error("Invalid fee amount");
      }

      const request: SendTransactionRequest = {
        from_address: currentWallet.address,
        to_address: toAddress,
        fee: feeNumber,
        amount: amount,
        network_id: 1, // Default network ID (mainnet)
        chain_id: selectedAsset.chainId,
        password: "", // Password not needed for locally signed transactions
        memo: memo || undefined,
      };

      console.log("📤 Sending transaction request:", request);

      const hash = await sendTransaction(request);
      setTxHash(hash);
      setIsSending(false);
      toast.success("Transaction sent successfully!");
    } catch (err) {
      setIsSending(false);
      const errorMessage = err instanceof Error ? err.message : "Transaction failed";
      console.error("❌ Transaction failed:", errorMessage, err);
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSendAgain = () => {
    setStep(1);
    setToAddress("");
    setAmount("");
    setMemo("");
    setTxHash(null);
    setError(null);
    setAddressError("");
    setAmountError("");
    setEstimatedFee(null);
    setFeeError(null);
  };

  const handleTryAgain = () => {
    setStep(2);
    setError(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const amountNum = parseFloat(amount) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0" showCloseButton={false}>
        {/* Step 1: Select Asset */}
        {step === 1 && (
          <>
            <VisuallyHidden>
              <DialogTitle>Send - Select Asset</DialogTitle>
            </VisuallyHidden>
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
                <h2 className="text-xl font-bold">Send</h2>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-6">
              <div className="space-y-2">
                <Label className="block text-sm font-medium">Select asset to send</Label>
                <Select value={selectedAsset?.chainId?.toString()} onValueChange={handleAssetSelect}>
                  <SelectTrigger size='md' className="h-auto py-3 [&>span]:line-clamp-none [&>span]:block w-full">
                    <SelectValue placeholder="Choose an asset to send">
                      {selectedAsset ? (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary">
                              <span className="text-sm font-bold text-white">
                                {selectedAsset?.symbol.slice(0, 1)}
                              </span>
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-medium text-sm">{selectedAsset?.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatBalanceWithCommas(selectedAsset?.balance)} {selectedAsset.symbol}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableAssets.map((asset) => (
                      <SelectItem
                        key={asset.chainId}
                        value={String(asset.chainId)}
                        className="h-auto py-3"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary">
                              <span className="text-sm font-bold text-white">
                                {asset.symbol.slice(0, 1)}
                              </span>
                            </div>
                            <div className="flex flex-col items-start gap-1">
                              <span className="font-medium">{asset.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatBalanceWithCommas(asset.balance)} {asset.symbol}
                              </span>
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full h-12" onClick={handleContinueFromStep1} disabled={!selectedAsset}>
                Continue
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Enter Recipient & Amount */}
        {step === 2 && selectedAsset && (
          <>
            <VisuallyHidden>
              <DialogTitle>Send - Enter Details</DialogTitle>
            </VisuallyHidden>
            <div className="relative px-6 py-3 border-b">
              <Button variant="ghost" size="icon" className="absolute left-2 top-2" onClick={handleBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
              <div className="space-y-1 text-center">
                <h2 className="text-xl font-bold">Send {selectedAsset.symbol}</h2>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-6">
              {/* Recipient Address */}
              <div className="space-y-2">
                <Label className="block text-sm font-medium">Recipient Address</Label>
                <Input
                  type="text"
                  placeholder="0x..."
                  value={toAddress}
                  onChange={(e) => {
                    setToAddress(e.target.value);
                    if (addressError) setAddressError("");
                  }}
                  onBlur={() => toAddress && validateAddress(toAddress)}
                  className={addressError ? "border-red-500" : ""}
                />
                {addressError && <p className="text-sm text-red-500">{addressError}</p>}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="block text-sm font-medium">Amount</Label>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleMaxClick}>
                    Max
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setAmount(value);
                        if (amountError) setAmountError("");
                      }
                    }}
                    onBlur={validateAmount}
                    className={`pr-16 text-lg ${amountError ? "border-red-500" : ""}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {selectedAsset.symbol}
                  </span>
                </div>
                {amountError && <p className="text-sm text-red-500">{amountError}</p>}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Available: {formatBalanceWithCommas(selectedAsset.balance)} {selectedAsset.symbol}
                  </span>
                </div>
              </div>

              {/* Memo (optional) */}
              <div className="space-y-2">
                <Label className="block text-sm font-medium">Memo (optional)</Label>
                <Input
                  type="text"
                  placeholder="Add a note..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  maxLength={200}
                />
              </div>

              {/* Fee Estimation Error */}
              {feeError && (
                <div className="flex gap-2 p-3 border border-red-500/20 bg-red-500/5 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-red-500">Fee Estimation Failed</p>
                    <p className="text-muted-foreground">{feeError}</p>
                  </div>
                </div>
              )}

              <Button
                className="w-full h-12"
                onClick={handleContinueFromStep2}
                disabled={!toAddress || !amountNum || amountNum <= 0 || isEstimatingFee}
              >
                {isEstimatingFee ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Estimating Fee...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && selectedAsset && (
          <>
            <VisuallyHidden>
              <DialogTitle>Send - Review & Confirm</DialogTitle>
            </VisuallyHidden>
            <div className="relative p-6 pb-4">
              <Button variant="ghost" size="icon" className="absolute left-2 top-2" onClick={handleBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-bold text-center">Review & Confirm</h2>
            </div>

            <div className="px-6 pb-6 space-y-6">
              {/* From/To Cards */}
              <div className="space-y-4">
                {/* From */}
                <Card className="p-4 border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary">
                      <span className="text-sm font-bold text-white">{selectedAsset.symbol.slice(0, 1)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">From</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{selectedAsset.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Balance: {formatBalanceWithCommas(selectedAsset.balance)} {selectedAsset.symbol}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowDown className="w-5 h-5 text-muted-foreground" />
                </div>

                {/* To */}
                <Card className="p-4 border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Send className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">To</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{formatAddress(toAddress)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => copyToClipboard(toAddress, "Address")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold">Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {amountNum} {selectedAsset.symbol}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Network Fee</span>
                    <div className="text-right">
                      {isEstimatingFee ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <p className="text-sm font-medium text-muted-foreground">Estimating...</p>
                        </div>
                      ) : estimatedFee ? (
                        <p className="text-sm font-medium">{fromMicroUnits(estimatedFee, 6)} CNPY</p>
                      ) : (
                        <p className="text-sm font-medium text-red-500">Fee estimation failed</p>
                      )}
                    </div>
                  </div>

                  {memo && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Memo</span>
                      <p className="text-sm font-medium">{memo}</p>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm font-semibold">Total</span>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {amountNum} {selectedAsset.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning */}
              {!currentWallet?.isUnlocked && (
                <div className="flex gap-2 p-3 border border-red-500/20 bg-red-500/5 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-red-500">Wallet Locked</p>
                    <p className="text-muted-foreground">
                      Your wallet must be unlocked to send transactions. Please unlock your wallet before proceeding.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">
                    This transaction cannot be reversed. Please verify the recipient address before confirming.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full h-12"
                  onClick={handleConfirmSend}
                  disabled={!currentWallet?.isUnlocked || !estimatedFee}
                >
                  Confirm & Send
                </Button>
                <Button variant="ghost" className="w-full" onClick={handleBack}>
                  Cancel
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Step 4: Transaction Status */}
        {step === 4 && selectedAsset && (
          <>
            <VisuallyHidden>
              <DialogTitle>Send - Transaction Status</DialogTitle>
            </VisuallyHidden>
            <div className="relative p-6 pb-4">
              {!isSending && (
                <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={handleClose}>
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>

            <div className="px-6 pb-6 space-y-6">
              {/* Sending State */}
              {isSending && (
                <div className="flex flex-col items-center space-y-4 pb-8">
                  <div className="w-16 h-16 rounded-full border-2 border-foreground/40 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold">Sending Transaction</h2>
                  <p className="text-center text-muted-foreground">
                    Please wait while your transaction is being processed...
                  </p>
                </div>
              )}

              {/* Success State */}
              {!isSending && !error && txHash && (
                <>
                  <div className="flex flex-col items-center space-y-4 py-8">
                    <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center">
                      <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Transaction Sent!</h2>
                    <p className="text-center text-muted-foreground">
                      Your <span className="font-semibold text-foreground">
                        {amountNum} {selectedAsset.symbol}
                      </span>{" "}
                      has been sent successfully
                    </p>
                  </div>

                  {/* Transaction Details */}
                  <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Transaction Hash</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono break-all">{formatAddress(txHash)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => copyToClipboard(txHash, "Transaction hash")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-sm font-medium">
                        {amountNum} {selectedAsset.symbol}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Recipient</p>
                      <p className="text-sm font-medium font-mono">{formatAddress(toAddress)}</p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-3">
                    <Button className="w-full h-12" onClick={handleSendAgain}>
                      Send Another Transaction
                    </Button>
                  </div>
                </>
              )}

              {/* Failed State */}
              {!isSending && error && (
                <>
                  <div className="flex flex-col items-center space-y-4 py-8">
                    <div className="w-16 h-16 rounded-full border-2 border-red-500 flex items-center justify-center">
                      <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Transaction Failed</h2>
                    <p className="text-center text-muted-foreground">{error}</p>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-3">
                    <Button className="w-full h-12" onClick={handleTryAgain}>
                      Try Again
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={handleClose}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
