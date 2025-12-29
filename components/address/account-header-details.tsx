"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CopyableText } from "../ui/copyable-text";
import { AddressInfo } from "@/types/api";

interface AccountHeaderDetailsProps {
  addressInfo: AddressInfo | null;
  address: string;
}

export function AccountHeaderDetails({
  addressInfo,
  address,
}: AccountHeaderDetailsProps) {
  const displayAddress = `${address.slice(0, 6)}...${address.slice(-5)}`;
  const daysAgo = addressInfo?.createdAt
    ? (() => {
        const days = Math.floor(
          (Date.now() - addressInfo.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return `${days}d ago`;
      })()
    : "204d ago";

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="space-y-5">
      {/* Account Header */}
      <div className="flex items-start lg:items-center justify-between">
        <div className="flex items-start lg:items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold">Account</h1>
            <div className="flex items-center gap-1 lg:gap-2 mt-1 lg:flex-row flex-col">
              <CopyableText text={displayAddress} iconMuted={false} />

              <div className="flex items-center gap-2 mr-auto">
                <span className="text-xs text-muted-foreground h-1 w-1 rounded-full bg-muted-foreground hidden lg:block"></span>
                <span className="text-xs text-muted-foreground capitalize mr-auto">
                  created {daysAgo}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
        {/* Portfolio Value */}
        <Card className="p-4 lg:p-6">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Portfolio Value</p>
            <p className="text-2xl font-semibold leading-none">
              $
              {addressInfo?.portfolioValue?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}{" "}
              USD
            </p>
            <p className="text-xs text-muted-foreground">
              {addressInfo?.cnpyTotal?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}{" "}
              CNPY
            </p>
          </div>
        </Card>

        {/* 24h Change */}
        <Card className="p-4 lg:p-6">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">24h Change</p>
            <p className="text-2xl font-semibold leading-none text-green-500">
              +$
              {addressInfo?.change24h?.absolute?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </p>
            <p className="text-xs text-green-500">
              ↑+{addressInfo?.change24h?.percentage || "0.0"}% last 24h
            </p>
          </div>
        </Card>

        {/* Staked vs Free */}
        <Card className="p-4 lg:p-6">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Staked vs Free</p>
            <Progress
              value={addressInfo?.staked?.value || 0}
              className="h-2"
              variant="green"
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-500">
                Staked: {addressInfo?.staked?.value || 0}%
              </span>
              <span className="text-green-500/30 text-muted-foreground">
                Free: {addressInfo?.staked?.free || 0}%
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
