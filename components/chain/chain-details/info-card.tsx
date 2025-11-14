import { LucideIcon, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarGroup } from "./avatar-group";
import { ChainHolder } from "@/types";
import { GitHubRepository } from "@/lib/api/github-repos";
export interface InfoCardStat {
  label: string;
  value: string | number;
}

export interface Holder {
  address: string;
  label?: string;
}

export interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  mainValue: string | number;
  stats?: InfoCardStat[];
  buttonText: string;
  onButtonClick?: () => void;
  isHolders?: boolean;
  holders?: ChainHolder[];
  maxVisibleHolders?: number;
  repository?: GitHubRepository | null;
}

export function InfoCard({
  icon: Icon,
  label,
  mainValue,
  stats,
  buttonText,
  onButtonClick,
  isHolders = false,
  holders = [],
  maxVisibleHolders = 5,
  repository = null,
}: InfoCardProps) {
  return (
    <Card className="flex flex-col px-0" size="none">
      {/* Header */}
      <div className="flex items-start gap-3 pt-5 px-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={`font-bold ${
              typeof mainValue === "string" && mainValue.length > 10
                ? "text-xl"
                : "text-2xl"
            }`}
          >
            {typeof mainValue === "number"
              ? mainValue.toLocaleString()
              : mainValue}
          </p>
        </div>
      </div>

      {/* Content - Avatar Group or Stats */}
      {isHolders && holders.length > 0 ? (
        <div className="flex items-center flex-wrap gap-2  py-0 px-5">
          <AvatarGroup holders={holders} maxVisible={maxVisibleHolders} />
        </div>
      ) : stats && stats.length > 0 ? (
        <div className="space-y-2 py-0 px-5">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between lg:text-sm text-xs"
            >
              <span className="text-muted-foreground">{stat.label}</span>
              <span className="font-medium">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString()
                  : stat.value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground text-xs px-5">
          No holders data available
        </span>
      )}

      {/* Footer Button */}
      <div className="pb-5 mt-auto px-3">
        <Button
          variant="ghost"
          className="w-full justify-between group py-0"
          onClick={onButtonClick}
        >
          {buttonText}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
}
