"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ChevronRight, ArrowDown, Zap, Settings } from "lucide-react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { fromMicroUnits, formatTokenAmount } from "@/lib/utils/denomination";
import toast from "react-hot-toast";
import SlippageSettings from "./slippage-settings";
import type { Token, InputMode, ConfirmationData } from "@/types/trading";

interface SwapTabProps {
  fromToken?: Token | null;
  toToken?: Token | null;
  isPreview?: boolean;
  onSelectToken?: (mode: "from" | "to") => void;
  onSwapTokens?: () => void;
  onShowConfirmation?: (data: ConfirmationData) => void;
}

interface InputValues {
  tokenAmount: string;
  usdAmount: string;
}

export default function SwapTab({
  fromToken = null,
  toToken = null,
  isPreview = false,
  onSelectToken,
  onSwapTokens,
  onShowConfirmation,
}: SwapTabProps) {
  const { wallets, currentWallet, balance, fetchBalance } = useWalletStore();
  const isConnected = wallets.length > 0;

  // Fetch balance when wallet changes
  useEffect(() => {
    if (currentWallet) {
      fetchBalance(currentWallet.id);
    }
  }, [currentWallet, fetchBalance]);

  const isWalletUnlocked =
    currentWallet?.isUnlocked && currentWallet?.privateKey;
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(1.0); // Default 1% slippage
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("token"); // 'token' or 'usd'

  // Get wallet balance for fromToken
  const fromTokenBalance = useMemo(() => {
    if (!fromToken || !balance) return 0;

    // For CNPY, check total balance or look for CNPY/C001 token
    if (fromToken.symbol === "CNPY") {
      const cnpyToken = balance.tokens?.find((t) => t.chainId === 1);
      if (cnpyToken) {
        const availableBalance =
          cnpyToken.distribution?.liquid || cnpyToken.balance;
        const balanceNum = parseFloat(availableBalance) || 0;
        // If balance is > 1 million, it's likely in micro units
        if (balanceNum > 1_000_000) {
          return parseFloat(fromMicroUnits(availableBalance));
        }
        return balanceNum;
      }
      const totalBalance = parseFloat(balance.total) || 0;
      if (totalBalance > 1_000_000) {
        return parseFloat(fromMicroUnits(balance.total));
      }
      return totalBalance;
    }

    // For other tokens, look in tokens array
    const tokenBalance = balance.tokens?.find(
      (t) => t.symbol === fromToken.symbol
    );
    if (tokenBalance) {
      const availableBalance =
        tokenBalance.distribution?.liquid || tokenBalance.balance;
      const balanceNum = parseFloat(availableBalance) || 0;
      // If balance is > 1 million, it's likely in micro units
      if (balanceNum > 1_000_000) {
        return parseFloat(fromMicroUnits(availableBalance));
      }
      return balanceNum;
    }

    return 0;
  }, [fromToken, balance]);

  // Calculate the token amount and USD value based on input mode
  const getInputValues = (): InputValues => {
    if (!amount || amount === "" || !fromToken) {
      return { tokenAmount: "0", usdAmount: "$0.00" };
    }

    const inputAmount = parseFloat(amount);
    const fromPrice = fromToken.currentPrice || 0;

    if (inputMode === "token") {
      // User is inputting token amount, calculate USD
      const usdValue = inputAmount * fromPrice;
      return {
        tokenAmount: parseFloat(
          formatTokenAmount(inputAmount.toFixed(6))
        ).toLocaleString(undefined, {
          maximumFractionDigits: 6,
          minimumFractionDigits: 0,
        }),
        usdAmount: `$${usdValue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      };
    } else {
      // User is inputting USD amount, calculate tokens
      const tokenValue = fromPrice > 0 ? inputAmount / fromPrice : 0;
      return {
        tokenAmount: parseFloat(
          formatTokenAmount(tokenValue.toFixed(6))
        ).toLocaleString(undefined, {
          maximumFractionDigits: 6,
          minimumFractionDigits: 0,
        }),
        usdAmount: `$${inputAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      };
    }
  };

  const inputValues = getInputValues();

  // Get the actual token amount for conversion (always in tokens)
  const getTokenAmountForConversion = (): number => {
    if (!amount || amount === "" || !fromToken) return 0;
    const inputAmount = parseFloat(amount);
    if (inputMode === "token") {
      return inputAmount;
    } else {
      // Convert USD to tokens
      const fromPrice = fromToken.currentPrice || 0;
      return fromPrice > 0 ? inputAmount / fromPrice : 0;
    }
  };

  // Calculate conversion based on token prices
  const calculateConversion = (): { tokens: string; usd: string } => {
    const tokenAmount = getTokenAmountForConversion();
    if (!tokenAmount || tokenAmount === 0 || !fromToken || !toToken) {
      return { tokens: "0", usd: "$0.00" };
    }

    const fromPrice = fromToken.currentPrice || 0;
    const toPrice = toToken.currentPrice || 0;

    if (toPrice === 0) return { tokens: "0", usd: "$0.00" };

    // Calculate value in USD then convert to output token
    const usdValue = tokenAmount * fromPrice;
    const tokensReceived = usdValue / toPrice;

    // Format with commas
    const formattedTokens = parseFloat(
      formatTokenAmount(tokensReceived.toFixed(6))
    ).toLocaleString(undefined, {
      maximumFractionDigits: 6,
      minimumFractionDigits: 0,
    });

    return {
      tokens: formattedTokens,
      usd: `$${usdValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    };
  };

  const conversion = calculateConversion();

  // Toggle between token and USD input modes
  const toggleInputMode = () => {
    if (!fromToken) return;

    const fromPrice = fromToken.currentPrice || 0;
    if (fromPrice === 0) return;

    // Convert the current amount to the new mode
    if (amount && amount !== "") {
      const currentAmount = parseFloat(amount);
      if (inputMode === "token") {
        // Switching to USD mode - convert token amount to USD
        const usdValue = currentAmount * fromPrice;
        setAmount(usdValue.toFixed(2));
      } else {
        // Switching to token mode - convert USD to token amount
        const tokenValue = currentAmount / fromPrice;
        setAmount(tokenValue.toString());
      }
    }

    setInputMode(inputMode === "token" ? "usd" : "token");
  };

  const handleUseMax = () => {
    if (fromTokenBalance > 0) {
      setInputMode("token");
      setAmount(fromTokenBalance.toString());
    } else {
      toast.error(`No ${fromToken?.symbol || "token"} balance available.`);
    }
  };

  const handleAmountChange = (value: string) => {
    // Remove commas for parsing
    const cleanValue = value.replace(/,/g, "");
    // Only allow numbers and decimal point
    if (cleanValue === "" || /^\d*\.?\d*$/.test(cleanValue)) {
      const numValue = parseFloat(cleanValue) || 0;
      // Validate against available balance
      if (inputMode === "token" && numValue > fromTokenBalance) {
        toast.error(
          `Insufficient ${
            fromToken?.symbol || "token"
          } balance. You have ${parseFloat(
            formatTokenAmount(fromTokenBalance.toFixed(6))
          ).toLocaleString(undefined, {
            maximumFractionDigits: 6,
            minimumFractionDigits: 0,
          })} available.`
        );
        return;
      }
      setAmount(cleanValue);
    }
  };

  // Format the amount for display in the input
  const getFormattedAmount = (): string => {
    if (!amount || amount === "") return "";
    const numValue = parseFloat(amount);
    if (isNaN(numValue)) return amount;

    // Format with commas
    if (inputMode === "token") {
      return parseFloat(formatTokenAmount(numValue.toFixed(6))).toLocaleString(
        undefined,
        {
          maximumFractionDigits: 6,
          minimumFractionDigits: 0,
          useGrouping: true,
        }
      );
    } else {
      // For USD mode, format as currency
      return numValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
      });
    }
  };

  const handleSwapDirection = () => {
    // Swap the sell and buy tokens
    if (onSwapTokens) {
      onSwapTokens();
    }
  };

  const handleContinue = () => {
    if (!isConnected || !fromToken || !toToken || !amount) return;

    // Validate balance
    const tokenAmount = getTokenAmountForConversion();
    if (tokenAmount > fromTokenBalance) {
      toast.error(
        `Insufficient ${fromToken.symbol} balance. You have ${parseFloat(
          formatTokenAmount(fromTokenBalance.toFixed(6))
        ).toLocaleString(undefined, {
          maximumFractionDigits: 6,
          minimumFractionDigits: 0,
        })} available.`
      );
      return;
    }

    if (onShowConfirmation) {
      // Always pass the token amount, not USD
      const tokenAmountStr =
        inputMode === "token" ? amount : inputValues.tokenAmount;
      onShowConfirmation({
        fromToken,
        toToken,
        fromAmount: tokenAmountStr,
        toAmount: conversion.tokens,
      });
    }
  };

  return (
    <>
      {/* Input Token Card */}
      <div className="px-4">
        {fromToken ? (
          <Card
            className={`bg-muted/30 p-4 space-y-3 ${
              fromTokenBalance === 0 ? "opacity-80" : ""
            }`}
          >
            {/* Token Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => onSelectToken && onSelectToken("from")}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {/* Token Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: fromToken.brandColor || "#10b981" }}
                >
                  {fromToken.logo ? (
                    <img
                      src={fromToken.logo}
                      alt={fromToken.symbol}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <span className="text-base font-bold text-white">
                      {fromToken.symbol[0]}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold">
                      {fromToken.symbol}
                    </p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Balance:{" "}
                    {parseFloat(
                      formatTokenAmount(fromTokenBalance.toFixed(6))
                    ).toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                      minimumFractionDigits: 0,
                    })}{" "}
                    {fromToken.symbol}
                  </p>
                </div>
              </button>
              <Button
                variant="secondary"
                size="sm"
                className="h-7 text-xs"
                onClick={handleUseMax}
                disabled={fromTokenBalance === 0}
              >
                Use max
              </Button>
            </div>

            {/* Amount Input */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-1">
                {inputMode === "usd" && (
                  <span className="text-4xl font-bold text-muted-foreground">
                    $
                  </span>
                )}
                <input
                  type="text"
                  inputMode="decimal"
                  value={getFormattedAmount()}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  disabled={fromTokenBalance === 0}
                  className="text-4xl font-bold bg-transparent border-0 outline-none p-0 h-auto text-center w-full placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Token Amount / USD Toggle */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={toggleInputMode}
                disabled={fromTokenBalance === 0}
                className="text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inputMode === "token" ? (
                  // Show USD value when in token mode
                  <span>{inputValues.usdAmount}</span>
                ) : (
                  // Show token value when in USD mode
                  <span>
                    {inputValues.tokenAmount} {fromToken.symbol}
                  </span>
                )}
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ) : (
          <Card
            className="bg-muted/30 p-4 hover:bg-muted/40 transition-colors cursor-pointer"
            onClick={() => onSelectToken && onSelectToken("from")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-base font-semibold">Select token</p>
                  <p className="text-sm text-muted-foreground">
                    Choose token to swap
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        )}
      </div>

      {/* Swap Direction Button */}
      <div className="relative flex justify-center">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-8 w-8 bg-background border-2"
          onClick={handleSwapDirection}
          disabled={!fromToken || !toToken}
        >
          <ArrowDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Output Token Card */}
      <div className="px-4">
        {toToken ? (
          <Card className="bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => onSelectToken && onSelectToken("to")}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {/* Token Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: toToken.brandColor || "#10b981" }}
                >
                  {toToken.logo ? (
                    <img
                      src={toToken.logo}
                      alt={toToken.symbol}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <span className="text-base font-bold text-white">
                      {toToken.symbol[0]}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold">{toToken.symbol}</p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    0 {toToken.symbol}
                  </p>
                </div>
              </button>
              <div className="text-right">
                <p className="text-base font-semibold">{conversion.tokens}</p>
                <p className="text-sm text-muted-foreground">
                  {conversion.usd}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card
            className="bg-muted/30 p-4 hover:bg-muted/40 transition-colors cursor-pointer"
            onClick={() => onSelectToken && onSelectToken("to")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-base font-semibold">Select token</p>
                  <p className="text-sm text-muted-foreground">
                    Choose token to receive
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        )}
      </div>

      {/* Connect Wallet / Continue Button */}
      <div className="px-4 pt-4 pb-3">
        <Button
          className="w-full h-11"
          size="lg"
          disabled={isPreview || !fromToken || !toToken || !amount}
          onClick={handleContinue}
        >
          {isPreview
            ? "Preview Mode"
            : !fromToken || !toToken
            ? "Select tokens"
            : !isConnected
            ? "Connect Wallet"
            : !isWalletUnlocked
            ? "Unlock Wallet"
            : "Continue"}
        </Button>
      </div>

      {/* Exchange Rate and Slippage */}
      {fromToken && toToken && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-3.5 h-3.5" />
              <span>
                1 {fromToken.symbol} ={" "}
                {(
                  (fromToken.currentPrice || 0) / (toToken.currentPrice || 1)
                ).toFixed(6)}{" "}
                {toToken.symbol}
              </span>
            </div>
            <button
              onClick={() => setShowSlippageSettings(true)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="font-semibold">{slippage}%</span>
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Slippage Settings Dialog */}
      <SlippageSettings
        open={showSlippageSettings}
        onOpenChange={setShowSlippageSettings}
        slippage={slippage}
        onSlippageChange={setSlippage}
      />
    </>
  );
}
