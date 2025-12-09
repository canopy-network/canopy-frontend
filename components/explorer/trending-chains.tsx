"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, Box } from "lucide-react";
import Link from "next/link";
import { Card } from "../ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { LatestUpdated } from "./latest-updated";

export interface ChainSummary {
  id: string;
  chainId?: number;
  name: string;
  ticker?: string;
  rank?: number;
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
    <Card padding="explorer" id="trending-chains" className="gap-2 lg:gap-6">
      <div className="flex items-center justify-between leading-none">
        <h2 className="text-lg lg:text-2xl font-bold text-white pl-2 lg:pl-0">
          Trending Chains
        </h2>
        <LatestUpdated timeAgo="44 secs ago" />
      </div>

      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow appearance="plain">
              <TableHead className="pl-0 lg:pl-4">Rank</TableHead>
              <TableHead className="pl-0 lg:pl-4">Chain Name</TableHead>
              <TableHead className="pl-0 lg:pl-4">Market Cap</TableHead>
              <TableHead className="pl-0 lg:pl-4">TVL</TableHead>
              <TableHead className="pl-0 lg:pl-4">Liquidity</TableHead>
              <TableHead className="pl-0 lg:pl-4">Volume 24H</TableHead>
              <TableHead className="pl-0 lg:pl-4 text-center lg:text-left">
                Validators
              </TableHead>
              <TableHead className="">Holders</TableHead>
              <TableHead className=""></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chains.map((chain, index) => (
              <TableRow key={chain.id} appearance="plain">
                <TableCell className="pl-0 lg:pl-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-medium">
                    {chain.rank ?? index + 1}
                  </div>
                </TableCell>
                <TableCell className="pl-0 lg:pl-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-pink-500" />
                    <Link
                      href={
                        chain.chainId
                          ? `/chains/${chain.chainId}`
                          : `/chains/${chain.id}`
                      }
                      className="flex flex-col hover:text-primary transition-colors"
                    >
                      <span className="font-medium">{chain.name}</span>
                      {chain.ticker && (
                        <span className="text-xs text-muted-foreground">
                          {chain.ticker}
                        </span>
                      )}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="pl-0 lg:pl-4">
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
                </TableCell>
                <TableCell className="pl-0 lg:pl-4">
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
                </TableCell>
                <TableCell className="pl-0 lg:pl-4">
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
                </TableCell>
                <TableCell className="pl-0 lg:pl-4">
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
                          {(chain.volume24hRaw / 0.05).toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                          })}{" "}
                          CNPY
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="pl-0 lg:pl-4 text-center lg:text-left">
                  {chain.validators}
                </TableCell>
                <TableCell className="">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-background" />
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-background" />
                    </div>
                    <span>+{chain.holders}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <MiniChart
                    data={
                      chain.chartData ||
                      Array.from({ length: 24 }, () => Math.random() * 100)
                    }
                    color={index % 2 === 0 ? "#14b8a6" : "#f87171"}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between lg:mt-4 mt- lg:pt-4 pt-3 border-t border-border">
          <Link href="/">
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
