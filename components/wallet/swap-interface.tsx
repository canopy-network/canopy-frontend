import { useState, useEffect } from "react";
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
import { ChainToken } from "@/types/chains";
interface SwapInterfaceProps {
  fromToken: ChainToken;
  toToken: ChainToken;
  fromAmount: string;
  toAmount: string;
  onFromAmountChange: (amount: string) => void;
  onToAmountChange: (amount: string) => void;
  onSwapTokens: () => void;
  onUseMax: () => void;
  cnpyAvailableAmount: number;
  usdCurrentPrice: number;
}

/**
 * Controlled component for perfomring crypto swaps. Needs to be wrapped in a parent component to be used.
 *
 * @param {Token} fromToken, the token to be swapped from
 * @param {Token} toToken, the token to be swapped to
 * @param {number} cnpyAvailableAmount, the max amount of Canopy available on the wallet
 * @param {number} usdCurrentPrice, the current price of Canopy but in  Usd
 * @param {string} fromAmount, the amount of the from token to be swapped
 * @param {string} toAmount, the amount of the to token to be swapped
 * @param {Function} onFromAmountChange, the function to be called when the from amount changes
 * @param {Function} onToAmountChange, the function to be called when the to amount changes
 * @param {Function} onSwapTokens, the function to be called when the tokens are swapped
 * @param {Function} onUseMax, the function to be called when the max amount is used
 * @param {boolean} showBalance, this renders the balance of current account is wallet
 */
export function SwapInterface({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  onFromAmountChange,
  onToAmountChange,
  onSwapTokens,
  onUseMax,
  cnpyAvailableAmount,
  usdCurrentPrice,
}: SwapInterfaceProps) {
  const exchangeRate = "1.00086";

  // Format number with commas and dollar sign
  const formatCurrency = (value: string): string => {
    // Remove everything except digits and decimal point
    const numericValue = value.replace(/[^\d.]/g, "");

    // Handle empty input
    if (!numericValue) return "$0";

    // Split into integer and decimal parts
    const parts = numericValue.split(".");
    let integerPart = parts[0];
    const decimalPart = parts[1];

    // Remove leading zeros but keep at least one zero if value is 0
    integerPart = integerPart.replace(/^0+/, "") || "0";

    // Add commas to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Combine with decimal part if it exists
    const formatted =
      decimalPart !== undefined
        ? `$${formattedInteger}.${decimalPart}`
        : `$${formattedInteger}`;

    return formatted;
  };

  // Parse formatted currency back to numeric string
  const parseCurrency = (formatted: string): string => {
    return formatted.replace(/[$,]/g, "");
  };

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseCurrency(inputValue);
    onFromAmountChange(numericValue);
  };

  // Calculate CNPY amount based on USD input
  const calculateCnpyAmount = (usdAmount: string): string => {
    if (!usdAmount || usdAmount === "0") return "0";
    const usdValue = parseFloat(usdAmount);
    if (isNaN(usdValue)) return "0";

    // Calculate CNPY: USD / price per CNPY
    const cnpyAmount = usdValue / usdCurrentPrice;

    // Format with commas and up to 2 decimal places
    return cnpyAmount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const displayFromAmount = fromAmount ? formatCurrency(fromAmount) : "$0";
  const calculatedCnpyAmount = calculateCnpyAmount(fromAmount);

  return (
    <div className="space-y-3">
      {/* From Token */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 relative">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-2 ">
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
            variant="secondary"
            size="sm"
            className="h-7 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
          >
            Use max
          </Button>
        </div>

        <div className="relative flex flex-col items-center mb-2">
          <Input
            type="text"
            value={displayFromAmount}
            onChange={handleFromAmountChange}
            placeholder="$0"
            size="wallet"
            variant="wallet"
            className="text-center text-[40px] border-none px-0"
          />
          <p className="text-sm text-gray-400 mt-2">
            {calculatedCnpyAmount} {fromToken.symbol} ↕
          </p>
        </div>

        <div
          id="swap-button"
          className="flex justify-center absolute -bottom-6 left-0 right-0 z-10"
        >
          <Button
            onClick={onSwapTokens}
            variant="neomorphic"
            size="icon"
            className=" outline-4 outline-black"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* To Token */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center justify-between mb-3 flex-col w-full">
        <div className="flex items-center gap-2 w-full">
          <div className="min-h-8 min-w-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-lg">
            {toToken.icon}
          </div>
          <div className="flex flex-col w-full">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-white">{toToken.name}</p>

              <span className="text-sm font-medium text-white text-right">
                {toAmount || "0"}
              </span>
            </div>

            <div className="flex justify-between">
              <p className="text-sm text-white/50">
                {toToken.balance} {toToken.symbol}
              </p>

              <span className="text-right text-sm text-white/50">
                {toToken.balanceUSD}
              </span>
            </div>
          </div>
        </div>
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
