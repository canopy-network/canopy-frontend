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
import { Loader2, Mail, CheckCircle2, LogOut, ArrowLeft, Wallet, ExternalLink, Check } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { sendEmailCode, } from "@/lib/api/auth";
import { getSiweNonce, linkWalletToAccount } from "@/lib/api/siwe";
import { createSiweMessage, createWalletLinkMessage } from "@/lib/web3/siwe-client";
import { hasValidLinkedWallet } from "@/lib/web3/utils";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import axios from "axios";
import { API_CONFIG } from "@/lib/config/api";
import { toast } from "sonner";

type AuthStep = "initial" | "email" | "code" | "siwe" | "authenticated" | "link-email" | "link-email-code";

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
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [showWalletLinking, setShowWalletLinking] = useState(false);
  const [isLinkingWallet, setIsLinkingWallet] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkEmailCode, setLinkEmailCode] = useState("");
  const [linkEmailDevCode, setLinkEmailDevCode] = useState<string | null>(null);
  const [isLinkingEmailProcess, setIsLinkingEmailProcess] = useState(false);

  // Wagmi hooks for SIWE
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    setError(null);

    try {
      const response = await sendEmailCode(email);

      // Store dev code if available
      if (response.data.code) {
        setDevCode(response.data.code);
      }
      setStep("code");
      setResendTimer(30); // Start 30-second countdown
    } catch (error: any) {
      setLocalError(
        error.message || "Failed to send verification code. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || isResending) return;

    setIsResending(true);
    setLocalError(null);
    setError(null);

    try {
      const response = await sendEmailCode(email);

      // Store dev code if available
      if (response.data.code) {
        setDevCode(response.data.code);
      }
      setResendTimer(30); // Reset countdown
    } catch (error: any) {
      setLocalError(
        error.message || "Failed to resend verification code. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    setError(null);

    try {
      const verifyResponse = await axios.post(
        `${API_CONFIG.baseURL}/api/v1/auth/verify`,
        {
          email,
          code,
        }
      );

      if (verifyResponse.status !== 200) {
        setLocalError(verifyResponse.data.message);
        return;
      }

      const response_body = verifyResponse.data;

      console.log({ response_body });

      const authHeader =
        verifyResponse.headers["authorization"] ||
        verifyResponse.headers["Authorization"];
      const token = authHeader ? authHeader.replace("Bearer ", "") : null;

      // Save the full user object and token from the API response
      // The auth store will handle storing to localStorage
      setUser(response_body.data.user, token);

      setStep("authenticated");
      setCode("");
      setDevCode(null);
    } catch (error: any) {
      setLocalError(
        error.message || "Failed to verify code. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
        setLocalError(verifyResponse.data.message || "Failed to verify signature");
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
    if (step === "authenticated" && showWalletLinking && isConnected && address && !isLinkingWallet) {
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
      setLocalError(error.message || "Failed to link wallet. Please try again.");
      toast.error("Failed to link wallet");
    } finally {
      setIsLinkingWallet(false);
    }
  };

  const handleSendLinkEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLinkingEmailProcess(true);
    setLocalError(null);

    try {
      const response = await sendEmailCode(linkEmail);

      // Store dev code if available
      if (response.data.code) {
        setLinkEmailDevCode(response.data.code);
      }

      setStep("link-email-code");
      toast.success("Verification code sent to your email!");
    } catch (error: any) {
      console.error("Failed to send email code:", error);
      setLocalError(error.message || "Failed to send verification code");
      toast.error("Failed to send verification code");
    } finally {
      setIsLinkingEmailProcess(false);
    }
  };

  const handleVerifyLinkEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLinkingEmailProcess(true);
    setLocalError(null);

    try {
      const linkResponse = await axios.post(
        `${API_CONFIG.baseURL}/api/v1/auth/email/link`,
        {
          email: linkEmail,
          code: linkEmailCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (linkResponse.status !== 200) {
        setLocalError(linkResponse.data.message || "Failed to link email");
        return;
      }

      // Update user with linked email
      if (user) {
        setUser({
          ...user,
          email: linkEmail,
        });
      }

      toast.success("Email linked successfully!");
      setStep("authenticated");
      setLinkEmail("");
      setLinkEmailCode("");
      setLinkEmailDevCode(null);
    } catch (error: any) {
      console.error("Failed to link email:", error);
      setLocalError(error.message || "Failed to link email. Please try again.");
      toast.error("Failed to link email");
    } finally {
      setIsLinkingEmailProcess(false);
    }
  };

  const handleLogout = () => {
    logout();
    disconnect();
    setStep("initial");
    setEmail("");
    setCode("");
    setLocalError(null);
    setDevCode(null);
  };

  const handleBack = () => {
    if (step === "code") {
      setStep("email");
      setCode("");
      setDevCode(null);
    } else if (step === "email" || step === "siwe") {
      setStep("initial");
      setEmail("");
      disconnect();
    }
    setLocalError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing when in SIWE step (RainbowKit modal might be open)
    if (!newOpen && step === "siwe") {
      return;
    }

    // Prevent closing when wallet linking is in progress
    if (!newOpen && showWalletLinking) {
      return;
    }

    if (!newOpen) {
      if (!isAuthenticated) {
        setStep("initial");
      }
      setEmail("");
      setCode("");
      setLocalError(null);
      setDevCode(null);
      setResendTimer(0);
      setIsResending(false);
      setShowWalletLinking(false);
      setIsLinkingWallet(false);
    }
    onOpenChange(newOpen);
  };

  // Link email view (step 1: enter email)
  if (step === "link-email") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <button
            onClick={() => setStep("authenticated")}
            className="absolute top-4 left-4 z-10 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </button>

          <DialogHeader className="text-center">
            <img
              src="/images/logo.svg"
              alt="Logo"
              className="invert h-4 mx-auto my-6"
            />
            <DialogTitle className="text-2xl font-bold">
              Link Your Email
            </DialogTitle>
            <DialogDescription className="text-base">
              Add an email to your account for notifications and recovery
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendLinkEmailCode} className="space-y-4">
            {localError && (
              <p className="text-sm text-red-500 text-center">{localError}</p>
            )}

            <div className="space-y-2">
              <Input
                id="link-email"
                type="email"
                placeholder="Enter your email"
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                required
                disabled={isLinkingEmailProcess}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLinkingEmailProcess || !linkEmail}
            >
              {isLinkingEmailProcess ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Link email view (step 2: verify code)
  if (step === "link-email-code") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <button
            onClick={() => {
              setStep("link-email");
              setLinkEmailCode("");
              setLinkEmailDevCode(null);
            }}
            className="absolute top-4 left-4 z-10 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </button>

          <DialogHeader className="text-center">
            <img
              src="/images/logo.svg"
              alt="Logo"
              className="invert h-4 mx-auto my-6"
            />
            <DialogTitle className="text-2xl font-bold">
              Verify Your Email
            </DialogTitle>
            <DialogDescription className="text-base">
              Enter the 6-digit code sent to {linkEmail}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVerifyLinkEmailCode} className="space-y-4">
            {linkEmailDevCode && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <span className="text-yellow-800 font-medium">Dev code:</span>{" "}
                <span className="text-yellow-900 font-mono">{linkEmailDevCode}</span>
              </div>
            )}

            {localError && (
              <p className="text-sm text-red-500 text-center">{localError}</p>
            )}

            <div className="space-y-2">
              <Input
                id="link-email-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={linkEmailCode}
                onChange={(e) => setLinkEmailCode(e.target.value)}
                maxLength={6}
                required
                disabled={isLinkingEmailProcess}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLinkingEmailProcess || !linkEmailCode}
            >
              {isLinkingEmailProcess ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Link Email"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

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
              className="invert h-4 mx-auto my-6"
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
                <p className="text-sm text-muted-foreground">Signed in as</p>
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
                  <p className="text-sm text-muted-foreground">Linked Wallet</p>
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
                      <p className="text-xs text-muted-foreground">Waiting for signature...</p>
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
                className="invert h-4 mx-auto my-6"
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
                    <p className="text-sm text-muted-foreground">Linked Wallet</p>
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

              {!user.email && hasLinkedWallet && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Link Your Email</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add an email to enable additional features and account recovery
                  </p>

                  <Button
                    onClick={() => {
                      setStep("link-email");
                      setLocalError(null);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Link Email
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

  // Code input view
  if (step === "code") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          {/* Back button in top left */}
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 z-10 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </button>

          <DialogHeader className="text-center">
            <img
              src="/images/logo.svg"
              alt="Logo"
              className="invert h-4 mx-auto my-6"
            />
            <DialogTitle className="text-2xl font-bold">
              Verification code sent
            </DialogTitle>
            <DialogDescription className="text-base">
              We have sent a 6-digit verification code to {email}. Please enter
              it below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCodeSubmit} className="space-y-4">
            {devCode && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <span className="text-yellow-800 font-medium">Dev code:</span>{" "}
                <span className="text-yellow-900 font-mono">{devCode}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <Input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={code[index] || ""}
                    onChange={(e) => {
                      const newCode = code.split("");
                      newCode[index] = e.target.value.replace(/\D/g, "");
                      setCode(newCode.join(""));

                      // Auto-focus next input
                      if (e.target.value && index < 5) {
                        const nextInput = (
                          e.target as HTMLInputElement
                        ).parentElement?.parentElement?.querySelector(
                          `input:nth-child(${index + 2})`
                        ) as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle backspace to go to previous input
                      if (e.key === "Backspace" && !code[index] && index > 0) {
                        const prevInput = (
                          e.target as HTMLInputElement
                        ).parentElement?.parentElement?.querySelector(
                          `input:nth-child(${index})`
                        ) as HTMLInputElement;
                        prevInput?.focus();
                      }
                    }}
                    disabled={isSubmitting}
                    className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-primary"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              {localError && (
                <p className="text-sm text-red-500 text-center">{localError}</p>
              )}
            </div>

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Resend another code in {resendTimer}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-sm text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                      Resending...
                    </>
                  ) : (
                    "Resend code"
                  )}
                </button>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || code.length !== 6}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // SIWE wallet connection view
  if (step === "siwe") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogPortal>
          {/* Use a lower z-index overlay that won't block RainbowKit modal */}
          <DialogOverlay className="z-[100]" />
          <div className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-[150] grid w-full max-w-[calc(100%-2rem)] sm:max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200">
            {/* Back button in top left */}
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 z-10 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </button>

            <DialogHeader className="text-center">
              <img
                src="/images/logo.svg"
                alt="Logo"
                className="invert h-4 mx-auto my-6"
              />
              <DialogTitle className="text-2xl font-bold">
                Sign in with Ethereum
              </DialogTitle>
              <DialogDescription className="text-base">
                Connect your wallet to continue
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {localError && (
                <p className="text-sm text-red-500 text-center">{localError}</p>
              )}

              {!isConnected ? (
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Wallet Connected</p>
                    <p className="text-sm text-muted-foreground">Waiting for signature...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogPortal>
      </Dialog>
    );
  }

  // Email input view (matches the design)
  if (step === "email" || step === "initial") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          {step === "email" && (
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
              className="invert h-4 mx-auto my-6"
            />
            <DialogTitle className="text-2xl font-bold">
              Welcome to Canopy
            </DialogTitle>
            <DialogDescription className="text-base">
              Start launching now.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="text-base"
                autoFocus
              />
              {localError && (
                <p className="text-sm text-red-500 text-center">{localError}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full text-base py-2"
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Continue"
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* SIWE Button */}
            <Button
              type="button"
              onClick={() => {
                setStep("siwe");
                setLocalError(null);
              }}
              variant="outline"
              className="w-full gap-2"
              disabled={isSubmitting}
            >
              <Wallet className="h-4 w-4" />
              Sign in with Ethereum
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
