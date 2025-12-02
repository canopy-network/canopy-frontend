"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Check, ChevronRight, Plus } from "lucide-react";
import { LocalWallet } from "@/types/wallet";
import { formatAddress } from "@/lib/utils/wallet-helpers";

interface SwitchWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: LocalWallet[];
  currentWallet: LocalWallet | null;
  onSelectWallet: (walletId: string) => void;
  onCreateNew?: () => void;
}

export function SwitchWalletDialog({
  open,
  onOpenChange,
  wallets,
  currentWallet,
  onSelectWallet,
  onCreateNew,
}: SwitchWalletDialogProps) {
  const handleSelectWallet = (walletId: string) => {
    onSelectWallet(walletId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Switch Wallet</DialogTitle>
          <DialogDescription>
            Select a wallet to switch to or create a new one
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Wallets List */}
          <div className="max-h-[400px] overflow-y-auto pr-4">
            <div className="space-y-2">
              {wallets.map((wallet) => {
                const isActive = currentWallet?.id === wallet.id;

                return (
                  <button
                    key={wallet.id}
                    onClick={() => handleSelectWallet(wallet.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Wallet Icon */}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isActive
                              ? "bg-primary/20"
                              : "bg-muted"
                          }`}
                        >
                          <Wallet
                            className={`w-6 h-6 ${
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>

                        {/* Wallet Info */}
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">
                              {wallet.wallet_name || "Unnamed Wallet"}
                            </p>
                            {isActive && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-primary/20 text-primary border-0"
                              >
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            {formatAddress(wallet.address)}
                          </p>
                        </div>
                      </div>

                      {/* Active Indicator or Arrow */}
                      {isActive ? (
                        <Check className="w-5 h-5 text-primary" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Create New Wallet Button */}
          {onCreateNew && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => {
                  onCreateNew();
                  onOpenChange(false);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Wallet
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
