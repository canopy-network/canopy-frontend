import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  RefreshCw,
  ArrowDownUp,
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

  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/[^\d.]/g, "");

    if (!numericValue) return "$0";

    const parts = numericValue.split(".");
    let integerPart = parts[0];
    const decimalPart = parts[1];

    integerPart = integerPart.replace(/^0+/, "") || "0";

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    const formatted =
      decimalPart !== undefined
        ? `$${formattedInteger}.${decimalPart}`
        : `$${formattedInteger}`;

    return formatted;
  };

  const parseCurrency = (formatted: string): string => {
    return formatted.replace(/[$,]/g, "");
  };

  const isBuyMode = fromToken.symbol === "CNPY";

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (isBuyMode) {
      const numericValue = parseCurrency(inputValue);
      onFromAmountChange(numericValue);
    } else {
      const value = inputValue;
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        onFromAmountChange(value);
      }
    }
  };

  const getTokenPrice = (symbol: string): number => {
    const prices: Record<string, number> = {
      CNPY: usdCurrentPrice,
      ETH: 2500,
      BTC: 65000,
      USDC: 1,
      OBNB: 300,
      MATIC: 0.9,
    };
    return prices[symbol] || usdCurrentPrice;
  };

  const calculateTokenFromUsd = (
    usdAmount: string,
    tokenSymbol: string
  ): string => {
    if (!usdAmount || usdAmount === "0") return "0";
    const usdValue = parseFloat(usdAmount);
    if (isNaN(usdValue)) return "0";

    const tokenPrice = getTokenPrice(tokenSymbol);
    const tokenAmount = usdValue / tokenPrice;

    return tokenAmount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };

  const calculateUsdFromToken = (
    tokenAmount: string,
    tokenSymbol: string
  ): string => {
    if (!tokenAmount || tokenAmount === "0") return "0";
    const amount = parseFloat(tokenAmount);
    if (isNaN(amount)) return "0";

    const tokenPrice = getTokenPrice(tokenSymbol);
    const usdValue = amount * tokenPrice;

    return usdValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculatePreview = (): string => {
    if (!fromAmount || fromAmount === "0") return "0";

    if (isBuyMode) {
      return calculateTokenFromUsd(fromAmount, toToken.symbol);
    } else {
      return calculateUsdFromToken(fromAmount, fromToken.symbol);
    }
  };

  const displayFromAmount = isBuyMode
    ? fromAmount
      ? formatCurrency(fromAmount)
      : "$0"
    : fromAmount || "0";

  const previewAmount = calculatePreview();
  const previewText = isBuyMode
    ? `${previewAmount} ${toToken.symbol} ↕`
    : `$${previewAmount} ↕`;

  return (
    <div className="space-y-3">
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
            placeholder={isBuyMode ? "$0" : "0"}
            size="wallet"
            variant="wallet"
            className="text-center text-[40px] border-none px-0"
          />
          <p className="text-sm text-gray-400 mt-2">{previewText}</p>
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

      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        <RefreshCw className="h-4 w-4" />
        <span>
          1 {fromToken.symbol} = {exchangeRate} ${toToken.symbol}
        </span>
      </div>
    </div>
  );
}
