"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Clock, AlertTriangle } from "lucide-react";

interface SellOrderConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  cnpyAmount: number;
  pricePerCnpy: number;
  usdcReceive: number;
  destinationCurrency: string;
  sellMode: "instant" | "create";
  estimatedFillTime?: string;
  isSubmitting?: boolean;
}

export default function SellOrderConfirmationDialog({
  open,
  onClose,
  onConfirm,
  cnpyAmount,
  pricePerCnpy,
  usdcReceive,
  destinationCurrency,
  sellMode,
  estimatedFillTime = "2-4 hours",
  isSubmitting = false,
}: SellOrderConfirmationDialogProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      // Trigger animation after mount
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/80 z-10 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Confirmation Content */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-background rounded-t-2xl max-h-[95vh] transition-transform duration-300 ease-out ${
          isAnimating ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-6 pt-8 pb-6">
          {/* Clock Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-1.5 mb-6">
            <h2 className="text-xl font-bold">Create Sell Order</h2>
            <p className="text-sm text-muted-foreground">Your order will be posted to the order book</p>
          </div>

          {/* Order Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Selling</span>
              <span className="text-sm font-semibold">{cnpyAmount.toLocaleString()} CNPY</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="text-sm font-semibold">${pricePerCnpy.toFixed(3)}/CNPY</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">You receive (if filled)</span>
              <span className="text-sm font-semibold">
                ${usdcReceive.toFixed(2)} {destinationCurrency}
              </span>
            </div>
          </div>

          {/* Fee Information */}
          <div className="flex items-center justify-between py-2 mb-4">
            <span className="text-sm text-muted-foreground">Fee</span>
            <span className="text-sm font-semibold text-green-500">No fees</span>
          </div>

          {/* Warning Box */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-sm">
                <p className="font-medium text-yellow-500">Order may not fill immediately</p>
                <p className="text-muted-foreground">Your order will remain active until filled or cancelled.</p>
                <p className="text-muted-foreground">Estimated fill time: {estimatedFillTime}</p>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <Button
            className="w-full h-11 bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white"
            size="lg"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Confirm Order"}
          </Button>
        </div>
      </div>
    </>
  );
}
