import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, ArrowLeft, Check, Info, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import liquidityPools from "@/data/liquidity-pools.json";
import tokens from "@/data/tokens.json";
import { walletTransactionApi, chainsApi } from "@/lib/api";
import { useWalletStore } from "@/lib/stores/wallet-store";
import toast from "react-hot-toast";

// Conversion factor for microunits (1 token = 1,000,000 microunits)
const MICRO_UNITS = 1_000_000;

// CNPY Logo component
function CnpyLogo({ size = 32 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #1dd13a 0%, #0fa32c 100%)",
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        C
      </span>
    </div>
  );
}

// Token Avatar component
function TokenAvatar({ symbol, color, size = 32 }) {
  if (symbol === "CNPY") {
    return <CnpyLogo size={size} />;
  }

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color || "#6b7280",
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        {symbol.slice(0, 2)}
      </span>
    </div>
  );
}

export default function AddLiquidityDialog({
  open,
  onOpenChange,
  selectedPool = null,
  availablePools = [],
}) {
  const [step, setStep] = useState(1);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [internalSelectedPool, setInternalSelectedPool] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentWallet } = useWalletStore();

  // Mock wallet data (replace with actual wallet connection later)
  const isConnected = true;
  const mockWalletData = {
    assets: [
      { symbol: "OENS", balance: 5000 },
      { symbol: "GAME", balance: 8000 },
      { symbol: "SOCN", balance: 4000 },
      { symbol: "MGC", balance: 6000 },
      { symbol: "HLTH", balance: 5000 },
      { symbol: "EDU", balance: 3000 },
      { symbol: "DEFI", balance: 2500 },
      { symbol: "NFT", balance: 1500 },
      { symbol: "SOCIAL", balance: 4000 },
      { symbol: "MUSIC", balance: 6000 },
    ],
  };

  const pools = availablePools.length > 0 ? availablePools : liquidityPools;
  const needsPoolSelection = !selectedPool && pools.length > 0;
  const activePool = selectedPool || internalSelectedPool;

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setInternalSelectedPool(null);
      setStep(1);
      setAmountA("");
      setAmountB("");
      setIsSubmitting(false);
    }
  }, [open]);

  const handlePoolSelect = (poolId) => {
    const pool = pools.find((p) => p.id === poolId);
    if (pool) {
      setInternalSelectedPool(pool);
    }
  };

  // Get token data
  const tokenAData = activePool
    ? tokens.find((t) => t.symbol === activePool.tokenA)
    : null;
  const tokenBData = activePool
    ? tokens.find((t) => t.symbol === activePool.tokenB)
    : null;

  // Get user balances (using mock data)
  const balanceA = useMemo(() => {
    if (!activePool || !isConnected) return 0;
    // CNPY is always tokenA in pools
    return 1000; // Mock CNPY balance
  }, [activePool, isConnected]);

  const balanceB = useMemo(() => {
    if (!activePool || !isConnected) return 0;
    const asset = mockWalletData?.assets?.find(
      (a) => a.symbol === activePool.tokenB
    );
    return asset?.balance || 0;
  }, [activePool, isConnected]);

  // Calculate pool ratio and auto-fill amounts
  const poolRatio = useMemo(() => {
    if (!activePool) return 1;
    return activePool.tokenAReserve / activePool.tokenBReserve;
  }, [activePool]);

  const handleAmountAChange = (value) => {
    setAmountA(value);
    const numValue = parseFloat(value) || 0;
    if (numValue > 0 && poolRatio) {
      setAmountB((numValue / poolRatio).toFixed(4));
    } else {
      setAmountB("");
    }
  };

  const handleAmountBChange = (value) => {
    setAmountB(value);
    const numValue = parseFloat(value) || 0;
    if (numValue > 0 && poolRatio) {
      setAmountA((numValue * poolRatio).toFixed(4));
    } else {
      setAmountA("");
    }
  };

  const handleMaxA = () => {
    handleAmountAChange(balanceA.toString());
  };

  const handleMaxB = () => {
    handleAmountBChange(balanceB.toString());
  };

  // Calculate estimated values
  const amountANum = parseFloat(amountA) || 0;
  const amountBNum = parseFloat(amountB) || 0;
  const totalValueUSD = amountANum * 1 + amountBNum * (tokenBData?.price || 1); // CNPY = $1
  const shareOfPool = activePool
    ? ((amountANum / (activePool.tokenAReserve + amountANum)) * 100).toFixed(4)
    : 0;
  const estimatedApr = activePool?.apr || 0;

  const handleContinue = async () => {
    if (step === 1 && amountANum > 0 && amountBNum > 0 && activePool) {
      setStep(2);
    } else if (step === 2) {
      // Call deposit API before moving to success step
      if (!currentWallet) {
        toast.error("Please connect your wallet to add liquidity.");
        return;
      }

      // Check if wallet is unlocked
      if (!currentWallet.isUnlocked || !currentWallet.privateKey) {
        toast.error("Wallet is locked. Please unlock your wallet first.");
        return;
      }

      setIsSubmitting(true);

      try {
        // Convert amount to microunits (base units)
        const amountInMicroUnits = Math.floor(amountANum * MICRO_UNITS);

        // Pool chain ID - the pool you're depositing into (chain 2+)
        const poolChainId = activePool.chainId || 2;

        // Transaction chain ID - always root chain (1) for liquidity deposits
        const transactionChainId = 1;

        // Get current height from root chain (where transaction is sent)
        const heightResponse = await chainsApi.getChainHeight(
          String(transactionChainId)
        );
        const currentHeight = heightResponse.data.height;

        // Create DEX liquidity deposit message
        const { createDexLiquidityDepositMessage } = await import(
          "@/lib/crypto/transaction"
        );
        const depositMsg = createDexLiquidityDepositMessage(
          poolChainId, // The pool chain you're depositing to
          amountInMicroUnits,
          currentWallet.address
        );

        // Create and sign transaction
        const { createAndSignTransaction } = await import(
          "@/lib/crypto/transaction"
        );
        const signedTx = createAndSignTransaction(
          {
            type: "dexLiquidityDeposit",
            msg: depositMsg,
            fee: 1000, // TODO: Add fee estimation
            memo: " ", // CRITICAL: Always empty string, never undefined/null
            networkID: 1,
            chainID: transactionChainId, // Root chain where transaction is sent
            height: currentHeight,
          },
          currentWallet.privateKey,
          currentWallet.public_key,
          currentWallet.curveType
        );

        // Submit transaction
        const response = await walletTransactionApi.sendRawTransaction(
          signedTx
        );

        toast.success(
          `Transaction submitted: ${response.transaction_hash.substring(
            0,
            8
          )}...`
        );

        setStep(3);
      } catch (error) {
        console.error("Failed to add liquidity:", error);
        toast.error(
          error.message || "An error occurred while adding liquidity."
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
  };

  const handleClose = () => {
    setStep(1);
    setAmountA("");
    setAmountB("");
    setInternalSelectedPool(null);
    onOpenChange(false);
  };

  const handleDone = () => {
    handleClose();
  };

  if (!activePool && !needsPoolSelection) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <DialogTitle className="text-lg font-semibold">
              {step === 1
                ? "Add Liquidity"
                : step === 2
                ? "Confirm"
                : "Success"}
            </DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {step === 1 && (
            <>
              {/* Pool Selection (if needed) */}
              {needsPoolSelection && !activePool && (
                <div className="space-y-2">
                  <Label>Select Pool</Label>
                  <Select onValueChange={handlePoolSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a liquidity pool" />
                    </SelectTrigger>
                    <SelectContent>
                      {pools.map((pool) => {
                        const poolTokenB = tokens.find(
                          (t) => t.symbol === pool.tokenB
                        );
                        return (
                          <SelectItem key={pool.id} value={pool.id}>
                            <div className="flex items-center gap-2">
                              <TokenAvatar
                                symbol={pool.tokenB}
                                color={poolTokenB?.brandColor}
                                size={20}
                              />
                              <span>
                                {pool.tokenB} / {pool.tokenA}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                ({pool.apr}% APY)
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {activePool && (
                <>
                  {/* Pool Info */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <TokenAvatar
                          symbol={activePool.tokenB}
                          color={tokenBData?.brandColor}
                          size={32}
                        />
                        <TokenAvatar symbol={activePool.tokenA} size={32} />
                      </div>
                      <div>
                        <div className="font-medium">
                          {activePool.tokenB} / {activePool.tokenA}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activePool.apr}% APY
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Token A Input (CNPY) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Amount ({activePool.tokenA})</Label>
                      <span className="text-xs text-muted-foreground">
                        Balance: {balanceA.toLocaleString()} {activePool.tokenA}
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amountA}
                        onChange={(e) => handleAmountAChange(e.target.value)}
                        className="pr-20"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
                        onClick={handleMaxA}
                      >
                        MAX
                      </Button>
                    </div>
                  </div>

                  {/* Token B Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Amount ({activePool.tokenB})</Label>
                      <span className="text-xs text-muted-foreground">
                        Balance: {balanceB.toLocaleString()} {activePool.tokenB}
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amountB}
                        onChange={(e) => handleAmountBChange(e.target.value)}
                        className="pr-20"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
                        onClick={handleMaxB}
                      >
                        MAX
                      </Button>
                    </div>
                  </div>

                  {/* Pool Ratio Info */}
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pool Ratio</span>
                      <span>
                        1 {activePool.tokenA} = {(1 / poolRatio).toFixed(4)}{" "}
                        {activePool.tokenB}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Value</span>
                      <span>${totalValueUSD.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Share of Pool
                      </span>
                      <span>{shareOfPool}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. APY</span>
                      <span className="text-green-500">{estimatedApr}%</span>
                    </div>
                  </div>
                </>
              )}

              <Button
                className="w-full"
                onClick={handleContinue}
                disabled={!activePool || amountANum <= 0 || amountBNum <= 0}
              >
                Continue
              </Button>
            </>
          )}

          {step === 2 && activePool && (
            <>
              {/* Confirmation Summary */}
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="text-center">
                    <div className="flex justify-center -space-x-2 mb-2">
                      <TokenAvatar
                        symbol={activePool.tokenB}
                        color={tokenBData?.brandColor}
                        size={40}
                      />
                      <TokenAvatar symbol={activePool.tokenA} size={40} />
                    </div>
                    <div className="text-lg font-semibold">
                      {activePool.tokenB} / {activePool.tokenA}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Add Liquidity
                    </div>
                  </div>

                  <div className="border-t border-border pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {activePool.tokenA} Amount
                      </span>
                      <span className="font-medium">
                        {amountA} {activePool.tokenA}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {activePool.tokenB} Amount
                      </span>
                      <span className="font-medium">
                        {amountB} {activePool.tokenB}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Value</span>
                      <span className="font-medium">
                        ${totalValueUSD.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Share of Pool
                      </span>
                      <span className="font-medium">{shareOfPool}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Estimated APY
                      </span>
                      <span className="font-medium text-green-500">
                        {estimatedApr}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-500">
                    By adding liquidity, you may be exposed to impermanent loss
                    if token prices diverge significantly.
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleContinue}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Confirming..." : "Confirm Add Liquidity"}
              </Button>
            </>
          )}

          {step === 3 && activePool && (
            <>
              {/* Success State */}
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Liquidity Added!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You've successfully added liquidity to the{" "}
                    {activePool.tokenB}/{activePool.tokenA} pool
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposited</span>
                    <span>
                      {amountA} {activePool.tokenA} + {amountB}{" "}
                      {activePool.tokenB}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Value</span>
                    <span>${totalValueUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pool Share</span>
                    <span>{shareOfPool}%</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={handleDone}>
                Done
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
