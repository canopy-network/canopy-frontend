"use client";

import { useState, use } from "react";
import { AddLiquidityForm } from "@/components/amm/add-liquidity-form";
import { AddLiquidityStepTwo } from "@/components/amm/add-liquidity-step-two";
import { LiquidityStepper } from "@/components/amm/components/shared/liquidity-stepper";
import { ADD_LIQUIDITY_STEPS } from "@/components/amm/constants/add-liquidity";

interface AddLiquidityPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AddLiquidityPage({ params }: AddLiquidityPageProps) {
  const { id } = use(params);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string>("");

  const handleContinueToStepTwo = (tokenSymbol: string) => {
    setSelectedTokenSymbol(tokenSymbol);
    setCurrentStep(2);
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add Liquidity</h1>
      </div>
      <div className="max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <div>
            <LiquidityStepper
              currentStep={currentStep}
              steps={ADD_LIQUIDITY_STEPS}
              onStepClick={handleStepClick}
            />
          </div>
          <div>
            {currentStep === 1 && (
              <AddLiquidityForm poolId={id} onContinue={handleContinueToStepTwo} />
            )}
            {currentStep === 2 && (
              <AddLiquidityStepTwo poolId={id} selectedTokenSymbol={selectedTokenSymbol} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
