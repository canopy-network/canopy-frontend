"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { ChainWithUI } from "@/lib/stores/chains-store";
import { useMemo } from "react";
import { HexagonIcon } from "@/components/icons/hexagon-icon";
import { Users, TrendingUp } from "lucide-react";

/**
 * SmallProjectCard component - A compact project card that functions as a clickable link
 * Displays project information in a condensed format with icon, title, source, performance, and progress
 * Used in dashboard listings and project grids where space is limited
 */
interface SmallProjectCardProps {
  project: ChainWithUI;
  href?: string;
  viewMode?: "grid" | "list";
}

export const SmallProjectCard = ({
  project,
  href = `/launchpad/${project.id}`,
  viewMode = "grid",
}: SmallProjectCardProps) => {
  // Dynamic performance calculation based on project data
  const performanceData = useMemo(() => {
    // Calculate 24h price change based on chart data
    if (project.chartData && project.chartData.length >= 2) {
      const latest = project.chartData[project.chartData.length - 1];
      const previous = project.chartData[project.chartData.length - 2];
      const change = ((latest.value - previous.value) / previous.value) * 100;
      return {
        change: Math.round(change * 100) / 100,
        isPositive: change >= 0,
      };
    }

    // Fallback: calculate based on progress and market cap
    const progressFactor = project.progress / 100;
    const marketCapFactor = Math.min(project.marketCap / 1000000000, 1); // Normalize to 0-1
    const change = (progressFactor * marketCapFactor - 0.5) * 40; // -20 to +20 range

    return {
      change: Math.round(change * 100) / 100,
      isPositive: change >= 0,
    };
  }, [project.chartData, project.progress, project.marketCap]);

  // Dynamic time calculation
  const timeAgo = useMemo(() => {
    const now = new Date();
    const created = new Date(project.created_at);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
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

  // Format numbers with proper suffixes
  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  // Calculate market cap and target based on actual project data
  const marketCapFormatted = formatNumber(25000);
  const targetFormatted = formatNumber(40000);
  // const marketCapFormatted = formatNumber( project.marketCap );
  // const targetFormatted = formatNumber( project.fdv );

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
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${iconData.gradient}`}
            >
              <span className="text-sm font-bold text-white">
                {project.chain_name.charAt(0).toUpperCase()}
              </span>
            </div>
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
              <Progress value={80} className="w-full h-1.5 bg-primary/20" />
              <div className="text-xs text-muted-foreground">
                ${marketCapFormatted} / ${targetFormatted}
              </div>
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
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${iconData.gradient}`}
        >
          <span className="text-sm font-bold text-white">
            {project.chain_name.charAt(0).toUpperCase()}
          </span>
        </div>

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
      <div className="space-y-2 mt-auto">
        {/* Progress Bar */}
        <Progress
          // value={project.progress}
          value={80}
          className="w-full h-2 bg-primary/20"
        />

        {/* Price and Percentage */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            ${marketCapFormatted} / ${targetFormatted}
          </span>
          <span
            className={
              performanceData.isPositive ? "text-green-500" : "text-red-500"
            }
          >
            {performanceData.isPositive ? "+" : ""}
            {performanceData.change}%
          </span>
        </div>
      </div>
    </Link>
  );
};
