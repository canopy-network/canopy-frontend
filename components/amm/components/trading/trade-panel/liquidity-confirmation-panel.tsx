"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiquidityAction } from "./liquidity-tab";
import { PoolToken } from "../../../types/amm/pool";

interface LiquidityConfirmationPanelProps {
  isOpen: boolean;
  action: LiquidityAction;
  baseToken: PoolToken;
  quoteToken: PoolToken;
  amountUsd: string;
  baseTokenPrice: string;
  cnpyPrice: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function LiquidityConfirmationPanel({
  isOpen,
  action,
  baseToken,
  quoteToken,
  amountUsd,
  baseTokenPrice,
  cnpyPrice,
  onClose,
  onConfirm,
}: LiquidityConfirmationPanelProps) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 top-[72px] bg-card border-t rounded-t-2xl transition-transform duration-300 ease-in-out",
        isOpen ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="h-full flex flex-col p-6">
        <div className="flex justify-end mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <div className="flex -space-x-2">
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage src={baseToken.icon} />
              <AvatarFallback>{baseToken.symbol[0]}</AvatarFallback>
            </Avatar>
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage src={quoteToken.icon} />
              <AvatarFallback>{quoteToken.symbol[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg">
              <span className="text-muted-foreground">
                {action === LiquidityAction.Deposit ? "Deposit" : "Withdraw"}{" "}
              </span>
              <span className="font-semibold">{amountUsd} worth of</span>
              <span className="text-muted-foreground">
                {" "}{baseToken.symbol} and {quoteToken.symbol}
              </span>
            </h3>
            <p className="text-sm text-muted-foreground">
              at {baseTokenPrice} per {baseToken.symbol} and {cnpyPrice} per{" "}
              {quoteToken.symbol}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Share of Pool</span>
            <span className="font-medium">0%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Deposit APY</span>
            <span className="font-medium">0.00%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Net Balance</span>
            <span className="font-medium">$0.00</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Network Fee</span>
            <span className="font-medium">$0.00 (0.00 CNPY)</span>
          </div>
        </div>

        <Button
          size="lg"
          onClick={onConfirm}
          className={`w-full text-black ${
            action === LiquidityAction.Deposit
              ? "bg-[#30B724] hover:bg-[#30B724]/90"
              : "bg-red-500 hover:bg-red-500/90"
          }`}
        >
          {action === LiquidityAction.Deposit ? "Deposit" : "Withdraw"}
        </Button>
      </div>
    </div>
  );
}
