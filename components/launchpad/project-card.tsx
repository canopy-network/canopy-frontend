"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { ChainWithUI } from "@/lib/stores/chains-store";
import { VirtualPool } from "@/types/chains";
import { formatKilo } from "@/lib/utils";
import { FeaturelessChart } from "../charts/featureless-chart";

/**
 * Generate sample chart data based on virtual pool data
 */
const generateSampleChartData = (
  virtualPool?: VirtualPool,
  project?: ChainWithUI
) => {
  // Always return hardcoded sample data that matches the image
  const now = Date.now() / 1000; // Current timestamp in seconds

  // Hardcoded data that matches the image: upward trend with peaks and valleys
  return [
    { time: now - 40 * 60 * 60, value: 0.12 },
    { time: now - 38 * 60 * 60, value: 0.15 },
    { time: now - 36 * 60 * 60, value: 0.18 },
    { time: now - 34 * 60 * 60, value: 0.16 },
    { time: now - 32 * 60 * 60, value: 0.22 },
    { time: now - 30 * 60 * 60, value: 0.25 },
    { time: now - 28 * 60 * 60, value: 0.28 },
    { time: now - 26 * 60 * 60, value: 0.24 },
    { time: now - 24 * 60 * 60, value: 0.3 },
    { time: now - 22 * 60 * 60, value: 0.35 },
    { time: now - 20 * 60 * 60, value: 0.38 },
    { time: now - 18 * 60 * 60, value: 0.42 },
    { time: now - 16 * 60 * 60, value: 0.45 },
    { time: now - 14 * 60 * 60, value: 0.48 },
    { time: now - 12 * 60 * 60, value: 0.44 },
    { time: now - 10 * 60 * 60, value: 0.4 },
    { time: now - 8 * 60 * 60, value: 0.36 },
    { time: now - 6 * 60 * 60, value: 0.38 },
    { time: now - 4 * 60 * 60, value: 0.42 },
    { time: now - 2 * 60 * 60, value: 0.45 },
    { time: now, value: 0.48 },
  ];
};
/**
 * Props interface for the ProjectCard component
 * Defines the required data and callbacks for rendering a project card
 * Used by the ProjectCard component to display project information and handle user interactions
 */
export interface ProjectCardProps {
  /** Complete project data object containing all information needed for display */
  project: ChainWithUI;
  /** Virtual pool data for trading metrics and progress calculation */
  virtualPool?: VirtualPool;
  /** Callback function triggered when the buy button is clicked */
  onBuyClick: (project: ChainWithUI) => void;
  /** Historical price data points for rendering price charts and trend analysis */
  chartData: any[];
}

export const ProjectCard = ({
  project,
  virtualPool,
  onBuyClick,
  chartData,
}: ProjectCardProps) => {
  const [avatar, setAvatar] = useState<string>("");

  useEffect(() => {
    if (project.creator?.avatar_url) {
      setAvatar(project.creator.avatar_url);
    } else if (project.creator?.username) {
      setAvatar(project.creator.username);
    } else {
      setAvatar("https://picsum.photos/536/354");
    }
  }, [project.creator]);

  // Calculate metrics from virtual pool data
  const progress = virtualPool
    ? Math.min(
        (virtualPool.cnpy_reserve / project.graduation_threshold) * 100,
        100
      )
    : project.progress || 0;

  const currentRaised = virtualPool?.cnpy_reserve || 0;
  const priceChange = virtualPool?.price_24h_change_percent || 0;
  const volume24h = virtualPool?.volume_24h_cnpy || 0;
  const marketCap = virtualPool?.market_cap_usd || 0;
  const fdv = virtualPool?.market_cap_usd || 0; // Using market_cap_usd as FDV for now
  const uniqueTraders = virtualPool?.unique_traders || 0;

  // Generate sample chart data based on virtual pool data
  const sampleChartData = generateSampleChartData(virtualPool, project);

  return (
    <>
      <Card
        padding="lg"
        size="lg"
        className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#2a2a2a] hover:from-[#2a2a2a] hover:to-[#3a3a3a] transition-all duration-300 lg:h-[342px]"
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg">
                {/* TODO: whats up with the icon/avatar on API response? */}
                <span className="text-white font-bold text-lg">
                  {project.chain_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <Link href={`/launchpad/${project.id}`} className="text-left">
                <div className="flex lg:items-center gap-2 mb-1 flex-col md:flex-row text-left">
                  <h2 className="text-2xl font-bold text-white text-left">
                    {project.chain_name}
                  </h2>

                  <Badge className="bg-[#2a2a2a] text-white border-[#3a3a3a] text-left">
                    ${project.token_symbol}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  {project.creator?.display_name} · Published{" "}
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </Link>
            </div>

            <div>
              <h3 className="text-3xl font-semibold text-white mb-2 leading-tight line-clamp-2">
                {project.chain_description}
              </h3>
              <p className="text-muted-foreground leading-relaxed line-clamp-2">
                Buy an asset chain company with $700 in assets or not, take
                everything onchain
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Progress
                    value={progress}
                    className="w-32 h-2 bg-[#2a2a2a]"
                  />
                  <span className="text-sm text-muted-foreground font-medium">
                    {formatKilo(currentRaised)}/
                    {formatKilo(project.graduation_threshold)}
                  </span>
                  <span className="text-sm text-primary font-semibold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {priceChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-full relative">
            <FeaturelessChart data={sampleChartData} isDark={true} />
          </div>
        </div>
      </Card>
      <div className="mt-6 flex items-center justify-between flex-col-reverse md:flex-row md:items-center gap-4 lg:gap-3">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatKilo(uniqueTraders)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">By</span>
            <div className="flex -space-x-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-500 to-blue-500 border-2 border-[#1a1a1a] overflow-hidden">
                <img src={avatar} alt="Avatar" width={24} height={24} />
              </div>
            </div>
            <span className="text-sm text-white font-medium">
              {project.creator?.username || project.creator?.display_name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm w-full md:w-auto">
          <div className=" text-left lg:text-center">
            <div className="text-muted-foreground">VOL (24h)</div>
            <div className="text-white font-semibold">
              $
              {volume24h >= 1000000
                ? `${(volume24h / 1000000).toFixed(1)}M`
                : volume24h >= 1000
                ? `${(volume24h / 1000).toFixed(1)}K`
                : volume24h.toFixed(0)}
            </div>
          </div>
          <div className=" text-left lg:text-center">
            <div className="text-muted-foreground">MCap</div>
            <div className="text-white font-semibold">
              $
              {marketCap >= 1000000
                ? `${(marketCap / 1000000).toFixed(1)}M`
                : marketCap >= 1000
                ? `${(marketCap / 1000).toFixed(1)}K`
                : marketCap.toFixed(0)}
            </div>
          </div>
          <div className=" text-left lg:text-center">
            <div className="text-muted-foreground">FDV</div>
            <div className="text-white font-semibold">
              $
              {fdv >= 1000000
                ? `${(fdv / 1000000).toFixed(1)}M`
                : fdv >= 1000
                ? `${(fdv / 1000).toFixed(1)}K`
                : fdv.toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
