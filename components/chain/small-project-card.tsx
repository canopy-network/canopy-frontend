"use client";

import Link from "next/link";
import { Chain, ChainExtended } from "@/types/chains";
import { useMemo } from "react";
import { HexagonIcon } from "@/components/icons/hexagon-icon";
import { Users, TrendingUp } from "lucide-react";
import { ChainProgressBar } from "./chain-progress-bar";
import {
  calculateGraduationProgress,
  formatNumber,
  calculateAge,
  getMarketCap,
  getPriceChange24h,
} from "@/lib/utils/chain-ui-helpers";

/**
 * SmallProjectCard component - A compact project card that functions as a clickable link
 * Displays project information in a condensed format with icon, title, source, performance, and progress
 * Used in dashboard listings and project grids where space is limited
 */
interface SmallProjectCardProps {
  project: Chain | ChainExtended;
  href?: string;
  viewMode?: "grid" | "list";
}

export const SmallProjectCard = ({
  project,
  href = `/chain/${project.id}`,
  viewMode = "grid",
}: SmallProjectCardProps) => {
  // Get virtual pool data if included
  const virtualPool = project.virtual_pool;

  // Use graduation.completion_percentage if available, otherwise calculate it
  const progress = useMemo(() => {
    const extendedProject = project as ChainExtended;
    if (extendedProject.graduation?.completion_percentage !== undefined) {
      return Math.min(
        Math.round(extendedProject.graduation.completion_percentage),
        100
      );
    }
    return calculateGraduationProgress(project, virtualPool);
  }, [project, virtualPool]);

  // Dynamic performance calculation based on project data
  const performanceData = useMemo(() => {
    const change = getPriceChange24h(virtualPool);
    return {
      change: Math.round(change * 100) / 100,
      isPositive: change >= 0,
    };
  }, [virtualPool]);

  // Dynamic time calculation
  const timeAgo = useMemo(() => {
    return calculateAge(project.created_at);
  }, [project.created_at]);

  // Dynamic icon generation based on project category and name
  const iconData = useMemo(() => {
    const categoryIcons: Record<string, string> = {
      defi: "🔵",
      gaming: "🎮",
      nft: "🖼️",
      infrastructure: "⚙️",
      social: "👥",
      other: "🚀",
    };

    const gradients: Record<string, string> = {
      defi: "from-blue-500 to-cyan-600",
      gaming: "from-purple-500 to-pink-600",
      nft: "from-pink-500 to-rose-600",
      infrastructure: "from-orange-500 to-red-600",
      social: "from-green-500 to-emerald-600",
      other: "from-gray-500 to-gray-600",
    };

    const category = project.template?.template_category || "other";
    return {
      emoji: categoryIcons[category] || "🚀",
      gradient: gradients[category] || "from-gray-500 to-gray-600",
    };
  }, [project.template?.template_category]);

  // Calculate market cap and target based on actual project data
  const marketCap = getMarketCap(virtualPool);
  const marketCapFormatted = formatNumber(marketCap || 25000);
  const targetFormatted = formatNumber(project.graduation_threshold);

  // Calculate visible and overflow hexagon icons
  const hexagonIcons = useMemo(() => {
    const icons = [];
    const maxVisible = 5;

    // Add icons based on project features
    if (project.participants > 100) {
      icons.push({ type: "users", tooltip: `${project.participants} holders` });
    }
    if (performanceData.isPositive && performanceData.change > 10) {
      icons.push({
        type: "trending",
        tooltip: `+${performanceData.change}% growth`,
      });
    }
    if (project.participants > 50) {
      icons.push({ type: "users", tooltip: "Active community" });
    }
    if (project.progress > 50) {
      icons.push({ type: "trending", tooltip: "Strong momentum" });
    }
    if (project.template?.template_category) {
      icons.push({
        type: "users",
        tooltip: project.template.template_category,
      });
    }

    const visible = icons.slice(0, maxVisible);
    const overflow = Math.max(0, icons.length - maxVisible);

    return { visible, overflow };
  }, [
    project.participants,
    project.progress,
    project.template,
    performanceData,
  ]);

  // Generate placeholder data for list view
  const volumeFormatted = formatNumber(
    project.volume24h || Math.random() * 100000 + 10000
  );
  const holdersCount = Math.floor(Math.random() * 2000 + 500); // Placeholder
  const liquidityFormatted = formatNumber(
    project.marketCap * 0.1 || Math.random() * 50000 + 5000
  );

  // List view rendering
  if (viewMode === "list") {
    return (
      <Link
        href={href}
        className="rounded-xl border bg-card text-card-foreground shadow cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all group"
      >
        <div className="flex items-center gap-4 p-4">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3 min-w-[200px]">
            {project.branding ? (
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${project.brand_color}`}
              >
                <img
                  src={project.branding}
                  alt={`logo - ${project.chain_name}`}
                  className="w-10 h-10 rounded-full"
                />
              </div>
            ) : (
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${project.brand_color}`}
              >
                <span className="text-sm font-bold text-white">
                  {project.chain_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold">{project.chain_name}</h3>
              <p className="text-xs text-muted-foreground">
                ${project.token_symbol}
              </p>
            </div>
          </div>

          {/* Market Cap */}
          <div className="flex-1 min-w-[280px]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Market Cap</span>
              </div>
              <ChainProgressBar
                progress={progress}
                currentAmount={marketCapFormatted}
                targetAmount={targetFormatted}
                priceChange={performanceData.change}
                variant="B"
                className="space-y-1"
              />
            </div>
          </div>

          {/* Change (24h) */}
          <div className="min-w-[100px] text-center">
            <div className="text-xs text-muted-foreground mb-1">
              Change (24h)
            </div>
            <div
              className={`text-sm font-semibold ${
                performanceData.isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {performanceData.isPositive ? "+" : ""}
              {performanceData.change}%
            </div>
          </div>

          {/* VOL (24h) */}
          <div className="min-w-[100px] text-center">
            <div className="text-xs text-muted-foreground mb-1">VOL (24h)</div>
            <div className="text-sm font-semibold">${volumeFormatted}</div>
          </div>

          {/* Holders */}
          <div className="min-w-[80px] text-center">
            <div className="text-xs text-muted-foreground mb-1">Holders</div>
            <div className="text-sm font-semibold">{holdersCount}</div>
          </div>

          {/* Liquidity */}
          <div className="min-w-[100px] text-center">
            <div className="text-xs text-muted-foreground mb-1">Liquidity</div>
            <div className="text-sm font-semibold">${liquidityFormatted}</div>
          </div>

          {/* Age */}
          <div className="min-w-[60px] text-center">
            <div className="text-xs text-muted-foreground mb-1">Age</div>
            <div className="text-sm font-semibold">{timeAgo}</div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view rendering (default)
  return (
    <Link
      href={href}
      className="rounded-xl border bg-card text-card-foreground shadow p-4 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all group h-40  flex flex-col gap-3"
    >
      {/* Header: Avatar + Title + Icons */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {project.branding ? (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${project.brand_color}`}
          >
            <img
              src={project.branding}
              alt={`logo - ${project.chain_name}`}
              className="w-10 h-10 rounded-full"
            />
          </div>
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${iconData.gradient}`}
          >
            <span className="text-sm font-bold text-white">
              {project.chain_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Title, Ticker, and Hexagon Icons */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold truncate">
              {project.chain_name}
            </h3>

            {/* Hexagon Icons */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {hexagonIcons.visible.map((icon, index) => (
                <HexagonIcon
                  key={index}
                  tooltip={icon.tooltip}
                  className="w-3.5 h-3.5"
                >
                  {icon.type === "users" ? (
                    <Users className="w-1.5 h-1.5" />
                  ) : (
                    <TrendingUp className="w-1.5 h-1.5" />
                  )}
                </HexagonIcon>
              ))}

              {/* Overflow indicator */}
              {hexagonIcons.overflow > 0 && (
                <HexagonIcon
                  className="w-3.5 h-3.5"
                  tooltip={`${hexagonIcons.overflow} more features`}
                >
                  <span className="text-[6px] font-bold">
                    +{hexagonIcons.overflow}
                  </span>
                </HexagonIcon>
              )}
            </div>
          </div>

          {/* Token Symbol */}
          <p className="text-xs text-muted-foreground">
            ${project.token_symbol}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2">
        {project.chain_description || "No description available."}
      </p>

      {/* Progress Bar and Metrics */}
      <ChainProgressBar
        progress={progress}
        currentAmount={marketCapFormatted}
        targetAmount={targetFormatted}
        priceChange={performanceData.change}
        variant="B"
        className="mt-auto"
      />
    </Link>
  );
};
