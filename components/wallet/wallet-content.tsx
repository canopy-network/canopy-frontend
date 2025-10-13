"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useWallet } from "./wallet-provider";
import type { CanopyWallet, ChainToken } from "@/types/chains";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Copy,
  ExternalLink,
  ArrowDownUp,
  Wallet,
} from "lucide-react";
import { SwapInterface } from "./swap-interface";

interface ActionButtonProps {
  activeTab: string;
}

function ActionButton({ activeTab }: ActionButtonProps) {
  const getButtonConfig = () => {
    switch (activeTab) {
      case "buy":
        return {
          label: "Buy",
          className:
            "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white",
        };
      case "sell":
        return {
          label: "Sell",
          className: "bg-red-600 hover:bg-red-700 text-white",
        };
      case "convert":
        return {
          label: "Convert",
          className:
            "bg-transparent border-2 border-white hover:bg-white hover:text-black text-white",
        };
      default:
        return {
          label: "Submit",
          className: "bg-primary hover:bg-primary/90 text-white",
        };
    }
  };

  const config = getButtonConfig();

  return (
    <Button
      className={`w-full h-12 text-base font-medium rounded-xl ${config.className}`}
      onClick={() => console.log(`${config.label} clicked`)}
    >
      {config.label}
    </Button>
  );
}

/**
 * Renders the wallet content.
 * @property {boolean} showBalance - This renders the balance of current account in wallet
 */
export function WalletContent({
  showBalance = true,
}: {
  showBalance?: boolean;
}) {
  const { currentAccount, connectWallet } = useWallet();
  const [activeTab, setActiveTab] = useState("buy");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  // Mock Canopy wallet data
  const mockCanopyWallet: CanopyWallet = {
    cnpyAvailableAmount: 100000, // 100,000 CNPY available
    usdCurrentPrice: 0.05, // 1 CNPY = $0.05 USD
  };

  // Calculate USD value of available CNPY
  const totalUsdValue = (
    mockCanopyWallet.cnpyAvailableAmount * mockCanopyWallet.usdCurrentPrice
  ).toFixed(2);

  // Define CNPY token
  const cnpyToken: ChainToken = {
    symbol: "CNPY",
    name: "Canopy",
    balance: mockCanopyWallet.cnpyAvailableAmount.toString(),
    balanceUSD: `$${totalUsdValue}`,
    icon: "🌳",
  };

  // Define custom chain token (OBNB)
  const customChainToken: ChainToken = {
    symbol: "OBNB",
    name: "Onchain BNB",
    balance: "0",
    balanceUSD: "$0.00",
    icon: "🔺",
  };

  const [selectedFromToken, setSelectedFromToken] =
    useState<ChainToken>(cnpyToken);
  const [selectedToToken, setSelectedToToken] =
    useState<ChainToken>(customChainToken);

  // Update tokens based on active tab
  useEffect(() => {
    if (activeTab === "buy") {
      // Buy: USD → Custom Chain Token (using CNPY)
      setSelectedFromToken(cnpyToken);
      setSelectedToToken(customChainToken);
    } else if (activeTab === "sell") {
      // Sell: Custom Chain Token → CNPY
      setSelectedFromToken(customChainToken);
      setSelectedToToken(cnpyToken);
    } else if (activeTab === "convert") {
      // Convert: Keep CNPY → Custom Chain Token
      setSelectedFromToken(cnpyToken);
      setSelectedToToken(customChainToken);
    }
    // Clear amounts when switching tabs
    setFromAmount("");
    setToAmount("");
  }, [activeTab]);

  const handleCopyAddress = () => {
    if (currentAccount?.address) {
      navigator.clipboard.writeText(currentAccount.address);
    }
  };

  const handleSwapTokens = () => {
    // Swap the tokens
    const temp = selectedFromToken;
    setSelectedFromToken(selectedToToken);
    setSelectedToToken(temp);
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);

    // Switch tabs based on current tab
    if (activeTab === "buy") {
      setActiveTab("sell");
    } else if (activeTab === "sell") {
      setActiveTab("buy");
    }
  };

  const handleUseMax = () => {
    // Convert CNPY balance to USD: CNPY amount * USD price per CNPY
    const cnpyBalance = parseFloat(selectedFromToken.balance);
    const usdAmount = cnpyBalance * mockCanopyWallet.usdCurrentPrice;
    setFromAmount(usdAmount.toString());
  };

  return (
    <>
      {/* Header */}
      {currentAccount && showBalance && (
        <div className="p-6 pb-4 border-b border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Wallet</p>
                <p className="text-xs text-gray-400">
                  {currentAccount.address.slice(0, 6)}...
                  {currentAccount.address.slice(-4)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyAddress}
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Balance Display */}
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-white mb-1">
              {mockCanopyWallet.cnpyAvailableAmount.toLocaleString()} CNPY
            </p>
            <p className="text-sm text-gray-400">≈ ${totalUsdValue}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full gap-4 mb-4"
      >
        <TabsList className="w-full grid grid-cols-3 bg-[#1a1a1a] border border-[#2a2a2a]">
          <TabsTrigger
            value="buy"
            className="data-[state=active]:bg-green-900/30 data-[state=active]:text-green-400 text-gray-400"
          >
            <ArrowUpRight className="h-4 w-4 mr-1" />
            Buy
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            className="data-[state=active]:bg-red-900/30 data-[state=active]:text-red-400 text-gray-400"
          >
            <ArrowDownLeft className="h-4 w-4 mr-1" />
            Sell
          </TabsTrigger>
          <TabsTrigger
            value="convert"
            className="data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-400 text-gray-400"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Convert
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="">
          <TabsContent value="buy" className="mt-0">
            <SwapInterface
              fromToken={selectedFromToken}
              toToken={selectedToToken}
              fromAmount={fromAmount}
              toAmount={toAmount}
              onFromAmountChange={setFromAmount}
              onToAmountChange={setToAmount}
              onSwapTokens={handleSwapTokens}
              onUseMax={handleUseMax}
              cnpyAvailableAmount={mockCanopyWallet.cnpyAvailableAmount}
              usdCurrentPrice={mockCanopyWallet.usdCurrentPrice}
            />
          </TabsContent>

          <TabsContent value="sell" className="mt-0">
            <SwapInterface
              fromToken={selectedFromToken}
              toToken={selectedToToken}
              fromAmount={fromAmount}
              toAmount={toAmount}
              onFromAmountChange={setFromAmount}
              onToAmountChange={setToAmount}
              onSwapTokens={handleSwapTokens}
              onUseMax={handleUseMax}
              cnpyAvailableAmount={mockCanopyWallet.cnpyAvailableAmount}
              usdCurrentPrice={mockCanopyWallet.usdCurrentPrice}
            />
          </TabsContent>

          <TabsContent value="convert" className="mt-0">
            <SwapInterface
              fromToken={selectedFromToken}
              toToken={selectedToToken}
              fromAmount={fromAmount}
              toAmount={toAmount}
              onFromAmountChange={setFromAmount}
              onToAmountChange={setToAmount}
              onSwapTokens={handleSwapTokens}
              onUseMax={handleUseMax}
              cnpyAvailableAmount={mockCanopyWallet.cnpyAvailableAmount}
              usdCurrentPrice={mockCanopyWallet.usdCurrentPrice}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Action Button - Only show if wallet is connected */}
      {currentAccount && (
        <div className="">
          <ActionButton activeTab={activeTab} />
        </div>
      )}

      {/* Connect Wallet Button - Only show if not connected */}
      {!currentAccount && (
        <div className="">
          <Button
            onClick={() => connectWallet()}
            variant="secondary"
            className="w-full h-12 text-base font-medium rounded-xl"
          >
            Connect Wallet
          </Button>
        </div>
      )}
    </>
  );
}
