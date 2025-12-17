"use client";

/**
 * Delete Order Dialog
 *
 * Handles deleting a sell order. Only the order creator can delete their own
 * unlocked orders. Escrowed CNPY will be returned upon deletion.
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
import { Loader2, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import type { OrderBookApiOrder } from "@/types/orderbook";

const DECIMALS = 1_000_000; // 6 decimals

interface DeleteOrderDialogProps {
  order: OrderBookApiOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteOrderDialog({
  order,
  open,
  onOpenChange,
  onSuccess,
}: DeleteOrderDialogProps) {
  const [step, setStep] = useState<"confirm" | "processing" | "success" | "error">("confirm");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Wallet store
  const { deleteOrder, isLoading } = useWalletStore();

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setStep("confirm");
      setError(null);
      setTxHash(null);
    }
  }, [open]);

  // Handle successful transaction
  useEffect(() => {
    if (step === "success" && onSuccess) {
      // Delay to show success state before closing
      const timer = setTimeout(() => {
        onSuccess();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, onSuccess]);

  const handleDelete = async () => {
    if (!order) return;

    setStep("processing");
    setError(null);

    try {
      const hash = await deleteOrder(order.id, order.committee);
      setTxHash(hash);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete order");
      setStep("error");
    }
  };

  if (!order) return null;

  const cnpyAmount = order.amountForSale / DECIMALS;
  const usdcAmount = order.requestedAmount / DECIMALS;
  const price = order.requestedAmount / order.amountForSale;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Delete Order
          </DialogTitle>
          <DialogDescription>
            Cancel this sell order and return your escrowed CNPY
          </DialogDescription>
        </DialogHeader>

        {step === "confirm" && (
          <>
            {/* Order Details */}
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-500 font-medium">
                  Are you sure you want to delete this order?
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your escrowed CNPY will be returned to your wallet.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">CNPY Escrowed</span>
                  <div className="text-lg font-bold text-green-500">
                    {cnpyAmount.toLocaleString()} CNPY
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Requested USDC</span>
                  <div className="text-lg font-bold">
                    ${usdcAmount.toLocaleString()}
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
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                disabled={isLoading}
              >
                Delete Order
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "processing" && (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <div>
              <p className="font-medium">Deleting order...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please wait while we process your request
              </p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="py-8 text-center space-y-4">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
            <div>
              <p className="font-medium text-green-500">Order Deleted Successfully!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your CNPY has been returned to your wallet.
              </p>
            </div>
            {txHash && (
              <p className="text-xs text-muted-foreground font-mono">
                TX: {txHash.slice(0, 16)}...
              </p>
            )}
          </div>
        )}

        {step === "error" && (
          <div className="py-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
            <div>
              <p className="font-medium text-red-500">Failed to Delete Order</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error || "An error occurred while deleting your order"}
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
