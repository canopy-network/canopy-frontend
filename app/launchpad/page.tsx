"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useAuthStore } from "@/lib/stores/auth-store";
import { chainsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Template } from "@/types";
import { cn, WINDOW_BREAKPOINTS } from "@/lib/utils";

export default function LaunchpadPage() {
  // Initialize templates on mount
  useInitializeTemplates();

  // Hydration state to prevent SSR/client mismatch with persisted store
  const [isHydrated, setIsHydrated] = useState(false);

  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Redirect logged-in users on mobile to home
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      const checkMobile = () => {
        if (window.innerWidth < WINDOW_BREAKPOINTS.LG) {
          router.push("/");
        }
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, [isHydrated, isAuthenticated, router]);
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
  const handleLanguageSubmit = useCallback(
    (template: Template) => {
      setFormData({ template });
      setStepValidity((prev) => ({ ...prev, 1: true }));
    },
    [setFormData]
  );

  // Step 2: Connect Repo
  const handleRepoSubmit = useCallback(
    (data: {
      repo: string;
      validated: boolean;
      repoData: {
        name: string;
        fullName: string;
        htmlUrl: string;
        defaultBranch: string;
        owner: string;
        language?: string;
        description?: string | null;
        cloneUrl: string;
      } | null;
    }) => {
      setFormData({
        githubRepo: data.repo,
        githubValidated: data.validated,
        githubRepoData: data.repoData,
      });
      setStepValidity((prev) => ({ ...prev, 2: data.validated }));
    },
    [setFormData]
  );

  // Step 3: Main Info
  const handleMainInfoSubmit = useCallback(
    (
      data: {
        chainName: string;
        tokenName: string;
        ticker: string;
        tokenSupply: string;
        decimals: string;
        description: string;
        halvingDays: string;
        blockTime: string;
      },
      isValid: boolean
    ) => {
      setFormData(data);
      setStepValidity((prev) => ({ ...prev, 3: isValid }));
    },
    [setFormData]
  );

  // Step 4: Branding & Media
  const handleBrandingSubmit = useCallback(
    (
      data: {
        logo: File | null;
        chainDescription: string;
        gallery: File[];
        brandColor: string;
      },
      isValid: boolean
    ) => {
      setFormData(data);
      setStepValidity((prev) => ({ ...prev, 4: isValid }));
    },
    [setFormData]
  );

  // Step 5: Links & Documentation
  const handleLinksSubmit = useCallback(
    (
      data: {
        social: Array<{
          id: number;
          platform: string;
          url: string;
        }>;
        resources: Array<{
          id: number;
          type: "file" | "url";
          file?: File;
          name: string;
          size?: number;
          url?: string;
          title?: string;
          description?: string;
        }>;
      },
      isValid: boolean
    ) => {
      setFormData({
        socialLinks: data.social,
        resources: data.resources,
      });
      setStepValidity((prev) => ({ ...prev, 5: isValid }));
    },
    [setFormData]
  );

  // Step 6: Launch Settings
  const handleSettingsSubmit = useCallback(
    (
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
      setStepValidity((prev) => ({ ...prev, 6: isValid }));
    },
    [setFormData]
  );

  // Navigation handlers
  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, setCurrentStep]);

  const handleContinue = useCallback(() => {
    if (stepValidity[currentStep]) {
      markStepCompleted(currentStep);
      if (currentStep < 7) {
        setCurrentStep(currentStep + 1);
      }
    }
  }, [currentStep, stepValidity, markStepCompleted, setCurrentStep]);

  // Final submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Step 1: Create chain via API
      // Calculate halving_schedule: convert halvingDays to blocks between halvings
      const blockTimeSeconds = parseInt(formData.blockTime || "10", 10);
      const halvingDays = parseFloat(formData.halvingDays || "365");
      const secondsPerDay = 24 * 60 * 60;
      const blocksPerDay = secondsPerDay / blockTimeSeconds;
      const halvingSchedule = Math.floor(blocksPerDay * halvingDays);

      const chainData = {
        chain_name: formData.chainName,
        token_name: formData.tokenName,
        token_symbol: formData.ticker,
        chain_description: formData.chainDescription || formData.description,
        template_id: formData.template?.id || "",
        consensus_mechanism: formData.template?.default_consensus || "PoS",
        token_total_supply: Number(formData.tokenSupply),
        graduation_threshold: formData.graduationThreshold,
        creation_fee_cnpy: 100.0,
        initial_cnpy_reserve: 10000.0,
        initial_token_supply: Number(formData.tokenSupply),
        bonding_curve_slope: 0.00000001,
        validator_min_stake: 1000.0,
        creator_initial_purchase_cnpy: parseFloat(
          formData.initialPurchaseAmount || "0"
        ),
        brand_color: formData.brandColor,
        //TODO: Sending block time seconds trows an error.
        // block_time_seconds: blockTimeSeconds,
        halving_schedule: halvingSchedule,
        block_reward_amount: 50.0,
      };

      const response = await chainsApi.createChain(chainData);
      const chain = response.data;

      // Chain created successfully! Now proceed with additional operations

      // Step 1.5: Store chain data in DynamoDB
      try {
        await fetch("/api/chains/store", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticker: formData.ticker,
            chain_name: formData.chainName,
            token_name: formData.tokenName,
          }),
        });
      } catch (storeErr) {
        console.error("Error storing chain data in DynamoDB:", storeErr);
        // Don't fail the entire process if DynamoDB storage fails
      }

      // Step 2: Create repository data if GitHub repo is connected
      if (
        formData.githubRepo &&
        formData.githubValidated &&
        formData.githubRepoData
      ) {
        try {
          await chainsApi.createRepository(chain.id, {
            github_url: formData.githubRepoData.htmlUrl,
            repository_name: formData.githubRepoData.name,
            repository_owner: formData.githubRepoData.owner,
            default_branch: formData.githubRepoData.defaultBranch,
          });
        } catch (repoErr) {
          console.error("Error creating repository:", repoErr);
          // Don't fail the entire process if repo creation fails
        }
      }

      // Step 3: Upload media files and create asset records
      let logoUrl = "";
      const galleryUrls: { url: string; type: string; name: string }[] = [];

      // Upload logo if present
      if (formData.logo) {
        try {
          const { uploadLogo } = await import("@/lib/api/media");
          const logoResult = await uploadLogo(formData.ticker, formData.logo);
          if (logoResult.success && logoResult.urls && logoResult.urls[0]) {
            logoUrl = logoResult.urls[0].url;

            // Create logo asset record
            await chainsApi.createAsset(chain.id, {
              asset_type: "logo",
              file_name: formData.logo.name,
              file_url: logoUrl,
              file_size_bytes: formData.logo.size,
              mime_type: formData.logo.type,
              is_primary: true,
              is_featured: true,
            });
          }
        } catch (logoErr) {
          console.error("Error uploading/creating logo:", logoErr);
          // Don't fail the entire process if logo upload fails
        }
      }

      // Upload gallery items if present
      if (formData.gallery && formData.gallery.length > 0) {
        try {
          const { uploadGallery } = await import("@/lib/api/media");
          const galleryResult = await uploadGallery(
            formData.ticker,
            formData.gallery
          );
          if (galleryResult.success && galleryResult.urls) {
            galleryUrls.push(
              ...galleryResult.urls.map((result, index) => ({
                url: result.url,
                type: formData.gallery[index].type.startsWith("image/")
                  ? "banner"
                  : "video",
                name: result.originalName,
              }))
            );

            // Create gallery asset records
            for (let i = 0; i < galleryUrls.length; i++) {
              const galleryItem = galleryUrls[i];
              const file = formData.gallery[i];
              try {
                await chainsApi.createAsset(chain.id, {
                  asset_type: galleryItem.type as "banner" | "video",
                  file_name: galleryItem.name,
                  file_url: galleryItem.url,
                  file_size_bytes: file.size,
                  mime_type: file.type,
                  display_order: i,
                });
              } catch (assetErr) {
                console.error(`Error creating gallery asset ${i}:`, assetErr);
              }
            }
          }
        } catch (galleryErr) {
          console.error("Error uploading/creating gallery:", galleryErr);
          // Don't fail the entire process if gallery upload fails
        }
      }

      // Step 4: Create social links
      if (formData.socialLinks && formData.socialLinks.length > 0) {
        for (let i = 0; i < formData.socialLinks.length; i++) {
          const socialLink = formData.socialLinks[i];
          try {
            await chainsApi.createSocial(chain.id, {
              platform: socialLink.platform,
              url: socialLink.url,
              display_order: i,
            });
          } catch (socialErr) {
            console.error(
              `Error creating social link for ${socialLink.platform}:`,
              socialErr
            );
            // Don't fail the entire process if a social link creation fails
          }
        }
      }

      // Step 5: Handle resources (documentation, whitepapers, etc.)
      if (formData.resources && formData.resources.length > 0) {
        for (let i = 0; i < formData.resources.length; i++) {
          const resource = formData.resources[i];
          try {
            let resourceUrl = resource.url || "";

            // If it's a file resource, upload it first
            if (resource.type === "file" && resource.file) {
              const { uploadSingleFile } = await import("@/lib/api/media");
              const uploadResult = await uploadSingleFile(
                formData.ticker,
                "papers",
                resource.file
              );
              if (uploadResult.success && uploadResult.urls?.[0]) {
                resourceUrl = uploadResult.urls[0].url;
              }
            }

            // Create asset record for the resource
            if (resourceUrl) {
              await chainsApi.createAsset(chain.id, {
                asset_type: "documentation",
                file_name: resource.name,
                file_url: resourceUrl,
                file_size_bytes: resource.size || 0,
                mime_type: resource.file?.type || "application/octet-stream",
                display_order: i,
              });
            }
          } catch (resourceErr) {
            console.error(`Error creating resource ${i}:`, resourceErr);
            // Don't fail the entire process if resource creation fails
          }
        }
      }

      // Reset form and navigate to chain page with success flag
      resetFormData();
      router.push(
        `/chains/${chain.id}?success=true&name=${encodeURIComponent(
          chain.chain_name
        )}`
      );
    } catch (err: unknown) {
      console.error("Error creating chain:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to create chain. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, resetFormData, router]);

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
      {/* <div className="flex-1"> */}
      {/* Step 1: Select Template/Language */}
      {currentStep === 1 && (
        <SelectLanguage
          initialTemplate={formData.template}
          onDataSubmit={handleLanguageSubmit}
        />
      )}

      {/* Step 2: Connect Repository */}
      {currentStep === 2 && (
        <ConnectRepo
          initialRepo={formData.githubRepo}
          initialValidated={formData.githubValidated}
          initialRepoData={formData.githubRepoData}
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
            social: formData.socialLinks,
            resources: formData.resources,
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
      {/* </div> */}

      {/* Action Buttons */}
      <div className=" py-8 px-4 mb-24">
        <div className="max-w-4xl mx-auto">
          {submitError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              {submitError}
            </div>
          )}

          <div
            className={cn(
              "flex justify-between",
              currentStep === 7 && "flex-col-reverse justify-center gap-4"
            )}
          >
            {/* Back Button */}
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                size="lg"
                className={cn("gap-2", currentStep === 7 && "w-full")}
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
                className={cn("gap-2 ml-auto", currentStep === 7 && "w-full")}
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
