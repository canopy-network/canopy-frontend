"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowDown, RefreshCw, Settings2, User, Clock } from "lucide-react";

enum PriorityFee {
  Eco = "eco",
  Fast = "fast",
  Turbo = "turbo",
}

const PRIORITY_FEES = [
  { label: "Eco", value: PriorityFee.Eco },
  { label: "Fast", value: PriorityFee.Fast },
  { label: "Turbo", value: PriorityFee.Turbo },
] as const;

interface SwapTabProps {
  baseTokenSymbol: string;
  quoteTokenSymbol: string;
  currentPrice: string;
}

export function SwapTab({
  baseTokenSymbol,
  quoteTokenSymbol,
  currentPrice,
}: SwapTabProps) {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isReversed, setIsReversed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  const [customSlippage, setCustomSlippage] = useState("");
  const [priorityFee, setPriorityFee] = useState<PriorityFee>(PriorityFee.Fast);

  const fromToken = isReversed ? quoteTokenSymbol : baseTokenSymbol;
  const toToken = isReversed ? baseTokenSymbol : quoteTokenSymbol;

  const handleSwapDirection = () => {
    setIsReversed(!isReversed);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const price = parseFloat(currentPrice);
      const amount = parseFloat(value);
      const calculated = isReversed
        ? (amount / price).toFixed(6)
        : (amount * price).toFixed(6);
      setToAmount(calculated);
    } else {
      setToAmount("");
    }
  };

  const handlePriorityFeeChange = (fee: PriorityFee) => {
    setPriorityFee(fee);
  };

  return (
    <>
      <div className="space-y-3">
        <div className="rounded-lg border bg-muted/50 p-4 h-60 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary" />
              <span className="font-medium">{fromToken}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 text-sm bg-[#292929] hover:bg-[#292929]/80"
            >
              Use Max
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Input
              type="number"
              placeholder="$0"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              variant="wallet"
              className="text-6xl! placeholder:text-6xl font-semibold text-center w-full h-full! p-0 bg-transparent! placeholder:text-muted-foreground/50"
            />
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
                className="text-5xl font-semibold text-right w-40 h-auto p-0 bg-transparent!"
              />
              <div className="text-xs text-muted-foreground">$0.00</div>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full mt-4 bg-[#30B724] hover:bg-[#30B724]/90 text-black"
        >
          Continue
        </Button>

        <div className="flex items-center justify-between text-sm mt-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              1 {fromToken} = {currentPrice} {toToken}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{slippage}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-2xl min-h-[400px] bg-[#171717]">
          <DialogHeader>
            <DialogTitle className="border-b border-dashed pb-3">
              Swap Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-medium">Slippage Tolerance</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Price protection for your swap. If prices move beyond your set
                percentage during processing, the transaction cancels
                automatically.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    slippage === "auto"
                      ? "bg-[#1B2D1C] text-[#8CEC8D]"
                      : "bg-[#2E2F30]"
                  }
                  onClick={() => setSlippage("auto")}
                >
                  Auto
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    slippage === "0.3"
                      ? "bg-[#1B2D1C] text-[#8CEC8D]"
                      : "bg-[#2E2F30]"
                  }
                  onClick={() => setSlippage("0.3")}
                >
                  0.3%
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    slippage === "0.5"
                      ? "bg-[#1B2D1C] text-[#8CEC8D]"
                      : "bg-[#2E2F30]"
                  }
                  onClick={() => setSlippage("0.5")}
                >
                  0.5%
                </Button>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Custom"
                    value={customSlippage}
                    onChange={(e) => {
                      setCustomSlippage(e.target.value);
                      setSlippage(e.target.value);
                    }}
                    className="w-24 h-9"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-dashed my-4" />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-medium">Priority Fee</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Pay extra to jump ahead in the transaction queue. Higher
                priority fees mean faster confirmation times.
              </p>
              <div className="flex gap-2">
                {PRIORITY_FEES.map((fee) => (
                  <Button
                    key={fee.value}
                    variant="ghost"
                    size="sm"
                    className={
                      priorityFee === fee.value
                        ? "bg-[#1B2D1C] text-[#8CEC8D]"
                        : "bg-[#2E2F30]"
                    }
                    onClick={() => handlePriorityFeeChange(fee.value)}
                  >
                    {fee.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
