"use client";

/**
 * Close Order Dialog
 *
 * Handles sending the actual USDC payment to complete a locked order.
 * This dialog is shown when the user wants to complete a swap by paying
 * the seller's requested USDC amount.
 *
 * Flow:
 * 1. Order must already be locked (has buyerReceiveAddress)
 * 2. User confirms USDC payment details
 * 3. ERC20 transfer sent to seller with CloseOrder JSON appended
 * 4. Committee witnesses payment and releases CNPY to buyer
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, ExternalLink, Wallet, DollarSign } from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useCloseOrder } from "@/lib/hooks/use-close-order";
import { USDC_ADDRESSES } from "@/lib/web3/config";
import type { OrderBookApiOrder } from "@/types/orderbook";

const DECIMALS = 1_000_000; // 6 decimals

interface CloseOrderDialogProps {
  order: OrderBookApiOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CloseOrderDialog({
  order,
  open,
  onOpenChange,
  onSuccess,
}: CloseOrderDialogProps) {
  const [step, setStep] = useState<"confirm" | "processing" | "success" | "error">("confirm");

  // Ethereum wallet
  const { address: ethAddress, isConnected: isEthConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();

  // Check if USDC is supported on this chain
  const usdcSupported = chainId && USDC_ADDRESSES[chainId];

  // Close order hook
  const {
    sendCloseOrder,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
    txHash,
    reset,
  } = useCloseOrder({ order });

  // Update step based on hook state
  useEffect(() => {
    if (isPending || isConfirming) {
      setStep("processing");
    } else if (isSuccess) {
      setStep("success");
    } else if (isError) {
      setStep("error");
    }
  }, [isPending, isConfirming, isSuccess, isError]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setStep("confirm");
      reset();
    }
  }, [open, reset]);

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && onSuccess) {
      // Delay to show success state before closing
      const timer = setTimeout(() => {
        onSuccess();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccess]);

  if (!order) return null;

  const cnpyAmount = order.amountForSale / DECIMALS;
  const usdcAmount = order.requestedAmount / DECIMALS;
  const price = order.requestedAmount / order.amountForSale;

  // Format seller's ETH address for display
  const sellerEthAddress = order.sellerReceiveAddress?.startsWith("0x")
    ? order.sellerReceiveAddress
    : `0x${order.sellerReceiveAddress}`;

  const canProceed = isEthConnected && usdcSupported;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Complete Purchase
          </DialogTitle>
          <DialogDescription>
            Send USDC to the seller to complete this swap
          </DialogDescription>
        </DialogHeader>

        {step === "confirm" && (
          <>
            {/* Order Details */}
            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-600 font-medium">
                  Order is locked and ready for payment
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Send USDC to complete the swap. CNPY will be released to your wallet.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">You Pay</span>
                  <div className="text-lg font-bold text-red-500">
                    ${usdcAmount.toLocaleString()} USDC
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">You Receive</span>
                  <div className="text-lg font-bold text-green-500">
                    {cnpyAmount.toLocaleString()} CNPY
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm border-t pt-4">
                <span className="text-muted-foreground">Price</span>
                <span className="font-mono">${price.toFixed(6)} per CNPY</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-xs">{order.id.slice(0, 16)}...</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Seller's ETH Address</span>
                <span className="font-mono text-xs">
                  {sellerEthAddress.slice(0, 10)}...{sellerEthAddress.slice(-6)}
                </span>
              </div>

              {/* Wallet Status */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    <span className="text-sm">Ethereum Wallet</span>
                  </div>
                  {isEthConnected && ethAddress ? (
                    <Badge variant="outline" className="font-mono text-xs">
                      {ethAddress.slice(0, 8)}...
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConnectModal?.()}
                    >
                      Connect
                    </Button>
                  )}
                </div>

                {/* Chain Warning */}
                {isEthConnected && !usdcSupported && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-500/10 text-yellow-500 rounded text-sm">
                    <AlertCircle className="w-4 h-4" />
                    USDC not supported on this network. Please switch to Ethereum Mainnet.
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={sendCloseOrder}
                disabled={!canProceed}
                className="bg-green-500 hover:bg-green-600"
              >
                Pay ${usdcAmount.toLocaleString()} USDC
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "processing" && (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <div>
              <p className="font-medium">
                {isPending ? "Waiting for wallet confirmation..." : "Confirming transaction..."}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Please confirm the transaction in your wallet
              </p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="py-8 text-center space-y-4">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
            <div>
              <p className="font-medium text-green-500">Payment Sent Successfully!</p>
              <p className="text-sm text-muted-foreground mt-1">
                The committee will release your CNPY shortly.
              </p>
            </div>
            {txHash && (
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View on Etherscan
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {step === "error" && (
          <div className="py-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
            <div>
              <p className="font-medium text-red-500">Transaction Failed</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error?.message || "An error occurred while sending payment"}
              </p>
            </div>
            <DialogFooter className="justify-center">
              <Button variant="outline" onClick={() => setStep("confirm")}>
                Try Again
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
