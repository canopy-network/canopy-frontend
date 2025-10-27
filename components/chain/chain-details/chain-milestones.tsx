import { Users, TrendingUp, Zap, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AchievementBadge, Achievement } from "./achievement-badge";

// Placeholder milestones data with progress tracking
const PLACEHOLDER_MILESTONES: Achievement[] = [
  {
    id: "first-10-holders",
    label: "First 10 Holders",
    title: "First 10 Holders",
    description: "Reach your first 10 token holders",
    icon: Users,
    unlocked: true,
    current: 1243,
    requirement: 10,
    type: "holders",
  },
  {
    id: "50-holders",
    label: "50 Holders",
    title: "50 Holders",
    description: "Grow your community to 50 holders",
    icon: Users,
    unlocked: true,
    current: 1243,
    requirement: 50,
    type: "holders",
  },
  {
    id: "100-holders",
    label: "100 Holders",
    title: "100 Holders",
    description: "Reach 100 community members",
    icon: Users,
    unlocked: true,
    current: 1243,
    requirement: 100,
    type: "holders",
  },
  {
    id: "500-holders",
    label: "500 Holders",
    title: "500 Holders",
    description: "Achieve 500 strong holders",
    icon: Users,
    unlocked: true,
    current: 1243,
    requirement: 500,
    type: "holders",
  },
  {
    id: "1k-market-cap",
    label: "$1k Market Cap",
    title: "$1k Market Cap",
    description: "Reach $1,000 market capitalization",
    icon: TrendingUp,
    unlocked: true,
    current: 67500,
    requirement: 1000,
    type: "value",
  },
  {
    id: "5k-market-cap",
    label: "$5k Market Cap",
    title: "$5k Market Cap",
    description: "Achieve $5,000 market cap milestone",
    icon: TrendingUp,
    unlocked: true,
    current: 67500,
    requirement: 5000,
    type: "value",
  },
  {
    id: "10k-market-cap",
    label: "$10k Market Cap",
    title: "$10k Market Cap",
    description: "Reach $10,000 market capitalization",
    icon: TrendingUp,
    unlocked: true,
    current: 67500,
    requirement: 10000,
    type: "value",
  },
  {
    id: "25k-market-cap",
    label: "$25k Market Cap",
    title: "$25k Market Cap",
    description: "Achieve $25,000 market cap",
    icon: TrendingUp,
    unlocked: true,
    current: 67500,
    requirement: 25000,
    type: "value",
  },
  {
    id: "1000-transactions",
    label: "1,000 Transactions",
    title: "1,000 Transactions",
    description: "Process your first 1,000 transactions",
    icon: Zap,
    unlocked: true,
    current: 567800,
    requirement: 1000,
    type: "transactions",
  },
  {
    id: "10000-transactions",
    label: "10,000 Transactions",
    title: "10,000 Transactions",
    description: "Reach 10,000 total transactions",
    icon: Zap,
    unlocked: true,
    current: 567800,
    requirement: 10000,
    type: "transactions",
  },
  {
    id: "graduation-ready",
    label: "Graduation Ready",
    title: "Graduation Ready",
    description: "Meet all requirements for mainnet graduation",
    icon: Award,
    unlocked: false,
    current: 85,
    requirement: 100,
    type: "other",
    isLocked: true,
  },
];

interface ChainMilestonesProps {
  milestones?: Achievement[];
  isOwner?: boolean;
}

export function ChainMilestones({
  milestones,
  isOwner = false,
}: ChainMilestonesProps) {
  const displayMilestones = milestones || PLACEHOLDER_MILESTONES;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">Chain Milestones</h3>
        <p className="text-sm text-muted-foreground">
          {isOwner
            ? "Unlock achievements as your blockchain grows"
            : "Track this blockchain's achievements and progress"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayMilestones.map((milestone) => (
          <AchievementBadge
            key={milestone.id}
            achievement={milestone}
            isCard={true}
          />
        ))}
      </div>
    </Card>
  );
}
