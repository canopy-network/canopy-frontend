"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Repeat,
  Droplet,
} from "lucide-react";
import SwapTab from "@/components/trading/swap-tab";
import LiquidityTab from "@/components/trading/liquidity-tab";
import BuySellTab from "@/components/trading/buy-sell-tab";
import ConvertTab from "@/components/trading/convert-tab";
import TokenSelectionDialog from "@/components/trading/token-selection-dialog";
import SwapConfirmationDialog from "@/components/trading/swap-confirmation-dialog";
import TransactionPendingDialog from "@/components/trading/transaction-pending-dialog";
import tokensData from "@/data/tokens.json";
import {
  useLiquidityPoolsStore,
  type LiquidityPool,
} from "@/lib/stores/liquidity-pools-store";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { walletTransactionApi, chainsApi } from "@/lib/api";
import toast from "react-hot-toast";
import type {
  Token,
  TokenPair,
  ConfirmationData,
  ChainData,
  TradingVariant,
  TabType,
  TokenDialogMode,
} from "@/types/trading";

interface TradingModuleProps {
  variant?: TradingVariant;
  chainData?: ChainData | null;
  defaultTokenPair?: TokenPair | null;
  defaultTab?: TabType | null;
  isPreview?: boolean;
  onOpenWalletDialog?: (() => void) | null;
  onLiquidityPoolChange?: ((pool: LiquidityPool | null) => void) | null;
}

interface TabsConfig {
  tabs: TabType[];
  defaultTab: TabType;
}

/**
 * TradingModule - Flexible trading component that adapts based on variant
 */
export default function TradingModule({
  variant = "trade",
  chainData = null,
  defaultTokenPair = null,
  defaultTab = null,
  isPreview = false,
  onOpenWalletDialog = null,
  onLiquidityPoolChange = null,
}: TradingModuleProps) {
  const { available_pools, fetchPools } = useLiquidityPoolsStore();
  const { currentWallet } = useWalletStore();

  // Fetch pools on mount if not already loaded
  useEffect(() => {
    if (available_pools.length === 0) {
      fetchPools();
    }
  }, [available_pools.length, fetchPools]);

  // Determine tabs based on variant
  const getTabsConfig = (): TabsConfig => {
    switch (variant) {
      case "trade":
        return {
          tabs: ["swap", "liquidity", "convert"],
          defaultTab: defaultTab || "swap",
        };
      case "chain":
        return {
          tabs: ["buy", "sell", "convert"],
          defaultTab: defaultTab || "buy",
        };
      case "liquidity":
        return {
          tabs: ["liquidity", "swap", "convert"],
          defaultTab: defaultTab || "liquidity",
        };
      default:
        return {
          tabs: ["swap", "liquidity", "convert"],
          defaultTab: "swap",
        };
    }
  };

  const tabsConfig = getTabsConfig();
  const [activeTab, setActiveTab] = useState<TabType>(tabsConfig.defaultTab);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [tokenDialogMode, setTokenDialogMode] = useState<TokenDialogMode>(null); // 'from', 'to', 'tokenA', 'tokenB'
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] =
    useState<ConfirmationData | null>(null);
  const [showPending, setShowPending] = useState(false);

  // Token state for swap/liquidity
  const [fromToken, setFromToken] = useState<Token | null>(() => {
    // For trade variant, always start with no token selected (user must select)
    if (variant === "trade") {
      return null;
    }
    // For chain variant, default to CNPY
    if (variant === "chain") {
      return (
        (tokensData.find((t) => t.symbol === "CNPY") as Token | undefined) ||
        null
      );
    }
    return null;
  });

  const [toToken, setToToken] = useState<Token | null>(() => {
    // For trade variant, default to CNPY as receiving token
    if (variant === "trade") {
      return (
        (tokensData.find((t) => t.symbol === "CNPY") as Token | undefined) ||
        null
      );
    }
    // For chain variant, use the chain's token
    if (variant === "chain" && chainData) {
      return {
        symbol: chainData.ticker,
        name: chainData.name,
        brandColor: chainData.brandColor,
        currentPrice: chainData.currentPrice,
        ...chainData,
      } as Token;
    }
    // Default fallback to CNPY
    return (
      (tokensData.find((t) => t.symbol === "CNPY") as Token | undefined) || null
    );
  });

  const [tokenA, setTokenA] = useState<Token | null>(() => {
    // For liquidity variant with defaultTokenPair, use the provided tokenA
    if (variant === "liquidity" && defaultTokenPair?.tokenA) {
      return defaultTokenPair.tokenA;
    }
    return null;
  });
  const [tokenB, setTokenB] = useState<Token | null>(() => {
    // For liquidity variant with defaultTokenPair, use the provided tokenB
    if (variant === "liquidity" && defaultTokenPair?.tokenB) {
      return defaultTokenPair.tokenB;
    }
    return (
      (tokensData.find((t) => t.symbol === "CNPY") as Token | undefined) || null
    );
  });

  // Find the matching pool for liquidity variant
  const initialPool = useMemo<LiquidityPool | null>(() => {
    if (variant === "liquidity" && defaultTokenPair?.tokenA) {
      // tokenA is the non-CNPY token, tokenB is CNPY in the defaultTokenPair
      const tokenSymbol = defaultTokenPair.tokenA.symbol;
      return (
        available_pools.find(
          (pool) => pool.tokenB === tokenSymbol && pool.tokenA === "CNPY"
        ) || null
      );
    }
    return null;
  }, [variant, defaultTokenPair, available_pools]);

  // Convert tab state
  const [convertAmount, setConvertAmount] = useState(0);
  const [convertSourceToken, setConvertSourceToken] = useState<Token | null>(
    null
  );

  const handleSelectToken = (mode: "from" | "to" | "tokenA" | "tokenB") => {
    setTokenDialogMode(mode);
    setShowTokenDialog(true);
  };

  const handleTokenSelected = (token: Token) => {
    switch (tokenDialogMode) {
      case "from":
        setFromToken(token);
        // For trade variant, if a non-CNPY token is selected, ensure toToken is CNPY
        if (variant === "trade" && token.symbol !== "CNPY") {
          setToToken(
            (tokensData.find((t) => t.symbol === "CNPY") as
              | Token
              | undefined) || null
          );
        }
        break;
      case "to":
        setToToken(token);
        // For trade variant, if a non-CNPY token is selected, ensure fromToken is CNPY
        if (variant === "trade" && token.symbol !== "CNPY") {
          setFromToken(
            (tokensData.find((t) => t.symbol === "CNPY") as
              | Token
              | undefined) || null
          );
        }
        break;
      case "tokenA":
        setTokenA(token);
        break;
      case "tokenB":
        setTokenB(token);
        break;
    }
    setShowTokenDialog(false);
    setTokenDialogMode(null);
  };

  const handleSwapTokens = () => {
    // Swap fromToken and toToken
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const handleShowConfirmation = (data: ConfirmationData) => {
    // Check if wallet is connected
    if (!currentWallet) {
      toast.error("Please connect your wallet first.");
      return;
    }

    // Check if wallet is unlocked
    if (!currentWallet.isUnlocked || !currentWallet.privateKey) {
      toast.error("Wallet is locked. Please unlock your wallet first.");
      return;
    }

    setConfirmationData(data);
    setShowConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
  };

  const handleConfirmSwap = async () => {
    if (!confirmationData || !currentWallet) {
      toast.error("Missing swap data or wallet not connected");
      return;
    }

    console.log("[currentWallet]", currentWallet);
    // Check if wallet is unlocked
    if (!currentWallet.isUnlocked || !currentWallet.privateKey) {
      toast.error("Wallet is locked. Please unlock your wallet first.");
      return;
    }

    const { fromToken, toToken, fromAmount } = confirmationData;

    try {
      // Show pending state immediately
      setShowPending(true);
      setShowConfirmation(false);

      // Convert amounts to microunits (1 token = 1,000,000 microunits)
      const MICRO_UNITS = 1_000_000;
      const amountForSale = Math.floor(parseFloat(fromAmount) * MICRO_UNITS);

      // Calculate requested amount based on exchange rate with slippage tolerance (1%)
      const exchangeRate =
        (fromToken.currentPrice || 0) / (toToken.currentPrice || 1);
      const expectedReceive = parseFloat(fromAmount) * exchangeRate;
      const requestedAmount = Math.floor(expectedReceive * MICRO_UNITS * 0.99); // 1% slippage

      // msg.chainId = the chain we're RECEIVING tokens from (destination chain)
      // Example: CNPY (chain 1) → DEFI (chain 2) => msg.chainId = 2
      // Example: DEFI (chain 2) → CNPY (chain 1) => msg.chainId = 1
      const toChainId = toToken.chainId || 1;

      // Transaction is ALWAYS sent to root chain (1) - per Canopy protocol
      const transactionChainId = 1;

      // Get current height from root chain
      const heightResponse = await chainsApi.getChainHeight(
        String(transactionChainId)
      );
      const currentHeight = heightResponse.data.height;

      // Create DEX limit order message
      const { createDexLimitOrderMessage } = await import(
        "@/lib/crypto/transaction"
      );

      const limitOrderMsg = createDexLimitOrderMessage(
        toChainId, // Chain ID of token we're swapping TO
        amountForSale, // Amount we're selling (in microunits)
        requestedAmount, // Minimum amount we want to receive (in microunits)
        currentWallet.address
      );

      // Create and sign transaction
      const { createAndSignTransaction } = await import(
        "@/lib/crypto/transaction"
      );

      const signedTx = createAndSignTransaction(
        {
          type: "dexLimitOrder",
          msg: limitOrderMsg,
          fee: 1000, // TODO: Add fee estimation
          memo: " ", // CRITICAL: Always empty string, never undefined/null
          networkID: 1,
          chainID: 1, // ALWAYS 1 - All swaps are submitted to Root-Chain
          height: currentHeight,
        },
        currentWallet.privateKey,
        currentWallet.public_key,
        currentWallet.curveType
      );

      // Submit transaction
      const response = await walletTransactionApi.sendRawTransaction(signedTx);

      toast.success(
        `Swap order created! TX: ${response.transaction_hash.substring(
          0,
          8
        )}...`
      );

      // Keep pending dialog open briefly to show success
      setTimeout(() => {
        setShowPending(false);
        setConfirmationData(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to execute swap:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while swapping.";
      toast.error(errorMessage);
      setShowPending(false);
    }
  };

  const handleClosePending = () => {
    setShowPending(false);
    setConfirmationData(null);
  };

  const renderTabButtons = () => {
    const getTabIcon = (tab: TabType) => {
      switch (tab) {
        case "buy":
          return <ArrowUpRight className="w-4 h-4" />;
        case "sell":
          return <ArrowDownRight className="w-4 h-4" />;
        case "swap":
          return <Repeat className="w-4 h-4" />;
        case "liquidity":
          return <Droplet className="w-4 h-4" />;
        case "convert":
          return <RotateCcw className="w-4 h-4" />;
        default:
          return null;
      }
    };

    const getTabLabel = (tab: TabType): string => {
      return tab.charAt(0).toUpperCase() + tab.slice(1);
    };

    return (
      <div className="bg-muted/50 p-1 rounded-lg flex gap-1">
        {tabsConfig.tabs.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            size="sm"
            className={`flex-1 h-10 gap-2 ${
              activeTab === tab ? "bg-primary text-primary-foreground" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {getTabIcon(tab)}
            <span className="text-sm font-medium">{getTabLabel(tab)}</span>
          </Button>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "buy":
        return (
          <BuySellTab
            mode="buy"
            chainData={chainData}
            isPreview={isPreview}
            onShowConfirmation={handleShowConfirmation}
          />
        );
      case "sell":
        return (
          <BuySellTab
            mode="sell"
            chainData={chainData}
            isPreview={isPreview}
            onShowConfirmation={handleShowConfirmation}
          />
        );
      case "swap":
        return (
          <SwapTab
            fromToken={fromToken}
            toToken={toToken}
            isPreview={isPreview}
            onSelectToken={handleSelectToken}
            onSwapTokens={handleSwapTokens}
            onShowConfirmation={handleShowConfirmation}
          />
        );
      case "liquidity":
        return (
          <LiquidityTab
            isPreview={isPreview}
            initialPool={initialPool}
            onPoolChange={onLiquidityPoolChange}
          />
        );
      case "convert":
        return (
          <ConvertTab
            chainData={chainData}
            isPreview={isPreview}
            onSelectToken={handleSelectToken}
            onOpenWalletDialog={onOpenWalletDialog || undefined}
            onAmountChange={setConvertAmount}
            onSourceTokenChange={setConvertSourceToken}
          />
        );
      default:
        return null;
    }
  };

  // Get excluded token for dialog
  const getExcludedToken = (): string | null => {
    // For trade variant, enforce CNPY pairing
    if (variant === "trade") {
      // If selecting 'from' and 'to' is not CNPY, exclude it
      if (tokenDialogMode === "from" && toToken && toToken.symbol !== "CNPY") {
        return toToken.symbol;
      }
      // If selecting 'to' and 'from' is not CNPY, exclude it
      if (
        tokenDialogMode === "to" &&
        fromToken &&
        fromToken.symbol !== "CNPY"
      ) {
        return fromToken.symbol;
      }
    }

    // Standard exclusion for same token
    if (tokenDialogMode === "from" && toToken) return toToken.symbol;
    if (tokenDialogMode === "to" && fromToken) return fromToken.symbol;
    if (tokenDialogMode === "tokenA" && tokenB) return tokenB.symbol;
    if (tokenDialogMode === "tokenB" && tokenA) return tokenA.symbol;
    return null;
  };

  return (
    <>
      <Card className="p-1 sticky top-6 overflow-visible">
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="px-3 pt-3">{renderTabButtons()}</div>

          {/* Tab Content - with relative positioning for overlay */}
          <div className="relative overflow-visible">
            {renderTabContent()}

            {/* Swap Confirmation Overlay */}
            {showConfirmation && confirmationData && (
              <SwapConfirmationDialog
                open={showConfirmation}
                onClose={handleCloseConfirmation}
                onConfirm={handleConfirmSwap}
                {...confirmationData}
              />
            )}

            {/* Transaction Pending/Success Overlay */}
            {showPending && confirmationData && (
              <TransactionPendingDialog
                open={showPending}
                onClose={handleClosePending}
                fromToken={confirmationData.fromToken}
                toToken={confirmationData.toToken}
                fromAmount={confirmationData.fromAmount}
                toAmount={confirmationData.toAmount}
                amount={confirmationData.fromAmount}
                price={confirmationData.toToken?.currentPrice}
                networkFee={0.42}
              />
            )}
          </div>
        </div>
      </Card>

      {/* Order Book is now integrated into ConvertTab */}

      {/* Token Selection Dialog */}
      <TokenSelectionDialog
        open={showTokenDialog}
        onOpenChange={setShowTokenDialog}
        onSelectToken={handleTokenSelected}
        excludeToken={getExcludedToken()}
      />
    </>
  );
}
