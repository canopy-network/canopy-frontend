"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SelectLanguage from "@/components/launchpad/select-language";
import ConnectRepo from "@/components/launchpad/connect-repo";
import MainInfo from "@/components/launchpad/main-info";
import BrandingMedia from "@/components/launchpad/branding-media";
import LinksDocumentation from "@/components/launchpad/links-documentation";
import LaunchSettings from "@/components/launchpad/launch-settings";
import ReviewPayment from "@/components/launchpad/review-payment";
import { useInitializeTemplates } from "@/lib/stores/templates-store";
import { useCreateChainStore } from "@/lib/stores/create-chain-store";
import { chainsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Template } from "@/types";

export default function LaunchpadPage() {
  // Initialize templates on mount
  useInitializeTemplates();

  // Hydration state to prevent SSR/client mismatch with persisted store
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const router = useRouter();
  const {
    formData,
    setFormData,
    currentStep,
    setCurrentStep,
    markStepCompleted,
    resetFormData,
  } = useCreateChainStore();

  const [stepValidity, setStepValidity] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: true, // Review is always valid
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step 1: Language/Template Selection
  const handleLanguageSubmit = (template: Template) => {
    setFormData({ template });
    setStepValidity({ ...stepValidity, 1: true });
  };

  // Step 2: Connect Repo
  const handleRepoSubmit = (data: { repo: string; validated: boolean }) => {
    setFormData({
      githubRepo: data.repo,
      githubValidated: data.validated,
    });
    setStepValidity({ ...stepValidity, 2: data.validated });
  };

  // Step 3: Main Info
  const handleMainInfoSubmit = (
    data: {
      chainName: string;
      tokenName: string;
      ticker: string;
      tokenSupply: string;
      decimals: string;
      description: string;
    },
    isValid: boolean
  ) => {
    setFormData(data);
    setStepValidity({ ...stepValidity, 3: isValid });
  };

  // Step 4: Branding & Media
  const handleBrandingSubmit = (
    data: {
      logo: File | null;
      chainDescription: string;
      gallery: File[];
      brandColor: string;
    },
    isValid: boolean
  ) => {
    setFormData(data);
    setStepValidity({ ...stepValidity, 4: isValid });
  };

  // Step 5: Links & Documentation
  const handleLinksSubmit = (
    data: {
      website: string;
      whitepaper: string;
      whitepaperFile: File | null;
      twitterUrl: string;
      telegramUrl: string;
    },
    isValid: boolean
  ) => {
    setFormData(data);
    setStepValidity({ ...stepValidity, 5: isValid });
  };

  // Step 6: Launch Settings
  const handleSettingsSubmit = (
    data: {
      launchDate: string;
      launchTime: string;
      timezone: string;
      launchImmediately: boolean;
      initialPurchaseAmount: string;
      graduationThreshold: number;
    },
    isValid: boolean
  ) => {
    setFormData(data);
    setStepValidity({ ...stepValidity, 6: isValid });
  };

  // Navigation handlers
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinue = () => {
    if (stepValidity[currentStep]) {
      markStepCompleted(currentStep);
      if (currentStep < 7) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  // Final submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare chain data for API
      const chainData = {
        chain_name: formData.chainName,
        token_symbol: formData.ticker,
        chain_description: formData.chainDescription || formData.description,
        template_id: formData.template?.id || "",
        consensus_mechanism: formData.template?.default_consensus || "PoS",
        token_total_supply: Number(formData.tokenSupply),
        graduation_threshold: formData.graduationThreshold,
        creation_fee_cnpy: 100.0,
        initial_cnpy_reserve: 10000.0,
        initial_token_supply: Math.floor(Number(formData.tokenSupply) * 0.8),
        bonding_curve_slope: 0.00000001,
        validator_min_stake: 1000.0,
        creator_initial_purchase_cnpy: parseFloat(
          formData.initialPurchaseAmount || "0"
        ),
      };

      // Create chain via API
      const response = await chainsApi.createChain(chainData);
      const result = response.data;

      // Show success message
      alert(
        `Chain "${result.chain_name}" created successfully! (Status: ${result.status})`
      );

      // Reset form and navigate to chain page
      resetFormData();
      router.push(`/chain/${result.id}`);
    } catch (err: any) {
      console.error("Error creating chain:", err);
      setSubmitError(
        err?.message || "Failed to create chain. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while hydrating persisted data from localStorage
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {/* Step 1: Select Template/Language */}
        {currentStep === 1 && (
          <SelectLanguage onDataSubmit={handleLanguageSubmit} />
        )}

        {/* Step 2: Connect Repository */}
        {currentStep === 2 && (
          <ConnectRepo
            initialRepo={formData.githubRepo}
            initialValidated={formData.githubValidated}
            templateName={formData.template?.template_name || "Python"}
            templateLanguage={formData.template?.supported_language || "Python"}
            onDataSubmit={handleRepoSubmit}
          />
        )}

        {/* Step 3: Main Info */}
        {currentStep === 3 && (
          <MainInfo
            initialData={{
              chainName: formData.chainName,
              tokenName: formData.tokenName,
              ticker: formData.ticker,
              tokenSupply: formData.tokenSupply,
              decimals: formData.decimals,
              description: formData.description,
            }}
            onDataSubmit={handleMainInfoSubmit}
          />
        )}

        {/* Step 4: Branding & Media */}
        {currentStep === 4 && (
          <BrandingMedia
            initialData={{
              logo: formData.logo,
              chainDescription: formData.chainDescription,
              gallery: formData.gallery,
              brandColor: formData.brandColor,
            }}
            onDataSubmit={handleBrandingSubmit}
          />
        )}

        {/* Step 5: Links & Documentation */}
        {currentStep === 5 && (
          <LinksDocumentation
            initialData={{
              website: formData.website,
              whitepaper: formData.whitepaper,
              whitepaperFile: formData.whitepaperFile,
              twitterUrl: formData.twitterUrl,
              telegramUrl: formData.telegramUrl,
            }}
            onDataSubmit={handleLinksSubmit}
          />
        )}

        {/* Step 6: Launch Settings */}
        {currentStep === 6 && (
          <LaunchSettings
            initialData={{
              launchDate: formData.launchDate,
              launchTime: formData.launchTime,
              timezone: formData.timezone,
              launchImmediately: formData.launchImmediately,
              initialPurchaseAmount: formData.initialPurchaseAmount,
              graduationThreshold: formData.graduationThreshold,
            }}
            ticker={formData.ticker}
            onDataSubmit={handleSettingsSubmit}
          />
        )}

        {/* Step 7: Review & Payment */}
        {currentStep === 7 && <ReviewPayment formData={formData} />}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-border p-6">
        <div className="max-w-4xl mx-auto">
          {submitError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              {submitError}
            </div>
          )}

          <div className="flex justify-between">
            {/* Back Button */}
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                size="lg"
                className="gap-2"
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}

            {/* Continue/Submit Button */}
            {currentStep < 7 ? (
              <Button
                onClick={handleContinue}
                disabled={!stepValidity[currentStep]}
                className="gap-2 ml-auto"
                size="lg"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                size="lg"
                className="gap-2 ml-auto"
              >
                {isSubmitting ? "Processing..." : "Connect Wallet & Pay"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
