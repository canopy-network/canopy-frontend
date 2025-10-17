"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChainWithUI } from "@/lib/stores/chains-store";
import { useMemo } from "react";

/**
 * SmallProjectCard component - A compact project card that functions as a clickable link
 * Displays project information in a condensed format with icon, title, source, performance, and progress
 * Used in dashboard listings and project grids where space is limited
 */
interface SmallProjectCardProps {
  project: ChainWithUI;
  href?: string;
}

export const SmallProjectCard = ({
  project,
  href = `/launchpad/${project.id}`,
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
  const marketCapFormatted = formatNumber(project.marketCap);
  const targetFormatted = formatNumber(project.fdv);

  // Dynamic status indicator
  const statusIndicator = useMemo(() => {
    if (project.is_graduated)
      return { color: "bg-blue-500", label: "Graduated" };
    if (project.progress >= 100)
      return { color: "bg-green-500", label: "Complete" };
    if (project.progress >= 75)
      return { color: "bg-yellow-500", label: "Near Goal" };
    return { color: "bg-green-500", label: "Active" };
  }, [project.is_graduated, project.progress]);

  return (
    <Link
      href={href}
      className="block p-4 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#2a2a2a] hover:from-[#2a2a2a] hover:to-[#3a3a3a] transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        {/* Dynamic Project Icon */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-12 h-12 bg-gradient-to-br ${iconData.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg`}
          >
            {iconData.emoji}
          </div>
          {/* Dynamic status indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <div
              className={`w-2 h-2 ${statusIndicator.color} rounded-full`}
            ></div>
          </div>
        </div>

        {/* Project Content */}
        <div className="flex-1 min-w-0">
          {/* Project Title with Token Symbol */}
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-sm truncate group-hover:text-blue-300 transition-colors">
              {project.chain_name}
            </h3>
            <span className="text-gray-400 text-xs font-mono">
              ${project.token_symbol}
            </span>
          </div>

          {/* Dynamic Source and Time */}
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="secondary"
              className={`text-xs px-2 py-0.5 ${
                project.template?.template_category === "defi"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  : project.template?.template_category === "gaming"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                  : project.template?.template_category === "nft"
                  ? "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
                  : project.template?.template_category === "infrastructure"
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                  : project.template?.template_category === "social"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
              }`}
            >
              {project.template?.template_category?.charAt(0).toUpperCase() +
                project.template?.template_category?.slice(1) || "Other"}
            </Badge>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-gray-400 text-xs">
              {project.creator?.display_name ||
                project.creator?.wallet_address?.slice(0, 6) +
                  "..." +
                  project.creator?.wallet_address?.slice(-4) ||
                "Unknown"}
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-gray-400 text-xs">{timeAgo}</span>
          </div>

          {/* Dynamic Performance and Progress */}
          <div className="flex items-center gap-3 mt-3">
            {/* Dynamic Performance Indicator */}
            <div className="flex items-center gap-1">
              <div
                className={`w-0 h-0 border-l-[3px] border-r-[3px] border-b-[6px] ${
                  performanceData.isPositive
                    ? "border-l-transparent border-r-transparent border-b-green-500"
                    : "border-l-transparent border-r-transparent border-t-[6px] border-t-red-500 border-b-0"
                }`}
              ></div>
              <span
                className={`text-sm font-medium ${
                  performanceData.isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {Math.abs(performanceData.change)}%
              </span>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="flex-1 flex items-center gap-2">
              <Progress
                value={project.progress}
                className="flex-1 h-2 bg-gray-700"
              />
              <div className="flex flex-col items-end">
                <span className="text-gray-400 text-xs whitespace-nowrap">
                  MC {marketCapFormatted}/{targetFormatted}
                </span>
                <span className="text-gray-500 text-xs">
                  {project.participants} holders
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
