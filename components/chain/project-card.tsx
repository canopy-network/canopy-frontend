"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Target } from "lucide-react";
import Link from "next/link";
import { Chain, VirtualPool } from "@/types/chains";
import { formatKilo } from "@/lib/utils";
import { FeaturelessChart } from "../charts/featureless-chart";
import { HexagonIcon } from "@/components/icons";
import { ChainProgressBar } from "./chain-progress-bar";
import {
  calculateGraduationProgress,
  formatRelativeTime,
  calculateAge,
  generateChainColor,
} from "@/lib/utils/chain-ui-helpers";

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
  chartData?: Array<{ value: number; time: number }>;
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
              {project.chain_name}
            </h2>
          </Link>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.chain_description}
          </p>

          {/* Progress Bar */}
          <ChainProgressBar
            progress={progress}
            currentAmount={formatKilo(currentRaised)}
            targetAmount={formatKilo(project.graduation_threshold)}
            priceChange={priceChange}
            variant="A"
            progressColor={projectColor}
          />

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
            {chartData && chartData.length > 0 ? (
              <FeaturelessChart data={chartData} isDark={true} />
            ) : chartData === undefined ? (
              // Loading state
              <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-xs text-muted-foreground">
                    Loading chart data...
                  </p>
                </div>
              </div>
            ) : (
              // No data available
              <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center space-y-2 px-4">
                  <svg
                    className="w-12 h-12 mx-auto text-muted-foreground/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    Currently we don&apos;t have chart data available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
