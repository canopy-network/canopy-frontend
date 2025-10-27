"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info } from "lucide-react";

const BLOCK_TIME_OPTIONS = [
  { value: "5", label: "5 seconds" },
  { value: "10", label: "10 seconds" },
  { value: "15", label: "15 seconds" },
  { value: "30", label: "30 seconds" },
  { value: "60", label: "1 minute" },
];

interface MainInfoProps {
  initialData?: {
    chainName?: string;
    tokenName?: string;
    ticker?: string;
    tokenSupply?: string;
    decimals?: string;
    description?: string;
    halvingDays?: string;
    blockTime?: string;
  };
  onDataSubmit?: (
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
  ) => void;
}

export default function MainInfo({ initialData, onDataSubmit }: MainInfoProps) {
  const [formData, setFormData] = useState({
    chainName: initialData?.chainName || "",
    tokenName: initialData?.tokenName || "",
    ticker: initialData?.ticker || "",
    tokenSupply: initialData?.tokenSupply || "1000000000",
    decimals: initialData?.decimals || "18",
    description: initialData?.description || "",
    halvingDays: initialData?.halvingDays || "365",
    blockTime: initialData?.blockTime || "10",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.chainName || formData.chainName.length < 3) {
      newErrors.chainName = "Chain name must be at least 3 characters";
    }

    if (!formData.tokenName || formData.tokenName.length < 2) {
      newErrors.tokenName = "Token name must be at least 2 characters";
    }

    if (!formData.ticker) {
      newErrors.ticker = "Ticker is required";
    } else if (formData.ticker.length < 3 || formData.ticker.length > 5) {
      newErrors.ticker = "Ticker must be 3-5 characters";
    }

    if (!formData.halvingDays || parseFloat(formData.halvingDays) <= 0) {
      newErrors.halvingDays = "Halving schedule must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Notify parent when data changes
  useEffect(() => {
    if (onDataSubmit) {
      const isValid = validateForm();
      onDataSubmit(formData, isValid);
    }
  }, [formData]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate yearly minting based on block time and halving
  const calculateYearlyMinting = () => {
    if (!formData.blockTime || !formData.halvingDays) return "0";

    const blocksPerDay = Math.floor(
      (24 * 60 * 60) / parseInt(formData.blockTime)
    );
    const blocksPerYear = blocksPerDay * 365;
    const halvingBlocks = blocksPerDay * parseInt(formData.halvingDays);

    // Simplified calculation - assume 50% of total supply in first year
    const yearlyMinting = Math.floor(parseInt(formData.tokenSupply) * 0.5);
    return yearlyMinting.toLocaleString();
  };

  return (
    <TooltipProvider>
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Configure your chain & token</h1>
            <p className="text-muted-foreground">
              Set up the core parameters for your blockchain network
            </p>
          </div>

          {/* Form */}
          <div className="space-y-8">
            {/* Basic Info Group */}
            <div className="space-y-6">
              {/* Chain Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="chainName"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  Chain Name
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The name of your blockchain network</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Example: "Ethereum", "Solana", "MyChain"
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="chainName"
                  placeholder="Enter chain name"
                  value={formData.chainName}
                  onChange={(e) => updateField("chainName", e.target.value)}
                  className={errors.chainName ? "border-destructive" : ""}
                />
                {errors.chainName && (
                  <p className="text-sm text-destructive">{errors.chainName}</p>
                )}
              </div>

              {/* Token Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="tokenName"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  Token Name
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The full name of your native token</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Example: "Ether", "Bitcoin", "MyToken"
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="tokenName"
                  placeholder="Enter your token name"
                  value={formData.tokenName}
                  onChange={(e) => updateField("tokenName", e.target.value)}
                  className={errors.tokenName ? "border-destructive" : ""}
                />
                {errors.tokenName && (
                  <p className="text-sm text-destructive">{errors.tokenName}</p>
                )}
              </div>

              {/* Ticker */}
              <div className="space-y-2">
                <Label
                  htmlFor="ticker"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  Ticker
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The trading symbol for your token</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Example: "ETH", "BTC", "USDC" (3-5 characters)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="ticker"
                  placeholder="Enter your ticker"
                  value={formData.ticker}
                  onChange={(e) => {
                    const upper = e.target.value.toUpperCase();
                    updateField("ticker", upper);
                  }}
                  maxLength={5}
                  className={errors.ticker ? "border-destructive" : ""}
                />
                {errors.ticker && (
                  <p className="text-sm text-destructive">{errors.ticker}</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Token Economics Group */}
            <div className="space-y-6">
              {/* Token Supply */}
              <div className="space-y-2">
                <Label
                  htmlFor="tokenSupply"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  Token Supply
                </Label>
                <Input
                  id="tokenSupply"
                  type="number"
                  value={formData.tokenSupply}
                  readOnly
                  disabled
                  className="bg-muted opacity-75 cursor-not-allowed"
                />
                <p className="text-sm text-muted-foreground">
                  The total number of tokens that will ever exist.
                </p>
              </div>

              {/* Halving Schedule */}
              <div className="space-y-2">
                <Label
                  htmlFor="halvingDays"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  Halving Schedule (days)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Halving reduces mining rewards by 50% at set intervals
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Like Bitcoin's 4-year halving cycle. Enter days between
                        halvings.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="halvingDays"
                  type="number"
                  placeholder="365"
                  value={formData.halvingDays}
                  onChange={(e) => updateField("halvingDays", e.target.value)}
                  className={errors.halvingDays ? "border-destructive" : ""}
                />
                {errors.halvingDays && (
                  <p className="text-sm text-destructive">
                    {errors.halvingDays}
                  </p>
                )}
              </div>

              {/* Block Time */}
              <div className="space-y-2">
                <Label
                  htmlFor="blockTime"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  Block Time
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Time between new blocks being added to the chain</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Bitcoin: ~10 min, Ethereum: ~12 sec. Faster = more
                        transactions.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select
                  value={formData.blockTime}
                  onValueChange={(value) => updateField("blockTime", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select block time" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOCK_TIME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary Card */}
            <Card className="p-6 bg-muted/50">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold">Network Summary</h3>
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Block Time:</span>
                    <span className="font-medium">
                      {BLOCK_TIME_OPTIONS.find(
                        (opt) => opt.value === formData.blockTime
                      )?.label || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Blocks per Day:
                    </span>
                    <span className="font-medium">
                      {formData.blockTime
                        ? Math.floor(
                            (24 * 60 * 60) / parseInt(formData.blockTime)
                          ).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Halving Schedule:
                    </span>
                    <span className="font-medium">
                      {formData.halvingDays
                        ? `Every ${formData.halvingDays} days`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Est. Tokens Minted (Year 1):
                    </span>
                    <span className="font-medium">
                      ~{calculateYearlyMinting()} {formData.ticker || "tokens"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
