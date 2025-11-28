"use client";

import { Card } from "../ui/card";
import { Badge } from "@/components/ui/badge";

interface PortfolioTableProps {
  data: {
    assets: Array<{
      id: number;
      token: string;
      price: number | null;
      priceChange: number | null;
      balance: number | null;
      usdValue: number | null;
    }>;
  } | null;
}

export function PortfolioTable({ data }: PortfolioTableProps) {
  if (!data) return null;

  return (
    <Card className="w-full space-y-4 lg:px-6 px-4 lg:py-6 py-4">
      <div className="w-full overflow-x-auto">
        <div className="min-w-[640px] space-y-2">
          <div className="secondary-table-row flex items-center w-full text-muted-foreground text-xs py-1 lg:py-3 px-4">
            <span className="min-w-8 text-xs mr-8">#</span>
            <span className="min-w-[152px]">Token</span>
            <span className="min-w-[124px] mr-[92px]">Price</span>
            <span className="min-w-[96px] mr-[92px]">Balance</span>
            <span className="flex items-center">USD Value</span>
          </div>
          <div className="secondary-table-body flex flex-col gap-2">
            {data.assets.map((asset, index) => (
              <div
                key={asset.id}
                className="secondary-table-row flex items-center w-full border border-border rounded-xl px-4 hover:bg-muted/30 transition-colors"
              >
                <span className="font-medium !min-w-8 h-8 py-3 border border-black leading-none mr-8 rounded-full bg-muted flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </span>
                <div className="flex items-center py-3 leading-none gap-2 min-w-[152px] ">
                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {asset.token[0]}
                    </span>
                  </span>
                  <span>{asset.token}</span>
                </div>
                <div className="min-w-[124px] mr-[92px] py-3 leading-none flex items-center">
                  {asset.price !== null ? (
                    <div className="flex items-center gap-2">
                      <span>${asset.price.toFixed(2)}</span>
                      {asset.priceChange !== null && (
                        <Badge
                          variant="outline"
                          className={
                            asset.priceChange >= 0
                              ? "bg-green-500/20 text-green-500 border-green-500/20"
                              : "bg-red-500/20 text-red-500 border-red-500/20"
                          }
                        >
                          {asset.priceChange >= 0 ? "↑" : "↓"}
                          {Math.abs(asset.priceChange).toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
                <div className="min-w-[96px] mr-[92px] py-3 leading-none flex items-center">
                  {asset.balance !== null ? (
                    <span>
                      $
                      {asset.balance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
                <div className="flex items-center py-3 leading-none">
                  {asset.usdValue !== null ? (
                    <span>
                      $
                      {asset.usdValue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
