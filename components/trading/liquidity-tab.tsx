"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Zap, Plus, ArrowLeft } from "lucide-react";
import {
  useLiquidityPoolsStore,
  type LiquidityPool,
} from "@/lib/stores/liquidity-pools-store";
import tokensData from "@/data/tokens.json";
import LiquidityConfirmationDialog from "./liquidity-confirmation-dialog";
import PoolSelectionDialog from "@/components/trading/pool-selection-dialog";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { walletTransactionApi, chainsApi } from "@/lib/api";
import toast from "react-hot-toast";
import type { Token, InputMode } from "@/types/trading";
import type { UserLiquidityPosition } from "@/types/trading";

// Conversion factor for microunits (1 token = 1,000,000 microunits)
const MICRO_UNITS = 1_000_000;

interface LiquidityTabProps {
  isPreview?: boolean;
  initialPool?: LiquidityPool | null;
  onPoolChange?: (pool: LiquidityPool | null) => void;
}

interface DisplayValues {
  tokenAmount: string;
  usdAmount: string;
}

export default function LiquidityTab({
  isPreview = false,
  initialPool = null,
  onPoolChange = null,
}: LiquidityTabProps) {
  const { wallets, currentWallet } = useWalletStore();
  const { available_pools, fetchPools } = useLiquidityPoolsStore();
  const isConnected = wallets.length > 0;
  const isWalletUnlocked =
    currentWallet?.isUnlocked && currentWallet?.privateKey;

  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(
    initialPool
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch pools on mount if not already loaded
  useEffect(() => {
    if (available_pools.length === 0) {
      fetchPools();
    }
  }, [available_pools.length, fetchPools]);

  // Notify parent when pool changes
  const handlePoolChange = (pool: LiquidityPool | null) => {
    setSelectedPool(pool);
    onPoolChange?.(pool);
  };
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [inputModeA, setInputModeA] = useState<InputMode>("token");
  const [inputModeB, setInputModeB] = useState<InputMode>("token");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPoolDialog, setShowPoolDialog] = useState(false);

  // Get user's position for selected pool (mock data for now)
  const userPosition = useMemo<UserLiquidityPosition | null>(() => {
    // TODO: Implement actual LP position fetching using wallet addresses
    return null;
  }, [isConnected, selectedPool]);

  // Sort pools by APY descending for suggestions
  const topPools = useMemo(() => {
    return [...available_pools].sort((a, b) => b.apr - a.apr).slice(0, 3);
  }, [available_pools]);

  // Get token data for selected pool
  const tokenA = selectedPool
    ? (tokensData.find((t) => t.symbol === selectedPool.tokenB) as
        | Token
        | undefined)
    : null;
  const tokenB = selectedPool
    ? (tokensData.find((t) => t.symbol === selectedPool.tokenA) as
        | Token
        | undefined)
    : null;

  // Mock wallet balances
  const getWalletBalance = (token: Token | null | undefined): number => {
    if (!token) return 0;
    const mockBalances: Record<string, number> = {
      CNPY: 5000,
      MGC: 1250,
      SOCN: 2500,
      OENS: 1000,
    };
    return mockBalances[token.symbol] || 100;
  };

  const balanceA = tokenA ? getWalletBalance(tokenA) : 0;
  const balanceB = tokenB ? getWalletBalance(tokenB) : 0;

  // Get display values
  const getDisplayValues = (
    amount: string,
    inputMode: InputMode,
    token: Token | null | undefined
  ): DisplayValues => {
    if (!amount || amount === "" || !token) {
      return { tokenAmount: "0", usdAmount: "$0.00" };
    }
    const inputAmount = parseFloat(amount);
    const price = token.currentPrice || 0;

    if (inputMode === "token") {
      const usdValue = inputAmount * price;
      return {
        tokenAmount: amount,
        usdAmount: `$${usdValue.toFixed(2)}`,
      };
    } else {
      const tokenValue = price > 0 ? inputAmount / price : 0;
      return {
        tokenAmount: tokenValue.toLocaleString("en-US", {
          maximumFractionDigits: 6,
        }),
        usdAmount: `$${inputAmount.toFixed(2)}`,
      };
    }
  };

  const displayValuesA = getDisplayValues(amountA, inputModeA, tokenA);
  const displayValuesB = getDisplayValues(amountB, inputModeB, tokenB);

  const handleMaxA = () => {
    if (tokenA && balanceA > 0) {
      setInputModeA("token");
      handleAmountAChange(balanceA.toString());
    }
  };

  const handleMaxB = () => {
    if (tokenB && balanceB > 0) {
      setInputModeB("token");
      handleAmountBChange(balanceB.toString());
    }
  };

  const toggleInputModeA = () => {
    if (!tokenA) return;
    const price = tokenA.currentPrice || 0;
    if (price === 0) return;

    if (amountA && amountA !== "") {
      const currentAmount = parseFloat(amountA);
      if (inputModeA === "token") {
        const usdValue = currentAmount * price;
        setAmountA(usdValue.toFixed(2));
      } else {
        const tokenValue = currentAmount / price;
        setAmountA(tokenValue.toString());
      }
    }
    setInputModeA(inputModeA === "token" ? "usd" : "token");
  };

  const toggleInputModeB = () => {
    if (!tokenB) return;
    const price = tokenB.currentPrice || 0;
    if (price === 0) return;

    if (amountB && amountB !== "") {
      const currentAmount = parseFloat(amountB);
      if (inputModeB === "token") {
        const usdValue = currentAmount * price;
        setAmountB(usdValue.toFixed(2));
      } else {
        const tokenValue = currentAmount / price;
        setAmountB(tokenValue.toString());
      }
    }
    setInputModeB(inputModeB === "token" ? "usd" : "token");
  };

  const handleAmountAChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmountA(value);
    }
  };

  const handleAmountBChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmountB(value);
    }
  };

  const handleSelectPool = (pool: LiquidityPool) => {
    handlePoolChange(pool);
    setAmountA("");
    setAmountB("");
  };

  const handleBack = () => {
    handlePoolChange(null);
    setAmountA("");
    setAmountB("");
  };

  const handleConfirmAddLiquidity = async () => {
    // Use amountA since that's the CNPY amount (tokenB in pool data)
    const amountANum = parseFloat(amountA);

    if (!amountANum || amountANum <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    // Check if wallet is connected
    if (!currentWallet) {
      toast.error("Please connect your wallet to add liquidity.");
      return;
    }

    // Check if wallet is unlocked
    if (!currentWallet.isUnlocked || !currentWallet.privateKey) {
      toast.error("Wallet is locked. Please unlock your wallet first.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert amount to microunits (base units)
      const amountInMicroUnits = Math.floor(amountANum * MICRO_UNITS);

      // Pool chain ID - hardcoded to chain 2 (DeFi Hub) for now
      const poolChainId = 2;

      // Transaction chain ID - always root chain (1) for liquidity deposits
      const transactionChainId = 1;

      // Get current height from root chain (where transaction is sent)
      const heightResponse = await chainsApi.getChainHeight(
        String(transactionChainId)
      );
      const currentHeight = heightResponse.data.height;

      // Create DEX liquidity deposit message
      const { createDexLiquidityDepositMessage } = await import(
        "@/lib/crypto/transaction"
      );
      const depositMsg = createDexLiquidityDepositMessage(
        poolChainId, // The pool chain you're depositing to (chain 2 - DeFi Hub)
        amountInMicroUnits,
        currentWallet.address
      );

      // Create and sign transaction
      const { createAndSignTransaction } = await import(
        "@/lib/crypto/transaction"
      );
      const signedTx = createAndSignTransaction(
        {
          type: "dexLiquidityDeposit",
          msg: depositMsg,
          fee: 1000, // TODO: Add fee estimation
          memo: " ", // CRITICAL: Always empty string, never undefined/null
          networkID: 1,
          chainID: transactionChainId, // Root chain where transaction is sent
          height: currentHeight,
        },
        currentWallet.privateKey,
        currentWallet.public_key,
        currentWallet.curveType
      );

      // Submit transaction
      const response = await walletTransactionApi.sendRawTransaction(signedTx);

      toast.success(
        `Liquidity added! TX: ${response.transaction_hash.substring(0, 8)}...`
      );

      // Reset form
      setAmountA("");
      setAmountB("");
      setShowConfirmation(false);
    } catch (error) {
      console.error("Failed to add liquidity:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while adding liquidity.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pool Selector View
  if (!selectedPool) {
    return (
      <>
        <div className="px-4 py-2 space-y-4">
          {/* Select Pool Card */}
          <Card
            className="bg-muted/30 p-4 hover:bg-muted/40 transition-colors cursor-pointer"
            onClick={() => setShowPoolDialog(true)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-base font-semibold">Select a pool</p>
                  <p className="text-sm text-muted-foreground">
                    Search pools to add liquidity
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>

          {/* Top Pools Suggestions */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Top pools by APY
            </p>
            {topPools.map((pool) => {
              const poolToken = tokensData.find(
                (t) => t.symbol === pool.tokenB
              ) as Token | undefined;
              return (
                <div
                  key={pool.id}
                  className="flex items-center justify-between py-2 px-1 hover:bg-muted/20 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleSelectPool(pool)}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center border border-background"
                        style={{
                          backgroundColor: poolToken?.brandColor || "#6b7280",
                        }}
                      >
                        <span className="text-[10px] font-bold text-white">
                          {pool.tokenB[0]}
                        </span>
                      </div>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center border border-background"
                        style={{ backgroundColor: "#1dd13a" }}
                      >
                        <span className="text-[10px] font-bold text-white">
                          C
                        </span>
                      </div>
                    </div>
                    <span className="text-sm">{pool.tokenB} / CNPY</span>
                  </div>
                  <span className="text-sm font-medium text-green-500">
                    {pool.apr}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pool Selection Dialog */}
        <PoolSelectionDialog
          open={showPoolDialog}
          onOpenChange={setShowPoolDialog}
          onSelectPool={handleSelectPool}
        />
      </>
    );
  }

  // Deposit View (after pool selection)
  return (
    <div className="relative">
      {/* Back Button */}
      <div className="px-4 pb-2">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Token Input Cards */}
      <div className="space-y-3">
        {/* Token A (non-CNPY token) */}
        <div className="px-4">
          <Card className="bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: tokenA?.brandColor || "#10b981" }}
                >
                  <span className="text-base font-bold text-white">
                    {tokenA?.symbol?.[0]}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-base font-semibold">{tokenA?.symbol}</p>
                  <button
                    onClick={handleMaxA}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Balance: {balanceA.toLocaleString()}
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-1">
                  {inputModeA === "usd" && (
                    <span className="text-base font-semibold text-muted-foreground">
                      $
                    </span>
                  )}
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amountA}
                    onChange={(e) => handleAmountAChange(e.target.value)}
                    placeholder="0"
                    className="text-base font-semibold bg-transparent border-0 outline-none p-0 h-auto text-right w-20 placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  onClick={toggleInputModeA}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {inputModeA === "token"
                    ? displayValuesA.usdAmount
                    : displayValuesA.tokenAmount}
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Token B (CNPY) */}
        <div className="px-4">
          <Card className="bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: tokenB?.brandColor || "#1dd13a" }}
                >
                  <span className="text-base font-bold text-white">
                    {tokenB?.symbol?.[0]}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-base font-semibold">{tokenB?.symbol}</p>
                  <button
                    onClick={handleMaxB}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Balance: {balanceB.toLocaleString()}
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-1">
                  {inputModeB === "usd" && (
                    <span className="text-base font-semibold text-muted-foreground">
                      $
                    </span>
                  )}
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amountB}
                    onChange={(e) => handleAmountBChange(e.target.value)}
                    placeholder="0"
                    className="text-base font-semibold bg-transparent border-0 outline-none p-0 h-auto text-right w-20 placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  onClick={toggleInputModeB}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {inputModeB === "token"
                    ? displayValuesB.usdAmount
                    : displayValuesB.tokenAmount}
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Info Text */}
      <div className="px-4 pt-2">
        <p className="text-xs text-muted-foreground text-center">
          Amounts will be converted to equal pool ratio when staked
        </p>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pt-3 pb-3">
        {userPosition ? (
          <Button
            className="w-full h-11"
            size="lg"
            disabled={
              isPreview ||
              (!amountA && !amountB) ||
              isSubmitting ||
              !isConnected
            }
            onClick={() => (amountA || amountB) && setShowConfirmation(true)}
          >
            {isPreview
              ? "Preview Mode"
              : !isConnected
              ? "Connect Wallet"
              : !isWalletUnlocked
              ? "Unlock Wallet"
              : isSubmitting
              ? "Processing..."
              : !amountA && !amountB
              ? "Input amount"
              : "Add Liquidity"}
          </Button>
        ) : (
          <Button
            className="w-full h-11"
            size="lg"
            disabled={
              isPreview ||
              (!amountA && !amountB) ||
              isSubmitting ||
              !isConnected
            }
            onClick={() => (amountA || amountB) && setShowConfirmation(true)}
          >
            {isPreview
              ? "Preview Mode"
              : !isConnected
              ? "Connect Wallet"
              : !isWalletUnlocked
              ? "Unlock Wallet"
              : isSubmitting
              ? "Processing..."
              : !amountA && !amountB
              ? "Input amount"
              : "Add Liquidity"}
          </Button>
        )}
      </div>

      {/* LP Preview */}
      {selectedPool && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-background"
                style={{ backgroundColor: tokenA?.brandColor || "#10b981" }}
              >
                <span className="text-xs font-bold text-white">
                  {tokenA?.symbol?.[0]}
                </span>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-background"
                style={{ backgroundColor: tokenB?.brandColor || "#1dd13a" }}
              >
                <span className="text-xs font-bold text-white">
                  {tokenB?.symbol?.[0]}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between flex-1">
              <span className="text-sm font-medium">
                {tokenA?.symbol} / {tokenB?.symbol}
              </span>
              <span className="text-sm font-semibold text-green-500">
                {selectedPool.apr}% APY
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Share of pool</span>
              <span className="font-medium">
                {userPosition
                  ? `${userPosition.share.toFixed(3)}%`
                  : (() => {
                      const depositUSD =
                        (parseFloat(amountA) || 0) *
                          (tokenA?.currentPrice || 0) +
                        (parseFloat(amountB) || 0) *
                          (tokenB?.currentPrice || 0);
                      const share =
                        selectedPool.totalLiquidity > 0
                          ? (depositUSD /
                              (selectedPool.totalLiquidity + depositUSD)) *
                            100
                          : 0;
                      return `${share.toFixed(4)}%`;
                    })()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deposit APY</span>
              <span className="font-semibold text-green-500">
                {selectedPool.apr}%
              </span>
            </div>
            {userPosition && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {tokenA?.symbol} Staked
                </span>
                <span className="font-medium">
                  {userPosition.tokenBAmount.toLocaleString()} ($
                  {(
                    userPosition.tokenBAmount * (tokenA?.currentPrice || 0)
                  ).toFixed(0)}
                  )
                </span>
              </div>
            )}
            {!userPosition && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pool Ratio</span>
                  <span className="font-medium">
                    1 {tokenB?.symbol} ={" "}
                    {(
                      selectedPool.tokenBReserve / selectedPool.tokenAReserve
                    ).toFixed(4)}{" "}
                    {tokenA?.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Value</span>
                  <span className="font-medium">
                    $
                    {(
                      (parseFloat(amountA) || 0) * (tokenA?.currentPrice || 0) +
                      (parseFloat(amountB) || 0) * (tokenB?.currentPrice || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && tokenA && tokenB && (
        <LiquidityConfirmationDialog
          open={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmAddLiquidity}
          tokenA={tokenA}
          tokenB={tokenB}
          amountA={amountA}
          amountB={amountB}
          pool={selectedPool}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
