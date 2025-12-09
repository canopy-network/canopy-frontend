import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, TrendingUp, Clock, Wallet } from "lucide-react";
import tokensData from "@/data/tokens.json";
import { chainsApi } from "@/lib/api";
import { useWalletStore } from "@/lib/stores/wallet-store";

export default function TokenSelectionDialog({
  open,
  onOpenChange,
  onSelectToken,
  excludeToken = null,
}) {
  const { wallets } = useWalletStore();
  const isConnected = wallets.length > 0;

  const [searchQuery, setSearchQuery] = useState("");
  const [recentTokens, setRecentTokens] = useState([]);
  const [allTokens, setAllTokens] = useState([...tokensData]);

  // Load recent tokens from localStorage
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem("recentTokens") || "[]");
    setRecentTokens(recent);
  }, [open]);

  // Fetch chains and build token list
  useEffect(() => {
    const fetchChains = async () => {
      try {
        const response = await chainsApi.getChains();
        if (response.data) {
          const tokens = [...tokensData];

          // Add chain tokens that aren't already in tokensData
          // Only include C001 (Chain 1) and C002 (Chain 2)
          response.data.forEach((chain) => {
            // Only add chains 1 and 2 that have required fields
            if (
              chain.ticker &&
              chain.name &&
              !tokens.find((t) => t.symbol === chain.ticker)
            ) {
              tokens.push({
                symbol: chain.ticker,
                name: chain.name,
                chainId: chain.id,
                address: chain.creator || "",
                decimals: 18,
                logo: chain.logo,
                brandColor: chain.brandColor,
                currentPrice: chain.currentPrice || 0,
                priceChange24h: chain.priceChange24h || 0,
                volume24h: chain.volume || 0,
                marketCap: chain.marketCap || 0,
              });
            }
          });

          setAllTokens(tokens);
        }
      } catch (error) {
        console.error("Error fetching chains:", error);
        // Fallback to just tokensData if API fails
        setAllTokens([...tokensData]);
      }
    };

    if (open) {
      fetchChains();
    }
  }, [open]);

  // Create a map of token symbols to their balances
  // TODO: Implement actual balance fetching using wallet addresses from walletStore
  const tokenBalances = useMemo(() => {
    const balances = {};
    // CNPY is always assumed to have balance for connected users
    if (isConnected) {
      balances["CNPY"] = 5000;
    }
    return balances;
  }, [isConnected]);

  // Filter and sort tokens based on search and balance
  const filteredTokens = useMemo(() => {
    let tokens = allTokens.filter((token) => {
      if (excludeToken && token.symbol === excludeToken) return false;

      const query = searchQuery.toLowerCase();
      return (
        token.symbol?.toLowerCase().includes(query) ||
        token.name?.toLowerCase().includes(query) ||
        token.address?.toLowerCase().includes(query)
      );
    });

    // Sort: tokens with balance first, then by name
    tokens.sort((a, b) => {
      const aBalance = tokenBalances[a.symbol] || 0;
      const bBalance = tokenBalances[b.symbol] || 0;

      // Primary sort: tokens with balance first
      if (aBalance > 0 && bBalance === 0) return -1;
      if (aBalance === 0 && bBalance > 0) return 1;

      // Secondary sort: by balance value (higher first)
      if (aBalance > 0 && bBalance > 0) {
        const aValue = aBalance * (a.currentPrice || 0);
        const bValue = bBalance * (b.currentPrice || 0);
        if (aValue !== bValue) return bValue - aValue;
      }

      // Tertiary sort: alphabetically by name
      return a.name.localeCompare(b.name);
    });

    return tokens;
  }, [allTokens, excludeToken, searchQuery, tokenBalances]);

  // Get recent tokens that are still valid
  const recentTokensList = recentTokens
    .map((symbol) => allTokens.find((t) => t.symbol === symbol))
    .filter((t) => t && (!excludeToken || t.symbol !== excludeToken))
    .slice(0, 3);

  const handleSelectToken = (token) => {
    // Add to recent tokens
    const updated = [
      token.symbol,
      ...recentTokens.filter((s) => s !== token.symbol),
    ].slice(0, 5);
    localStorage.setItem("recentTokens", JSON.stringify(updated));
    setRecentTokens(updated);

    onSelectToken(token);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md max-h-[600px] flex flex-col p-0"
        aria-describedby={undefined}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, symbol or address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Token List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          {/* Recent Tokens */}
          {!searchQuery && recentTokensList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2">
                <Clock className="w-3 h-3" />
                <span>Recent</span>
              </div>
              <div className="space-y-1">
                {recentTokensList.map((token) => (
                  <TokenItem
                    key={token.symbol}
                    token={token}
                    onSelect={handleSelectToken}
                    balance={tokenBalances[token.symbol]}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Your Tokens (with balance) */}
          {!searchQuery &&
            isConnected &&
            (() => {
              const tokensWithBalance = filteredTokens.filter(
                (t) => tokenBalances[t.symbol] > 0
              );
              if (tokensWithBalance.length === 0) return null;
              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2">
                    <Wallet className="w-3 h-3" />
                    <span>Your Tokens</span>
                  </div>
                  <div className="space-y-1">
                    {tokensWithBalance.map((token) => (
                      <TokenItem
                        key={token.symbol}
                        token={token}
                        onSelect={handleSelectToken}
                        balance={tokenBalances[token.symbol]}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

          {/* All Tokens */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2">
              <TrendingUp className="w-3 h-3" />
              <span>{searchQuery ? "Search Results" : "All Tokens"}</span>
            </div>
            <div className="space-y-1">
              {(() => {
                // When not searching, filter out tokens already shown in "Your Tokens"
                const tokensToShow =
                  !searchQuery && isConnected
                    ? filteredTokens.filter(
                        (t) =>
                          !tokenBalances[t.symbol] ||
                          tokenBalances[t.symbol] === 0
                      )
                    : filteredTokens;

                return tokensToShow.length > 0 ? (
                  tokensToShow.map((token) => (
                    <TokenItem
                      key={token.symbol}
                      token={token}
                      onSelect={handleSelectToken}
                      balance={tokenBalances[token.symbol]}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    {filteredTokens.length > 0
                      ? "All your tokens are shown above"
                      : "No tokens found"}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TokenItem({ token, onSelect, balance }) {
  const formatBalance = (bal) => {
    if (!bal) return null;
    if (bal >= 1000000) return `${(bal / 1000000).toFixed(2)}M`;
    if (bal >= 1000) return `${(bal / 1000).toFixed(1)}K`;
    return bal.toLocaleString();
  };

  return (
    <button
      onClick={() => onSelect(token)}
      className="w-full p-3 rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        {/* Token Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: token.brandColor || "#10b981" }}
        >
          {token.logo ? (
            <img
              src={token.logo}
              alt={token.symbol}
              className="w-full h-full rounded-full"
            />
          ) : (
            <span className="text-base font-bold text-white">
              {token.symbol[0]}
            </span>
          )}
        </div>

        {/* Token Info */}
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="font-medium">{token.symbol}</span>
            {token.isNative && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                Native
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{token.name}</p>
        </div>
      </div>

      {/* Token Price & Balance */}
      <div className="text-right">
        {balance > 0 ? (
          <>
            <p className="text-sm font-medium">{formatBalance(balance)}</p>
            <p className="text-xs text-muted-foreground">
              $
              {(balance * token.currentPrice || 0).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium">
              $
              {token.currentPrice?.toFixed(token.currentPrice < 0.01 ? 6 : 4) ||
                "0.00"}
            </p>
            {token.priceChange24h !== undefined && (
              <p
                className={`text-xs ${
                  token.priceChange24h >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {token.priceChange24h >= 0 ? "+" : ""}
                {token.priceChange24h.toFixed(2)}%
              </p>
            )}
          </>
        )}
      </div>
    </button>
  );
}
