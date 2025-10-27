import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface Achievement {
  id: string;
  label: string;
  icon: LucideIcon;
  unlocked?: boolean;
  title?: string;
  description?: string;
  current?: number;
  requirement?: number;
  type?: "holders" | "value" | "transactions" | "other";
  isLocked?: boolean;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  isCard?: boolean;
}

// Format value based on type
const formatValue = (value: number, type?: string): string => {
  if (!type || type === "other") return value.toLocaleString();

  if (type === "holders" || type === "transactions") {
    return value.toLocaleString();
  }

  if (type === "value") {
    return `$${value.toLocaleString()}`;
  }

  return value.toLocaleString();
};

/**
 * Props for the AchievementBadge component.
 *
 * @typedef {Object} AchievementBadgeProps
 * @property {Object} achievement - The achievement object containing details for the badge.
 * @property {string} achievement.id - Unique identifier for the achievement.
 * @property {string} achievement.label - Short label for the achievement (e.g., "100 Holders").
 * @property {LucideIcon} achievement.icon - Icon component from lucide-react to visually represent the badge.
 * @property {boolean} [achievement.unlocked] - Indicates if the achievement is currently unlocked.
 * @property {string} [achievement.title] - Optional full title for the achievement card.
 * @property {string} [achievement.description] - Optional description text for the achievement.
 * @property {number} [achievement.current] - The current progress value toward this achievement.
 * @property {number} [achievement.requirement] - The total value required to unlock the achievement.
 * @property {"holders" | "value" | "transactions" | "other"} [achievement.type] - Type of requirement (e.g., holders, value, transactions).
 * @property {boolean} [achievement.isLocked] - Whether the badge should show as locked, even if requirement is met.
 *
 * @property {boolean} [isCard] - Display as a full card view (true) or compact badge view (false, default).
 */

export function AchievementBadge({
  achievement,
  isCard = false,
}: AchievementBadgeProps) {
  const Icon = achievement.icon;

  // Calculate progress if card mode and data is available
  const progress =
    achievement.current && achievement.requirement
      ? Math.min((achievement.current / achievement.requirement) * 100, 100)
      : 0;

  const isCompleted = achievement.unlocked || progress >= 100;
  const isLocked = achievement.isLocked || false;

  // Render compact badge
  if (!isCard) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="relative w-6 h-6 flex items-center justify-center flex-shrink-0">
          {/* Hexagon Background */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            <polygon
              points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25"
              className="fill-primary/20 stroke-primary"
              strokeWidth="4"
            />
          </svg>
          {/* Icon */}
          <Icon
            className="w-3 h-3 relative z-10 text-primary"
            aria-hidden="true"
          />
        </div>
        <span className="text-sm font-medium">{achievement.label}</span>
      </div>
    );
  }

  // Render full card
  return (
    <Card
      className={`p-6 ${isLocked ? "opacity-50" : ""} ${
        isCompleted ? "border-primary/50 bg-primary/5" : ""
      }`}
    >
      {/* Header with badges */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {isCompleted && (
            <Badge
              variant="outline"
              className="border-green-500/50 text-green-500 text-xs"
            >
              Completed
            </Badge>
          )}
        </div>
        {isLocked && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Locked
          </Badge>
        )}
      </div>

      {/* Hexagonal badge with icon */}
      <div className="flex flex-col items-center mb-4">
        <div
          className={`relative w-24 h-24 flex items-center justify-center ${
            isLocked ? "opacity-30" : ""
          }`}
        >
          {/* Hexagon SVG */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            <polygon
              points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25"
              className={`${
                isCompleted
                  ? "fill-primary/20 stroke-primary"
                  : "fill-muted/50 stroke-border"
              }`}
              strokeWidth="2"
            />
          </svg>
          {/* Icon */}
          <Icon
            className={`w-10 h-10 relative z-10 ${
              isCompleted ? "text-primary" : "text-muted-foreground"
            }`}
          />
        </div>
      </div>

      {/* Title and description */}
      <div className="text-center mb-4">
        <h4 className="font-semibold text-base mb-1">
          {achievement.title || achievement.label}
        </h4>
        <p className="text-sm text-muted-foreground">
          {achievement.description ||
            `Reach ${achievement.requirement?.toLocaleString() || 0} ${
              achievement.type || "milestone"
            }`}
        </p>
      </div>

      {/* Progress */}
      {achievement.current !== undefined &&
        achievement.requirement !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatValue(achievement.current, achievement.type)} of{" "}
                {formatValue(achievement.requirement, achievement.type)}
              </span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
    </Card>
  );
}
