"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

interface Step {
  title: string;
  description?: string;
}

interface LiquidityStepperProps {
  currentStep: number;
  steps: Step[];
  onStepClick?: (stepNumber: number) => void;
}

export function LiquidityStepper({
  currentStep,
  steps,
  onStepClick,
}: LiquidityStepperProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            const isLast = index === steps.length - 1;
            const isClickable = (isCompleted || isActive) && onStepClick;

            return (
              <div key={index} className="relative">
                <button
                  onClick={() => isClickable && onStepClick(stepNumber)}
                  disabled={!isClickable}
                  className={`flex items-start gap-3 w-full text-left ${
                    isClickable
                      ? "cursor-pointer hover:opacity-80"
                      : "cursor-default"
                  }`}
                >
                  {/* Step indicator */}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isActive
                          ? "border-primary text-primary"
                          : "border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{stepNumber}</span>
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pt-1">
                    <p
                      className={`text-sm font-medium ${
                        isActive || isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    )}
                  </div>
                </button>

                {/* Connecting line */}
                {!isLast && (
                  <div
                    className={`absolute left-4 w-0.5 h-6 -translate-x-1/2 ${
                      isCompleted ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
