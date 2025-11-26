"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export enum LiquidityAction {
  Deposit = "deposit",
  Withdraw = "withdraw",
}

interface LiquidityTabProps {
  baseTokenSymbol: string;
  quoteTokenSymbol: string;
  onOpenConfirm: (action: LiquidityAction) => void;
}

export function LiquidityTab({
  baseTokenSymbol,
  quoteTokenSymbol,
  onOpenConfirm,
}: LiquidityTabProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary" />
            <div>
              <div className="font-medium text-sm">{baseTokenSymbol}</div>
              <div className="text-xs text-muted-foreground">Balance: 0.00</div>
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
              <div className="text-xs text-muted-foreground">Balance: 0.00</div>
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

      <div className="flex gap-3 mt-4">
        <Button
          size="lg"
          onClick={() => onOpenConfirm(LiquidityAction.Withdraw)}
          className="flex-1 text-black bg-red-500 hover:bg-red-500/90"
        >
          Withdraw
        </Button>
        <Button
          size="lg"
          onClick={() => onOpenConfirm(LiquidityAction.Deposit)}
          className="flex-1 text-black bg-[#30B724] hover:bg-[#30B724]/90"
        >
          Deposit
        </Button>
      </div>

      <div className="space-y-2 text-sm mt-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Share of Pool</span>
          <span className="font-medium">0%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">CNPY Staked</span>
          <span className="font-medium">0.00 CNPY</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            {baseTokenSymbol} Staked
          </span>
          <span className="font-medium">0.00 {baseTokenSymbol}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Deposit APY</span>
          <span className="font-medium">0.00%</span>
        </div>
      </div>
    </div>
  );
}
