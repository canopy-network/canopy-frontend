import {
  Check,
  Code2,
  GitBranch,
  Settings,
  Palette,
  Link2,
  Rocket,
  FileCheck,
  CloudUpload,
  CheckCircle2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Language", icon: Code2 },
  { id: 2, label: "Connect Repo", icon: GitBranch },
  { id: 3, label: "Main Info", icon: Settings },
  { id: 4, label: "Branding & Media", icon: Palette },
  { id: 5, label: "Links & Documentation", icon: Link2 },
  { id: 6, label: "Launch Settings", icon: Rocket },
  { id: 7, label: "Review & Payment", icon: FileCheck },
];

interface LaunchpadSidebarProps {
  currentStep?: number;
  completedSteps?: number[];
  isSaving?: boolean;
  lastSaved?: string | null;
  repoConnected?: boolean;
}

export default function LaunchpadSidebar({
  currentStep = 1,
  completedSteps = [],
  isSaving = false,
  lastSaved = null,
  repoConnected = false,
}: LaunchpadSidebarProps) {
  const progressPercentage = (completedSteps.length / steps.length) * 100;

  // Show auto-save indicator ONLY after repo is actually connected
  const showAutoSave = repoConnected;

  return (
    <aside className="w-[280px] border-r border-zinc-800 bg-card flex flex-col p-6 pt-5.5 overflow-y-auto flex-shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Progress Section */}
      <div className="space-y-3 mb-6">
        <h3 className="text-lg font-semibold">Progress</h3>
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-sm text-muted-foreground">
          {Math.round(progressPercentage)}% complete. Keep it up.
        </p>
      </div>

      {/* Auto-save Indicator - Only shows when repo is connected */}
      {showAutoSave && (
        <div className="mb-6 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            {isSaving ? (
              <>
                <CloudUpload className="w-3.5 h-3.5 text-muted-foreground animate-pulse" />
                <span className="text-xs text-muted-foreground">
                  Saving changes...
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs text-muted-foreground">
                  {lastSaved ? `Saved ${lastSaved}` : "All changes saved"}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3 flex-1">
        <h4 className="text-sm font-medium text-muted-foreground mb-4">
          Launch Steps
        </h4>

        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = completedSteps.includes(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg transition-colors",
                isActive && "bg-primary/10",
                !isActive && !isCompleted && "opacity-50"
              )}
            >
              {/* Icon/Status */}
              <div
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0",
                  isCompleted && "bg-green-500/20",
                  isActive && !isCompleted && "bg-primary/20",
                  !isActive && !isCompleted && "bg-muted"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-sm font-medium",
                  isActive && "text-foreground",
                  isCompleted && !isActive && "text-foreground",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
