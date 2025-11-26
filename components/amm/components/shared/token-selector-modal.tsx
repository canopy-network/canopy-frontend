"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PoolToken } from "../types/amm/pool";
import { Search } from "lucide-react";

interface TokenSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokens: PoolToken[];
  selectedToken?: string;
  onSelectToken: (token: string) => void;
}

export function TokenSelectorModal({
  open,
  onOpenChange,
  tokens,
  selectedToken,
  onSelectToken,
}: TokenSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;

    const query = searchQuery.toLowerCase();
    return tokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().startsWith(query)
    );
  }, [tokens, searchQuery]);

  const handleSelectToken = (tokenSymbol: string) => {
    onSelectToken(tokenSymbol);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select token</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or symbol"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {filteredTokens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tokens found
              </div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => handleSelectToken(token.symbol)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors ${
                    selectedToken === token.symbol ? "bg-muted" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={token.icon} />
                    <AvatarFallback>{token.symbol[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{token.symbol}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
