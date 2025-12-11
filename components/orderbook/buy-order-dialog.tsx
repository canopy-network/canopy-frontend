"use client";

/**
 * Buy Order Dialog
 *
 * Handles both LockOrder and CloseOrder flows for buying CNPY:
 * - LockOrder: Order not locked yet (no buyerReceiveAddress) - signals intent, amount=0
 * - CloseOrder: Order already locked (has buyerReceiveAddress) - sends actual USDC payment
 *
 * Requires both Canopy wallet (to receive CNPY) and Ethereum wallet (to send USDC).
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
import { Loader2, Wallet, AlertCircle, CheckCircle, ExternalLink, Lock } from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { useLockOrder } from "@/lib/hooks/use-lock-order";
import { useCloseOrder } from "@/lib/hooks/use-close-order";
import { USDC_ADDRESSES } from "@/lib/web3/config";
import { isOrderLocked, type OrderBookApiOrder } from "@/types/orderbook";

const DECIMALS = 1_000_000; // 6 decimals

interface BuyOrderDialogProps {
  order: OrderBookApiOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BuyOrderDialog({
  order,
  open,
  onOpenChange,
  onSuccess,
}: BuyOrderDialogProps) {
  const [step, setStep] = useState<"confirm" | "processing" | "success" | "error">("confirm");

  // Ethereum wallet
  const { address: ethAddress, isConnected: isEthConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();

  // Canopy wallet
  const { currentWallet } = useWalletStore();
  const canopyAddress = currentWallet?.address;

  // Check if USDC is supported on this chain
  const usdcSupported = chainId && USDC_ADDRESSES[chainId];

  // Determine if this order needs LockOrder or CloseOrder
  const orderIsLocked = order ? isOrderLocked(order) : false;

  // Lock order hook (for unlocked orders)
  const lockOrder = useLockOrder({
    order,
    buyerCanopyAddress: canopyAddress || "",
  });

  // Close order hook (for locked orders)
  const closeOrder = useCloseOrder({
    order,
  });

  // Use the appropriate hook based on order state
  const activeHook = orderIsLocked ? closeOrder : lockOrder;
  const {
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
    txHash,
    reset,
  } = activeHook;

  const sendOrder = orderIsLocked ? closeOrder.sendCloseOrder : lockOrder.sendLockOrder;

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

  // For LockOrder: only need Canopy address
  // For CloseOrder: need ETH wallet to send USDC
  const canProceedLock = isEthConnected && canopyAddress && usdcSupported;
  const canProceedClose = isEthConnected && usdcSupported;
  const canProceed = orderIsLocked ? canProceedClose : canProceedLock;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {orderIsLocked ? (
              <>
                <Lock className="w-5 h-5 text-yellow-500" />
                Complete Purchase
              </>
            ) : (
              "Buy CNPY"
            )}
          </DialogTitle>
          <DialogDescription>
            {orderIsLocked
              ? "This order is locked. Send USDC to complete the purchase."
              : "Lock this sell order to purchase CNPY with USDC"}
          </DialogDescription>
        </DialogHeader>

        {step === "confirm" && (
          <>
            {/* Order Status Badge */}
            {orderIsLocked && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-600 rounded-md text-sm">
                <Lock className="w-4 h-4" />
                Order is locked - ready for USDC payment
              </div>
            )}

            {/* Order Details */}
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">You Pay</span>
                  <div className="text-lg font-bold">
                    {orderIsLocked ? (
                      <span className="text-red-500">${usdcAmount.toLocaleString()} USDC</span>
                    ) : (
                      <span className="text-muted-foreground">$0 (Lock only)</span>
                    )}
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

              {orderIsLocked && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Seller's ETH Address</span>
                  <span className="font-mono text-xs">
                    {order.sellerReceiveAddress.startsWith("0x")
                      ? `${order.sellerReceiveAddress.slice(0, 10)}...`
                      : `0x${order.sellerReceiveAddress.slice(0, 8)}...`}
                  </span>
                </div>
              )}

              {/* Wallet Status */}
              <div className="space-y-2 border-t pt-4">
                {/* Canopy Wallet - only needed for LockOrder */}
                {!orderIsLocked && (
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      <span className="text-sm">Canopy Wallet</span>
                    </div>
                    {canopyAddress ? (
                      <Badge variant="outline" className="font-mono text-xs">
                        {canopyAddress.slice(0, 8)}...
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Not Connected</Badge>
                    )}
                  </div>
                )}

                {/* Ethereum Wallet */}
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

              {/* Missing Wallet Warning */}
              {!orderIsLocked && !canopyAddress && (
                <div className="flex items-center gap-2 p-2 bg-yellow-500/10 text-yellow-500 rounded text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Please connect your Canopy wallet to receive CNPY
                </div>
              )}

              {/* Explanation of next steps */}
              {!orderIsLocked && (
                <div className="p-3 bg-muted/30 rounded text-sm text-muted-foreground">
                  <strong>Step 1 of 2:</strong> Lock this order (no USDC sent yet).
                  After locking, you'll need to send the USDC payment to complete the purchase.
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={sendOrder}
                disabled={!canProceed}
                className={orderIsLocked ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
              >
                {orderIsLocked ? `Pay $${usdcAmount.toLocaleString()} USDC` : "Lock Order"}
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
              <p className="font-medium text-green-500">
                {orderIsLocked ? "Payment Sent Successfully!" : "Order Locked Successfully!"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {orderIsLocked
                  ? "The committee will release your CNPY shortly."
                  : "Now send the USDC payment to complete the purchase."}
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
                {error?.message || "An error occurred while processing your order"}
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
