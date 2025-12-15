"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Check, Loader2 } from "lucide-react";
import type { BridgeToken } from "@/types/trading";

// CNPY Logo SVG Component
function CnpyLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 18 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.7649 0.880227C12.658 0.827134 12.5342 0.905351 12.5342 1.02378V3.04351C12.5342 3.18794 12.7104 3.26027 12.8135 3.15814L14.069 1.91394C14.1383 1.84534 14.1317 1.73215 14.0535 1.67368C13.6439 1.36708 13.2123 1.10259 12.7649 0.880227Z"
        fill="currentColor"
      />
      <path
        d="M10.4705 0.127791C10.5477 0.141319 10.6032 0.208239 10.6032 0.285896V5.28157C10.6032 5.32456 10.586 5.36579 10.5553 5.3962L8.90769 7.02887C8.80463 7.13099 8.62842 7.05867 8.62842 6.91423V0.163239C8.62842 0.0764816 8.69735 0.00493239 8.78487 0.00272091C9.34863 -0.0115243 9.91358 0.0301658 10.4705 0.127791Z"
        fill="currentColor"
      />
      <path
        d="M6.64953 9.26628C6.68021 9.23588 6.69744 9.19464 6.69744 9.15164V0.531669C6.69744 0.424066 6.59358 0.346317 6.48993 0.37839C5.89636 0.562066 5.31929 0.812546 4.77074 1.12983C4.72107 1.15856 4.69092 1.21149 4.69092 1.26849V10.8158C4.69092 10.9602 4.86713 11.0325 4.97019 10.9304L6.64953 9.26628Z"
        fill="currentColor"
      />
      <path
        d="M2.4827 3.0726C2.57734 2.95748 2.75983 3.02558 2.75983 3.17407L2.75984 13.0535C2.75984 13.0965 2.7426 13.1377 2.71192 13.1681L2.53426 13.3441C2.46504 13.4128 2.35058 13.4059 2.29159 13.3285C-0.0224758 10.292 0.0412298 6.04232 2.4827 3.0726Z"
        fill="currentColor"
      />
      <path
        d="M10.3924 8.65513C10.2467 8.65513 10.1737 8.48052 10.2768 8.37839L11.9244 6.74572C11.9551 6.71532 11.9966 6.69824 12.04 6.69824H17.1031C17.1812 6.69824 17.2486 6.75292 17.2625 6.82908C17.3635 7.38074 17.408 7.94056 17.396 8.49942C17.3942 8.58642 17.3219 8.65513 17.234 8.65513H10.3924Z"
        fill="currentColor"
      />
      <path
        d="M14.1825 4.50709C14.0795 4.60922 14.1525 4.78383 14.2982 4.78383H16.3466C16.4664 4.78383 16.5454 4.66045 16.4911 4.55456C16.2638 4.11067 15.9935 3.68279 15.6806 3.27689C15.6215 3.20007 15.5077 3.19389 15.4388 3.26223L14.1825 4.50709Z"
        fill="currentColor"
      />
      <path
        d="M8.13428 10.5684C8.09089 10.5684 8.04928 10.5854 8.0186 10.6158L6.33926 12.28C6.2362 12.3821 6.30919 12.5567 6.45493 12.5567H16.1382C16.196 12.5567 16.2496 12.5265 16.2784 12.4769C16.5952 11.933 16.8447 11.3612 17.027 10.7733C17.0588 10.6707 16.9803 10.5684 16.8721 10.5684H8.13428Z"
        fill="currentColor"
      />
      <path
        d="M3.91045 14.9412C3.83293 14.8825 3.82636 14.7696 3.89534 14.7013L4.08101 14.5173C4.11169 14.4868 4.1533 14.4697 4.19669 14.4697H14.2374C14.3867 14.4697 14.4559 14.6496 14.3406 14.7438C11.33 17.208 6.99201 17.2737 3.91045 14.9412Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Step indicator component
interface StepIndicatorProps {
  step: number;
  currentStep: number;
  label: string;
  sublabel: string;
}

function StepIndicator({
  step,
  currentStep,
  label,
  sublabel,
}: StepIndicatorProps) {
  const isCompleted = currentStep > step;
  const isCurrent = currentStep === step;
  const isPending = currentStep < step;

  return (
    <div className="flex items-start gap-3">
      {/* Step circle with line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isCompleted
              ? "bg-green-500 text-white scale-100"
              : isCurrent
              ? "bg-primary text-primary-foreground animate-pulse"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isCompleted ? (
            <Check className="w-4 h-4 animate-in zoom-in-50 duration-200" />
          ) : isCurrent ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="text-sm font-medium">{step}</span>
          )}
        </div>
        {/* Connecting line (not for last step) */}
        {step < 4 && (
          <div
            className={`w-0.5 h-8 transition-all duration-500 ${
              isCompleted ? "bg-green-500" : "bg-muted"
            }`}
          />
        )}
      </div>

      {/* Step text */}
      <div className="pt-1">
        <p
          className={`text-sm font-medium transition-colors duration-300 ${
            isCompleted
              ? "text-green-500"
              : isCurrent
              ? "text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {label}
        </p>
        {sublabel && (
          <p
            className={`text-xs transition-colors duration-300 ${
              isCurrent ? "text-muted-foreground" : "text-muted-foreground/60"
            }`}
          >
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}

type ConversionPair = "USDC-CNPY" | "CNPY-USDC";
interface ConvertTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  sourceToken?: BridgeToken | null;
  cnpyReceived?: number;
  totalCost?: number;
  totalSavings?: number;
  ordersMatched?: number;
  conversionPair?: ConversionPair;
}

export default function ConvertTransactionDialog({
  open,
  onClose,
  sourceToken,
  cnpyReceived = 0,
  totalCost = 0,
  totalSavings = 0,
  ordersMatched = 0,
  conversionPair,
}: ConvertTransactionDialogProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Step timing configuration (realistic 5-8 seconds total)
  const stepDurations: Record<number, number> = {
    1: 2000, // Submitting
    2: 2000, // Matching Orders
    3: 2000, // Confirming
  };

  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      setCurrentStep(1);
      setShowSuccess(false);
    } else {
      setIsAnimating(false);
    }
  }, [open]);

  // Progress through steps
  useEffect(() => {
    if (!open || showSuccess) return;

    if (currentStep <= 3) {
      const timer = setTimeout(() => {
        if (currentStep === 3) {
          setShowSuccess(true);
          setCurrentStep(4);
        } else {
          setCurrentStep((prev) => prev + 1);
        }
      }, stepDurations[currentStep]);

      return () => clearTimeout(timer);
    }
  }, [open, currentStep, showSuccess]);

  const getStepSublabel = (step: number): string => {
    switch (step) {
      case 1:
        return currentStep === 1
          ? "Initiating transaction..."
          : "Transaction submitted";
      case 2:
        return currentStep === 2
          ? `Finding ${ordersMatched} best orders...`
          : currentStep > 2
          ? `${ordersMatched} orders matched`
          : "Waiting...";
      case 3:
        return currentStep === 3
          ? "Confirming on chain..."
          : currentStep > 3
          ? "Confirmed"
          : "Waiting...";
      default:
        return "";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/80 z-10 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={showSuccess ? onClose : undefined}
      />

      {/* Dialog Content */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-background rounded-t-2xl max-h-[95vh] transition-transform duration-300 ease-out ${
          isAnimating ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-6 pt-8 pb-6">
          {!showSuccess ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold mb-1">Converting to CNPY</h2>
                <p className="text-sm text-muted-foreground">
                  ${totalCost.toFixed(2)} → {cnpyReceived.toLocaleString()} CNPY
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-0 mb-8">
                <StepIndicator
                  step={1}
                  currentStep={currentStep}
                  label="Submitting"
                  sublabel={getStepSublabel(1)}
                />
                <StepIndicator
                  step={2}
                  currentStep={currentStep}
                  label="Matching Orders"
                  sublabel={getStepSublabel(2)}
                />
                <StepIndicator
                  step={3}
                  currentStep={currentStep}
                  label="Confirming"
                  sublabel={getStepSublabel(3)}
                />
              </div>

              {/* Info text */}
              <p className="text-sm text-muted-foreground text-center mb-6">
                You can close this dialog. Your transaction will continue in the
                background.
              </p>

              {/* Close Button */}
              <Button
                variant="secondary"
                className="w-full h-11 text-base"
                size="lg"
                onClick={onClose}
              >
                Close
              </Button>
            </>
          ) : (
            <>
              {/* Success State */}
              {/* Token Exchange Icons */}
              <div className="flex items-center justify-center gap-3 mb-4">
                {/* Source Token */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 animate-in zoom-in-50 duration-300"
                  style={{ backgroundColor: sourceToken?.color || "#2563eb" }}
                >
                  <span className="text-lg font-bold text-white">
                    {sourceToken?.symbol === "USDC" ? "$" : "T"}
                  </span>
                </div>

                {/* Arrow Dots */}
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/40 animate-in fade-in duration-300 delay-100" />
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/40 animate-in fade-in duration-300 delay-150" />
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/40 animate-in fade-in duration-300 delay-200" />
                </div>

                {/* CNPY Token */}
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shrink-0 animate-in zoom-in-50 duration-300 delay-100">
                  <CnpyLogo className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Success Message */}
              <h2 className="text-xl font-bold text-center mb-1 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150">
                Converted to{" "}
                <span className="text-green-500">
                  {cnpyReceived.toLocaleString()} CNPY
                </span>
              </h2>

              {/* Transaction Details */}
              <p className="text-sm text-muted-foreground text-center mb-4 animate-in fade-in duration-300 delay-200">
                ${totalCost.toFixed(2)} {sourceToken?.symbol || "USDC"} →{" "}
                {cnpyReceived.toLocaleString()} CNPY
              </p>

              {/* Stats */}
              <div className="space-y-2 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-250">
                <div className="flex items-center justify-between py-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    Orders Matched
                  </span>
                  <span className="text-sm font-semibold">{ordersMatched}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">
                      Bonus Earned
                    </span>
                    <span className="text-sm font-semibold text-green-500">
                      +${totalSavings.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">
                    Network Fee
                  </span>
                  <span className="text-sm font-semibold">$0.12</span>
                </div>
              </div>

              {/* Done Button */}
              <Button
                className="w-full h-11 text-base mb-3 bg-linear-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
                size="lg"
                onClick={onClose}
              >
                Done
              </Button>

              {/* View Transaction Button */}
              <Button
                variant="secondary"
                className="w-full h-11 text-base"
                size="lg"
                onClick={onClose}
              >
                View transaction
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
