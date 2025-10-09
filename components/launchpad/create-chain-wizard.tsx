"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Rocket,
  Code,
  Settings,
  DollarSign,
  Upload,
  FileText,
  Calendar,
  CheckCircle2,
  Github,
  Globe,
  Twitter,
  AlertCircle,
  Zap,
  Cog,
  X,
  HelpCircle,
  Target,
  ChevronDown,
  Clock,
} from "lucide-react";
import { useCreateChainDialog } from "@/lib/stores/use-create-chain-dialog";
import { useTemplatesStore, useChainsStore } from "@/lib/stores";
import {
  TEMPLATE_CATEGORY_COLORS,
  COMPLEXITY_LEVEL_COLORS,
} from "@/types/templates";
import { chainsApi } from "@/lib/api";
import {
  validateGitHubOwnership,
  parseGitHubUrl,
  isValidGitHubUrl,
  type GitHubValidationResult,
} from "@/lib/api/github";
import { uploadLogo, uploadGallery, uploadWhitepaper } from "@/lib/api/media";
import { useSession } from "next-auth/react";
import { WizardBackButton } from "./wizard-back-button";
import { WizardContinueButton } from "./wizard-continue-button";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Set to false to disable all step validation (useful for development/testing)
const ENABLE_VALIDATION = false;

const step1Schema = z.object({
  chainName: z
    .string()
    .min(3, "Chain name must be at least 3 characters")
    .max(40, "Chain name must be at most 40 characters"),
  ticker: z
    .string()
    .min(2, "Ticker must be at least 2 characters")
    .max(8, "Ticker must be at most 8 characters")
    .regex(/^[A-Z]+$/, "Ticker must be uppercase letters only"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(250, "Description must be at most 250 characters"),
  logo: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 15 * 1024 * 1024,
      "Logo must be less than 15MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type),
      "Logo must be JPG, PNG, or GIF"
    ),
  promoVideo: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 30 * 1024 * 1024,
      "Video must be less than 30MB"
    )
    .refine((file) => file.type === "video/mp4", "Video must be MP4")
    .optional(),
  banner: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 15 * 1024 * 1024,
      "Banner must be less than 15MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/png"].includes(file.type),
      "Banner must be JPG or PNG"
    )
    .optional(),
});

const templateParamsSchema = z.object({
  template: z.string().uuid("Please select a valid template"),
  tokenSupply: z.number().min(1000000).max(1000000000000),
  decimals: z.number().min(6).max(18),
});

const step3Schema = z.object({
  githubRepo: z
    .string()
    .url()
    .refine((url) => url.includes("github.com"), "Must be a valid GitHub URL"),
  website: z.string().url(),
  whitepaper: z.string().url().optional(),
  whitepaperFile: z.instanceof(File).optional(),
  twitterUrl: z
    .string()
    .url()
    .refine(
      (url) => url.includes("twitter.com") || url.includes("x.com"),
      "Must be a valid Twitter/X URL"
    )
    .optional(),
  telegramUrl: z
    .string()
    .url()
    .refine((url) => url.includes("t.me"), "Must be a valid Telegram URL")
    .optional(),
});

const step5Schema = z.object({
  launchDate: z
    .date()
    .refine(
      (date) => date.getTime() > Date.now() + 10 * 60 * 1000,
      "Launch date must be at least 10 minutes from now"
    )
    .refine(
      (date) => date.getTime() < Date.now() + 30 * 24 * 60 * 60 * 1000,
      "Launch date must be within 30 days"
    ),
  timezone: z.string(),
  launchImmediately: z.boolean().default(false),
});

const step6Schema = z.object({
  riskAcknowledgment: z
    .boolean()
    .refine((val) => val === true, "You must acknowledge the risks"),
});

// ============================================================================
// TEMPLATES - Now loaded from API via store
// ============================================================================

// ============================================================================
// API STUBS
// ============================================================================

async function checkTickerAvailability(ticker: string): Promise<boolean> {
  // TODO: Implement actual API call
  // const response = await fetch(`/api/projects/check-ticker?ticker=${ticker}`);
  // return response.json();
  console.log("Checking ticker availability:", ticker);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return true; // Stub: always available
}

// getTemplates is no longer needed as we use the store

// uploadFile function removed - now using uploadLogo, uploadGallery, uploadWhitepaper from @/lib/api/media

async function getBondingCurveQuote(
  amountInCNPY: number
): Promise<{ tokensOut: number; pricePerToken: number }> {
  // TODO: Implement actual API call
  // const response = await fetch('/api/curve/quote', {
  //   method: 'POST',
  //   body: JSON.stringify({ direction: 'buy', amountInCNPY }),
  // });
  // return response.json();
  console.log("Getting bonding curve quote for:", amountInCNPY);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    tokensOut: amountInCNPY * 10,
    pricePerToken: 0.1,
  };
}

// Removed - now using chainsApi directly

// ============================================================================
// WALLET STUBS
// ============================================================================

async function approveCNPY(amount: number): Promise<string> {
  // TODO: Implement wagmi writeContract for ERC-20 approve
  // const { hash } = await writeContract({
  //   address: CNPY_TOKEN_ADDRESS,
  //   abi: ERC20_ABI,
  //   functionName: 'approve',
  //   args: [LAUNCHPAD_CONTRACT_ADDRESS, parseUnits(amount.toString(), 18)],
  // });
  // return hash;
  console.log("Approving CNPY:", amount);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return "0x" + "1".repeat(64);
}

async function sendCreateChainTransaction(txData: any): Promise<string> {
  // TODO: Implement wagmi sendTransaction or writeContract
  // const { hash } = await writeContract({
  //   address: LAUNCHPAD_CONTRACT_ADDRESS,
  //   abi: LAUNCHPAD_ABI,
  //   functionName: 'createChain',
  //   args: [...],
  // });
  // return hash;
  console.log("Sending create chain transaction:", txData);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return "0x" + "2".repeat(64);
}

async function checkAllowance(userAddress: string): Promise<number> {
  // TODO: Implement wagmi readContract for ERC-20 allowance
  // const allowance = await readContract({
  //   address: CNPY_TOKEN_ADDRESS,
  //   abi: ERC20_ABI,
  //   functionName: 'allowance',
  //   args: [userAddress, LAUNCHPAD_CONTRACT_ADDRESS],
  // });
  // return Number(formatUnits(allowance, 18));
  console.log("Checking allowance for:", userAddress);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return 0; // Stub: no allowance
}

// ============================================================================
// TYPES
// ============================================================================

interface FormData {
  // Step 1
  chainName: string;
  ticker: string;
  description: string;

  // Step 2
  template: string; // Template ID (UUID)
  tokenName: string;
  tokenSupply: string;
  decimals: string;
  governance?: boolean;
  stakingEnabled?: boolean;
  nftModule?: boolean;
  lowLatency?: boolean;
  bundlerUrl?: string;
  paymasterEnabled?: boolean;
  permissioned?: boolean;
  privacyFeatures?: boolean;
  socialGraph?: boolean;

  // Step 3
  githubRepo: string;
  website: string;
  whitepaper: string;
  whitepaperFile: File | null;
  twitterUrl: string;
  telegramUrl: string;

  // Step 4
  logo: File | null;
  chainDescription: string;
  gallery: File[];

  // Step 5
  launchDate: string;
  launchTime: string;
  timezone: string;
  launchImmediately: boolean;

  // Step 6
  initialPurchaseAmount: string;
  graduationThreshold: number;
  riskAcknowledgment: boolean;
}

// ============================================================================
// WIZARD STEPS CONFIGURATION
// ============================================================================

const WIZARD_STEPS = [
  { number: 1, title: "Launch Type", description: "Choose your launch method" },
  {
    number: 2,
    title: "Template / GitHub",
    description: "Choose your blockchain template",
    subtitle: "How templates works",
  },
  {
    number: 3,
    title: "Main Info",
    description: "Configure your chain & token",
  },
  {
    number: 4,
    title: "Branding & Media",
    description: "Add your branding",
  },
  {
    number: 5,
    title: "Links & Documentation",
    description: "Web presence and documentation",
  },
  {
    number: 6,
    title: "Launch Settings",
    description: "Launch settings",
  },
  {
    number: 7,
    title: "Review & Payment",
    description: "Review your configuration",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function CreateChainWizard() {
  const { isOpen, setOpen } = useCreateChainDialog();
  const {
    templates,
    getActiveTemplates,
    getTemplateById,
    isLoading: templatesLoading,
  } = useTemplatesStore();
  const { createChain } = useChainsStore();
  const activeTemplates = getActiveTemplates();

  // Step 0 = initial chain name screen, Steps 1-7 = wizard steps
  const [step, setStep] = useState(0);
  const [launchType, setLaunchType] = useState<"quick" | "advanced" | null>(
    null
  );
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [tickerAvailable, setTickerAvailable] = useState<boolean | null>(null);
  const [bondingQuote, setBondingQuote] = useState<{
    tokensOut: number;
    pricePerToken: number;
  } | null>(null);

  // GitHub validation state
  const { data: session } = useSession();
  const [githubValidation, setGithubValidation] =
    useState<GitHubValidationResult | null>(null);
  const [isValidatingGithub, setIsValidatingGithub] = useState(false);
  const [githubValidationTimeout, setGithubValidationTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<FormData>({
    // Step 1
    chainName: "",
    ticker: "",
    description: "",

    // Step 2
    template: "",
    tokenName: "",
    tokenSupply: "1000000000",
    decimals: "18",

    // Step 3
    githubRepo: "",
    website: "",
    whitepaper: "",
    whitepaperFile: null,
    twitterUrl: "",
    telegramUrl: "",

    // Step 4
    logo: null,
    chainDescription: "",
    gallery: [],

    // Step 5
    launchDate: "",
    launchTime: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    launchImmediately: true,

    // Step 6
    initialPurchaseAmount: "",
    graduationThreshold: 50000,
    riskAcknowledgment: false,
  });

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setLaunchType(null);
      setShowAllTemplates(false);
      setErrors({});
      setFormData({
        chainName: "",
        ticker: "",
        description: "",
        template: "",
        tokenName: "",
        tokenSupply: "1000000000",
        decimals: "18",
        githubRepo: "",
        website: "",
        whitepaper: "",
        whitepaperFile: null,
        twitterUrl: "",
        telegramUrl: "",
        logo: null,
        chainDescription: "",
        gallery: [],
        launchDate: "",
        launchTime: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        launchImmediately: true,
        initialPurchaseAmount: "",
        graduationThreshold: 50000,
        riskAcknowledgment: false,
      });
    }
  }, [isOpen]);

  // Reset showAllTemplates when leaving step 2
  useEffect(() => {
    if (step !== 2) {
      setShowAllTemplates(false);
    }
  }, [step]);

  // Reset datePickerOpen when leaving step 6
  useEffect(() => {
    if (step !== 6) {
      setDatePickerOpen(false);
    }
  }, [step]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = async (stepNum: number): Promise<boolean> => {
    // Skip validation if disabled
    if (!ENABLE_VALIDATION) {
      return true;
    }

    setErrors({});

    try {
      switch (stepNum) {
        case 1: {
          // Step 1: Launch Type - just check if launchType is selected
          if (!launchType) {
            setErrors({ launchType: "Please select a launch type" });
            return false;
          }
          return true;
        }

        case 2: {
          // Step 2: Template / GitHub
          if (!formData.template) {
            setErrors({ template: "Please select a template" });
            return false;
          }

          const params = {
            template: formData.template,
            tokenSupply: Number(formData.tokenSupply),
            decimals: Number(formData.decimals),
          };

          const result = templateParamsSchema.safeParse(params);

          if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
              newErrors[err.path[0] as string] = err.message;
            });
            setErrors(newErrors);
            return false;
          }

          return true;
        }

        case 3: {
          // Step 3: Main Info (ticker, description)
          if (!formData.ticker) {
            setErrors({ ticker: "Ticker is required" });
            return false;
          }

          if (!formData.description) {
            setErrors({ description: "Description is required" });
            return false;
          }

          // Check ticker availability
          const available = await checkTickerAvailability(formData.ticker);
          if (!available) {
            setErrors({ ticker: "Ticker is already taken" });
            return false;
          }

          return true;
        }

        case 4: {
          // Step 4: Branding & Media
          // Optional for now, but could add logo validation here
          return true;
        }

        case 5: {
          // Step 5: Links & Documentation
          const result = step3Schema.safeParse({
            githubRepo: formData.githubRepo,
            website: formData.website,
            whitepaper: formData.whitepaper || undefined,
            whitepaperFile: formData.whitepaperFile || undefined,
            twitterUrl: formData.twitterUrl || undefined,
            telegramUrl: formData.telegramUrl || undefined,
          });

          if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
              newErrors[err.path[0] as string] = err.message;
            });
            setErrors(newErrors);
            return false;
          }

          // Check GitHub validation
          if (!session) {
            setErrors({
              githubRepo: "Please connect GitHub in the sidebar first",
            });
            return false;
          }

          if (!githubValidation || !githubValidation.isValid) {
            setErrors({
              githubRepo: "Please verify GitHub repository ownership",
            });
            return false;
          }

          return true;
        }

        case 6: {
          // Step 6: Launch Settings
          if (!formData.launchImmediately && !formData.launchDate) {
            setErrors({ launchDate: "Launch date is required" });
            return false;
          }

          if (!formData.launchImmediately) {
            const result = step5Schema.safeParse({
              launchDate: new Date(formData.launchDate),
              timezone: formData.timezone,
              launchImmediately: formData.launchImmediately,
            });

            if (!result.success) {
              const newErrors: Record<string, string> = {};
              result.error.errors.forEach((err) => {
                newErrors[err.path[0] as string] = err.message;
              });
              setErrors(newErrors);
              return false;
            }
          }

          return true;
        }

        case 7: {
          // Step 7: Review & Payment
          // No validation required for review step
          return true;
        }

        default:
          return true;
      }
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(step);
    if (isValid && step < 7) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Validate final step
      const isValid = await validateStep(7);
      if (!isValid) {
        setIsLoading(false);
        return;
      }

      // Get selected template for defaults
      const selectedTemplate = getTemplateById(formData.template);
      if (!selectedTemplate) {
        setErrors({ submit: "Selected template not found" });
        setIsLoading(false);
        return;
      }

      // Upload files to AWS S3
      let logoUrl = "";
      const galleryUrls: string[] = [];
      let whitepaperUrl = formData.whitepaper; // Keep URL if provided

      // Upload logo if present
      if (formData.logo) {
        const logoResult = await uploadLogo(formData.ticker, formData.logo);
        if (logoResult.success && logoResult.urls && logoResult.urls.length > 0) {
          logoUrl = logoResult.urls[0].url;
        } else {
          throw new Error(`Failed to upload logo: ${logoResult.error}`);
        }
      }

      // Upload gallery images if present
      if (formData.gallery.length > 0) {
        const galleryResult = await uploadGallery(formData.ticker, formData.gallery);
        if (galleryResult.success && galleryResult.urls) {
          galleryUrls.push(...galleryResult.urls.map((r) => r.url));
        } else {
          throw new Error(`Failed to upload gallery: ${galleryResult.error}`);
        }
      }

      // Upload whitepaper file if present (takes precedence over URL)
      if (formData.whitepaperFile) {
        const paperResult = await uploadWhitepaper(formData.ticker, formData.whitepaperFile);
        if (paperResult.success && paperResult.urls && paperResult.urls.length > 0) {
          whitepaperUrl = paperResult.urls[0].url;
        } else {
          throw new Error(`Failed to upload whitepaper: ${paperResult.error}`);
        }
      }

      // Prepare chain data according to API spec
      const chainData = {
        chain_name: formData.chainName,
        token_symbol: formData.ticker,
        chain_description: formData.description,
        template_id: formData.template,
        consensus_mechanism: selectedTemplate.default_consensus,
        token_total_supply: Number(formData.tokenSupply),
        // Use template defaults for other fields
        graduation_threshold: 50000.0,
        creation_fee_cnpy: 100.0,
        initial_cnpy_reserve: 10000.0,
        initial_token_supply: Math.floor(Number(formData.tokenSupply) * 0.8), // 80% of total supply
        bonding_curve_slope: 0.00000001,
        validator_min_stake: 1000.0,
        creator_initial_purchase_cnpy: 0, // No initial purchase for now
      };

      // TODO: Store additional metadata (github, website, etc.) separately
      // These fields are collected in the form but not part of the chain creation API
      console.log("Additional metadata to store separately:", {
        github_repo: formData.githubRepo,
        website: formData.website,
        whitepaper: whitepaperUrl,
        twitter_url: formData.twitterUrl,
        telegram_url: formData.telegramUrl,
        scheduled_launch: formData.launchImmediately
          ? new Date().toISOString()
          : formData.launchDate,
        logo_url: logoUrl,
        gallery_urls: galleryUrls,
      });

      console.log("Creating chain with data:", chainData);

      // Create chain via API
      const result = await createChain(chainData);

      console.log("Chain created successfully:", result);

      // TODO: Check allowance and approve if needed (for on-chain operations)
      // const userAddress = "0x0000000000000000000000000000000000000000"; // TODO: Get from wallet
      // const totalCost = 100; // Only creation fee, no pre-purchase
      // const allowance = await checkAllowance(userAddress);
      // if (allowance < totalCost) {
      //   await approveCNPY(totalCost);
      // }

      // TODO: Send transaction if needed (for on-chain deployment)
      // await sendCreateChainTransaction(result);

      // Show success message
      alert(
        `Chain "${result.chain_name}" created successfully! (Status: ${result.status})`
      );

      // Reset and close
      setOpen(false);
      setStep(1);
      setFormData({
        chainName: "",
        ticker: "",
        description: "",
        template: "",
        tokenName: "",
        tokenSupply: "1000000000",
        decimals: "18",
        githubRepo: "",
        website: "",
        whitepaper: "",
        whitepaperFile: null,
        twitterUrl: "",
        telegramUrl: "",
        logo: null,
        chainDescription: "",
        gallery: [],
        launchDate: "",
        launchTime: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        launchImmediately: true,
        initialPurchaseAmount: "",
        graduationThreshold: 50000,
        riskAcknowledgment: false,
      });
    } catch (error: any) {
      console.error("Error creating chain:", error);
      const errorMessage =
        error?.message || "Failed to create chain. Please try again.";
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChainNameChange = (name: string) => {
    updateFormData({ chainName: name });
  };

  // Check ticker availability with debounce
  const handleTickerChange = async (ticker: string) => {
    const upperTicker = ticker.toUpperCase();
    updateFormData({ ticker: upperTicker });

    if (upperTicker.length >= 2) {
      setTickerAvailable(null);
      const available = await checkTickerAvailability(upperTicker);
      setTickerAvailable(available);
    }
  };

  // GitHub validation function
  const validateGitHubRepo = async (url: string) => {
    if (!session?.accessToken || !isValidGitHubUrl(url)) {
      setGithubValidation(null);
      return;
    }

    setIsValidatingGithub(true);
    setGithubValidation(null);

    try {
      const result = await validateGitHubOwnership(
        url,
        session.accessToken as string
      );
      setGithubValidation(result);
    } catch (error) {
      setGithubValidation({
        isValid: false,
        error: "Failed to validate repository",
      });
    } finally {
      setIsValidatingGithub(false);
    }
  };

  // Handle GitHub URL change with debounced validation
  const handleGitHubUrlChange = (url: string) => {
    updateFormData({ githubRepo: url });

    // Clear existing timeout
    if (githubValidationTimeout) {
      clearTimeout(githubValidationTimeout);
    }

    // Reset validation when URL changes
    setGithubValidation(null);

    // Validate if user is logged in and URL is valid
    if (session?.accessToken && isValidGitHubUrl(url)) {
      // Debounce validation by 500ms
      const timeoutId = setTimeout(() => {
        validateGitHubRepo(url);
      }, 500);
      setGithubValidationTimeout(timeoutId);
    }
  };

  // Handle initial chain name continue
  const handleInitialContinue = () => {
    if (!formData.chainName.trim()) {
      setErrors({ chainName: "Please enter a chain name" });
      return;
    }
    setErrors({});
    setStep(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent
        id="create-chain-wizard"
        className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 z-50 rounded-full p-2 hover:bg-accent transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex h-full overflow-auto w-full">
          {/* Step 0: Initial Chain Name Screen */}
          {step === 0 && (
            <>
              {/* Left side - Empty slate background (will hold image later) */}
              <div className="flex-1 bg-slate-100 relative">
                {/* Logo */}
                <div className="flex items-center gap-2 absolute top-8 left-8 text-black">
                  <Rocket className="h-6 w-6" />
                  <span className="text-lg font-bold">CANOPY</span>
                </div>
              </div>

              {/* Right side - Content */}
              <div className="flex-1 flex items-center justify-center bg-background">
                <div className="max-w-xl w-full px-12">
                  <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">
                      Launch Your Blockchain
                    </h1>
                    <div className="text-lg text-muted-foreground mb-2">
                      We have made launching a new blockchain easy and
                      straightforward, even for those with no coding experience.
                      So relax and follow the steps.
                    </div>
                    <button className="text-pink-500 hover:text-pink-600 inline-flex items-center gap-1 text-sm font-medium">
                      <HelpCircle className="h-4 w-4" />
                      How the process works
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label
                        htmlFor="initialChainName"
                        className="text-base mb-2 block"
                      >
                        Chain Name
                      </Label>
                      <Input
                        id="initialChainName"
                        placeholder="MyGameChain"
                        value={formData.chainName}
                        onChange={(e) =>
                          updateFormData({ chainName: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleInitialContinue();
                        }}
                        className={`h-14 text-lg ${
                          errors.chainName ? "border-destructive" : ""
                        }`}
                      />
                      {errors.chainName && (
                        <p className="text-sm text-destructive mt-2">
                          {errors.chainName}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <WizardContinueButton onClick={handleInitialContinue} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Steps 1-7: Wizard with Sidebar */}
          {step >= 1 && step <= 7 && (
            <>
              {/* Sidebar */}
              <div className="w-80 bg-muted/30 p-8 flex flex-col">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-12">
                  <Rocket className="h-6 w-6" />
                  <span className="text-lg font-bold">CANOPY</span>
                </div>

                {/* Steps List */}
                <nav className="space-y-6 flex-1">
                  {WIZARD_STEPS.map((wizardStep) => (
                    <div
                      key={wizardStep.number}
                      className={`transition-colors ${
                        step === wizardStep.number
                          ? "text-pink-500 font-medium"
                          : step > wizardStep.number
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      <div className="text-sm">
                        {String(wizardStep.number).padStart(2, "0")}.{" "}
                        {wizardStep.title}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-auto">
                <div className="max-w-4xl mx-auto p-12">
                  <DialogHeader className="mb-8">
                    <DialogTitle className="text-3xl font-bold">
                      {step === 2
                        ? WIZARD_STEPS[step - 1]?.description
                        : WIZARD_STEPS[step - 1]?.title}
                    </DialogTitle>
                    <DialogDescription className="text-base flex items-center gap-2">
                      {step === 2 ? (
                        <button className="text-pink-500 hover:text-pink-600 inline-flex items-center gap-1">
                          <HelpCircle className="h-4 w-4" />
                          {WIZARD_STEPS[step - 1]?.subtitle}
                        </button>
                      ) : (
                        <>
                          {WIZARD_STEPS[step - 1]?.description}
                          <button className="text-pink-500 hover:text-pink-600 inline-flex items-center gap-1">
                            <HelpCircle className="h-4 w-4" />
                            How the process works
                          </button>
                        </>
                      )}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-8">
                    {errors.submit && (
                      <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {errors.submit}
                      </div>
                    )}

                    {/* Step 1: Launch Type */}
                    {step === 1 && (
                      <div className="space-y-6">
                        <div className="grid gap-6">
                          {/* Quick Launch Option */}
                          <Card
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              launchType === "quick"
                                ? "ring-2 ring-primary shadow-md"
                                : ""
                            }`}
                            onClick={() => setLaunchType("quick")}
                          >
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-purple-600">
                                <Zap className="h-5 w-5" />
                                <span className="italic">QUICK LAUNCH</span>
                              </CardTitle>
                              <CardDescription className="text-base">
                                No coding required. Perfect for first time
                                launchers.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-medium">
                                    Pre-built templates
                                  </span>
                                  <button className="ml-1 text-pink-500 hover:text-pink-600">
                                    <HelpCircle className="h-3 w-3 inline" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                <span className="font-medium">
                                  No coding required
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                <span className="font-medium">
                                  5-10 min setup
                                </span>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Advanced Launch Option */}
                          <Card
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              launchType === "advanced"
                                ? "ring-2 ring-primary shadow-md"
                                : ""
                            }`}
                            onClick={() => setLaunchType("advanced")}
                          >
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-orange-600">
                                <Cog className="h-5 w-5" />
                                <span className="italic">ADVANCED LAUNCH</span>
                              </CardTitle>
                              <CardDescription className="text-base">
                                Import code from GitHub. Perfect for custom
                                applications.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                <span className="font-medium">
                                  Full customization
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                <span className="font-medium">
                                  Advanced Configuration
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                <span className="font-medium">
                                  Auto-Upgrade System
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Template / GitHub */}
                    {step === 2 && (
                      <div className="space-y-6">
                        {templatesLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="text-center space-y-2">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                              <p className="text-sm text-muted-foreground">
                                Loading templates...
                              </p>
                            </div>
                          </div>
                        ) : activeTemplates.length === 0 ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="text-center space-y-2">
                              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                              <p className="text-sm text-muted-foreground">
                                No templates available. Please try again later.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-4">
                              {(showAllTemplates
                                ? activeTemplates
                                : activeTemplates.slice(0, 3)
                              ).map((template, index) => {
                                const colors = [
                                  "text-purple-600",
                                  "text-blue-500",
                                  "text-red-500",
                                ];
                                const color = colors[index % colors.length];

                                return (
                                  <div
                                    key={template.id}
                                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                                      formData.template === template.id
                                        ? "border-pink-500 bg-pink-50/50"
                                        : "border-gray-300 hover:border-gray-400"
                                    }`}
                                    onClick={() =>
                                      updateFormData({ template: template.id })
                                    }
                                  >
                                    <h3
                                      className={`text-xl font-semibold italic mb-3 ${color}`}
                                    >
                                      {template.template_name}
                                    </h3>

                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm text-muted-foreground mb-1">
                                          Best for:
                                        </p>
                                        <p className="font-semibold">
                                          {template.template_category}
                                        </p>
                                      </div>

                                      <div className="flex-1 text-right">
                                        <p className="text-sm text-muted-foreground">
                                          {template.template_description}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {activeTemplates.length > 3 && (
                              <button
                                onClick={() =>
                                  setShowAllTemplates(!showAllTemplates)
                                }
                                className="flex items-center gap-2 text-sm font-medium hover:underline mx-auto"
                              >
                                <span className="text-xl">
                                  {showAllTemplates ? "−" : "+"}
                                </span>
                                {showAllTemplates
                                  ? "Show fewer templates"
                                  : "See all templates"}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Step 3: Main Info */}
                    {step === 3 && (
                      <div className="space-y-6">
                        {/* Chain Name - Read Only */}
                        <div className="border-2 rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-normal">
                              Chain Name
                            </Label>
                            <span className="text-base font-medium">
                              {formData.chainName}
                            </span>
                          </div>
                        </div>

                        {/* Token Name */}
                        <div className="border-2 rounded-lg p-6">
                          <div className="flex items-center justify-between gap-4">
                            <Label
                              htmlFor="tokenName"
                              className="text-base font-normal whitespace-nowrap"
                            >
                              Token name
                            </Label>
                            <Input
                              id="tokenName"
                              placeholder="GAME"
                              value={formData.tokenName}
                              onChange={(e) =>
                                updateFormData({ tokenName: e.target.value })
                              }
                              className={`text-right border-0 shadow-none focus-visible:ring-0 text-base font-medium ${
                                errors.tokenName ? "text-destructive" : ""
                              }`}
                            />
                          </div>
                          {errors.tokenName && (
                            <p className="text-xs text-destructive mt-2">
                              {errors.tokenName}
                            </p>
                          )}
                        </div>

                        {/* Ticker */}
                        <div className="border-2 rounded-lg p-6">
                          <div className="flex items-center justify-between gap-4">
                            <Label
                              htmlFor="ticker"
                              className="text-base font-normal whitespace-nowrap"
                            >
                              Ticker
                            </Label>
                            <div className="relative flex-1">
                              <Input
                                id="ticker"
                                placeholder="GAME"
                                value={formData.ticker}
                                onChange={(e) =>
                                  handleTickerChange(
                                    e.target.value.toUpperCase()
                                  )
                                }
                                className={`text-right border-0 shadow-none focus-visible:ring-0 text-base font-medium pr-8 ${
                                  errors.ticker ? "text-destructive" : ""
                                }`}
                                maxLength={8}
                              />
                              {tickerAvailable === true && (
                                <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                              )}
                              {tickerAvailable === false && (
                                <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                              )}
                            </div>
                          </div>
                          {errors.ticker && (
                            <p className="text-xs text-destructive mt-2">
                              {errors.ticker}
                            </p>
                          )}
                          {tickerAvailable === false && !errors.ticker && (
                            <p className="text-xs text-destructive mt-2">
                              Ticker already taken
                            </p>
                          )}
                        </div>

                        {/* Token Supply */}
                        <div className="border-2 rounded-lg p-6">
                          <div className="flex items-center justify-between gap-4">
                            <Label
                              htmlFor="tokenSupply"
                              className="text-base font-normal whitespace-nowrap"
                            >
                              Token Supply
                            </Label>
                            <Input
                              id="tokenSupply"
                              placeholder="1,000,000,000"
                              value={formData.tokenSupply}
                              onChange={(e) =>
                                updateFormData({ tokenSupply: e.target.value })
                              }
                              className={`text-right border-0 shadow-none focus-visible:ring-0 text-base font-medium ${
                                errors.tokenSupply ? "text-destructive" : ""
                              }`}
                            />
                          </div>
                          {errors.tokenSupply && (
                            <p className="text-xs text-destructive mt-2">
                              {errors.tokenSupply}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-4">
                            The total number of tokens that will ever exist.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Branding & Media */}
                    {step === 4 && (
                      <div className="space-y-12">
                        {/* Logo Section */}
                        <div>
                          <h3 className="text-2xl font-semibold mb-2">Logo</h3>
                          <p className="text-muted-foreground mb-6">
                            This appears in wallets, explorers, and trading
                            interfaces.
                          </p>
                          <div className="flex items-start gap-6">
                            {/* Logo Upload Box */}
                            <div
                              className="w-40 h-40 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                document.getElementById("logo")?.click()
                              }
                            >
                              {formData.logo ? (
                                <img
                                  src={URL.createObjectURL(formData.logo)}
                                  alt="Logo preview"
                                  className="w-full h-full rounded-lg object-cover"
                                />
                              ) : (
                                <Upload className="h-8 w-8 text-muted-foreground" />
                              )}
                              <Input
                                id="logo"
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={(e) =>
                                  updateFormData({
                                    logo: e.target.files?.[0] || null,
                                  })
                                }
                                className="hidden"
                              />
                            </div>
                            {/* Upload Instructions */}
                            <div className="flex-1">
                              <button
                                onClick={() =>
                                  document.getElementById("logo")?.click()
                                }
                                className="text-base font-medium underline hover:no-underline mb-2 block"
                              >
                                Upload from device
                              </button>
                              <p className="text-sm text-muted-foreground">
                                1000×1000 pixels recommended. PNG or JPG file.
                              </p>
                              {formData.logo && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateFormData({ logo: null });
                                  }}
                                  className="mt-3"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                          {errors.logo && (
                            <p className="text-xs text-destructive mt-2">
                              {errors.logo}
                            </p>
                          )}
                        </div>

                        {/* Describe your chain Section */}
                        <div>
                          <h3 className="text-2xl font-semibold mb-6">
                            Describe your chain
                          </h3>
                          <div className="border-2 rounded-lg p-6">
                            <Label
                              htmlFor="chainDescription"
                              className="text-base font-semibold mb-4 block"
                            >
                              What does your chain do?
                            </Label>
                            <Textarea
                              id="chainDescription"
                              placeholder="A short explanation of what your blockchain does"
                              value={formData.chainDescription}
                              onChange={(e) =>
                                updateFormData({
                                  chainDescription: e.target.value,
                                })
                              }
                              className="min-h-[120px] resize-none border-0 shadow-none focus-visible:ring-0 p-0 text-muted-foreground placeholder:text-muted-foreground/50"
                              rows={5}
                            />
                          </div>
                          {errors.chainDescription && (
                            <p className="text-xs text-destructive mt-2">
                              {errors.chainDescription}
                            </p>
                          )}
                        </div>

                        {/* Gallery Section */}
                        <div>
                          <h3 className="text-2xl font-semibold mb-2">
                            Gallery
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            This will help your chain stand out and build trust
                            among others. We recommend adding at least three
                            images or videos.
                          </p>
                          <div
                            className="border-2 border-dashed border-border rounded-lg p-16 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() =>
                              document.getElementById("gallery")?.click()
                            }
                          >
                            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                            <p className="text-base text-foreground">
                              Upload from your device.
                            </p>
                            <Input
                              id="gallery"
                              type="file"
                              accept="image/png,image/jpeg,video/mp4"
                              multiple
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                updateFormData({
                                  gallery: [...formData.gallery, ...files],
                                });
                              }}
                              className="hidden"
                            />
                          </div>

                          {/* Gallery Preview */}
                          {formData.gallery.length > 0 && (
                            <div className="mt-6 grid grid-cols-3 gap-4">
                              {formData.gallery.map((file, index) => (
                                <div
                                  key={index}
                                  className="relative group aspect-video border-2 rounded-lg overflow-hidden"
                                >
                                  {file.type.startsWith("image/") ? (
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={`Gallery ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                      <FileText className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                  )}
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newGallery =
                                        formData.gallery.filter(
                                          (_, i) => i !== index
                                        );
                                      updateFormData({ gallery: newGallery });
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          {errors.gallery && (
                            <p className="text-xs text-destructive mt-2">
                              {errors.gallery}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step 5: Links & Documentation */}
                    {step === 5 && (
                      <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label
                              htmlFor="githubRepo"
                              className="flex items-center gap-2"
                            >
                              <Github className="h-4 w-4" />
                              GitHub Repository *
                            </Label>
                            <div className="relative">
                              <Input
                                id="githubRepo"
                                placeholder="https://github.com/username/repo"
                                value={formData.githubRepo}
                                onChange={(e) =>
                                  handleGitHubUrlChange(e.target.value)
                                }
                                className={`pr-10 ${
                                  errors.githubRepo ? "border-destructive" : ""
                                }`}
                              />
                              {/* Validation status icon */}
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {isValidatingGithub ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                ) : githubValidation ? (
                                  githubValidation.isValid ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )
                                ) : null}
                              </div>
                            </div>

                            {/* Validation messages */}
                            {githubValidation && !githubValidation.isValid && (
                              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                You don't own that project
                              </p>
                            )}

                            {githubValidation && githubValidation.isValid && (
                              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Repository verified
                              </p>
                            )}

                            {errors.githubRepo && (
                              <p className="text-xs text-destructive mt-1">
                                {errors.githubRepo}
                              </p>
                            )}

                            {!session && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Connect GitHub in the sidebar to validate
                                repository ownership
                              </p>
                            )}
                          </div>

                          <div>
                            <Label
                              htmlFor="website"
                              className="flex items-center gap-2"
                            >
                              <Globe className="h-4 w-4" />
                              Website *
                            </Label>
                            <Input
                              id="website"
                              placeholder="https://mychain.com"
                              value={formData.website}
                              onChange={(e) =>
                                updateFormData({ website: e.target.value })
                              }
                              className={
                                errors.website ? "border-destructive" : ""
                              }
                            />
                            {errors.website && (
                              <p className="text-xs text-destructive mt-1">
                                {errors.website}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label
                              htmlFor="whitepaper"
                              className="flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              Whitepaper URL
                            </Label>
                            <Input
                              id="whitepaper"
                              placeholder="https://docs.mychain.com/whitepaper.pdf"
                              value={formData.whitepaper}
                              onChange={(e) =>
                                updateFormData({ whitepaper: e.target.value })
                              }
                              className={
                                errors.whitepaper ? "border-destructive" : ""
                              }
                            />
                            {errors.whitepaper && (
                              <p className="text-xs text-destructive mt-1">
                                {errors.whitepaper}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="whitepaperFile">
                              Or Upload Whitepaper (PDF, ≤15MB)
                            </Label>
                            <Input
                              id="whitepaperFile"
                              type="file"
                              accept=".pdf"
                              onChange={(e) =>
                                updateFormData({
                                  whitepaperFile: e.target.files?.[0] || null,
                                })
                              }
                            />
                          </div>

                          <div>
                            <Label
                              htmlFor="twitterUrl"
                              className="flex items-center gap-2"
                            >
                              <Twitter className="h-4 w-4" />
                              Twitter / X
                            </Label>
                            <Input
                              id="twitterUrl"
                              placeholder="https://x.com/mychain"
                              value={formData.twitterUrl}
                              onChange={(e) =>
                                updateFormData({ twitterUrl: e.target.value })
                              }
                              className={
                                errors.twitterUrl ? "border-destructive" : ""
                              }
                            />
                            {errors.twitterUrl && (
                              <p className="text-xs text-destructive mt-1">
                                {errors.twitterUrl}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="telegramUrl">Telegram</Label>
                            <Input
                              id="telegramUrl"
                              placeholder="https://t.me/mychain"
                              value={formData.telegramUrl}
                              onChange={(e) =>
                                updateFormData({ telegramUrl: e.target.value })
                              }
                              className={
                                errors.telegramUrl ? "border-destructive" : ""
                              }
                            />
                            {errors.telegramUrl && (
                              <p className="text-xs text-destructive mt-1">
                                {errors.telegramUrl}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 6: Launch Settings */}
                    {step === 6 && (
                      <div className="space-y-12">
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
                              ${formData.graduationThreshold.toLocaleString()}
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
                              value={formData.initialPurchaseAmount}
                              onChange={(e) =>
                                updateFormData({
                                  initialPurchaseAmount: e.target.value,
                                })
                              }
                              className="border-0 shadow-none focus-visible:ring-0 p-0 text-base text-muted-foreground placeholder:text-muted-foreground/50"
                            />
                          </div>

                          {formData.initialPurchaseAmount &&
                            parseFloat(formData.initialPurchaseAmount) > 0 && (
                              <p className="text-base italic mt-4">
                                You'll receive ~
                                {Math.floor(
                                  parseFloat(formData.initialPurchaseAmount) *
                                    0.25
                                ).toLocaleString()}{" "}
                                {formData.ticker || "tokens"}
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
                                checked={formData.launchImmediately}
                                onCheckedChange={(checked: boolean) =>
                                  updateFormData({
                                    launchImmediately: !!checked,
                                  })
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
                                checked={!formData.launchImmediately}
                                onCheckedChange={(checked: boolean) =>
                                  updateFormData({
                                    launchImmediately: !checked,
                                  })
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
                            {!formData.launchImmediately && (
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
                                        {formData.launchDate
                                          ? new Date(
                                              formData.launchDate
                                            ).toLocaleDateString()
                                          : "Select date"}
                                        <ChevronDown className="h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-auto p-0"
                                      align="start"
                                    >
                                      <CalendarComponent
                                        mode="single"
                                        selected={
                                          formData.launchDate
                                            ? new Date(formData.launchDate)
                                            : undefined
                                        }
                                        onSelect={(date: Date | undefined) => {
                                          if (date) {
                                            updateFormData({
                                              launchDate: date
                                                .toISOString()
                                                .split("T")[0],
                                            });
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
                                  {errors.launchDate && (
                                    <p className="text-xs text-destructive">
                                      {errors.launchDate}
                                    </p>
                                  )}
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
                                      value={formData.launchTime}
                                      onChange={(e) =>
                                        updateFormData({
                                          launchTime: e.target.value,
                                        })
                                      }
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
                    )}

                    {/* Step 7: Review & Payment */}
                    {step === 7 && (
                      <div className="space-y-8">
                        {/* Chain Details Section */}
                        <div>
                          <h3 className="text-lg font-medium text-muted-foreground mb-6">
                            Chain Details
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-baseline">
                              <span className="text-base">Name:</span>
                              <span className="ml-2 font-semibold">
                                {formData.chainName}
                              </span>
                            </div>
                            <div className="flex items-baseline">
                              <span className="text-base">Token:</span>
                              <span className="ml-2 font-semibold">
                                {formData.ticker}
                              </span>
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
                                {getTemplateById(formData.template)
                                  ?.template_name || "N/A"}
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
                                ${formData.graduationThreshold.toLocaleString()}{" "}
                                market cap
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
                                  ? `${new Date(
                                      formData.launchDate
                                    ).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })} - ${formData.launchTime}`
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
                              <span className="text-base">
                                Initial Purchase:
                              </span>
                              <span className="font-semibold">
                                {formData.initialPurchaseAmount || "0"} CNPY
                              </span>
                            </div>
                            <Separator />
                            <div className="flex items-baseline justify-between">
                              <span className="text-base font-semibold">
                                Total:
                              </span>
                              <span className="font-semibold">
                                {100 +
                                  parseFloat(
                                    formData.initialPurchaseAmount || "0"
                                  )}{" "}
                                CNPY (~$
                                {(
                                  (100 +
                                    parseFloat(
                                      formData.initialPurchaseAmount || "0"
                                    )) *
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
                              <li className="text-sm">
                                Starts as virtual chain (test mode)
                              </li>
                              <li className="text-sm">
                                Becomes real at $50k market cap
                              </li>
                              <li className="text-sm">
                                Settings cannot be changed later
                              </li>
                            </ul>
                          </div>
                        </div>

                        {errors.submit && (
                          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {errors.submit}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex flex-col gap-4 pt-8 border-t">
                      {step < 7 ? (
                        <div className="flex items-center justify-between">
                          <WizardBackButton
                            onClick={handleBack}
                            disabled={step === 1 || isLoading}
                          />
                          <WizardContinueButton
                            onClick={handleNext}
                            disabled={isLoading || (step === 1 && !launchType)}
                          />
                        </div>
                      ) : (
                        <>
                          <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            size="lg"
                            className="w-full"
                          >
                            {isLoading
                              ? "Processing..."
                              : "Connect Wallet & Pay"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={isLoading}
                            size="lg"
                            className="w-full"
                          >
                            Back
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Backward compatibility export
export { CreateChainWizard as CreateChainDialog };
