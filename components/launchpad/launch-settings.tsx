"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Target,
  DollarSign,
  Calendar,
  ChevronDown,
  Clock,
  HelpCircle,
} from "lucide-react";

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
  const [launchImmediately, setLaunchImmediately] = useState(
    initialData?.launchImmediately ?? true
  );
  const [launchDate, setLaunchDate] = useState(initialData?.launchDate || "");
  const [launchTime, setLaunchTime] = useState(initialData?.launchTime || "");
  const [timezone] = useState(
    initialData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [initialPurchaseAmount, setInitialPurchaseAmount] = useState(
    initialData?.initialPurchaseAmount || ""
  );
  const [graduationThreshold] = useState(
    initialData?.graduationThreshold || 50000
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);

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
  ]);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Launch Settings</h1>
          <p className="text-muted-foreground">
            Configure when and how your chain will launch.
          </p>
        </div>

        {/* Graduation Threshold Section */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Target className="h-6 w-6 text-muted-foreground" />
            <h3 className="text-lg font-medium text-muted-foreground">
              Graduation Threshold
            </h3>
          </div>
          <p className="text-base">
            Your chain becomes real at:{" "}
            <span className="font-semibold">
              ${graduationThreshold.toLocaleString()}
            </span>
          </p>
        </div>

        {/* Initial Purchase Section */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="h-6 w-6 text-muted-foreground" />
            <h3 className="text-lg font-medium text-muted-foreground">
              Initial Purchase (Optional)
            </h3>
          </div>
          <div className="mb-6">
            <p className="text-base mb-1">
              Buy tokens to show confidence.{" "}
              <button className="text-pink-500 hover:text-pink-600 inline-flex items-center gap-1">
                <HelpCircle className="h-4 w-4" />
                Why should I buy?
              </button>
            </p>
          </div>

          <div className="border-2 rounded-lg p-6">
            <Label
              htmlFor="initialPurchaseAmount"
              className="text-base font-semibold mb-4 block"
            >
              Amount in CNPY
            </Label>
            <Input
              id="initialPurchaseAmount"
              type="number"
              placeholder="0000"
              value={initialPurchaseAmount}
              onChange={(e) => setInitialPurchaseAmount(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 p-0 text-base text-muted-foreground placeholder:text-muted-foreground/50"
            />
          </div>

          {initialPurchaseAmount && parseFloat(initialPurchaseAmount) > 0 && (
            <p className="text-base italic mt-4">
              You'll receive ~
              {Math.floor(
                parseFloat(initialPurchaseAmount) * 0.25
              ).toLocaleString()}{" "}
              {ticker}
            </p>
          )}
        </div>

        {/* Launch Schedule Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-6 w-6 text-muted-foreground" />
            <h3 className="text-lg font-medium text-muted-foreground">
              Launch Schedule
            </h3>
          </div>

          <div className="space-y-4">
            {/* Launch now checkbox */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="launchNow"
                checked={launchImmediately}
                onCheckedChange={(checked: boolean) =>
                  setLaunchImmediately(!!checked)
                }
              />
              <Label
                htmlFor="launchNow"
                className="text-base font-normal cursor-pointer"
              >
                Launch now
              </Label>
            </div>

            {/* Schedule for later checkbox */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="scheduleLater"
                checked={!launchImmediately}
                onCheckedChange={(checked: boolean) =>
                  setLaunchImmediately(!checked)
                }
              />
              <Label
                htmlFor="scheduleLater"
                className="text-base font-normal cursor-pointer"
              >
                Schedule for later
              </Label>
            </div>

            {/* Date and Time Pickers - shown when Schedule for later is checked */}
            {!launchImmediately && (
              <div className="flex gap-4 pt-4">
                {/* Date Picker */}
                <div className="flex flex-col gap-3 flex-1">
                  <Label
                    htmlFor="date-picker"
                    className="text-base font-normal"
                  >
                    Date
                  </Label>
                  <Popover
                    open={datePickerOpen}
                    onOpenChange={setDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date-picker"
                        className="w-full justify-between font-normal h-11"
                      >
                        {launchDate
                          ? new Date(launchDate).toLocaleDateString()
                          : "Select date"}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={launchDate ? new Date(launchDate) : undefined}
                        onSelect={(date: Date | undefined) => {
                          if (date) {
                            setLaunchDate(date.toISOString().split("T")[0]);
                            setDatePickerOpen(false);
                          }
                        }}
                        disabled={(date: Date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Picker */}
                <div className="flex flex-col gap-3 flex-1">
                  <Label
                    htmlFor="time-picker"
                    className="text-base font-normal"
                  >
                    Time
                  </Label>
                  <div className="relative">
                    <Input
                      type="time"
                      id="time-picker"
                      value={launchTime}
                      onChange={(e) => setLaunchTime(e.target.value)}
                      className="h-11"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
