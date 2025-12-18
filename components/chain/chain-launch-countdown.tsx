"use client";

import { useEffect, useState } from "react";
import { Clock, CircleAlert, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ChainLaunchCountdownProps {
  publicationDate?: string;
  chainId: string;
}

export function ChainLaunchCountdown({
  publicationDate,
  chainId,
}: ChainLaunchCountdownProps) {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    // Check if publicationDate is valid
    if (
      !publicationDate ||
      publicationDate === "null" ||
      publicationDate === "undefined"
    ) {
      setTimeRemaining(0);
      toast.error("No scheduled launch time set", {
        duration: 4000,
      });
      return;
    }

    const launchTime = new Date(publicationDate).getTime();

    // Check if date is valid
    if (isNaN(launchTime)) {
      setTimeRemaining(0);
      toast.error("Invalid launch time format", {
        duration: 4000,
      });
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((launchTime - now) / 1000));
      return diff;
    };

    // Set initial time
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      // If countdown reaches 0, refresh the page to show updated chain status
      if (remaining === 0) {
        setTimeout(() => {
          router.refresh();
        }, 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [publicationDate, router]);

  // Calculate progress for the circular countdown (assuming max 20 seconds)
  const maxSeconds = 20;
  const progress = Math.min(timeRemaining / maxSeconds, 1);
  const circumference = 2 * Math.PI * 56; // radius is 56
  const strokeDashoffset = circumference * (1 - progress);

  const handleEdit = () => {
    router.push(`/launchpad/${chainId}`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border text-card-foreground shadow p-6 sticky top-6 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/50">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold">Review Period</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              You have {timeRemaining}s to review and edit your chain before it
              launches
            </p>
          </div>

          {/* Circular Countdown */}
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="text-orange-500 transition-all duration-1000 ease-linear"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground mb-1">
                  publish on
                </span>
                <span className="text-3xl font-bold text-orange-500">
                  {timeRemaining}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Card */}
          <div className="rounded-xl border text-card-foreground shadow p-4 bg-background/50 border-orange-500/20">
            <div className="flex gap-3">
              <CircleAlert className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Last chance to edit</p>
                <p className="text-xs text-muted-foreground">
                  Once the countdown ends, your chain will be launched and
                  settings cannot be changed.
                </p>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div>
            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 w-full gap-2"
            >
              <SquarePen className="w-4 h-4" />
              Edit Chain Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
