"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Loader2,
  Wallet,
  Check,
  Plus,
  Lock,
  Unlock,
  AlertCircle,
} from "lucide-react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LocalWallet } from "@/types/wallet";
import { showSuccessToast, showErrorToast } from "@/lib/utils/error-handler";
import { WalletConnectionDialog } from "./wallet-connection-dialog";

type SelectWalletStep = "select" | "unlock" | "unlocking";

interface SelectWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SelectWalletDialog({
  open,
  onOpenChange,
  onSuccess,
}: SelectWalletDialogProps) {
  const { isAuthenticated } = useAuthStore();
  const {
    wallets,
    currentWallet,
    isLoading,
    fetchWallets,
    selectWallet,
    unlockWallet,
  } = useWalletStore();

  const [step, setStep] = useState<SelectWalletStep>("select");
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch wallets when dialog opens
  useEffect(() => {
    if (open && isAuthenticated) {
      fetchWallets();
    }
  }, [open, isAuthenticated]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("select");
        setSelectedWalletId(null);
        setPassword("");
        setLocalError(null);
      }, 300);
    }
  }, [open]);

  const handleSelectWallet = (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId);
    if (!wallet) return;

    setSelectedWalletId(walletId);

    // If wallet is already unlocked, select it directly
    if (wallet.isUnlocked) {
      selectWallet(walletId);
      showSuccessToast("Wallet connected!");
      onOpenChange(false);
      onSuccess?.();
    } else {
      // Otherwise, show unlock step
      setStep("unlock");
    }
  };

  const handleUnlock = async () => {
    if (!selectedWalletId || !password) return;

    try {
      setStep("unlocking");
      setLocalError(null);

      await unlockWallet(selectedWalletId, password);
      selectWallet(selectedWalletId);

      showSuccessToast("Wallet unlocked and connected!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to unlock wallet";
      setLocalError(errorMessage);
      showErrorToast(error, "Failed to unlock wallet");
      setStep("unlock");
    }
  };

  const handleCreateNewWallet = () => {
    setShowCreateDialog(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    fetchWallets();
    onOpenChange(false);
    onSuccess?.();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderStepContent = () => {
    switch (step) {
      case "select":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Select Wallet
              </DialogTitle>
              <DialogDescription>
                Choose a wallet to connect or create a new one.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Empty State */}
              {!isLoading && wallets.length === 0 && (
                <div className="text-center py-8 space-y-4">
                  <div className="rounded-full bg-muted/50 p-4 w-16 h-16 mx-auto flex items-center justify-center">
                    <Wallet className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">No Wallets Found</p>
                    <p className="text-sm text-muted-foreground">
                      Create your first wallet to get started.
                    </p>
                  </div>
                </div>
              )}

              {/* Wallet List */}
              {!isLoading && wallets.length > 0 && (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleSelectWallet(wallet.id)}
                      className={`w-full p-4 rounded-lg border text-left transition-colors hover:bg-muted/50 ${
                        currentWallet?.id === wallet.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">
                              {wallet.wallet_name || "Unnamed Wallet"}
                            </p>
                            {currentWallet?.id === wallet.id && (
                              <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            {formatAddress(wallet.address)}
                          </p>
                          {wallet.wallet_description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {wallet.wallet_description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          {wallet.isUnlocked ? (
                            <Badge variant="default" className="gap-1">
                              <Unlock className="h-3 w-3" />
                              Unlocked
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Lock className="h-3 w-3" />
                              Locked
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Create New Wallet Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCreateNewWallet}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Wallet
              </Button>

              {localError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{localError}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </>
        );

      case "unlock":
        const selectedWallet = wallets.find(
          (w) => w.id === selectedWalletId
        ) as LocalWallet;

        return (
          <>
            <DialogHeader>
              <DialogTitle>Unlock Wallet</DialogTitle>
              <DialogDescription>
                Enter your seed-phrase to unlock this wallet.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Wallet Info */}
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-sm font-medium mb-1">
                  {selectedWallet?.wallet_name || "Unnamed Wallet"}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {selectedWallet?.address}
                </p>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="seedphrase">Seedphrase</Label>
                <Input
                  id="seedphrase"
                  type="password"
                  placeholder="Enter your 12-word seedphrase"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLocalError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnlock();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the seedphrase you saved when creating this wallet.
                </p>
              </div>

              {localError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{localError}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("select");
                  setPassword("");
                  setLocalError(null);
                }}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleUnlock}
                className="flex-1"
                disabled={!password}
              >
                Unlock
              </Button>
            </div>
          </>
        );

      case "unlocking":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Unlocking Wallet...</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Please wait while we unlock your wallet...
              </p>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          {renderStepContent()}
        </DialogContent>
      </Dialog>

      <WalletConnectionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
