"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Loader2,
  Check,
  ArrowLeft,
  X,
  Shield,
  CheckCircle,
  Copy,
} from "lucide-react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { generateSeedphrase, splitMnemonic } from "@/lib/crypto/seedphrase";
import { showSuccessToast, showErrorToast } from "@/lib/utils/error-handler";
import { toast } from "sonner";

type CreateWalletStep =
  | "generate"
  | "verify"
  | "name"
  | "creating"
  | "success";

interface WalletConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WalletConnectionDialog({
  open,
  onOpenChange,
  onSuccess,
}: WalletConnectionDialogProps) {
  const { createWallet, isLoading } = useWalletStore();

  const [step, setStep] = useState<CreateWalletStep>("generate");
  const [seedPhrase, setSeedPhrase] = useState<string>("");
  const [walletName, setWalletName] = useState("");
  const [verificationAnswers, setVerificationAnswers] = useState<Record<number, string>>({});
  const [verificationQuestions, setVerificationQuestions] = useState<
    Array<{ position: number; word: string; options: string[] }>
  >([]);
  const [localError, setLocalError] = useState<string | null>(null);

  // Generate verification questions
  const generateVerificationQuestions = (phrase: string) => {
    const words = splitMnemonic(phrase);
    const questions: Array<{ position: number; word: string; options: string[] }> = [];

    // Generate 2 random questions
    const usedIndices = new Set<number>();
    while (questions.length < 2) {
      const randomIndex = Math.floor(Math.random() * words.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);

        // Generate wrong options (excluding the correct word)
        const wrongWords = words.filter((_, i) => i !== randomIndex);
        const shuffled = wrongWords.sort(() => Math.random() - 0.5);
        const options = [words[randomIndex], ...shuffled.slice(0, 3)].sort(
          () => Math.random() - 0.5
        );

        questions.push({
          position: randomIndex + 1,
          word: words[randomIndex],
          options,
        });
      }
    }

    return questions;
  };

  // Generate seedphrase on mount
  useEffect(() => {
    if (open && !seedPhrase) {
      try {
        const newSeedphrase = generateSeedphrase();
        setSeedPhrase(newSeedphrase);
        setVerificationQuestions(generateVerificationQuestions(newSeedphrase));
      } catch (error) {
        setLocalError("Failed to generate seedphrase. Please try again.");
      }
    }
  }, [open, seedPhrase]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("generate");
        setSeedPhrase("");
        setWalletName("");
        setVerificationAnswers({});
        setLocalError(null);
      }, 300);
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === "verify") {
      setStep("generate");
      setVerificationAnswers({});
    } else if (step === "name") {
      setStep("verify");
    }
  };

  const handleSeedPhraseConfirm = () => {
    setStep("verify");
  };

  const handleVerificationAnswer = (questionIndex: number, answer: string) => {
    setVerificationAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleVerificationContinue = () => {
    // Check if all answers are correct
    const allCorrect = verificationQuestions.every(
      (q, idx) => verificationAnswers[idx] === q.word
    );

    if (allCorrect) {
      setStep("name");
    } else {
      toast.error("Incorrect words selected. Please try again.");
      setVerificationAnswers({});
    }
  };

  const handleCreateWallet = async () => {
    try {
      setStep("creating");
      setLocalError(null);

      await createWallet(seedPhrase, walletName || undefined);

      setStep("success");
      showSuccessToast("Wallet created successfully!");

      // Close dialog and call success callback after delay
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create wallet";
      setLocalError(errorMessage);
      showErrorToast(error, "Failed to create wallet");
      setStep("name");
    }
  };

  const renderStepContent = () => {
    const words = splitMnemonic(seedPhrase);

    switch (step) {
      case "generate":
        return (
          <div className="flex flex-col">
            {/* Header */}
            <div className="relative px-6 py-12 flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 rounded-full"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>

              <h2 className="text-2xl font-bold text-center mb-2">
                Secure Your Wallet
              </h2>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                This is your recovery phrase. Write down these 12 words in exact
                order and store them safely offline.
              </p>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-6">
              {/* Seed Phrase Grid */}
              <div className="p-6 bg-muted/30 rounded-xl border-2 border-border">
                <div className="grid grid-cols-2 gap-3">
                  {words.map((word, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-6">
                        {index + 1}.
                      </span>
                      <span className="font-medium">{word}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Copy Button */}
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl"
                onClick={() => {
                  navigator.clipboard.writeText(seedPhrase);
                  toast.success("Recovery phrase copied to clipboard");
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>

              {/* Warning */}
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <div className="flex gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-medium text-sm mb-1">
                      Never Share Your Recovery Phrase
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Anyone with these words can access and control your wallet.
                      Canopy will never ask for your recovery phrase. Store it
                      offline in a secure location.
                    </p>
                  </div>
                </div>
              </div>

              {localError && (
                <p className="text-sm text-destructive text-center">{localError}</p>
              )}

              <Button
                className="w-full h-11 rounded-xl bg-primary"
                onClick={handleSeedPhraseConfirm}
              >
                I've Written It Down
              </Button>
            </div>
          </div>
        );

      case "verify":
        return (
          <div className="flex flex-col">
            {/* Header */}
            <div className="relative px-6 py-12 flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-2 rounded-full"
                onClick={handleBack}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 rounded-full"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>

              <h2 className="text-2xl font-bold text-center mb-2">
                Verify Your Backup
              </h2>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Select the words in the correct order to verify your backup
              </p>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-6">
              {verificationQuestions.map((question, qIndex) => (
                <div key={qIndex} className="space-y-3">
                  <Label className="block text-center">
                    What is word #{question.position}?
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {question.options.map((option, oIndex) => (
                      <Button
                        key={oIndex}
                        variant={
                          verificationAnswers[qIndex] === option
                            ? "default"
                            : "outline"
                        }
                        className="h-11 rounded-xl"
                        onClick={() => handleVerificationAnswer(qIndex, option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}

              <Button
                className="w-full h-11 rounded-xl bg-primary mt-4"
                onClick={handleVerificationContinue}
                disabled={
                  Object.keys(verificationAnswers).length <
                  verificationQuestions.length
                }
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case "name":
        return (
          <div className="flex flex-col">
            {/* Header */}
            <div className="relative px-6 py-12 flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-2 rounded-full"
                onClick={handleBack}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 rounded-full"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </Button>

              <h2 className="text-2xl font-bold text-center mb-2">
                Name Your Wallet
              </h2>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Give your wallet a name to easily identify it (optional)
              </p>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="wallet-name">Wallet Name (Optional)</Label>
                <Input
                  id="wallet-name"
                  type="text"
                  placeholder="My Main Wallet"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateWallet();
                    }
                  }}
                  maxLength={100}
                  className="h-11 rounded-xl"
                />
              </div>

              {localError && (
                <p className="text-sm text-destructive">{localError}</p>
              )}

              <Button
                onClick={handleCreateWallet}
                className="w-full h-11 rounded-xl bg-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Wallet...
                  </>
                ) : (
                  "Create Wallet"
                )}
              </Button>
            </div>
          </div>
        );

      case "creating":
        return (
          <div className="flex flex-col">
            {/* Header */}
            <div className="relative px-6 py-12 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-center mb-2">
                Creating Wallet...
              </h2>
            </div>

            <div className="flex flex-col items-center justify-center px-6 pb-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground text-center">
                Please wait while we create your wallet...
              </p>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="flex flex-col">
            {/* Header */}
            <div className="relative px-6 py-12 flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 rounded-full"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>

              <h2 className="text-2xl font-bold text-center mb-2">
                Wallet Created!
              </h2>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Your wallet has been created successfully. You can now use it to
                manage your assets.
              </p>
            </div>

            <div className="px-6 pb-6">
              <Button
                className="w-full h-11 rounded-xl bg-primary"
                onClick={handleClose}
              >
                Get Started
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] p-0 gap-0 !rounded-3xl"
        hideclose
        onInteractOutside={(e) => {
          // Prevent closing when clicking outside during critical steps
          if (step === "creating") {
            e.preventDefault();
          }
        }}
      >
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
