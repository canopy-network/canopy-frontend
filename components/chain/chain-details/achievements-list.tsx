import { Users, TrendingUp, Zap, Award, Trophy, Target } from "lucide-react";
import { AchievementBadge, Achievement } from "./achievement-badge";
import { ArrowRight } from "lucide-react";
import { Accolade } from "@/types/chains";

// Placeholder achievements data
const PLACEHOLDER_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-10-holders",
    label: "First 10 holders",
    icon: Users,
    unlocked: true,
  },
  {
    id: "1k-market-cap",
    label: "$1k market cap",
    icon: TrendingUp,
    unlocked: true,
  },
  {
    id: "50-holders-milestone",
    label: "50 holders milestone",
    icon: Users,
    unlocked: true,
  },
  {
    id: "1000-transactions",
    label: "1,000 transactions",
    icon: Zap,
    unlocked: true,
  },
  {
    id: "5k-market-cap",
    label: "$5k market cap",
    icon: TrendingUp,
    unlocked: true,
  },
  {
    id: "100-holders-club",
    label: "100 holders club",
    icon: Users,
    unlocked: true,
  },
  {
    id: "10k-market-cap",
    label: "$10k market cap",
    icon: Target,
    unlocked: true,
  },
  {
    id: "500-holders-strong",
    label: "500 holders strong",
    icon: Award,
    unlocked: true,
  },
  {
    id: "25k-market-cap",
    label: "$25k market cap",
    icon: Trophy,
    unlocked: true,
  },
  {
    id: "graduation-ready",
    label: "Graduation ready",
    icon: Award,
    unlocked: true,
  },
];

interface AchievementsListProps {
  achievements?: Achievement[];
  accolades?: Accolade[];
}

// Map accolade category to icon
const getAccoladeIcon = (category: string) => {
  switch (category) {
    case "holder":
      return Users;
    case "market_cap":
      return TrendingUp;
    case "transaction":
      return Zap;
    default:
      return Award;
  }
};

// Map accolade category to achievement type
const getAccoladeType = (
  category: string
): "holders" | "value" | "transactions" | "other" => {
  switch (category) {
    case "holder":
      return "holders";
    case "market_cap":
      return "value";
    case "transaction":
      return "transactions";
    default:
      return "other";
  }
};

// Convert Accolade[] to Achievement[]
const convertAccoladesToAchievements = (
  accolades: Accolade[]
): Achievement[] => {
  // Filter to only show accolades where current_value >= threshold
  const achieved = accolades.filter(
    (accolade) => accolade.current_value >= accolade.threshold
  );

  // Sort accolades: by category, then by threshold
  const sorted = [...achieved].sort((a, b) => {
    // First by category
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    // Then by threshold (ascending)
    return a.threshold - b.threshold;
  });

  return sorted.map((accolade) => ({
    id: accolade.name,
    label: accolade.display_name,
    icon: getAccoladeIcon(accolade.category),
    unlocked: accolade.is_earned,
    title: accolade.display_name,
    description: accolade.description,
    current: accolade.current_value,
    requirement: accolade.threshold,
    type: getAccoladeType(accolade.category),
    isLocked: !accolade.is_earned,
  }));
};

export function AchievementsList({
  achievements,
  accolades = [],
}: AchievementsListProps) {
  // Convert accolades to achievements format if provided
  const accoladesAsAchievements =
    accolades.length > 0 ? convertAccoladesToAchievements(accolades) : null;

  // Use accolades if provided, otherwise use achievements prop, otherwise use placeholders
  const displayAchievements =
    accoladesAsAchievements || achievements || PLACEHOLDER_ACHIEVEMENTS;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Achievements</h3>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayAchievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
