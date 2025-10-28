"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Target } from "lucide-react";
import Link from "next/link";
import { Chain, VirtualPool } from "@/types/chains";
import { formatKilo } from "@/lib/utils";
import { FeaturelessChart } from "../charts/featureless-chart";
import { HexagonIcon } from "@/components/icons";
import {
  calculateGraduationProgress,
  formatCurrency,
  formatRelativeTime,
  calculateAge,
  generateChainColor,
} from "@/lib/utils/chain-ui-helpers";

/**
 * Generate sample chart data based on virtual pool data
 */
const generateSampleChartData = (virtualPool?: VirtualPool, chain?: Chain) => {
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
  /** Complete chain data object containing all information needed for display */
  project: Chain;
  /** Virtual pool data for trading metrics and progress calculation */
  virtualPool?: VirtualPool;
  /** Callback function triggered when the buy button is clicked */
  onBuyClick: (project: Chain) => void;
  /** Historical price data points for rendering price charts and trend analysis */
  chartData: any[];
}

export const ProjectCard = ({
  project,
  virtualPool,
  onBuyClick,
  chartData,
}: ProjectCardProps) => {
  // Calculate metrics from virtual pool data using utility functions
  const progress = calculateGraduationProgress(project, virtualPool);
  const currentRaised = virtualPool?.cnpy_reserve || 0;
  const priceChange = virtualPool?.price_24h_change_percent || 0;
  const volume24h = virtualPool?.volume_24h_cnpy || 0;
  const marketCap = virtualPool?.market_cap_usd || 0;
  const uniqueTraders = virtualPool?.unique_traders || 0;

  // Generate sample chart data based on virtual pool data
  const sampleChartData = generateSampleChartData(virtualPool, project);

  // Generate holder avatars (using first letter of project name + random colors)
  const holderColors = [
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  const projectColor = generateChainColor(project.chain_name);

  return (
    <Card className="rounded-xl border text-card-foreground   p-6 pb-0 bg-gradient-to-br from-card to-muted/20  hover:ring-2 hover:ring-primary/20 transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Link href={`/chain/${project.id}`}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: projectColor }}
              >
                {project.branding ? (
                  <img
                    src={project.branding}
                    alt={`logo - ${project.chain_name}`}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <span className="text-base font-bold text-black">
                    {project.chain_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">${project.token_symbol}</h3>
                <div className="flex items-center gap-1">
                  <HexagonIcon tooltip="50 holders milestone">
                    <Users className="w-2 h-2" />
                  </HexagonIcon>
                  <HexagonIcon tooltip="Top trending today">
                    <TrendingUp className="w-2 h-2" />
                  </HexagonIcon>
                  <HexagonIcon tooltip="100+ active traders">
                    <Users className="w-2 h-2" />
                  </HexagonIcon>
                  <HexagonIcon tooltip="Price up 25% today">
                    <TrendingUp className="w-2 h-2" />
                  </HexagonIcon>
                  <HexagonIcon tooltip="Most popular in category">
                    <Users className="w-2 h-2" />
                  </HexagonIcon>
                  <HexagonIcon tooltip="50% to graduation goal">
                    <Target className="w-2 h-2" />
                  </HexagonIcon>
                  <HexagonIcon tooltip="3 more achievements">
                    <span className="text-[7px] font-bold">+3</span>
                  </HexagonIcon>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {project.chain_name} • created{" "}
                {formatRelativeTime(project.created_at)}
              </p>
            </div>
          </div>

          <Link href={`/chain/${project.id}`}>
            {/* Title */}
            <h2 className="text-2xl font-bold leading-tight">
              {project.chain_description}
            </h2>
          </Link>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            Secure medical records on blockchain with patient-controlled access
            and encrypted health data sharing.
          </p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="relative w-full overflow-hidden rounded-full bg-primary/20 h-3">
              <div
                className="h-full w-full flex-1 transition-all"
                style={{
                  backgroundColor: projectColor,
                  transform: `translateX(-${100 - progress}%)`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                ${formatKilo(currentRaised)} / $
                {formatKilo(project.graduation_threshold)} until graduation
              </span>
              <span
                className={priceChange >= 0 ? "text-green-500" : "text-red-500"}
              >
                {priceChange >= 0 ? "+" : ""}
                {priceChange.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="flex items-center gap-6 pt-2 border-t border-border/50 pb-4">
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {holderColors.map((color, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-semibold text-white ${color}`}
                  >
                    H{i + 1}
                  </div>
                ))}
              </div>
              <span className="ml-3 text-xs text-muted-foreground">
                {formatKilo(uniqueTraders)}+ all
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-muted-foreground">VOL (24h) </span>
                <span className="font-medium">
                  $
                  {volume24h >= 1000000
                    ? `${(volume24h / 1000000).toFixed(1)}M`
                    : volume24h >= 1000
                    ? `${(volume24h / 1000).toFixed(1)}k`
                    : volume24h.toFixed(0)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">MCap </span>
                <span className="font-medium">
                  $
                  {marketCap >= 1000000
                    ? `${(marketCap / 1000000).toFixed(1)}M`
                    : marketCap >= 1000
                    ? `${(marketCap / 1000).toFixed(1)}k`
                    : marketCap.toFixed(0)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Age </span>
                <span className="font-medium">
                  {calculateAge(project.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Chart */}
        <div className="flex items-center">
          <div className="w-full h-[280px]">
            <FeaturelessChart data={sampleChartData} isDark={true} />
          </div>
        </div>
      </div>
    </Card>
  );
};
