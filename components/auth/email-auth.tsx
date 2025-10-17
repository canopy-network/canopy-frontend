"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, LogOut, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { sendEmailCode, verifyCode } from "@/lib/api/auth";

type AuthStep = "initial" | "email" | "code" | "authenticated";

export function EmailAuth() {
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

  const handleLoginClick = () => {
    setStep("email");
    setLocalError(null);
  };

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
    } catch (error: any) {
      setLocalError(
        error?.message || "Failed to send verification code. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    setError(null);

    try {
      const response = await verifyCode(email, code);

      setUser(response.data.user);
      setStep("authenticated");
      setCode("");
      setDevCode(null);
    } catch (error: any) {
      setLocalError(
        error?.message || "Failed to verify code. Please try again."
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

  // Authenticated view
  if (step === "authenticated" && user) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md">
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm text-white truncate">{user.email}</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full gap-2 bg-transparent border-[#2a2a2a] text-white hover:bg-[#1a1a1a]"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    );
  }

  // Email input view
  if (step === "email") {
    return (
      <div className="space-y-3">
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="email"
              className="text-sm text-muted-foreground block mb-2"
            >
              Enter your email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              autoFocus
            />
          </div>
          {localError && <p className="text-xs text-red-500">{localError}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleBack}
              variant="outline"
              className="flex-1 bg-transparent border-[#2a2a2a] text-white hover:bg-[#1a1a1a]"
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-black font-medium"
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Code"
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Code input view
  if (step === "code") {
    return (
      <div className="space-y-3">
        <form onSubmit={handleCodeSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="code"
              className="text-sm text-muted-foreground block mb-2"
            >
              Enter 6-digit code
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Sent to {email}
            </p>
            {devCode && (
              <div className="mb-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
                <span className="text-yellow-500">Dev code:</span>{" "}
                <span className="text-white font-mono">{devCode}</span>
              </div>
            )}
            <Input
              id="code"
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              maxLength={6}
              disabled={isSubmitting}
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-center text-lg tracking-widest"
              autoFocus
            />
          </div>
          {localError && <p className="text-xs text-red-500">{localError}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleBack}
              variant="outline"
              className="flex-1 bg-transparent border-[#2a2a2a] text-white hover:bg-[#1a1a1a]"
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-black font-medium"
              disabled={isSubmitting || code.length !== 6}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Initial view - Login button
  return (
    <Button
      onClick={handleLoginClick}
      className="w-full gap-2 bg-transparent hover:bg-[#1a1a1a] text-white border border-[#2a2a2a] font-medium"
      variant="outline"
    >
      <Mail className="h-4 w-4" />
      Login
    </Button>
  );
}
