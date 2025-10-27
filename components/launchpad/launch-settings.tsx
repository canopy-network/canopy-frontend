"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, DollarSign, HelpCircle } from "lucide-react";

interface LaunchSettingsProps {
  initialData?: {
    launchDate?: string;
    launchTime?: string;
    timezone?: string;
    launchImmediately?: boolean;
    initialPurchaseAmount?: string;
    graduationThreshold?: number;
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
    },
    isValid: boolean
  ) => void;
}

export default function LaunchSettings({
  initialData,
  ticker = "tokens",
  onDataSubmit,
}: LaunchSettingsProps) {
  const [launchImmediately] = useState(initialData?.launchImmediately ?? true);
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
      const isValid = Boolean(launchImmediately || (launchDate && launchTime));
      onDataSubmit(
        {
          launchDate,
          launchTime,
          timezone,
          launchImmediately,
          initialPurchaseAmount,
          graduationThreshold,
        },
        isValid
      );
    }
  }, [
    launchDate,
    launchTime,
    timezone,
    launchImmediately,
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
            Configure your chain's launch parameters
          </p>
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
                You'll receive{" "}
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
