"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Layers } from "lucide-react";

interface Committee {
  chain_id: number;
  chain_name?: string;
}

interface CommitteeBadgesProps {
  committees: Committee[];
  maxVisible?: number;
  variant?: "compact" | "detailed";
  showLabel?: boolean;
}

// Get color for chain based on chain ID
function getChainColor(chainId: number): string {
  const colors = [
    "#FFD700", // gold for main chain (1)
    "#F97316", // orange
    "#10B981", // green
    "#EC4899", // pink
    "#3B82F6", // blue
    "#EAB308", // yellow
    "#6366F1", // indigo
    "#EF4444", // red
  ];

  // Main chain gets gold
  if (chainId === 1) return colors[0];

  return colors[chainId % colors.length];
}

function isMainChain(chainId: number): boolean {
  return chainId === 1;
}

export function CommitteeBadges({
  committees = [],
  maxVisible = 3,
  variant = "compact",
  showLabel = true,
}: CommitteeBadgesProps) {
  if (!committees || committees.length === 0) {
    return null;
  }

  const visibleCommittees = committees.slice(0, maxVisible);
  const remainingCount = Math.max(0, committees.length - maxVisible);
  const hasMultipleChains = committees.length > 1;

  // Compact variant for table rows
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5">
        {showLabel && (
          <Layers className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        )}
        <div className="flex items-center gap-1">
          {visibleCommittees.map((committee) => (
            <Tooltip key={committee.chain_id}>
              <TooltipTrigger asChild>
                <div
                  className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 cursor-help"
                  style={{ backgroundColor: getChainColor(committee.chain_id) }}
                >
                  <span className="text-[10px] font-bold text-white">
                    {committee.chain_id}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">
                  {committee.chain_name || `Chain ${committee.chain_id}`}
                </p>
                {isMainChain(committee.chain_id) && (
                  <p className="text-xs text-muted-foreground">Main Chain (CNPY)</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}

          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-6 h-6 rounded flex items-center justify-center bg-muted cursor-help">
                  <span className="text-[10px] font-medium">
                    +{remainingCount}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">
                  {remainingCount} more chain{remainingCount !== 1 ? "s" : ""}
                </p>
                <div className="mt-1 space-y-0.5">
                  {committees.slice(maxVisible).map((committee) => (
                    <p key={committee.chain_id} className="text-xs">
                      • {committee.chain_name || `Chain ${committee.chain_id}`}
                    </p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {hasMultipleChains && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {committees.length} chain{committees.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    );
  }

  // Detailed variant for expanded views
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Layers className="w-4 h-4" />
        <span>Validating For:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {committees.map((committee) => (
          <Badge
            key={committee.chain_id}
            variant="secondary"
            className="gap-2 py-1.5"
            style={{
              borderLeft: `3px solid ${getChainColor(committee.chain_id)}`,
            }}
          >
            <div
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: getChainColor(committee.chain_id) }}
            >
              <span className="text-[10px] font-bold text-white">
                {committee.chain_id}
              </span>
            </div>
            <span className="font-medium">
              {committee.chain_name || `Chain ${committee.chain_id}`}
            </span>
            {isMainChain(committee.chain_id) && (
              <span className="text-xs opacity-70">(Main)</span>
            )}
          </Badge>
        ))}
      </div>

      {hasMultipleChains && (
        <p className="text-xs text-muted-foreground">
          This stake earns rewards from {committees.length} chain
          {committees.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

// Simplified version that just shows count
export function CommitteeCount({ committees }: { committees: Committee[] }) {
  if (!committees || committees.length === 0) {
    return <span className="text-xs text-muted-foreground">No chains</span>;
  }

  const mainChainOnly = committees.length === 1 && isMainChain(committees[0].chain_id);

  return (
    <div className="text-xs text-muted-foreground">
      {mainChainOnly ? (
        "Main chain only"
      ) : (
        <span className="font-medium">
          {committees.length} chain{committees.length !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}