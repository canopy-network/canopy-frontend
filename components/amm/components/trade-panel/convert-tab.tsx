"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDown } from "lucide-react";

interface ConvertTabProps {
  baseTokenSymbol: string;
  quoteTokenSymbol: string;
  currentPrice: string;
}

export function ConvertTab({
  baseTokenSymbol,
  quoteTokenSymbol,
  currentPrice,
}: ConvertTabProps) {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isReversed, setIsReversed] = useState(false);

  const fromToken = isReversed ? "USD" : "CNPY";
  const toToken = isReversed ? "CNPY" : "USD";

  const handleSwapDirection = () => {
    setIsReversed(!isReversed);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      // Placeholder calculation - should be replaced with actual conversion logic
      const calculated = (parseFloat(value) * 0.7).toFixed(6);
      setToAmount(calculated);
    } else {
      setToAmount("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary" />
            <div>
              <div className="font-medium text-sm">{fromToken}</div>
              <div className="text-xs text-muted-foreground">
                Balance: 0.00
              </div>
            </div>
          </div>
          <div className="text-right">
            <Input
              type="number"
              placeholder="0"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              variant="wallet"
              className="text-4xl font-semibold text-right w-40 h-auto p-0 bg-transparent!"
            />
            <div className="text-xs text-muted-foreground">$0.00</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center -my-4 relative z-10">
        <div className="bg-black rounded-2xl p-1">
          <Button
            size="icon"
            className="rounded-inherit h-10 w-10 bg-muted/90 text-white border-0"
            onClick={handleSwapDirection}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-secondary" />
            <div>
              <div className="font-medium text-sm">{toToken}</div>
              <div className="text-xs text-muted-foreground">
                Balance: 0.00
              </div>
            </div>
          </div>
          <div className="text-right">
            <Input
              type="number"
              placeholder="0"
              value={toAmount}
              readOnly
              variant="wallet"
              className="text-4xl font-semibold text-right w-40 h-auto p-0 bg-transparent!"
            />
            <div className="text-xs text-muted-foreground">$0.00</div>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm mt-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Conversion Rate</span>
          <span className="font-medium">1 CNPY = 0.70 USD</span>
        </div>
      </div>

      <Button size="lg" className="w-full mt-4 bg-[#30B724] hover:bg-[#30B724]/90 text-black">
        Convert
      </Button>
    </div>
  );
}
