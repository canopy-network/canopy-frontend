import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Copy,
  ExternalLink,
  ArrowDownUp,
  Wallet,
} from "lucide-react";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  balanceUSD: string;
  icon: string;
}

interface SwapInterfaceProps {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  onFromAmountChange: (amount: string) => void;
  onToAmountChange: (amount: string) => void;
  onSwapTokens: () => void;
  onUseMax: () => void;
}

export function SwapInterface({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  onFromAmountChange,
  onToAmountChange,
  onSwapTokens,
  onUseMax,
}: SwapInterfaceProps) {
  const exchangeRate = "1.00086";

  return (
    <div className="space-y-3">
      {/* From Token */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-lg">
              {fromToken.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {fromToken.symbol}
              </p>
              <p className="text-xs text-gray-400">
                {fromToken.balance} {fromToken.symbol}
              </p>
            </div>
          </div>
          <Button
            onClick={onUseMax}
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
          >
            Use max
          </Button>
        </div>

        <div className="relative">
          <Input
            type="text"
            value={fromAmount}
            onChange={(e) => onFromAmountChange(e.target.value)}
            placeholder="$0"
            className="text-3xl font-semibold bg-transparent border-none p-0 h-auto text-white placeholder:text-gray-600 focus-visible:ring-0"
          />
          <p className="text-sm text-gray-400 mt-2">
            {fromAmount || "0"} {fromToken.symbol} ↕
          </p>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-2 relative z-10">
        <Button
          onClick={onSwapTokens}
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#2a2a2a] hover:border-[#3a3a3a] text-gray-400 hover:text-white"
        >
          <ArrowDownUp className="h-4 w-4" />
        </Button>
      </div>

      {/* To Token */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-lg">
              {toToken.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{toToken.name}</p>
              <p className="text-xs text-gray-400">
                {toToken.balance} {toToken.symbol}
              </p>
            </div>
          </div>
          <p className="text-sm font-medium text-white">{toAmount || "0"}</p>
        </div>

        <p className="text-right text-sm text-gray-400">{toToken.balanceUSD}</p>
      </div>

      {/* Exchange Rate */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        <RefreshCw className="h-4 w-4" />
        <span>
          1 {fromToken.symbol} = {exchangeRate} ${toToken.symbol}
        </span>
      </div>
    </div>
  );
}
