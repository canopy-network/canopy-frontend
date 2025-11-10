"use client";

import Link from "next/link";
import { Chain, ChainExtended, Accolade } from "@/types/chains";
import { useMemo, useState } from "react";
import { HexagonIcon } from "@/components/icons/hexagon-icon";
import { Users, TrendingUp, Star, Target } from "lucide-react";
import { ChainProgressBar } from "./chain-progress-bar";
import {
  calculateGraduationProgress,
  formatNumber,
  calculateAge,
  getMarketCap,
  getPriceChange24h,
} from "@/lib/utils/chain-ui-helpers";
import { useChainFavorite } from "@/lib/hooks/use-chain-favorite";
import { cn } from "@/lib/utils";

/**
 * SmallProjectCard component - A compact project card that functions as a clickable link
 * Displays project information in a condensed format with icon, title, source, performance, and progress
 * Used in dashboard listings and project grids where space is limited
 */
interface SmallProjectCardProps {
  project: Chain | ChainExtended;
  href?: string;
  viewMode?: "grid" | "list";
  /** Filtered accolades to display (one per category) */
  accolades?: Accolade[];
}

export const SmallProjectCard = ({
  project,
  href = `/chain/${project.id}`,
  viewMode = "grid",
  accolades = [],
}: SmallProjectCardProps) => {
  // Favorite hook
  const { isFavorited, isLoading, toggleFavorite, isAuthenticated } =
    useChainFavorite(project.id);

  // Map accolade categories to icons
  const getAccoladeIcon = (category: string) => {
    switch (category) {
      case "holder":
        return <Users className="w-1.5 h-1.5" />;
      case "market_cap":
        return <TrendingUp className="w-1.5 h-1.5" />;
      case "transaction":
        return <Target className="w-1.5 h-1.5" />;
      default:
        return <TrendingUp className="w-1.5 h-1.5" />;
    }
  };

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

  // Calculate current amount and target from graduation data if available
  const extendedProject = project as ChainExtended;
  const currentAmount =
    extendedProject.graduation?.current_cnpy_reserve ??
    virtualPool?.cnpy_reserve ??
    0;
  const graduationThreshold =
    extendedProject.graduation?.threshold_cnpy ?? project.graduation_threshold;
  const marketCapFormatted = formatNumber(currentAmount);
  const targetFormatted = formatNumber(graduationThreshold);

  // Use brand_color from API or fallback to generated gradient
  const brandColor = project.brand_color;

  // Get first 2 letters of chain name for logo fallback
  const chainInitials = project.chain_name.slice(0, 2).toUpperCase();

  // State to track if image failed to load
  const [imageError, setImageError] = useState(false);

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
        className="rounded-xl border bg-card text-card-foreground shadow cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all group relative"
      >
        <div className="flex items-center gap-4 p-4">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3 min-w-[200px]">
            {project.branding && !imageError ? (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: brandColor }}
              >
                <img
                  src={project.branding}
                  alt={`logo - ${project.chain_name}`}
                  className="w-10 h-10 rounded-full"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  brandColor ? "" : `bg-gradient-to-br ${iconData.gradient}`
                }`}
                style={brandColor ? { backgroundColor: brandColor } : undefined}
              >
                <span className="text-sm font-bold text-white">
                  {chainInitials}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{project.chain_name}</h3>
                {isAuthenticated && (
                  <button
                    onClick={toggleFavorite}
                    disabled={isLoading}
                    className={cn(
                      "p-1 rounded transition-all hover:scale-110",
                      isFavorited
                        ? "bg-yellow-500/20 hover:bg-yellow-500/30"
                        : "hover:bg-muted"
                    )}
                    title={
                      isFavorited ? "Remove from favorites" : "Add to favorites"
                    }
                  >
                    <Star
                      className={cn(
                        "w-3 h-3 transition-all",
                        isFavorited && "fill-yellow-500 text-yellow-500"
                      )}
                    />
                  </button>
                )}
              </div>
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
      className="rounded-xl border bg-card text-card-foreground shadow p-4 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all group h-40  flex flex-col gap-3 relative"
    >
      {/* Favorite Button - Positioned absolutely */}
      {isAuthenticated && (
        <button
          onClick={toggleFavorite}
          disabled={isLoading}
          className={cn(
            "absolute top-2 right-2 p-1.5 rounded-lg transition-all hover:scale-110 z-10",
            isFavorited
              ? "bg-yellow-500/20 hover:bg-yellow-500/30"
              : "bg-muted/50 hover:bg-muted"
          )}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            className={cn(
              "w-3.5 h-3.5 transition-all",
              isFavorited && "fill-yellow-500 text-yellow-500"
            )}
          />
        </button>
      )}

      {/* Header: Avatar + Title + Icons */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {project.branding && !imageError ? (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: brandColor }}
          >
            <img
              src={project.branding}
              alt={`logo - ${project.chain_name}`}
              className="w-10 h-10 rounded-full"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              brandColor ? "" : `bg-gradient-to-br ${iconData.gradient}`
            }`}
            style={brandColor ? { backgroundColor: brandColor } : undefined}
          >
            <span className="text-sm font-bold text-white">
              {chainInitials}
            </span>
          </div>
        )}

        {/* Title, Ticker, and Hexagon Icons */}
        <div className="flex-1 min-w-0 pr-8">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold truncate">
              {project.chain_name}
            </h3>

            {/* Hexagon Icons - Use Accolades if available, otherwise fallback to computed icons */}
            {accolades.length > 0 ? (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {accolades.map((accolade) => (
                  <HexagonIcon
                    key={accolade.name}
                    tooltip={accolade.display_name}
                    description={accolade.description}
                    className="w-3.5 h-3.5"
                  >
                    {getAccoladeIcon(accolade.category)}
                  </HexagonIcon>
                ))}
              </div>
            ) : (
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
            )}
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
