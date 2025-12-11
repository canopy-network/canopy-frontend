"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import {
  Loader2,
  CheckCircle2,
  LogOut,
  ArrowLeft,
  Wallet,
  ExternalLink,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getSiweNonce, linkWalletToAccount } from "@/lib/api/siwe";
import {
  createSiweMessage,
  createWalletLinkMessage,
} from "@/lib/web3/siwe-client";
import { hasValidLinkedWallet } from "@/lib/web3/utils";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import axios from "axios";
import { API_CONFIG } from "@/lib/config/api";
import { toast } from "sonner";

type AuthStep = "initial" | "siwe" | "authenticated";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { user, isAuthenticated, token, setUser, setError, logout } =
    useAuthStore();
  const [step, setStep] = useState<AuthStep>(
    isAuthenticated ? "authenticated" : "initial"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showWalletLinking, setShowWalletLinking] = useState(false);
  const [isLinkingWallet, setIsLinkingWallet] = useState(false);

  // Sync step with isAuthenticated when it changes (e.g., after rehydration)
  useEffect(() => {
    if (isAuthenticated && step === "initial") {
      setStep("authenticated");
    } else if (!isAuthenticated && step === "authenticated") {
      setStep("initial");
    }
  }, [isAuthenticated]);

  // Wagmi hooks for SIWE
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const handleSiweLogin = async () => {
    setIsSubmitting(true);
    setLocalError(null);
    setError(null);

    try {
      // Wait for wallet connection
      if (!isConnected || !address || !chain) {
        setStep("siwe");
        setIsSubmitting(false);
        return;
      }

      // 1. Get nonce from backend
      const nonceResponse = await getSiweNonce(address);
      const nonce = nonceResponse.data.nonce;

      // 2. Create SIWE message
      const message = createSiweMessage(address, nonce, chain.id);
      const messageString = message.prepareMessage();

      // 3. Sign message with wallet
      const signature = await signMessageAsync({ message: messageString });

      // 4. Verify signature with backend
      const verifyResponse = await axios.post(
        `${API_CONFIG.baseURL}/api/v1/auth/siwe/verify`,
        {
          message: messageString,
          signature,
        }
      );

      if (verifyResponse.status !== 200) {
        setLocalError(
          verifyResponse.data.message || "Failed to verify signature"
        );
        return;
      }

      const response_body = verifyResponse.data;

      // 5. Extract token from response headers
      const authHeader =
        verifyResponse.headers["authorization"] ||
        verifyResponse.headers["Authorization"];
      const token = authHeader ? authHeader.replace("Bearer ", "") : null;

      // 6. Save user and token (same as email auth)
      setUser(response_body.data.user, token);

      setStep("authenticated");

      // Close the modal after successful sign-in
      onOpenChange(false);
    } catch (error: any) {
      console.error("SIWE login error:", error);
      setLocalError(
        error.message || "Failed to sign in with wallet. Please try again."
      );
      disconnect();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effect to handle wallet connection for SIWE
  useEffect(() => {
    if (step === "siwe" && isConnected && address && !isSubmitting) {
      handleSiweLogin();
    }
  }, [step, isConnected, address]);

  // Effect to handle wallet connection for linking (in authenticated view)
  useEffect(() => {
    if (
      step === "authenticated" &&
      showWalletLinking &&
      isConnected &&
      address &&
      !isLinkingWallet
    ) {
      handleLinkWallet();
    }
  }, [step, showWalletLinking, isConnected, address]);

  const handleLinkWallet = async () => {
    if (!isConnected || !address || !chain) {
      // Open RainbowKit modal directly
      setShowWalletLinking(true);
      openConnectModal?.();
      return;
    }

    setIsLinkingWallet(true);
    setLocalError(null);

    try {
      // 1. Get nonce from backend
      const nonceResponse = await getSiweNonce(address);
      const nonce = nonceResponse.data.nonce;

      // 2. Create wallet link message
      const message = createWalletLinkMessage(address, nonce, chain.id);
      const messageString = message.prepareMessage();

      // 3. Sign message with wallet
      const signature = await signMessageAsync({ message: messageString });

      // 4. Link wallet to account (uses Bearer token automatically)
      await linkWalletToAccount(messageString, signature);

      // 5. Update user in store with new wallet address
      if (user) {
        setUser({
          ...user,
          wallet_address: address,
        });
      }

      // 6. Show success message
      toast.success("Wallet linked successfully!");

      // 7. Disconnect wallet UI and reset state
      disconnect();
      setShowWalletLinking(false);
    } catch (error: any) {
      console.error("Wallet linking error:", error);
      setLocalError(
        error.message || "Failed to link wallet. Please try again."
      );
      toast.error("Failed to link wallet");
    } finally {
      setIsLinkingWallet(false);
    }
  };

  const handleLogout = () => {
    logout();
    disconnect();
    setStep("initial");
    setLocalError(null);
  };

  const handleBack = () => {
    if (step === "siwe") {
      setStep("initial");
      disconnect();
    }
    setLocalError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing when wallet linking is in progress
    if (!newOpen && showWalletLinking) {
      return;
    }

    if (!newOpen) {
      if (!isAuthenticated) {
        setStep("initial");
      }
      setLocalError(null);
      setShowWalletLinking(false);
      setIsLinkingWallet(false);
    }
    onOpenChange(newOpen);
  };

  // Authenticated view
  if (step === "authenticated" && user) {
    const hasLinkedWallet = hasValidLinkedWallet(user.wallet_address);

    // Format wallet address for display
    const formatAddress = (addr: string) => {
      if (!addr) return "";
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // Get explorer URL for the wallet
    const getExplorerUrl = (addr: string) => {
      return `https://etherscan.io/address/${addr}`;
    };

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {showWalletLinking ? (
          <DialogPortal>
            {/* Use a lower z-index overlay that won't block RainbowKit modal */}
            <DialogOverlay className="z-[100]" />
            <div className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-[150] grid w-full max-w-[calc(100%-2rem)] sm:max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200">
              <DialogHeader className="text-center">
                <img
                  src="/images/logo.svg"
                  alt="Logo"
                  className="h-4 mx-auto my-6"
                />
                <DialogTitle className="text-2xl font-bold">
                  Welcome back!
                </DialogTitle>
                <DialogDescription className="text-base">
                  You're successfully signed in.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">
                      Signed in as
                    </p>
                    <p className="font-medium text-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Linked Wallet Display */}
                {hasLinkedWallet && (
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">
                        Linked Wallet
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-medium truncate">
                          {formatAddress(user.wallet_address)}
                        </p>
                        <a
                          href={getExplorerUrl(user.wallet_address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Wallet Linking Section */}
                {!hasLinkedWallet && (
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Link Your Wallet</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Connect your wallet to access blockchain features
                    </p>

                    {localError && (
                      <p className="text-xs text-red-500">{localError}</p>
                    )}

                    {showWalletLinking && isConnected ? (
                      <div className="space-y-3">
                        <div className="flex flex-col items-center justify-center gap-2 py-2">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <p className="text-xs text-muted-foreground">
                            Waiting for signature...
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setShowWalletLinking(false);
                            disconnect();
                            setLocalError(null);
                          }}
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={isLinkingWallet}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleLinkWallet}
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        disabled={showWalletLinking}
                      >
                        {showWalletLinking ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Opening wallet...
                          </>
                        ) : (
                          <>
                            <Wallet className="h-4 w-4" />
                            Link Wallet
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </DialogPortal>
        ) : (
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center">
              <img
                src="/images/logo.svg"
                alt="Logo"
                className="h-4 mx-auto my-6"
              />
              <DialogTitle className="text-2xl font-bold">
                Welcome back!
              </DialogTitle>
              <DialogDescription className="text-base">
                You're successfully signed in.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Primary Identity Display */}
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Signed in as</p>
                  {user.email ? (
                    <p className="font-medium text-foreground truncate">
                      {user.email}
                    </p>
                  ) : hasLinkedWallet ? (
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-medium truncate">
                        {formatAddress(user.wallet_address)}
                      </p>
                      <a
                        href={getExplorerUrl(user.wallet_address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ) : (
                    <p className="font-medium text-foreground truncate">
                      Anonymous User
                    </p>
                  )}
                </div>
              </div>

              {/* Secondary Wallet Display (only if email exists and wallet is linked) */}
              {user.email && hasLinkedWallet && (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">
                      Linked Wallet
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-medium truncate">
                        {formatAddress(user.wallet_address)}
                      </p>
                      <a
                        href={getExplorerUrl(user.wallet_address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Link Missing Identity */}
              {user.email && !hasLinkedWallet && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Link Your Wallet</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Connect your wallet to access blockchain features
                  </p>

                  {localError && (
                    <p className="text-xs text-red-500">{localError}</p>
                  )}

                  <Button
                    onClick={handleLinkWallet}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <Wallet className="h-4 w-4" />
                    Link Wallet
                  </Button>
                </div>
              )}

              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    );
  }

  // Initial view - show welcome with SIWE button
  if (step === "initial") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <img
              src="/images/logo.svg"
              alt="Logo"
              className="h-4 mx-auto my-6"
            />
            <DialogTitle className="text-2xl font-bold">
              Welcome to Canopy
            </DialogTitle>
            <DialogDescription className="text-base">
              Connect your wallet to get started.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {localError && (
              <p className="text-sm text-red-500 text-center">{localError}</p>
            )}

            {/* SIWE Button */}
            <Button
              type="button"
              onClick={() => {
                setStep("siwe");
                setLocalError(null);
                // Open RainbowKit modal
                setTimeout(() => {
                  openConnectModal?.();
                }, 100);
              }}
              className="w-full gap-2"
              disabled={isSubmitting}
            >
              <Wallet className="h-4 w-4" />
              Sign in with Ethereum
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // SIWE step - keep dialog open but show loading state
  if (step === "siwe") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogPortal>
          {/* Use a lower z-index overlay that won't block RainbowKit modal */}
          <DialogOverlay className="z-[100]" />
          <div className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-[150] grid w-full max-w-[calc(100%-2rem)] sm:max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200">
            {/* Back button - only show if not connected yet */}
            {!isConnected && (
              <button
                onClick={handleBack}
                className="absolute top-4 left-4 z-10 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </button>
            )}

            <DialogHeader className="text-center">
              <img
                src="/images/logo.svg"
                alt="Logo"
                className="h-4 mx-auto my-6"
              />
              <DialogTitle className="text-2xl font-bold">
                {!isConnected ? "Connect Your Wallet" : "Sign in with Ethereum"}
              </DialogTitle>
              <DialogDescription className="text-base">
                {!isConnected
                  ? "Select a wallet from the modal"
                  : "Sign the message to complete authentication"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {localError && (
                <p className="text-sm text-red-500 text-center">{localError}</p>
              )}

              {isConnected && (
                <div className="flex flex-col items-center justify-center gap-3 py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Wallet Connected</p>
                    <p className="text-sm text-muted-foreground">
                      Waiting for signature...
                    </p>
                  </div>
                </div>
              )}

              {!isConnected && (
                <div className="flex flex-col items-center justify-center gap-3 py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Opening wallet selection...
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogPortal>
      </Dialog>
    );
  }

  return null;
}
