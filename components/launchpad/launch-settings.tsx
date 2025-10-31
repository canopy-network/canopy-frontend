"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, DollarSign, HelpCircle, Clock } from "lucide-react";

interface LaunchSettingsProps {
  initialData?: {
    launchDate?: string;
    launchTime?: string;
    timezone?: string;
    launchImmediately?: boolean;
    initialPurchaseAmount?: string;
    graduationThreshold?: number;
    scheduled_launch_time?: string;
  };
  ticker?: string;
  onDataSubmit?: (
    data: {
      launchDate: string;
      launchTime: string;
      timezone: string;
      launchImmediately: boolean;
      initialPurchaseAmount: string;
      graduationThreshold: number;
      scheduled_launch_time?: string;
    },
    isValid: boolean
  ) => void;
}

export default function LaunchSettings({
  initialData,
  ticker = "tokens",
  onDataSubmit,
}: LaunchSettingsProps) {
  const [launchImmediately, setLaunchImmediately] = useState(
    initialData?.launchImmediately ?? true
  );
  const [scheduledDate, setScheduledDate] = useState(
    initialData?.launchDate || ""
  );
  const [scheduledTime, setScheduledTime] = useState(
    initialData?.launchTime || ""
  );
  const [launchDate] = useState(initialData?.launchDate || "");
  const [launchTime] = useState(initialData?.launchTime || "");
  const [timezone] = useState(
    initialData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [initialPurchaseAmount, setInitialPurchaseAmount] = useState(
    initialData?.initialPurchaseAmount || ""
  );
  const [graduationThreshold] = useState(
    initialData?.graduationThreshold || 50000
  );

  // Notify parent when data changes
  useEffect(() => {
    if (onDataSubmit) {
      const isValid = Boolean(
        launchImmediately || (scheduledDate && scheduledTime)
      );

      // Calculate scheduled_launch_time if scheduled launch is selected
      let scheduled_launch_time: string | undefined = undefined;
      if (!launchImmediately && scheduledDate && scheduledTime) {
        // Combine date and time into ISO format
        scheduled_launch_time = new Date(
          `${scheduledDate}T${scheduledTime}`
        ).toISOString();
      }

      onDataSubmit(
        {
          launchDate,
          launchTime,
          timezone,
          launchImmediately,
          initialPurchaseAmount,
          graduationThreshold,
          scheduled_launch_time,
        },
        isValid
      );
    }
  }, [
    launchDate,
    launchTime,
    timezone,
    launchImmediately,
    scheduledDate,
    scheduledTime,
    initialPurchaseAmount,
    graduationThreshold,
    onDataSubmit,
  ]);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Launch settings</h1>
          <p className="text-muted-foreground">
            Configure your chain&apos;s launch parameters
          </p>
        </div>

        {/* Launch Time Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Launch Time</h2>
          </div>

          <div className="space-y-4">
            {/* Launch Now Option */}
            <div
              className={`rounded-lg p-4 border-2 cursor-pointer transition-colors ${
                launchImmediately
                  ? "border-primary bg-primary/10"
                  : "border-muted bg-muted/30 hover:border-muted-foreground/30"
              }`}
              onClick={() => setLaunchImmediately(true)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    launchImmediately
                      ? "border-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {launchImmediately && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">Launch now</h3>
                  <p className="text-sm text-muted-foreground">
                    Your chain will be available immediately after payment
                  </p>
                </div>
              </div>
            </div>

            {/* Launch at Scheduled Time Option */}
            <div
              className={`rounded-lg p-4 border-2 cursor-pointer transition-colors ${
                !launchImmediately
                  ? "border-primary bg-primary/10"
                  : "border-muted bg-muted/30 hover:border-muted-foreground/30"
              }`}
              onClick={() => setLaunchImmediately(false)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    !launchImmediately
                      ? "border-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {!launchImmediately && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Launch at a scheduled time</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a specific date and time for your launch
                  </p>
                </div>
              </div>

              {/* Date and Time Inputs - Only show when scheduled is selected */}
              {!launchImmediately && (
                <div className="mt-4 space-y-4 pl-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="scheduledDate"
                        className="text-sm font-medium"
                      >
                        Launch Date
                      </Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="scheduledTime"
                        className="text-sm font-medium"
                      >
                        Launch Time
                      </Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>
                  </div>

                  {scheduledDate && scheduledTime && (
                    <p className="text-sm text-muted-foreground italic">
                      Your chain will launch on{" "}
                      <span className="font-semibold text-foreground">
                        {new Date(
                          `${scheduledDate}T${scheduledTime}`
                        ).toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Graduation Threshold Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Graduation Threshold</h2>
          </div>

          <div className="bg-muted/30 rounded-lg p-6 space-y-4">
            <p className="text-lg">
              Your chain becomes real at:{" "}
              <span className="font-bold">
                ${graduationThreshold.toLocaleString()}
              </span>
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Your chain starts as a{" "}
                <span className="font-semibold text-foreground">
                  virtual chain
                </span>{" "}
                — a lightweight environment where users can buy and trade your
                tokens without the full blockchain infrastructure running yet.
              </p>
              <p>
                Once total purchases reach{" "}
                <span className="font-semibold text-foreground">
                  ${graduationThreshold.toLocaleString()}
                </span>
                , your chain{" "}
                <span className="font-semibold text-foreground">graduates</span>
                . At this point, we deploy your repository and launch the full
                blockchain network, making it a real, operational chain on the
                Canopy ecosystem.
              </p>
            </div>
          </div>
        </div>

        {/* Initial Purchase Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Initial Purchase</h2>
            <span className="px-2.5 py-0.5 rounded-md bg-muted text-xs font-medium">
              Optional
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-sm">
              Buy tokens to show confidence.{" "}
              <button className="inline-flex items-center gap-1 text-sm hover:underline">
                <HelpCircle className="h-3.5 w-3.5" />
                Why should I buy?
              </button>
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="initialPurchaseAmount"
                  className="text-sm font-medium"
                >
                  Amount in CNPY
                </Label>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </div>

              <Input
                id="initialPurchaseAmount"
                type="number"
                placeholder="0000"
                value={initialPurchaseAmount}
                onChange={(e) => setInitialPurchaseAmount(e.target.value)}
              />
            </div>

            {initialPurchaseAmount && parseFloat(initialPurchaseAmount) > 0 && (
              <p className="text-sm text-muted-foreground italic">
                You&apos;ll receive{" "}
                <span className="font-bold text-white">
                  {Math.floor(
                    parseFloat(initialPurchaseAmount) * 0.25
                  ).toLocaleString()}{" "}
                  ${ticker}
                </span>
                &nbsp; tokens (1:1 ratio)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
