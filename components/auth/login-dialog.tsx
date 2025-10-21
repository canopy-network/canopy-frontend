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
} from "@/components/ui/dialog";
import { Loader2, Mail, CheckCircle2, LogOut, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { sendEmailCode, verifyCode } from "@/lib/api/auth";
import axios from "axios";

type AuthStep = "initial" | "email" | "code" | "authenticated";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { user, isAuthenticated, setUser, setLoading, setError, logout } =
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

  // Sync step with authentication state when dialog opens
  useEffect(() => {
    if (open) {
      setStep(isAuthenticated ? "authenticated" : "initial");
    }
  }, [open, isAuthenticated]);

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
      console.log("🟢 [LoginDialog] Verifying code...");
      const response = await axios.post(
        `http://app.neochiba.net:3001/api/v1/auth/verify`,
        {
          email,
          code,
        }
      );

      // Extract token from Authorization header
      const authHeader =
        response.headers["authorization"] || response.headers["Authorization"];
      const token = authHeader ? authHeader.replace("Bearer ", "") : null;

      // Save the full user object and token from the API response
      // The auth store will handle storing to localStorage
      setUser(response.data.data.user, token);

      setStep("authenticated");
      setCode("");
      setDevCode(null);
      // Close dialog after successful authentication
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    } catch (error: any) {
      console.error("🔴 [LoginDialog] Verification failed:", error);
      setLocalError(
        error.message || "Failed to verify code. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
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
    } else if (step === "email") {
      setStep("initial");
      setEmail("");
    }
    setLocalError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing, but preserve auth state
      if (!isAuthenticated) {
        setStep("initial");
      }
      setEmail("");
      setCode("");
      setLocalError(null);
      setDevCode(null);
      setResendTimer(0);
      setIsResending(false);
    }
    onOpenChange(newOpen);
  };

  // Authenticated view
  if (step === "authenticated" && user && user.email) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                🌳
              </span>
            </div>
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
            <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                ✈️
              </span>
            </div>
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

  // Email input view (matches the design)
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">
              🌳
            </span>
          </div>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
