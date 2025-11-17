"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, Box } from "lucide-react";
import Link from "next/link";
import { LiveStatusComponent } from "./live-status-component";
import { Card } from "../ui/card";

interface ChainSummary {
  id: string;
  name: string;
  ticker?: string;
  market_cap: string;
  marketCapRaw?: number; // Raw market cap value in USD for CNPY conversion
  tvl: string;
  tvlRaw?: number; // Raw TVL value in USD for CNPY conversion
  liquidity: string;
  liquidityRaw?: number; // Raw liquidity value in USD for CNPY conversion
  volume_24h: string;
  volume24hRaw?: number; // Raw volume value in USD for CNPY conversion
  change_24h: number;
  validators: number;
  holders: number;
  chartData?: number[]; // 24 data points for the chart
}

interface TrendingChainsProps {
  chains: ChainSummary[];
}

// Simple minimal chart component - no labels, no tooltips
function MiniChart({ data, color }: { data: number[]; color?: string }) {
  if (!data || data.length === 0) return null;

  const width = 138; // 15% bigger: 120 * 1.15 = 138
  const height = 46; // 15% bigger: 40 * 1.15 = 46
  const padding = 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Avoid division by zero

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y =
      height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y };
  });

  // Create path for the line
  const linePath = `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`;

  // Create closed path for gradient fill (line + bottom corners)
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const bottomY = height - padding;
  const areaPath = `${linePath} L ${lastPoint.x},${bottomY} L ${firstPoint.x},${bottomY} Z`;

  const lineColor = color || "#14b8a6"; // Default teal color

  const gradientId = `gradient-${color?.replace("#", "") || "default"}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="block ml-auto"
      style={{ minWidth: width }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Gradient fill area */}
      <path d={areaPath} fill={`url(#${gradientId})`} />
      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrendingChains({ chains }: TrendingChainsProps) {
  return (
    <Card id="trending-chains">
      <div className="flex items-center justify-between leading-none">
        <h2 className="text-2xl font-bold text-white">Trending Chains</h2>
        <div className="flex items-center gap-4">
          <LiveStatusComponent />
          <div className="flex items-center gap-2 text-muted-foreground text-sm bg-white/[0.05] rounded-lg px-4 py-2">
            <Box className="w-4 h-4" />
            <span>Latest update 44 secs ago</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Rank
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Chain Name
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Market Cap
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  TVL
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Liquidity
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Volume 24H
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Validators
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Holders
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {chains.map((chain, index) => (
                <tr
                  key={chain.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-medium">
                      {index + 1}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-pink-500" />
                      <div className="flex flex-col">
                        <span className="font-medium">{chain.name}</span>
                        {chain.ticker && (
                          <span className="text-xs text-muted-foreground">
                            {chain.ticker}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span>{chain.market_cap}</span>
                      {chain.marketCapRaw && (
                        <span className="text-xs text-muted-foreground">
                          {(chain.marketCapRaw / 0.05).toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                          })}{" "}
                          CNPY
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span>{chain.tvl}</span>
                      {chain.tvlRaw && (
                        <span className="text-xs text-muted-foreground">
                          {(chain.tvlRaw / 0.05).toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                          })}{" "}
                          CNPY
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span>{chain.liquidity}</span>
                      {chain.liquidityRaw && (
                        <span className="text-xs text-muted-foreground">
                          {(chain.liquidityRaw / 0.05).toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                          })}{" "}
                          CNPY
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col">
                        <span className="relative">
                          {chain.volume_24h}

                          <span
                            className={`px-1 mx-2 -top-0.5 relative py-0.5 rounded-md text-sm font-medium w-fit ${
                              chain.change_24h >= 0
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {chain.change_24h >= 0 ? "+" : ""}
                            {chain.change_24h.toFixed(1)}%
                          </span>
                        </span>
                        {chain.volume24hRaw && (
                          <span className="text-xs text-muted-foreground">
                            {(chain.volume24hRaw / 0.05).toLocaleString(
                              "en-US",
                              {
                                maximumFractionDigits: 0,
                              }
                            )}{" "}
                            CNPY
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{chain.validators}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-background" />
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-background" />
                      </div>
                      <span>+{chain.holders}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <MiniChart
                      data={
                        chain.chartData ||
                        Array.from({ length: 24 }, () => Math.random() * 100)
                      }
                      color={index % 2 === 0 ? "#14b8a6" : "#f87171"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <Link href="/explorer/chains">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              View All Chains
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
