"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Function to truncate address: first 6 chars + ... + last 4 chars
const truncateAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Get initials from address for avatar
const getInitials = (address: string): string => {
  if (address.length < 4) return address.slice(0, 2).toUpperCase();
  return address.slice(2, 4).toUpperCase();
};

// Generate consistent color based on address
const getAvatarColor = (address: string): string => {
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

  // Use address to generate consistent color
  const hash = address.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

export type Holder = {
  rank: number;
  address: string;
  balance: number;
  percentage: number;
  value: number;
  isCreator?: boolean;
};

// Base data template
const baseData: Holder[] = [
  {
    rank: 1,
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    balance: 350000,
    percentage: 16.28,
    value: 4725.0,
    isCreator: true,
  },
  {
    rank: 2,
    address: "0x8626F6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    balance: 320000,
    percentage: 14.88,
    value: 4320.0,
  },
  {
    rank: 3,
    address: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
    balance: 290000,
    percentage: 13.49,
    value: 3915.0,
  },
  {
    rank: 4,
    address: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
    balance: 260000,
    percentage: 12.09,
    value: 3510.0,
  },
  {
    rank: 5,
    address: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
    balance: 230000,
    percentage: 10.7,
    value: 3105.0,
  },
  {
    rank: 6,
    address: "0xCD36a566fE133a2711a03B0b3c488ce8E27C1234",
    balance: 200000,
    percentage: 9.3,
    value: 2700.0,
  },
  {
    rank: 7,
    address: "0x1234567890aBcDeF1234567890aBcDeF12345678",
    balance: 180000,
    percentage: 8.37,
    value: 2430.0,
  },
  {
    rank: 8,
    address: "0xaBcDeF1234567890aBcDeF1234567890aBcDeF12",
    balance: 150000,
    percentage: 6.98,
    value: 2025.0,
  },
  {
    rank: 9,
    address: "0x9876543210fEdCbA9876543210fEdCbA98765432",
    balance: 120000,
    percentage: 5.58,
    value: 1620.0,
  },
  {
    rank: 10,
    address: "0xfEdCbA9876543210fEdCbA9876543210fEdCbA98",
    balance: 100000,
    percentage: 4.65,
    value: 1350.0,
  },
];

// Duplicate data to create 50 entries for pagination
const mockData: Holder[] = Array.from({ length: 5 }, (_, groupIndex) =>
  baseData.map((holder, index) => ({
    ...holder,
    rank: groupIndex * 10 + index + 1,
    isCreator: holder.isCreator && groupIndex === 0,
    // Vary the addresses slightly for each duplicate
    address:
      holder.address.slice(0, -4) +
      Math.random().toString(16).substring(2, 6).toUpperCase(),
  }))
).flat();

// Format USD value
const formatUSDValue = (value: number): string => {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Format percentage
const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(2)}%`;
};

// Format token balance
const formatBalance = (balance: number, ticker: string = "DYPRO"): string => {
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

export function HoldersTable() {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);

  const ticker = "DYPRO";
  const creatorAddress = mockData[0]?.address; // First holder is creator for demo

  // Calculate pagination
  const totalPages = Math.ceil(mockData.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentHolders = mockData.slice(startIndex, endIndex);

  const canPreviousPage = currentPage > 0;
  const canNextPage = currentPage < totalPages - 1;

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">
          Total{" "}
          <span className="text-white/70">
            {(2471549).toLocaleString()} holders
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
          {currentHolders.map((holder, idx) => (
            <div
              key={holder.address}
              className="flex items-center gap-4 py-4  border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-muted-foreground">
                #{holder.rank}
              </div>

              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarFallback
                  className={`${getAvatarColor(
                    holder.address
                  )} text-white font-semibold`}
                >
                  {getInitials(holder.address)}
                </AvatarFallback>
              </Avatar>

              {/* Address */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CopyableAddress address={holder.address} />
                  {holder.isCreator && (
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
                  {formatUSDValue(holder.value)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(holder.percentage)} •{" "}
                  {formatBalance(holder.balance, ticker)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
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
      </div>
    </div>
  );
}
