"use client";

import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";

interface ReviewPaymentProps {
  formData: {
    chainName: string;
    ticker: string;
    tokenSupply: string;
    template: { template_name: string } | null;
    graduationThreshold: number;
    initialPurchaseAmount: string;
    launchImmediately: boolean;
    launchDate: string;
    launchTime: string;
  };
}

export default function ReviewPayment({ formData }: ReviewPaymentProps) {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Review & Payment</h1>
          <p className="text-muted-foreground">
            Review your configuration and complete payment.
          </p>
        </div>

        {/* Chain Details Section */}
        <div>
          <h3 className="text-lg font-medium text-muted-foreground mb-6">
            Chain Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-baseline">
              <span className="text-base">Name:</span>
              <span className="ml-2 font-semibold">{formData.chainName}</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-base">Token:</span>
              <span className="ml-2 font-semibold">{formData.ticker}</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-base">Supply:</span>
              <span className="ml-2 font-semibold">
                {Number(formData.tokenSupply).toLocaleString()}{" "}
                {formData.ticker}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="text-base">Template:</span>
              <span className="ml-2 font-semibold">
                {formData.template?.template_name || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Launch Settings Section */}
        <div>
          <h3 className="text-lg font-medium text-muted-foreground mb-6">
            Launch Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-baseline">
              <span className="text-base">Graduation:</span>
              <span className="ml-2 font-semibold">
                ${formData.graduationThreshold.toLocaleString()} market cap
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="text-base">Initial Buy:</span>
              <span className="ml-2 font-semibold">
                {formData.initialPurchaseAmount || "0"} CNPY
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="text-base">Schedule:</span>
              <span className="ml-2 font-semibold">
                {formData.launchImmediately
                  ? "Launch now"
                  : formData.launchDate && formData.launchTime
                  ? `${new Date(formData.launchDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )} - ${formData.launchTime}`
                  : "Launch now"}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="border-2 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-medium text-muted-foreground">
            Payment Summary
          </h3>

          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-base">Creation Fee:</span>
              <span className="font-semibold">100 CNPY</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base">Initial Purchase:</span>
              <span className="font-semibold">
                {formData.initialPurchaseAmount || "0"} CNPY
              </span>
            </div>
            <Separator />
            <div className="flex items-baseline justify-between">
              <span className="text-base font-semibold">Total:</span>
              <span className="font-semibold">
                {100 + parseFloat(formData.initialPurchaseAmount || "0")} CNPY
                (~$
                {(
                  (100 + parseFloat(formData.initialPurchaseAmount || "0")) *
                  2
                ).toFixed(0)}
                )
              </span>
            </div>
          </div>

          {/* Important Notice */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Important</span>
            </div>
            <ul className="space-y-2 ml-7 list-disc">
              <li className="text-sm">Starts as virtual chain (test mode)</li>
              <li className="text-sm">Becomes real at $50k market cap</li>
              <li className="text-sm">Settings cannot be changed later</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
