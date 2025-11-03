"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Edit, Github, Globe, Linkedin } from "lucide-react";
import { useCreateChainStore } from "@/lib/stores/create-chain-store";

// Social platform icons
const TwitterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const MediumIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
  </svg>
);

const RedditIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

interface ReviewPaymentProps {
  formData: {
    template: { template_name: string; supported_language?: string } | null;
    githubRepo: string;
    githubRepoData: {
      fullName: string;
    } | null;
    chainName: string;
    tokenName: string;
    ticker: string;
    tokenSupply: string;
    decimals: string;
    halvingDays: string;
    blockTime: string;
    logo: File | null;
    chainDescription: string;
    gallery: File[];
    brandColor: string;
    socialLinks: Array<{
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
    graduationThreshold: number;
    initialPurchaseAmount: string;
    launchImmediately: boolean;
    launchDate: string;
    launchTime: string;
  };
}

export default function ReviewPayment({ formData }: ReviewPaymentProps) {
  const { setCurrentStep } = useCreateChainStore();
  const [logoUrl, setLogoUrl] = useState<string>("");

  // Create and cleanup object URL for logo preview
  useEffect(() => {
    if (formData.logo) {
      const url = URL.createObjectURL(formData.logo);
      setLogoUrl(url);

      // Cleanup
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [formData.logo]);

  const handleEdit = (step: number) => {
    setCurrentStep(step);
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "website":
        return <Globe className="w-4 h-4" />;
      case "twitter":
        return <TwitterIcon />;
      case "telegram":
        return <TelegramIcon />;
      case "discord":
        return <DiscordIcon />;
      case "github":
        return <Github className="w-4 h-4" />;
      case "medium":
        return <MediumIcon />;
      case "reddit":
        return <RedditIcon />;
      case "linkedin":
        return <Linkedin className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const creationFee = 100;
  const initialPurchase = parseFloat(formData.initialPurchaseAmount || "0");
  const total = creationFee + initialPurchase;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Review your configuration</h1>
          <p className="text-muted-foreground">
            Review all details before launching your chain
          </p>
        </div>

        {/* Language & Repository Card */}
        <Card className="p-6 bg-card">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">Language & Repository</h2>
                <p className="text-sm text-muted-foreground">
                  Template and source code
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(1)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Language:</div>
              <div className="font-medium">
                {formData.template?.supported_language || "N/A"}
              </div>

              {formData.githubRepoData && (
                <div className="flex items-center gap-2 text-sm">
                  <Github className="w-4 h-4" />
                  <span>{formData.githubRepoData.fullName}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Chain Details Card */}
        <Card className="p-6 bg-card">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">Chain Details</h2>
                <p className="text-sm text-muted-foreground">
                  Core configuration
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(3)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-8">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Chain Name
                </div>
                <div className="font-medium">{formData.chainName}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Token Name
                </div>
                <div className="font-medium">{formData.tokenName}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Ticker</div>
                <div className="font-medium">{formData.ticker}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Supply</div>
                <div className="font-medium">
                  {Number(formData.tokenSupply).toLocaleString()}{" "}
                  {formData.ticker}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Halving Schedule
                </div>
                <div className="font-medium">
                  Every {formData.halvingDays} days
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Block Time
                </div>
                <div className="font-medium">{formData.blockTime} seconds</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Branding & Media Card */}
        <Card className="p-6 bg-card">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">Branding & Media</h2>
                <p className="text-sm text-muted-foreground">Visual identity</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(4)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </div>

            <div className="space-y-4">
              {formData.logo && logoUrl && (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Brand Color
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: formData.brandColor }}
                      />
                      <span className="font-medium">{formData.brandColor}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Description
                </div>
                <p className="text-sm">
                  {formData.chainDescription ||
                    "A detailed description of your blockchain's purpose and features."}
                </p>
              </div>

              {formData.gallery.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Gallery
                  </div>
                  <div className="text-sm">
                    {formData.gallery.length}{" "}
                    {formData.gallery.length === 1 ? "item" : "items"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Links & Documentation Card */}
        <Card className="p-6 bg-card">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">Links & Documentation</h2>
                <p className="text-sm text-muted-foreground">Social presence</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(5)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Social Links
              </div>
              <div className="space-y-2">
                {formData.socialLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    {getPlatformIcon(link.platform)}
                    <span className="font-medium capitalize">
                      {link.platform}:
                    </span>
                    <span className="text-muted-foreground">{link.url}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Launch Settings Card */}
        <Card className="p-6 bg-card">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">Launch Settings</h2>
                <p className="text-sm text-muted-foreground">
                  Graduation and initial purchase
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(6)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Graduation Threshold
                </div>
                <div className="font-medium">
                  ${formData.graduationThreshold.toLocaleString()} market cap
                </div>
              </div>

              {formData.initialPurchaseAmount &&
                parseFloat(formData.initialPurchaseAmount) > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Initial Purchase
                    </div>
                    <div className="font-medium">
                      {formData.initialPurchaseAmount} CNPY
                    </div>
                    <div className="text-sm text-muted-foreground">
                      You will receive{" "}
                      {Math.floor(
                        parseFloat(formData.initialPurchaseAmount) * 0.25
                      ).toLocaleString()}{" "}
                      ${formData.ticker}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </Card>

        {/* Payment Summary */}
        <Card className="p-8 bg-card">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Payment Summary</h2>

            <div className="space-y-4 text-lg">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Creation Fee:</span>
                <span className="font-medium text-foreground">
                  {creationFee} CNPY
                </span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span>Initial Purchase:</span>
                <span className="font-medium text-foreground">
                  {initialPurchase} CNPY
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-xl font-bold">
                <span>Total:</span>
                <span>{total} CNPY</span>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-rounded-xl border text-card-foreground shadow mt-6 p-4 bg-background border-primary/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Important</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Starts as virtual chain (test mode)</li>
                <li>
                  • Becomes real at $
                  {formData.graduationThreshold.toLocaleString()} market cap
                </li>
                <li>• Settings cannot be changed after launch</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
