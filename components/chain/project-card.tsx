"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Target, Star } from "lucide-react";
import Link from "next/link";
import { Chain, ChainExtended, VirtualPool, Accolade } from "@/types/chains";
import { formatKilo, cn } from "@/lib/utils";
import { FeaturelessChart } from "../charts/featureless-chart";
import { HexagonIcon } from "@/components/icons";
import { ChainProgressBar } from "./chain-progress-bar";
import {
  calculateGraduationProgress,
  formatRelativeTime,
  calculateAge,
  generateChainColor,
} from "@/lib/utils/chain-ui-helpers";
import { useChainFavorite } from "@/lib/hooks/use-chain-favorite";

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
  /** Filtered accolades to display (one per category) */
  accolades?: Accolade[];
}

export const ProjectCard = ({
  project,
  virtualPool,
  onBuyClick,
  chartData,
  accolades = [],
}: ProjectCardProps) => {
  // Favorite hook
  const { isFavorited, isLoading, toggleFavorite, isAuthenticated } =
    useChainFavorite(project.id);

  // Map accolade categories to icons
  const getAccoladeIcon = (category: string) => {
    switch (category) {
      case "holder":
        return <Users className="w-2 h-2" />;
      case "market_cap":
        return <TrendingUp className="w-2 h-2" />;
      case "transaction":
        return <Target className="w-2 h-2" />;
      default:
        return <Target className="w-2 h-2" />;
    }
  };

  // Calculate metrics from graduation data if available, otherwise fallback to virtual pool
  const extendedProject = project as ChainExtended;
  const progress = extendedProject.graduation?.completion_percentage
    ? Math.min(
        Math.round(extendedProject.graduation.completion_percentage),
        100
      )
    : calculateGraduationProgress(project, virtualPool);
  const currentRaised =
    extendedProject.graduation?.current_cnpy_reserve ??
    virtualPool?.cnpy_reserve ??
    0;
  const graduationThreshold =
    extendedProject.graduation?.threshold_cnpy ?? project.graduation_threshold;
  const priceChange = virtualPool?.price_24h_change_percent || 0;
  const volume24h = virtualPool?.volume_24h_cnpy || 0;
  const marketCap = virtualPool?.market_cap_usd || 0;
  const uniqueTraders = virtualPool?.unique_traders || 0;

  // Generate holder avatars based on unique traders count
  const holderColors = [
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  const maxVisibleHolders = 4;
  const visibleHoldersCount = Math.min(uniqueTraders, maxVisibleHolders);
  const remainingHolders = Math.max(0, uniqueTraders - maxVisibleHolders);

  // Use brand_color from API or fallback to generated color
  const brandColor =
    project.brand_color || generateChainColor(project.chain_name);

  // Get first 2 letters of chain name for logo fallback
  const chainInitials = project.chain_name.slice(0, 2).toUpperCase();

  // State to track if image failed to load
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="rounded-xl border text-card-foreground  px-4 py-4 lg:p-6 lg:pb-0 bg-gradient-to-br from-card to-muted/20  hover:ring-2 hover:ring-primary/20 transition-all relative h-114 lg:h-auto">
      {/* Favorite Button - Absolute positioned */}
      {isAuthenticated && (
        <button
          onClick={toggleFavorite}
          disabled={isLoading}
          className={cn(
            "absolute top-4 right-4 p-2 rounded-lg transition-all hover:scale-110 z-10",
            isFavorited
              ? "bg-yellow-500/20 hover:bg-yellow-500/30"
              : "bg-muted/50 hover:bg-muted"
          )}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            className={cn(
              "w-4 h-4 transition-all",
              isFavorited && "fill-yellow-500 text-yellow-500"
            )}
          />
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] lg:gap-8">
        {/* Left Column */}
        <div className="space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Link href={`/chain/${project.id}`}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: brandColor }}
              >
                {project.branding && !imageError ? (
                  <img
                    src={project.branding}
                    alt={`logo - ${project.chain_name}`}
                    className="w-10 h-10 rounded-full"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-base font-bold text-white">
                    {chainInitials}
                  </span>
                )}
              </div>
            </Link>
            <div className="flex-1 min-w-0 lg:pr-12">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">${project.token_symbol}</h3>
                {/* Display Accolades */}
                {accolades.length > 0 && (
                  <div className="flex items-center gap-1">
                    {accolades.map((accolade) => (
                      <HexagonIcon
                        key={accolade.name}
                        tooltip={accolade.display_name}
                        description={accolade.description}
                      >
                        {getAccoladeIcon(accolade.category)}
                      </HexagonIcon>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-auto max-w-[112px] lg:max-w-auto overflow-hidden text-ellipsis whitespace-nowrap">
                  {project.token_name}
                </span>{" "}
                • <span className="hidden lg:inline">Created </span>
                {formatRelativeTime(project.created_at)}
              </p>
            </div>
          </div>

          <Link href={`/chain/${project.id}`} className="block mb-3 lg:mb-0">
            {/* Title */}
            <h2
              className="text-2xl font-bold leading-tight line-clamp-2"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {project.chain_name}
            </h2>
          </Link>

          {/* Description */}
          <p className="hidden lg:block text-sm text-muted-foreground leading-relaxed">
            {project.chain_description}
          </p>

          {/* Progress Bar */}
          <ChainProgressBar
            progress={progress}
            currentAmount={formatKilo(currentRaised)}
            targetAmount={formatKilo(graduationThreshold)}
            priceChange={priceChange}
            variant="A"
            progressColor={brandColor}
          />

          {/* Bottom Stats */}
          <div className="flex items-center gap-6 pt-2 border-t border-border/50 pb-4">
            <div className="flex items-center">
              {uniqueTraders > 0 ? (
                <>
                  <div className="flex -space-x-2">
                    {Array.from({ length: visibleHoldersCount }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-semibold text-white ${
                          holderColors[i % holderColors.length]
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="ml-3 text-xs text-muted-foreground">
                    {remainingHolders > 0
                      ? `+${formatKilo(remainingHolders)} more`
                      : `${formatKilo(uniqueTraders)} holder${
                          uniqueTraders !== 1 ? "s" : ""
                        }`}
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">0 holders</span>
              )}
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
        <div className="flex items-center w-full lg:h-[280px] flex-col justify-center">
          {chartData && chartData.length > 0 ? (
            <FeaturelessChart
              data={chartData}
              isDark={true}
              lineColor={brandColor}
            />
          ) : chartData === undefined ? (
            // Loading state
            <div className="w-full h-full flex items-center justify-center  rounded-xl">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-xs text-muted-foreground">
                  Loading chart data...
                </p>
              </div>
            </div>
          ) : (
            // No data available
            <div className="w-full h-full flex items-center justify-center bg-muted/25 rounded-xl !h-[200px]">
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
    </Card>
  );
};
