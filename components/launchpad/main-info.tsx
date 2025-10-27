"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface MainInfoProps {
  initialData?: {
    chainName?: string;
    tokenName?: string;
    ticker?: string;
    tokenSupply?: string;
    decimals?: string;
    description?: string;
  };
  onDataSubmit?: (
    data: {
      chainName: string;
      tokenName: string;
      ticker: string;
      tokenSupply: string;
      decimals: string;
      description: string;
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tickerAvailable, setTickerAvailable] = useState<boolean | null>(null);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.chainName || formData.chainName.length < 4) {
      newErrors.chainName = "Chain name must be at least 4 characters";
    }

    if (!formData.tokenName) {
      newErrors.tokenName = "Token name is required";
    }

    if (!formData.ticker) {
      newErrors.ticker = "Ticker is required";
    } else if (formData.ticker.length < 3 || formData.ticker.length > 6) {
      newErrors.ticker = "Ticker must be 3-6 characters";
    }

    if (!formData.tokenSupply || parseFloat(formData.tokenSupply) <= 0) {
      newErrors.tokenSupply = "Token supply must be greater than 0";
    }

    if (!formData.description || formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Notify parent when data changes
  useEffect(() => {
    if (onDataSubmit) {
      const isValid = validateForm();
      onDataSubmit(formData, isValid && tickerAvailable !== false);
    }
  }, [formData, tickerAvailable]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Mock ticker availability check
  const checkTickerAvailability = (ticker: string) => {
    if (ticker.length >= 3) {
      // Simulate API call
      setTimeout(() => {
        setTickerAvailable(true); // Mock: always available
      }, 500);
    } else {
      setTickerAvailable(null);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Main Information</h1>
          <p className="text-muted-foreground">
            Configure your chain and token details.
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Chain Name - Read Only */}
          <div className="border-2 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-normal">Chain Name</Label>
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
                Token Name
              </Label>
              <Input
                id="tokenName"
                placeholder="MyToken"
                value={formData.tokenName}
                onChange={(e) => updateField("tokenName", e.target.value)}
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
                  placeholder="MTK"
                  value={formData.ticker}
                  onChange={(e) => {
                    const upper = e.target.value.toUpperCase();
                    updateField("ticker", upper);
                    checkTickerAvailability(upper);
                  }}
                  className={`text-right border-0 shadow-none focus-visible:ring-0 text-base font-medium pr-8 ${
                    errors.ticker ? "text-destructive" : ""
                  }`}
                  maxLength={6}
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
              <p className="text-xs text-destructive mt-2">{errors.ticker}</p>
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
                type="number"
                onChange={(e) => updateField("tokenSupply", e.target.value)}
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

          {/* Description */}
          <div className="border-2 rounded-lg p-6">
            <Label
              htmlFor="description"
              className="text-base font-semibold mb-4 block"
            >
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your chain in a few sentences..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="min-h-[120px] resize-none border-0 shadow-none focus-visible:ring-0 p-0"
              rows={5}
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-2">
                {errors.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
