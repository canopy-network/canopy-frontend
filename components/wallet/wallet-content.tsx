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
import { TokenSelector } from "./token-selector";

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

export function WalletContent({
  showBalance = true,
}: {
  showBalance?: boolean;
}) {
  const { currentWallet, connectWallet } = useWallet();
  const [activeTab, setActiveTab] = useState("buy");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const mockCanopyWallet: CanopyWallet = {
    cnpyAvailableAmount: 100000,
    usdCurrentPrice: 0.05,
  };

  const totalUsdValue = (
    mockCanopyWallet.cnpyAvailableAmount * mockCanopyWallet.usdCurrentPrice
  ).toFixed(2);

  const cnpyToken: ChainToken = {
    symbol: "CNPY",
    name: "Canopy",
    balance: mockCanopyWallet.cnpyAvailableAmount.toString(),
    balanceUSD: `$${totalUsdValue}`,
    icon: "🌳",
  };

  const customChainToken: ChainToken = {
    symbol: "OBNB",
    name: "Onchain BNB",
    balance: "50",
    balanceUSD: "$15,000.00",
    icon: "🔺",
  };

  const [selectedFromToken, setSelectedFromToken] =
    useState<ChainToken>(cnpyToken);
  const [selectedToToken, setSelectedToToken] =
    useState<ChainToken>(customChainToken);

  const [selectedConvertToken, setSelectedConvertToken] =
    useState<ChainToken | null>(null);

  const availableTokens: ChainToken[] = [
    {
      symbol: "ETH",
      name: "Ethereum",
      balance: "2.5",
      balanceUSD: "$6,250.00",
      icon: "💎",
    },
    {
      symbol: "BTC",
      name: "Bitcoin",
      balance: "0.15",
      balanceUSD: "$9,750.00",
      icon: "₿",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      balance: "1000",
      balanceUSD: "$1,000.00",
      icon: "💵",
    },
    {
      symbol: "OBNB",
      name: "Onchain BNB",
      balance: "50",
      balanceUSD: "$15,000.00",
      icon: "🔺",
    },
    {
      symbol: "MATIC",
      name: "Polygon",
      balance: "500",
      balanceUSD: "$450.00",
      icon: "🟣",
    },
  ];

  const getTokenPrice = (symbol: string): number => {
    const prices: Record<string, number> = {
      CNPY: mockCanopyWallet.usdCurrentPrice,
      ETH: 2500,
      BTC: 65000,
      USDC: 1,
      OBNB: 300,
      MATIC: 0.9,
    };
    return prices[symbol] || mockCanopyWallet.usdCurrentPrice;
  };

  useEffect(() => {
    if (activeTab === "buy") {
      setSelectedFromToken(cnpyToken);
      setSelectedToToken(customChainToken);
    } else if (activeTab === "sell") {
      setSelectedFromToken(customChainToken);
      setSelectedToToken(cnpyToken);
    } else if (activeTab === "convert") {
      setSelectedFromToken(cnpyToken);
      setSelectedToToken(customChainToken);
    }
    setFromAmount("");
    setToAmount("");
  }, [activeTab]);

  useEffect(() => {
    if (!fromAmount || fromAmount === "0" || fromAmount === "") {
      setToAmount("0");
      return;
    }

    const amount = parseFloat(fromAmount);
    if (isNaN(amount)) {
      setToAmount("0");
      return;
    }

    if (activeTab === "buy") {
      const fromPrice = getTokenPrice(selectedFromToken.symbol);
      const toPrice = getTokenPrice(selectedToToken.symbol);
      const toValue = (amount * fromPrice) / toPrice;
      setToAmount(
        toValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        })
      );
    } else if (activeTab === "sell") {
      const fromPrice = getTokenPrice(selectedFromToken.symbol);
      const toPrice = getTokenPrice(selectedToToken.symbol);
      const toValue = (amount * fromPrice) / toPrice;
      setToAmount(
        toValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
  }, [fromAmount, activeTab, selectedFromToken, selectedToToken]);

  const handleCopyAddress = () => {
    if (currentWallet?.address) {
      navigator.clipboard.writeText(currentWallet.address);
    }
  };

  const handleSwapTokens = () => {
    const temp = selectedFromToken;
    setSelectedFromToken(selectedToToken);
    setSelectedToToken(temp);
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);

    if (activeTab === "buy") {
      setActiveTab("sell");
    } else if (activeTab === "sell") {
      setActiveTab("buy");
    }
  };

  const handleUseMax = () => {
    if (activeTab === "buy") {
      const cnpyBalance = parseFloat(selectedFromToken.balance);
      const usdAmount = cnpyBalance * mockCanopyWallet.usdCurrentPrice;
      setFromAmount(usdAmount.toString());
    } else if (activeTab === "sell") {
      setFromAmount(selectedFromToken.balance);
    }
  };

  return (
    <>
      {currentWallet && showBalance && (
        <div className="p-6 pb-4 border-b border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Wallet</p>
                <p className="text-xs text-gray-400">
                  {currentWallet.address.slice(0, 6)}...
                  {currentWallet.address.slice(-4)}
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

          <div className="text-center py-4">
            <p className="text-3xl font-bold text-white mb-1">
              {mockCanopyWallet.cnpyAvailableAmount.toLocaleString()} CNPY
            </p>
            <p className="text-sm text-gray-400">≈ ${totalUsdValue}</p>
          </div>
        </div>
      )}

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
            <TokenSelector
              availableTokens={availableTokens}
              selectedToken={selectedConvertToken}
              onSelectToken={setSelectedConvertToken}
              cnpyPrice={mockCanopyWallet.usdCurrentPrice}
            />
          </TabsContent>
        </div>
      </Tabs>

      {currentWallet && activeTab !== "convert" && (
        <div className="">
          <ActionButton activeTab={activeTab} />
        </div>
      )}

      {currentWallet && activeTab === "convert" && selectedConvertToken && (
        <div className="">
          <Button
            className="w-full h-12 text-base font-medium rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            onClick={() => console.log("Convert clicked")}
          >
            Convert to CNPY
          </Button>
        </div>
      )}

      {!currentWallet && (
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
