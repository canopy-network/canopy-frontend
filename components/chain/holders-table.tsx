"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChainHolder } from "@/types/chains";

// Function to truncate address: first 6 chars + ... + last 4 chars
const truncateAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Get initials from account name for avatar
const getInitials = (accountName: string): string => {
  if (!accountName || accountName.length === 0) return "??";
  const words = accountName.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return accountName.slice(0, 2).toUpperCase();
};

// Generate consistent color based on string
const getAvatarColor = (str: string): string => {
  const colors = [
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-indigo-500",
  ];

  // Use string to generate consistent color
  const hash = str.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

// Format USD value (mock placeholder)
const formatUSDValue = (cnpyValue: number): string => {
  // Using placeholder mock conversion: 1 CNPY = ~$0.135 (mock rate)
  const mockUSDValue = cnpyValue * 0.135;
  return `$${mockUSDValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Format percentage
const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(2)}%`;
};

// Format token balance
const formatBalance = (balance: number, ticker: string): string => {
  return `${balance.toLocaleString()} ${ticker}`;
};

// Copyable address component
const CopyableAddress = ({ address }: { address: string }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip open={copied}>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className="font-mono text-sm font-medium hover:text-primary transition-colors cursor-pointer"
          >
            {truncateAddress(address)}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copied to clipboard!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function HoldersTable({
  data,
  pagination,
  tokenSymbol,
}: {
  data: ChainHolder[];
  pagination: {
    page: number;
    total: number;
  };
  tokenSymbol: string;
}) {
  // Display settings
  const displayLimit = 10; // Number of holders to display initially
  const displayedHolders = data.slice(0, displayLimit);
  const remainingHolders = pagination.total - displayedHolders.length;

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">
          Total{" "}
          <span className="text-white/70">
            {pagination.total.toLocaleString()} holders
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <span className="mr-2">📥</span>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Holders List */}
      <div className=" bg-card overflow-hidden">
        <div>
          {displayedHolders.map((holder, idx) => (
            <div
              key={holder.user_id}
              className="flex items-center gap-4 py-4  border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-muted-foreground">
                #{idx + 1}
              </div>

              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarFallback
                  className={`${getAvatarColor(
                    holder.account_name
                  )} text-white font-semibold`}
                >
                  {getInitials(holder.account_name)}
                </AvatarFallback>
              </Avatar>

              {/* Address */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CopyableAddress address={holder.wallet_address} />
                  {idx === 0 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4 bg-green-500/10 text-green-500 border-green-500/20"
                    >
                      Creator
                    </Badge>
                  )}
                </div>
              </div>

              {/* Balance Info */}
              <div className="text-right">
                <p className="font-semibold text-sm">
                  {formatUSDValue(holder.value_cnpy)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(holder.percentage)} •{" "}
                  {formatBalance(holder.token_balance, tokenSymbol)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Among others indicator */}
        {remainingHolders > 0 && (
          <div className="pt-6 text-center border-t border-border">
            <p className="text-sm text-muted-foreground">
              Among <span>{remainingHolders.toLocaleString()}</span> others
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {/* <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">Show</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(0);
            }}
          >
            <SelectTrigger className="h-8 w-[70px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="bg-[#1a1a1a] border-white/20">
              {[10, 20, 25, 30, 40, 50].map((size) => (
                <SelectItem
                  key={size}
                  value={`${size}`}
                  className="text-white hover:bg-white/10"
                >
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-white/70">per page</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(0)}
              disabled={!canPreviousPage}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50"
            >
              ⟪
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!canPreviousPage}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50"
            >
              ‹
            </Button>
            <span className="text-sm text-white">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!canNextPage}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50"
            >
              ›
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={!canNextPage}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50"
            >
              ⟫
            </Button>
          </div>
        </div>
      </div> */}
    </div>
  );
}
