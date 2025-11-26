"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiquidityTabProps {
  baseTokenSymbol: string;
  quoteTokenSymbol: string;
  currentPrice: string;
}

export function LiquidityTab({
  baseTokenSymbol,
  quoteTokenSymbol,
  currentPrice,
}: LiquidityTabProps) {
  const [isAddLiquidity, setIsAddLiquidity] = useState(true);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          {isAddLiquidity ? "Add Liquidity" : "Withdraw Liquidity"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsAddLiquidity(!isAddLiquidity)}
        >
          <ArrowDownUp className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary" />
            <div>
              <div className="font-medium text-sm">{baseTokenSymbol}</div>
              <div className="text-xs text-muted-foreground">
                Balance: 0.00
              </div>
            </div>
          </div>
          <div className="text-right">
            <Input
              type="number"
              placeholder="0"
              variant="wallet"
              className="text-4xl font-semibold text-right w-40 h-auto p-0 bg-transparent!"
            />
            <div className="text-xs text-muted-foreground">$0.00</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-secondary" />
            <div>
              <div className="font-medium text-sm">{quoteTokenSymbol}</div>
              <div className="text-xs text-muted-foreground">
                Balance: 0.00
              </div>
            </div>
          </div>
          <div className="text-right">
            <Input
              type="number"
              placeholder="0"
              variant="wallet"
              className="text-4xl font-semibold text-right w-40 h-auto p-0 bg-transparent!"
            />
            <div className="text-xs text-muted-foreground">$0.00</div>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm mt-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Share of Pool</span>
          <span className="font-medium">0%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Current Rate</span>
          <span className="font-medium">
            1 {baseTokenSymbol} = {currentPrice} {quoteTokenSymbol}
          </span>
        </div>
      </div>

      <Button
        size="lg"
        className={cn(
          "w-full mt-4 text-black",
          isAddLiquidity
            ? "bg-[#30B724] hover:bg-[#30B724]/90"
            : "bg-red-500 hover:bg-red-500/90"
        )}
      >
        {isAddLiquidity ? "Add Liquidity" : "Withdraw Liquidity"}
      </Button>
    </div>
  );
}
