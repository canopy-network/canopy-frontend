import { LucideIcon } from "lucide-react";

export interface Achievement {
  id: string;
  label: string;
  icon: LucideIcon;
  unlocked?: boolean;
}

interface AchievementBadgeProps {
  achievement: Achievement;
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const Icon = achievement.icon;

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
