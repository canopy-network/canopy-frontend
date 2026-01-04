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
import { chainsApi, storeChainListing } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Loader2, Lock, Zap } from "lucide-react";
import { Template, Chain } from "@/types";
import { cn, WINDOW_BREAKPOINTS } from "@/lib/utils";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { useWallet } from "@/components/wallet/wallet-provider";
import { useBlocksStore } from "@/lib/stores/blocks-store";

/** Submit step tracking for the payment flow */
type SubmitStep =
  | "idle"
  | "creating" // POST /api/v1/chains
  | "paying" // Sending transaction
  | "activating" // PATCH with tx_hash (with retry)
  | "uploading" // Media, socials, resources
  | "success"
  | "error";

// Default values for dev populate feature (steps 2-5 only)
const DEV_DEFAULTS = {
  // Step 2: GitHub (skip validation)
  githubRepo: null as string | null,
  githubValidated: true,
  githubRepoData: null,

  // Step 3: Main Info
  chainName: "DevTestChain",
  tokenName: "DevToken",
  ticker: "DEV",
  decimals: "18",
  description: "Development test chain for quick testing",
  halvingDays: "365",
  blockTime: "10",

  // Step 4: Branding
  chainDescription: "A development test chain for quick testing of the launchpad flow",
  brandColor: "#6366F1",
  logo: null as File | null,
  gallery: [] as File[],

  // Step 5: Links
  socialLinks: [{ id: 1, platform: "twitter", url: "https://x.com/devtest" }],
  resources: [] as Array<{ id: number; type: "file" | "url"; name: string; url?: string }>,
};

export default function LaunchpadPage() {
  // Initialize templates on mount
  useInitializeTemplates();

  // Dev mode check for populate button
  const isDev = process.env.NODE_ENV === "development";

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

  // TODO: Steps temporarily set to true to bypass validation for testing
  const [stepValidity, setStepValidity] = useState<Record<number, boolean>>({
    1: false,
    2: true, // TEMP: Bypass GitHub validation
    3: false,
    4: true, // TEMP: Bypass branding validation
    5: false,
    6: false,
    7: true, // Review is always valid
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [populateCount, setPopulateCount] = useState(0);

  // Payment flow state
  const [submitStep, setSubmitStep] = useState<SubmitStep>("idle");
  const [createdChain, setCreatedChain] = useState<Chain | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Wallet state
  const { currentWallet, sendTransaction } = useWalletStore();
  const { setShowSelectDialog } = useWallet();
  const isWalletUnlocked = currentWallet?.isUnlocked ?? false;

  // Block time tracking for activation step
  const getEstimatedTimeToNextBlock = useBlocksStore(
    (state) => state.getEstimatedTimeToNextBlock
  );
  const [secondsToNextBlock, setSecondsToNextBlock] = useState<number | null>(
    null
  );

  // Update countdown during activation step
  useEffect(() => {
    if (submitStep !== "activating") {
      setSecondsToNextBlock(null);
      return;
    }

    const updateCountdown = () => {
      const estimate = getEstimatedTimeToNextBlock(1);
      setSecondsToNextBlock(estimate !== null ? Math.round(estimate) : null);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [submitStep, getEstimatedTimeToNextBlock]);

  // Handle unlock wallet button click
  const handleUnlockClick = useCallback(() => {
    setShowSelectDialog(true);
  }, [setShowSelectDialog]);

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
        targetPriceAtGraduation: number;
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

  // Dev populate handler - fills default values for current step
  const handlePopulate = useCallback(
    (step: number) => {
      // Clear any previous chain creation state to ensure fresh POST request
      setCreatedChain(null);
      setTxHash(null);
      setSubmitStep("idle");
      setSubmitError(null);

      switch (step) {
        case 2:
          // Skip GitHub - just mark valid
          setFormData({
            githubRepo: DEV_DEFAULTS.githubRepo,
            githubValidated: DEV_DEFAULTS.githubValidated,
            githubRepoData: DEV_DEFAULTS.githubRepoData,
          });
          setStepValidity((prev) => ({ ...prev, 2: true }));
          break;
        case 3: {
          // Increment counter and use it for suffix
          const newCount = populateCount + 1;
          setPopulateCount(newCount);

          const suffix = newCount > 1 ? String(newCount) : "";
          setFormData({
            chainName: `${DEV_DEFAULTS.chainName}${suffix}`,
            tokenName: `${DEV_DEFAULTS.tokenName}${suffix}`,
            ticker: `${DEV_DEFAULTS.ticker}${suffix}`,
            decimals: DEV_DEFAULTS.decimals,
            description: DEV_DEFAULTS.description,
            halvingDays: DEV_DEFAULTS.halvingDays,
            blockTime: DEV_DEFAULTS.blockTime,
          });
          setStepValidity((prev) => ({ ...prev, 3: true }));
          break;
        }
        case 4:
          setFormData({
            chainDescription: DEV_DEFAULTS.chainDescription,
            brandColor: DEV_DEFAULTS.brandColor,
            logo: DEV_DEFAULTS.logo,
            gallery: DEV_DEFAULTS.gallery,
          });
          setStepValidity((prev) => ({ ...prev, 4: true }));
          break;
        case 5:
          setFormData({
            socialLinks: DEV_DEFAULTS.socialLinks,
            resources: DEV_DEFAULTS.resources,
          });
          setStepValidity((prev) => ({ ...prev, 5: true }));
          break;
      }
    },
    [setFormData, populateCount]
  );

  // Helper: Retry PATCH activation until confirmed (200) or timeout
  // Backend returns 202 if transaction not yet found, 200 when confirmed
  const activateWithRetry = useCallback(
    async (chainId: string, hash: string, timeoutMs: number): Promise<void> => {
      const startTime = Date.now();

      while (Date.now() - startTime < timeoutMs) {
        try {
          const result = await chainsApi.activateChainWithStatus(chainId, hash);
          if (result.confirmed) {
            return; // Success - got 200
          }
          // Got 202 - transaction pending, retry after delay
        } catch (error) {
          // Network error or other failure, retry
        }
        // Wait 6 seconds before retry
        await new Promise((resolve) => setTimeout(resolve, 6000));
      }

      throw new Error(
        `Chain activation timed out after ${
          timeoutMs / 1000
        }s. Your payment was sent successfully. ` +
          `Please contact support with chain ID: ${chainId} and tx hash: ${hash}`
      );
    },
    []
  );

  // Final submission with payment flow
  const handleSubmit = useCallback(async () => {
    // Validate wallet is unlocked
    if (!currentWallet?.isUnlocked) {
      setSubmitError("Please unlock your wallet first");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitStep("idle");

    try {
      let chain = createdChain;

      // Step 1: Create chain in draft status (only if not already created)
      if (!chain) {
        setSubmitStep("creating");

        // Calculate halving_schedule: convert halvingDays to blocks between halvings
        const blockTimeSeconds = parseInt(formData.blockTime || "10", 10);
        const halvingDays = parseFloat(formData.halvingDays || "365");
        const secondsPerDay = 24 * 60 * 60;
        const blocksPerDay = secondsPerDay / blockTimeSeconds;
        const halvingSchedule = Math.floor(blocksPerDay * halvingDays);

        const chainData = {
          chain_name: formData.chainName,
          token_symbol: formData.ticker,
          status: "pending_launch" as const,
          chain_description: formData.chainDescription || formData.description,
          template_id: formData.template?.id || "",
          genesis_supply: 1000000000,
          target_price_at_graduation_cnpy_per_token:
            formData.targetPriceAtGraduation,
          initial_cnpy_reserve: 10000.0,
          initial_token_supply: 1000000000,
          validator_min_stake: 1000.0,
          creator_initial_purchase_cnpy: parseFloat(
            formData.initialPurchaseAmount || "0"
          ),
          brand_color: formData.brandColor,
          block_time_seconds: blockTimeSeconds,
          halving_schedule: halvingSchedule,
          block_reward_amount: 50.0,
        };

        const response = await chainsApi.createChain(chainData);
        chain = response.data;
        setCreatedChain(chain);
      }

      // Step 2: Send payment transaction
      setSubmitStep("paying");
      const paymentAmount =
        100 + parseFloat(formData.initialPurchaseAmount || "0");

      if (!chain || !chain.address) {
        throw new Error("Chain created but no payment address received");
      }

      const hash = await sendTransaction({
        from_address: currentWallet.address,
        to_address: chain.address,
        amount: paymentAmount.toString(),
        network_id: 1,
        chain_id: 1,
        password: "", // Password not needed for locally signed transactions
      });
      setTxHash(hash);

      // Step 3: Activate chain with retry (120s timeout)
      setSubmitStep("activating");
      await activateWithRetry(chain.id, hash, 120000);

      // Step 4: Upload assets (continue even if some fail)
      setSubmitStep("uploading");

      // Chain created successfully! Now proceed with additional operations

      // Step 1.5: Store chain data in DynamoDB
      try {
        await storeChainListing({
          ticker: formData.ticker,
          chain_name: formData.chainName,
          token_name: formData.tokenName,
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

      // Success! Reset form and navigate to chain page
      setSubmitStep("success");
      resetFormData();
      router.push(
        `/chains/${chain.id}?success=true&name=${encodeURIComponent(
          chain.chain_name
        )}`
      );
    } catch (err: unknown) {
      console.error("Error creating chain:", err);
      setSubmitStep("error");
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to create chain. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData,
    resetFormData,
    router,
    currentWallet,
    sendTransaction,
    activateWithRetry,
    createdChain,
  ]);

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
          key={`main-info-${populateCount}`}
          initialData={{
            chainName: formData.chainName,
            tokenName: formData.tokenName,
            ticker: formData.ticker,
            decimals: formData.decimals,
            description: formData.description,
          }}
          onDataSubmit={handleMainInfoSubmit}
        />
      )}

      {/* Step 4: Branding & Media */}
      {currentStep === 4 && (
        <BrandingMedia
          key={`branding-${populateCount}`}
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
          key={`links-${populateCount}`}
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
          key={`settings-${populateCount}`}
          initialData={{
            launchDate: formData.launchDate,
            launchTime: formData.launchTime,
            timezone: formData.timezone,
            launchImmediately: formData.launchImmediately,
            initialPurchaseAmount: formData.initialPurchaseAmount,
            targetPriceAtGraduation: formData.targetPriceAtGraduation,
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

            {/* Populate & Continue Buttons */}
            {currentStep < 7 ? (
              <div className="flex gap-2 ml-auto">
                {/* Populate Button - only in development, steps 2-5 */}
                {isDev && currentStep > 1 && currentStep < 6 && (
                  <Button
                    variant="outline"
                    onClick={() => handlePopulate(currentStep)}
                    className="gap-2 border-green-500 text-green-500 hover:bg-green-500/10"
                    size="lg"
                  >
                    <Zap className="w-4 h-4" />
                    Populate
                  </Button>
                )}
                {/* Continue Button */}
                <Button
                  onClick={handleContinue}
                  disabled={!stepValidity[currentStep]}
                  className="gap-2"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={isWalletUnlocked ? handleSubmit : handleUnlockClick}
                disabled={isSubmitting}
                size="lg"
                className={cn("gap-2 ml-auto", currentStep === 7 && "w-full")}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {submitStep === "creating" && "Creating chain..."}
                    {submitStep === "paying" &&
                      `Sending ${
                        100 + parseFloat(formData.initialPurchaseAmount || "0")
                      } CNPY...`}
                    {submitStep === "activating" &&
                      (secondsToNextBlock !== null
                        ? `Confirming transaction... ~${secondsToNextBlock}s`
                        : "Confirming transaction...")}
                    {submitStep === "uploading" && "Uploading assets..."}
                    {submitStep === "idle" && "Processing..."}
                  </>
                ) : !isWalletUnlocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Unlock Wallet to Pay
                  </>
                ) : (
                  `Pay & Launch Chain`
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
