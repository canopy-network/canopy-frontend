"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import type { UnstakingEntry } from "@/types/api";

interface UnstakingDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unstakingItem?: UnstakingEntry | null;
  onCancel?: (item: UnstakingEntry) => void;
}

// Parse CNPY which comes formatted like "1,000" to number
function parseCNPY(cnpyString: string): number {
  return parseFloat(cnpyString.replace(/,/g, "")) || 0;
}

// Format number to CNPY string with commas
function formatCNPY(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// Get color for chain based on chain ID
function getChainColor(chainId: number): string {
  const colors = [
    "#FFD700", // gold for main chain (1)
    "#F97316", // orange
    "#10B981", // green
    "#EC4899", // pink
    "#3B82F6", // blue
    "#EAB308", // yellow
    "#6366F1", // indigo
    "#EF4444", // red
  ];

  if (chainId === 1) return colors[0];
  return colors[chainId % colors.length];
}

export function UnstakingDetailSheet({
  open,
  onOpenChange,
  unstakingItem,
  onCancel,
}: UnstakingDetailSheetProps) {
  if (!unstakingItem) return null;

  const chainColor = getChainColor(unstakingItem.chain_id);
  const isReady = unstakingItem.status === "ready";
  const unstakingCNPY = parseCNPY(unstakingItem.unstaking_cnpy || "0");
  const unstakingNative = parseFloat(unstakingItem.unstaking_amount || "0");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Unstaking Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Chain Info */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ backgroundColor: chainColor }}
            >
              <span className="text-xl font-bold text-white">
                {unstakingItem.chain_id}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg">
                {unstakingItem.chain_name || `Chain ${unstakingItem.chain_id}`}
              </p>
              <Badge variant={isReady ? "default" : "secondary"} className="mt-1">
                {isReady ? "Ready to Claim" : "Unstaking"}
              </Badge>
            </div>
          </div>

          {/* Amount Being Unstaked */}
          <div className="p-5 bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl border">
            <p className="text-sm text-muted-foreground mb-3">Amount Being Unstaked</p>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{formatCNPY(unstakingCNPY)}</p>
                <span className="text-lg text-muted-foreground">CNPY</span>
              </div>
              {unstakingNative > 0 && (
                <p className="text-sm text-muted-foreground">
                  {formatCNPY(unstakingNative)} native tokens
                </p>
              )}
            </div>
          </div>

          {/* Progress Information */}
          <div className="space-y-4">
            {/* Time Remaining / Ready */}
            <div className="p-4 bg-muted/30 rounded-xl border">
              <div className="flex items-start gap-3">
                {isReady ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    {isReady ? "Available Now" : "Available In"}
                  </p>
                  <p className="text-xl font-bold">
                    {isReady ? "Ready to claim" : unstakingItem.time_remaining}
                  </p>
                </div>
              </div>
            </div>

            {/* Block Progress */}
            {!isReady && (
              <div className="p-4 bg-muted/30 rounded-xl border">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Blocks Remaining</span>
                    <span className="font-semibold">
                      {unstakingItem.blocks_remaining.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Height</span>
                    <span className="font-medium">
                      {unstakingItem.current_height.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Unstaking Height</span>
                    <span className="font-medium">
                      {unstakingItem.unstaking_height.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Estimated Completion */}
            {!isReady && unstakingItem.estimated_completion && (
              <div className="p-4 bg-muted/30 rounded-xl border">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Estimated Completion</p>
                  <p className="text-sm font-medium">
                    {new Date(unstakingItem.estimated_completion).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Initiated Time */}
            {unstakingItem.unstake_initiated_time && (
              <div className="p-4 bg-muted/30 rounded-xl border">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Unstake Initiated</p>
                  <p className="text-sm font-medium">
                    {new Date(unstakingItem.unstake_initiated_time).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Information Box */}
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border ${
              isReady
                ? "bg-green-500/10 border-green-500/20"
                : "bg-blue-500/10 border-blue-500/20"
            }`}
          >
            {isReady ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className={`text-sm font-medium ${isReady ? "text-green-700" : "text-blue-700"}`}>
                {isReady ? "Ready to Claim" : "What happens during unstaking?"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isReady
                  ? "Your tokens are now available to withdraw to your wallet."
                  : "Your tokens are no longer earning rewards and will become available in your wallet after the unstaking period completes. You can cancel this unstake request at any time to return your tokens to active staking."}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {!isReady && onCancel && (
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => {
                  onCancel(unstakingItem);
                  onOpenChange(false);
                }}
              >
                Cancel Unstake Request
              </Button>
            )}
            {isReady && (
              <Button className="w-full h-12">Claim to Wallet</Button>
            )}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
