"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";
import { PoolToken } from "../../../types/amm/pool";
import { TokenSelectorModal } from "../../shared/token-selector-modal";

export enum LiquidityAction {
  Deposit = "deposit",
  Withdraw = "withdraw",
}

interface LiquidityTabProps {
  baseToken: PoolToken;
  quoteToken: PoolToken;
  availableTokens: PoolToken[];
  onOpenConfirm: (action: LiquidityAction) => void;
  onTokenSelect: (token: PoolToken) => void;
}

export function LiquidityTab({
  baseToken,
  quoteToken,
  availableTokens,
  onOpenConfirm,
  onTokenSelect,
}: LiquidityTabProps) {
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);

  const handleTokenSelect = (tokenSymbol: string) => {
    const token = availableTokens.find((t) => t.symbol === tokenSymbol);
    if (token) {
      onTokenSelect(token);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center justify-between h-full">
          <button
            onClick={() => setIsTokenSelectorOpen(true)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-5 w-5">
              <AvatarImage src={baseToken.icon} />
              <AvatarFallback>{baseToken.symbol[0]}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="font-medium text-sm flex items-center gap-1">
                {baseToken.symbol}
                <ChevronRight className="h-3 w-3" />
              </div>
              <div className="text-xs text-muted-foreground">Balance: 0.00</div>
            </div>
          </button>
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
            <Avatar className="h-5 w-5">
              <AvatarImage src={quoteToken.icon} />
              <AvatarFallback>{quoteToken.symbol[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{quoteToken.symbol}</div>
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
            {baseToken.symbol} Staked
          </span>
          <span className="font-medium">0.00 {baseToken.symbol}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Deposit APY</span>
          <span className="font-medium">0.00%</span>
        </div>
      </div>

      <TokenSelectorModal
        open={isTokenSelectorOpen}
        onOpenChange={setIsTokenSelectorOpen}
        tokens={availableTokens}
        selectedToken={baseToken.symbol}
        onSelectToken={handleTokenSelect}
      />
    </div>
  );
}
