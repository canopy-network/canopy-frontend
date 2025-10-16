"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, Search } from "lucide-react";
import type { ChainToken } from "@/types/chains";

interface TokenSelectorProps {
  availableTokens: ChainToken[];
  selectedToken: ChainToken | null;
  onSelectToken: (token: ChainToken) => void;
  cnpyPrice?: number;
}

export function TokenSelector({
  availableTokens,
  selectedToken,
  onSelectToken,
  cnpyPrice = 0.05,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [amount, setAmount] = useState("");

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return availableTokens;
    const query = searchQuery.toLowerCase();
    return availableTokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query)
    );
  }, [availableTokens, searchQuery]);

  const handleSelectToken = (tokenSymbol: string) => {
    const token = availableTokens.find((t) => t.symbol === tokenSymbol);
    if (token) {
      onSelectToken(token);
      setIsOpen(false);
      setSearchQuery("");
      setAmount("");
    }
  };

  const getTokenPrice = (symbol: string): number => {
    const prices: Record<string, number> = {
      ETH: 2500,
      BTC: 65000,
      USDC: 1,
      OBNB: 300,
      MATIC: 0.9,
    };
    return prices[symbol] || 1;
  };

  const calculateCnpyAmount = (): string => {
    if (!selectedToken || !amount || parseFloat(amount) === 0) {
      return "0.00";
    }

    const tokenAmount = parseFloat(amount);
    const tokenPrice = getTokenPrice(selectedToken.symbol);
    const totalUsd = tokenAmount * tokenPrice;
    const cnpyAmount = totalUsd / cnpyPrice;

    return cnpyAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleUseMax = () => {
    if (selectedToken) {
      setAmount(selectedToken.balance);
    }
  };

  const cnpyAmount = calculateCnpyAmount();

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="text-white text-base font-medium mb-2 block">
            Select token
          </label>
          <p className="text-gray-400 text-sm mb-4">Select selling asset</p>

          <Select
            value={selectedToken?.symbol}
            onValueChange={handleSelectToken}
            open={isOpen}
            onOpenChange={setIsOpen}
          >
            <SelectTrigger className="w-full h-14 bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#1a1a1a] text-white">
              {selectedToken ? (
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{selectedToken.icon}</span>
                  </div>
                  <div className="flex flex-col items-start flex-1">
                    <span className="text-sm font-medium text-white">
                      {selectedToken.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {selectedToken.symbol}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                    <span className="text-2xl text-gray-500">+</span>
                  </div>
                  <span className="text-gray-400">Select a token</span>
                </div>
              )}
              <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
            </SelectTrigger>
            <SelectContent className="w-[var(--radix-select-trigger-width)] bg-[#1a1a1a] border-[#2a2a2a]">
              {/* Search Input */}
              <div className="p-2 border-b border-[#2a2a2a]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tokens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Token List */}
              <div className="max-h-[300px] overflow-y-auto">
                {filteredTokens.length > 0 ? (
                  filteredTokens.map((token) => (
                    <SelectItem
                      key={token.symbol}
                      value={token.symbol}
                      className="cursor-pointer hover:bg-[#2a2a2a] text-white focus:bg-[#2a2a2a] focus:text-white"
                    >
                      <div className="flex items-center gap-3 w-full py-1">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">{token.icon}</span>
                        </div>
                        <div className="flex flex-col items-start flex-1">
                          <span className="text-sm font-medium">
                            {token.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {token.balance} {token.symbol}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No tokens found
                  </div>
                )}
              </div>
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input - Only show when token is selected */}
        {selectedToken && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-lg">
                  <span>{selectedToken.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {selectedToken.symbol}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedToken.balance} {selectedToken.symbol}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUseMax}
                variant="secondary"
                size="sm"
                className="h-7 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
              >
                Use max
              </Button>
            </div>

            <Input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="text-center text-3xl font-bold border-none bg-transparent text-white placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        )}

        {/* Conversion Arrow - Only show when token is selected */}
        {selectedToken && (
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-full bg-[#2a2a2a] flex items-center justify-center">
              <span className="text-white">↓</span>
            </div>
          </div>
        )}

        {/* CNPY Destination */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <span className="text-lg">🌳</span>
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">CNPY</span>
                <span className="text-sm font-medium text-white">
                  {cnpyAmount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Canopy</span>
                <span className="text-xs text-gray-400">
                  $
                  {(
                    parseFloat(cnpyAmount.replace(/,/g, "")) * cnpyPrice
                  ).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
