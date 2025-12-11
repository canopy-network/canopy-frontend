"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ChevronRight, ArrowDown, Zap, Settings } from "lucide-react";
import { useWalletStore } from "@/lib/stores/wallet-store";
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
  const { wallets, currentWallet } = useWalletStore();
  const isConnected = wallets.length > 0;

  console.log("currentWallet", currentWallet);
  const isWalletUnlocked =
    currentWallet?.isUnlocked && currentWallet?.privateKey;
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(1.0); // Default 1% slippage
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("token"); // 'token' or 'usd'

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
        tokenAmount: amount,
        usdAmount: `$${usdValue.toFixed(2)}`,
      };
    } else {
      // User is inputting USD amount, calculate tokens
      const tokenValue = fromPrice > 0 ? inputAmount / fromPrice : 0;
      return {
        tokenAmount: tokenValue.toLocaleString("en-US", {
          maximumFractionDigits: 6,
        }),
        usdAmount: `$${inputAmount.toFixed(2)}`,
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

    return {
      tokens: tokensReceived.toLocaleString("en-US", {
        maximumFractionDigits: 6,
      }),
      usd: `$${usdValue.toFixed(2)}`,
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
    // TODO: Set to max balance
    setAmount("100");
  };

  const handleSwapDirection = () => {
    // Swap the sell and buy tokens
    if (onSwapTokens) {
      onSwapTokens();
    }
  };

  const handleContinue = () => {
    if (isConnected && fromToken && toToken && amount && onShowConfirmation) {
      // Always pass the token amount, not USD
      const tokenAmount =
        inputMode === "token" ? amount : inputValues.tokenAmount;
      onShowConfirmation({
        fromToken,
        toToken,
        fromAmount: tokenAmount,
        toAmount: conversion.tokens,
      });
    }
  };

  return (
    <>
      {/* Input Token Card */}
      <div className="px-4">
        {fromToken ? (
          <Card className="bg-muted/30 p-4 space-y-3">
            {/* Token Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => onSelectToken && onSelectToken("from")}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {/* Token Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
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
                    0 {fromToken.symbol}
                  </p>
                </div>
              </button>
              <Button
                variant="secondary"
                size="sm"
                className="h-7 text-xs"
                onClick={handleUseMax}
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
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers and decimal point
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setAmount(value);
                    }
                  }}
                  placeholder="0"
                  className="text-4xl font-bold bg-transparent border-0 outline-none p-0 h-auto text-center w-full placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Token Amount / USD Toggle */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={toggleInputMode}
                className="text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
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
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
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
