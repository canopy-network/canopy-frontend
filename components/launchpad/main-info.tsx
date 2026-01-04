"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { HelpCircle, Info, Check, Loader2 } from "lucide-react";
import { chainsApi } from "@/lib/api/chains";

// Toggle this to disable API validation when the API is unavailable
// TODO: TEMP - Set to true to bypass API validation for testing
const FORCE_ENABLE = true;

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
      decimals: string;
      description: string;
      halvingDays: string;
      blockTime: string;
    },
    isValid: boolean
  ) => void;
}

export default function MainInfo({ initialData, onDataSubmit }: MainInfoProps) {
  // TODO: TEMP - Default values for testing
  const [formData, setFormData] = useState({
    chainName: initialData?.chainName || "TestChain",
    tokenName: initialData?.tokenName || "TestToken",
    ticker: initialData?.ticker || "TEST",
    tokenSupply: initialData?.tokenSupply || "1000000000",
    decimals: initialData?.decimals || "18",
    description: initialData?.description || "",
    halvingDays: initialData?.halvingDays || "365",
    blockTime: initialData?.blockTime || "10",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  // Start with empty validation state - API validation will confirm availability
  const [validatedFields, setValidatedFields] = useState<
    Record<string, boolean>
  >({});
  const [validatingFields, setValidatingFields] = useState<
    Record<string, boolean>
  >({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // API validation for a single field (chain_name, token_name, or ticker)
  // Uses backend /api/v1/chains/validate endpoint
  const validateWithAPI = async (field: string, value: string) => {
    try {
      // Build params based on field being validated
      const params: { name?: string; symbol?: string; token_name?: string } = {};

      if (field === "chainName") {
        params.name = value;
      } else if (field === "tokenName") {
        params.token_name = value;
      } else if (field === "ticker") {
        params.symbol = value;
      } else {
        return {
          success: false,
          message: "Invalid field for validation",
        };
      }

      const response = await chainsApi.validateChainNames(params);

      // Map response field to availability
      let available = false;
      if (field === "chainName") {
        available = response.data?.name_available === true;
      } else if (field === "tokenName") {
        available = response.data?.token_name_available === true;
      } else if (field === "ticker") {
        available = response.data?.symbol_available === true;
      }

      return {
        success: available,
        message: available ? "Available" : "Already taken",
      };
    } catch (error) {
      console.error("Validation error:", error);
      return {
        success: false,
        message: "Unable to validate. Please check your connection.",
      };
    }
  };

  // Validate a specific field
  const validateField = async (field: string, value: string) => {
    const newErrors = { ...errors };
    delete newErrors[field];

    // Basic validation
    if (field === "chainName") {
      if (!value || value.length < 3) {
        newErrors.chainName = "Chain name must be at least 3 characters";
        setErrors(newErrors);
        setValidatedFields((prev) => ({ ...prev, chainName: false }));
        return false;
      }
    }

    if (field === "tokenName") {
      if (!value || value.length < 2) {
        newErrors.tokenName = "Token name must be at least 2 characters";
        setErrors(newErrors);
        setValidatedFields((prev) => ({ ...prev, tokenName: false }));
        return false;
      }
    }

    if (field === "ticker") {
      if (!value) {
        newErrors.ticker = "Ticker is required";
        setErrors(newErrors);
        setValidatedFields((prev) => ({ ...prev, ticker: false }));
        return false;
      } else if (value.length < 3 || value.length > 5) {
        newErrors.ticker = "Ticker must be 3-5 characters";
        setErrors(newErrors);
        setValidatedFields((prev) => ({ ...prev, ticker: false }));
        return false;
      }
    }

    if (field === "halvingDays") {
      if (!value || parseFloat(value) <= 0) {
        newErrors.halvingDays = "Halving schedule must be greater than 0";
        setErrors(newErrors);
        return false;
      }
    }

    // API validation for chain name, token name, and ticker
    if (field === "chainName" || field === "tokenName" || field === "ticker") {
      if (FORCE_ENABLE) {
        // Skip API validation, just mark as valid after basic validation passes
        setValidatedFields((prev) => ({ ...prev, [field]: true }));
      } else {
        // Perform API validation for the specific field only
        setValidatingFields((prev) => ({ ...prev, [field]: true }));

        const result = await validateWithAPI(field, value);

        setValidatingFields((prev) => ({ ...prev, [field]: false }));

        if (!result.success) {
          newErrors[field] = result.message;
          setErrors(newErrors);
          setValidatedFields((prev) => ({ ...prev, [field]: false }));
          return false;
        }

        setValidatedFields((prev) => ({ ...prev, [field]: true }));
      }
    }

    setErrors(newErrors);
    return true;
  };

  // Validate form
  const validateForm = useCallback(() => {
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

    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Notify parent when data changes
  useEffect(() => {
    if (onDataSubmit) {
      // When FORCE_ENABLE is true, skip API validation requirement
      const isValid = FORCE_ENABLE
        ? validateForm()
        : validateForm() &&
          validatedFields.chainName &&
          validatedFields.tokenName &&
          validatedFields.ticker;
      onDataSubmit(formData, isValid);
    }
  }, [formData, validateForm, onDataSubmit, validatedFields]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Clear existing timer for this field
    if (debounceTimers.current[field]) {
      clearTimeout(debounceTimers.current[field]);
    }

    // Clear validation state while typing
    setValidatedFields((prev) => ({ ...prev, [field]: false }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }

    // Set new timer to validate after 1 second of inactivity
    if (
      field === "chainName" ||
      field === "tokenName" ||
      field === "ticker" ||
      field === "halvingDays"
    ) {
      debounceTimers.current[field] = setTimeout(() => {
        validateField(field, value);
      }, 1000);
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  // Validate initial data on mount (e.g., when Populate button is pressed)
  useEffect(() => {
    const validateInitialData = async () => {
      if (initialData?.chainName && initialData.chainName.length >= 3) {
        setTouched((prev) => ({ ...prev, chainName: true }));
        await validateField("chainName", initialData.chainName);
      }
      if (initialData?.tokenName && initialData.tokenName.length >= 2) {
        setTouched((prev) => ({ ...prev, tokenName: true }));
        await validateField("tokenName", initialData.tokenName);
      }
      if (initialData?.ticker && initialData.ticker.length >= 3) {
        setTouched((prev) => ({ ...prev, ticker: true }));
        await validateField("ticker", initialData.ticker);
      }
    };
    validateInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate yearly minting based on block time and halving
  const calculateYearlyMinting = () => {
    if (!formData.blockTime || !formData.halvingDays) return "0";

    // Simplified calculation - assume 50% of default 1B supply in first year
    const defaultSupply = 1000000000;
    const yearlyMinting = Math.floor(defaultSupply * 0.5);
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
                        Example: &quot;Ethereum&quot;, &quot;Solana&quot;,
                        &quot;MyChain&quot;
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative">
                  <Input
                    id="chainName"
                    placeholder="Enter chain name"
                    value={formData.chainName}
                    onChange={(e) => updateField("chainName", e.target.value)}
                    className={
                      touched.chainName && errors.chainName
                        ? "border-destructive pr-10"
                        : validatedFields.chainName
                        ? "border-green-500 pr-10"
                        : ""
                    }
                  />
                  {validatingFields.chainName && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                  {!validatingFields.chainName && validatedFields.chainName && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
                {touched.chainName && errors.chainName && (
                  <p className="text-sm text-destructive">{errors.chainName}</p>
                )}
                {validatedFields.chainName && !errors.chainName && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Chain name is available
                  </p>
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
                        Example: &quot;Ether&quot;, &quot;Bitcoin&quot;,
                        &quot;MyToken&quot;
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative">
                  <Input
                    id="tokenName"
                    placeholder="Enter your token name"
                    value={formData.tokenName}
                    onChange={(e) => updateField("tokenName", e.target.value)}
                    className={
                      touched.tokenName && errors.tokenName
                        ? "border-destructive pr-10"
                        : validatedFields.tokenName
                        ? "border-green-500 pr-10"
                        : ""
                    }
                  />
                  {validatingFields.tokenName && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                  {!validatingFields.tokenName && validatedFields.tokenName && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
                {touched.tokenName && errors.tokenName && (
                  <p className="text-sm text-destructive">{errors.tokenName}</p>
                )}
                {validatedFields.tokenName && !errors.tokenName && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Token name is available
                  </p>
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
                        Example: &quot;ETH&quot;, &quot;BTC&quot;,
                        &quot;USDC&quot; (3-5 characters)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative">
                  <Input
                    id="ticker"
                    placeholder="Enter your ticker"
                    value={formData.ticker}
                    onChange={(e) => {
                      const upper = e.target.value.toUpperCase();
                      updateField("ticker", upper);
                    }}
                    maxLength={5}
                    className={
                      touched.ticker && errors.ticker
                        ? "border-destructive pr-10"
                        : validatedFields.ticker
                        ? "border-green-500 pr-10"
                        : ""
                    }
                  />
                  {validatingFields.ticker && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                  {!validatingFields.ticker && validatedFields.ticker && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
                {touched.ticker && errors.ticker && (
                  <p className="text-sm text-destructive">{errors.ticker}</p>
                )}
                {validatedFields.ticker && !errors.ticker && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Ticker is available
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Token Economics Group */}
            <div className="space-y-6">
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
                        Like Bitcoin&apos;s 4-year halving cycle. Enter days
                        between halvings.
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
                  className={
                    touched.halvingDays && errors.halvingDays
                      ? "border-destructive"
                      : ""
                  }
                />
                {touched.halvingDays && errors.halvingDays && (
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
