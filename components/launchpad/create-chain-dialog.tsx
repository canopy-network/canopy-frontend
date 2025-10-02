"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useCreateChainDialog } from "@/lib/stores/use-create-chain-dialog";

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

const templateParamsSchema = z.discriminatedUnion("template", [
  z.object({
    template: z.literal("rust"),
    tokenSupply: z.number().min(1000000).max(1000000000000),
    decimals: z.number().min(6).max(18),
  }),
  z.object({
    template: z.literal("kotlin"),
    tokenSupply: z.number().min(1000000).max(1000000000000),
    decimals: z.number().min(6).max(18),
  }),
  z.object({
    template: z.literal("go"),
    tokenSupply: z.number().min(1000000).max(1000000000000),
    decimals: z.number().min(6).max(18),
  }),
  z.object({
    template: z.literal("selenium"),
    tokenSupply: z.number().min(1000000).max(1000000000000),
    decimals: z.number().min(6).max(18),
  }),
  z.object({
    template: z.literal("javascript"),
    tokenSupply: z.number().min(1000000).max(1000000000000),
    decimals: z.number().min(6).max(18),
  }),
]);

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
// TEMPLATES
// ============================================================================

const templates = [
  {
    id: "rust",
    name: "Rust",
    estimatedCost: "100 CNPY",
  },
  {
    id: "kotlin",
    name: "Kotlin",
    estimatedCost: "100 CNPY",
  },
  {
    id: "go",
    name: "Go",
    estimatedCost: "100 CNPY",
  },
  {
    id: "selenium",
    name: "Selenium",
    estimatedCost: "100 CNPY",
  },
  {
    id: "javascript",
    name: "JavaScript",
    estimatedCost: "100 CNPY",
  },
];

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

async function getTemplates() {
  // TODO: Implement actual API call
  // const response = await fetch('/api/templates');
  // return response.json();
  console.log("Fetching templates");
  return templates;
}

async function uploadFile(
  file: File
): Promise<{ url: string; mime: string; width?: number; height?: number }> {
  // TODO: Implement actual file upload
  // const formData = new FormData();
  // formData.append('file', file);
  // const response = await fetch('/api/uploads', { method: 'POST', body: formData });
  // return response.json();
  console.log("Uploading file:", file.name);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    url: URL.createObjectURL(file),
    mime: file.type,
    width: 1000,
    height: 1000,
  };
}

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

async function createProject(
  data: any
): Promise<{ projectId: string; txData?: any }> {
  // TODO: Implement actual API call
  // const response = await fetch('/api/projects', {
  //   method: 'POST',
  //   body: JSON.stringify(data),
  // });
  // return response.json();
  console.log("Creating project:", data);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    projectId: "project-" + Date.now(),
    txData: null,
  };
}

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

type TemplateId = "rust" | "kotlin" | "go" | "selenium" | "javascript";

interface FormData {
  // Step 1
  chainName: string;
  ticker: string;
  description: string;

  // Step 2
  template: TemplateId | "";
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
  promoVideo: File | null;
  banner: File | null;

  // Step 5
  launchDate: string;
  timezone: string;
  launchImmediately: boolean;

  // Step 6
  riskAcknowledgment: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CreateChainDialog() {
  const { isOpen, setOpen } = useCreateChainDialog();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [tickerAvailable, setTickerAvailable] = useState<boolean | null>(null);
  const [bondingQuote, setBondingQuote] = useState<{
    tokensOut: number;
    pricePerToken: number;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    // Step 1
    chainName: "",
    ticker: "",
    description: "",

    // Step 2
    template: "",
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
    promoVideo: null,
    banner: null,

    // Step 5
    launchDate: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    launchImmediately: false,

    // Step 6
    riskAcknowledgment: false,
  });

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
          const result = step1Schema.safeParse({
            chainName: formData.chainName,
            ticker: formData.ticker,
            description: formData.description,
            logo: formData.logo,
            promoVideo: formData.promoVideo || undefined,
            banner: formData.banner || undefined,
          });

          if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
              newErrors[err.path[0] as string] = err.message;
            });
            setErrors(newErrors);
            return false;
          }

          // Check ticker availability
          const available = await checkTickerAvailability(formData.ticker);
          if (!available) {
            setErrors({ ticker: "Ticker is already taken" });
            return false;
          }

          // Validate logo dimensions
          if (formData.logo) {
            const img = new Image();
            const url = URL.createObjectURL(formData.logo);
            await new Promise((resolve, reject) => {
              img.onload = () => {
                if (img.width < 1000 || img.height < 1000) {
                  setErrors({ logo: "Logo must be at least 1000x1000 pixels" });
                  reject();
                } else {
                  resolve(true);
                }
                URL.revokeObjectURL(url);
              };
              img.onerror = reject;
              img.src = url;
            }).catch(() => false);

            if (errors.logo) return false;
          }

          return true;
        }

        case 2: {
          if (!formData.template) {
            setErrors({ template: "Please select a template" });
            return false;
          }

          const params: any = {
            template: formData.template,
            tokenSupply: Number(formData.tokenSupply),
            decimals: Number(formData.decimals),
          };

          // All language templates use the same base parameters

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

          return true;
        }

        case 4: {
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

        case 5: {
          const result = step6Schema.safeParse({
            riskAcknowledgment: formData.riskAcknowledgment,
          });

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
    if (isValid && step < 5) {
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
      const isValid = await validateStep(5);
      if (!isValid) {
        setIsLoading(false);
        return;
      }

      // Upload files
      let logoUrl = "";
      let videoUrl = "";
      let bannerUrl = "";

      if (formData.logo) {
        const result = await uploadFile(formData.logo);
        logoUrl = result.url;
      }

      if (formData.promoVideo) {
        const result = await uploadFile(formData.promoVideo);
        videoUrl = result.url;
      }

      if (formData.banner) {
        const result = await uploadFile(formData.banner);
        bannerUrl = result.url;
      }

      // Prepare project data
      const projectData = {
        chainName: formData.chainName,
        ticker: formData.ticker,
        description: formData.description,
        template: formData.template,
        tokenSupply: Number(formData.tokenSupply),
        decimals: Number(formData.decimals),
        githubRepo: formData.githubRepo,
        website: formData.website,
        whitepaper: formData.whitepaper,
        twitterUrl: formData.twitterUrl,
        telegramUrl: formData.telegramUrl,
        logoUrl,
        videoUrl,
        bannerUrl,
        launchDate: formData.launchImmediately
          ? new Date()
          : new Date(formData.launchDate),
        launchImmediately: formData.launchImmediately,
      };

      // Check allowance and approve if needed
      const userAddress = "0x0000000000000000000000000000000000000000"; // TODO: Get from wallet
      const totalCost = 100; // Only creation fee, no pre-purchase
      const allowance = await checkAllowance(userAddress);

      if (allowance < totalCost) {
        await approveCNPY(totalCost);
      }

      // Create project
      const result = await createProject(projectData);

      // Send transaction if needed
      if (result.txData) {
        await sendCreateChainTransaction(result.txData);
      }

      console.log("Project created successfully:", result.projectId);

      // Reset and close
      setOpen(false);
      setStep(1);
      setFormData({
        chainName: "",
        ticker: "",
        description: "",
        template: "",
        tokenSupply: "1000000000",
        decimals: "18",
        githubRepo: "",
        website: "",
        whitepaper: "",
        whitepaperFile: null,
        twitterUrl: "",
        telegramUrl: "",
        logo: null,
        promoVideo: null,
        banner: null,
        launchDate: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        launchImmediately: false,
        riskAcknowledgment: false,
      });
    } catch (error) {
      console.error("Error creating chain:", error);
      setErrors({ submit: "Failed to create chain. Please try again." });
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

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Launch New Chain
          </DialogTitle>
          <DialogDescription>
            Create and deploy your own blockchain in 5 simple steps
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div key={stepNum} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step >= stepNum
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stepNum}
                  </div>
                  <span className="text-xs mt-1 hidden md:block">
                    {stepNum === 1 && "Basics & Assets"}
                    {stepNum === 2 && "Template"}
                    {stepNum === 3 && "Links"}
                    {stepNum === 4 && "Schedule"}
                    {stepNum === 5 && "Review"}
                  </span>
                </div>
                {stepNum < 5 && (
                  <div
                    className={`h-px flex-1 transition-colors ${
                      step > stepNum ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {errors.submit && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {errors.submit}
            </div>
          )}

          {/* Step 1: Basics & Assets */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Chain Basics & Assets
                </h3>
                <p className="text-muted-foreground text-sm">
                  Define your chain's core identity and upload visual assets
                </p>
              </div>

              {/* Basic Info - Original Layout */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="chainName">Chain Name *</Label>
                  <Input
                    id="chainName"
                    placeholder="My Awesome Chain"
                    value={formData.chainName}
                    onChange={(e) => handleChainNameChange(e.target.value)}
                    className={errors.chainName ? "border-destructive" : ""}
                  />
                  {errors.chainName && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.chainName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="ticker">Ticker Symbol *</Label>
                  <div className="relative">
                    <Input
                      id="ticker"
                      placeholder="AWSM"
                      value={formData.ticker}
                      onChange={(e) => handleTickerChange(e.target.value)}
                      className={errors.ticker ? "border-destructive" : ""}
                      maxLength={8}
                    />
                    {tickerAvailable === true && (
                      <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                    )}
                    {tickerAvailable === false && (
                      <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-destructive" />
                    )}
                  </div>
                  {errors.ticker && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.ticker}
                    </p>
                  )}
                  {tickerAvailable === false && !errors.ticker && (
                    <p className="text-xs text-destructive mt-1">
                      Ticker already taken
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">
                    Tagline * (Keep it short and punchy)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., Twitter for crypto, or DeFi for the masses"
                    value={formData.description}
                    onChange={(e) =>
                      updateFormData({ description: e.target.value })
                    }
                    className={errors.description ? "border-destructive" : ""}
                    rows={2}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.description && (
                      <p className="text-xs text-destructive">
                        {errors.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">
                      {formData.description.length}/250
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Assets - 3 Column Grid */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* Logo Upload */}
                <div>
                  <Label htmlFor="logo">
                    Logo * (Square, ≥1000×1000px, ≤15MB)
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-accent/50 transition-colors">
                    {formData.logo ? (
                      <div className="space-y-2">
                        <img
                          src={URL.createObjectURL(formData.logo)}
                          alt="Logo preview"
                          className="w-24 h-24 rounded-lg object-cover border mx-auto"
                        />
                        <p className="text-sm text-muted-foreground">
                          {formData.logo.name}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateFormData({ logo: null })}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drop your logo here
                        </p>
                        <Input
                          id="logo"
                          type="file"
                          accept="image/jpeg,image/png,image/gif"
                          onChange={(e) =>
                            updateFormData({
                              logo: e.target.files?.[0] || null,
                            })
                          }
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("logo")?.click()
                          }
                        >
                          Choose Logo
                        </Button>
                      </div>
                    )}
                  </div>
                  {errors.logo && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.logo}
                    </p>
                  )}
                </div>

                {/* Video Upload */}
                <div>
                  <Label htmlFor="promoVideo">Promo Video (MP4, ≤30MB)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-accent/50 transition-colors">
                    {formData.promoVideo ? (
                      <div className="space-y-2">
                        <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {formData.promoVideo.name}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateFormData({ promoVideo: null })}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drop video here
                        </p>
                        <Input
                          id="promoVideo"
                          type="file"
                          accept="video/mp4"
                          onChange={(e) =>
                            updateFormData({
                              promoVideo: e.target.files?.[0] || null,
                            })
                          }
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("promoVideo")?.click()
                          }
                        >
                          Choose Video
                        </Button>
                      </div>
                    )}
                  </div>
                  {errors.promoVideo && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.promoVideo}
                    </p>
                  )}
                </div>

                {/* Banner Upload */}
                <div>
                  <Label htmlFor="banner">Banner (16:9 ratio, ≤15MB)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-accent/50 transition-colors">
                    {formData.banner ? (
                      <div className="space-y-2">
                        <img
                          src={URL.createObjectURL(formData.banner)}
                          alt="Banner preview"
                          className="w-full h-20 rounded-lg object-cover border"
                        />
                        <p className="text-sm text-muted-foreground">
                          {formData.banner.name}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateFormData({ banner: null })}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drop banner here
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Recommended: 1920×1080px
                        </p>
                        <Input
                          id="banner"
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={(e) =>
                            updateFormData({
                              banner: e.target.files?.[0] || null,
                            })
                          }
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("banner")?.click()
                          }
                        >
                          Choose Banner
                        </Button>
                      </div>
                    )}
                  </div>
                  {errors.banner && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.banner}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Template & Parameters */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Template & Configuration
                </h3>
                <p className="text-muted-foreground text-sm">
                  Choose a template and configure chain parameters
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      formData.template === template.id
                        ? "ring-2 ring-primary shadow-md"
                        : "hover:bg-accent/50"
                    }`}
                    onClick={() =>
                      updateFormData({ template: template.id as TemplateId })
                    }
                  >
                    <CardHeader>
                      <CardTitle className="text-base">
                        {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Est. Cost:
                        </span>
                        <span className="font-medium">
                          {template.estimatedCost}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {formData.template && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Chain Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="tokenSupply">Token Supply *</Label>
                        <Input
                          id="tokenSupply"
                          type="number"
                          placeholder="1000000000"
                          value={formData.tokenSupply}
                          onChange={(e) =>
                            updateFormData({ tokenSupply: e.target.value })
                          }
                          className={
                            errors.tokenSupply ? "border-destructive" : ""
                          }
                        />
                        {errors.tokenSupply && (
                          <p className="text-xs text-destructive mt-1">
                            {errors.tokenSupply}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="decimals">Decimals *</Label>
                        <Select
                          value={formData.decimals}
                          onValueChange={(value) =>
                            updateFormData({ decimals: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[6, 8, 12, 18].map((d) => (
                              <SelectItem key={d} value={d.toString()}>
                                {d} decimals
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Integrations & Proof */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Integrations & Verification
                </h3>
                <p className="text-muted-foreground text-sm">
                  Connect your project's web presence and documentation
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label
                    htmlFor="githubRepo"
                    className="flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    GitHub Repository *
                  </Label>
                  <Input
                    id="githubRepo"
                    placeholder="https://github.com/username/repo"
                    value={formData.githubRepo}
                    onChange={(e) =>
                      updateFormData({ githubRepo: e.target.value })
                    }
                    className={errors.githubRepo ? "border-destructive" : ""}
                  />
                  {errors.githubRepo && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.githubRepo}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="website" className="flex items-center gap-2">
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
                    className={errors.website ? "border-destructive" : ""}
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
                    className={errors.whitepaper ? "border-destructive" : ""}
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
                    className={errors.twitterUrl ? "border-destructive" : ""}
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
                    className={errors.telegramUrl ? "border-destructive" : ""}
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

          {/* Step 4: Schedule */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Launch Schedule</h3>
                <p className="text-muted-foreground text-sm">
                  Choose when your chain goes live
                </p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label htmlFor="launchImmediately" className="text-base">
                        Launch Immediately
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Chain goes live right after creation
                      </p>
                    </div>
                    <Switch
                      id="launchImmediately"
                      checked={formData.launchImmediately}
                      onCheckedChange={(checked) =>
                        updateFormData({ launchImmediately: checked })
                      }
                    />
                  </div>

                  {!formData.launchImmediately && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label
                          htmlFor="launchDate"
                          className="flex items-center gap-2"
                        >
                          <Calendar className="h-4 w-4" />
                          Launch Date & Time *
                        </Label>
                        <Input
                          id="launchDate"
                          type="datetime-local"
                          value={formData.launchDate}
                          onChange={(e) =>
                            updateFormData({ launchDate: e.target.value })
                          }
                          className={
                            errors.launchDate ? "border-destructive" : ""
                          }
                          min={new Date(Date.now() + 10 * 60 * 1000)
                            .toISOString()
                            .slice(0, 16)}
                        />
                        {errors.launchDate && (
                          <p className="text-xs text-destructive mt-1">
                            {errors.launchDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input
                          id="timezone"
                          value={formData.timezone}
                          disabled
                          className="bg-muted"
                        />
                      </div>

                      {formData.launchDate && (
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">
                            Scheduled Launch
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(formData.launchDate).toLocaleString(
                              undefined,
                              {
                                dateStyle: "full",
                                timeStyle: "long",
                              }
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Review & Create */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Review & Create</h3>
                <p className="text-muted-foreground text-sm">
                  Review your chain configuration before launch
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    {formData.chainName}
                  </CardTitle>
                  <CardDescription>{formData.ticker}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{formData.description}</p>

                  <Separator />

                  <div className="grid gap-3 md:grid-cols-2 text-sm">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        Template
                      </Label>
                      <p className="font-medium">
                        {
                          templates.find((t) => t.id === formData.template)
                            ?.name
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        Token Supply
                      </Label>
                      <p className="font-medium">
                        {Number(formData.tokenSupply).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        Decimals
                      </Label>
                      <p className="font-medium">{formData.decimals}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        Website
                      </Label>
                      <p className="font-medium truncate">{formData.website}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        GitHub
                      </Label>
                      <p className="font-medium truncate">
                        {formData.githubRepo}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        Launch
                      </Label>
                      <p className="font-medium">
                        {formData.launchImmediately
                          ? "Immediately"
                          : new Date(formData.launchDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Creation Fee
                      </span>
                      <span className="font-medium">100 CNPY</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total Cost</span>
                      <span className="text-lg">100 CNPY</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-amber-900 dark:text-amber-100">
                        Risk Acknowledgment
                      </p>
                      <p className="text-amber-800 dark:text-amber-200">
                        Tokens launch in a virtual bonding curve pool. There is
                        no external liquidity guarantee. Chain parameters are
                        immutable after creation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      id="riskAcknowledgment"
                      checked={formData.riskAcknowledgment}
                      onCheckedChange={(checked) =>
                        updateFormData({ riskAcknowledgment: checked })
                      }
                    />
                    <Label
                      htmlFor="riskAcknowledgment"
                      className="text-sm cursor-pointer"
                    >
                      I understand and acknowledge the risks
                    </Label>
                  </div>
                  {errors.riskAcknowledgment && (
                    <p className="text-xs text-destructive">
                      {errors.riskAcknowledgment}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || isLoading}
            >
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              {step < 5 ? (
                <Button onClick={handleNext} disabled={isLoading}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !formData.riskAcknowledgment}
                >
                  {isLoading ? "Creating..." : "Create Chain"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
