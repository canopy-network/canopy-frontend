"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Rocket, TrendingUp, Users, Target, CheckCircle } from "lucide-react";

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const onboardingSteps = [
  {
    title: "Welcome to Canopy Launchpad",
    description: "Launch blockchain projects in minutes with our automated bonding curve system",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Rocket className="h-16 w-16 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            Canopy Launchpad makes it easy to create and invest in new blockchain projects. Let&apos;s walk through how
            it works!
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Understanding Bonding Curves",
    description: "Learn how automatic pricing works",
    content: (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              How Bonding Curves Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <p className="text-sm">Price starts low when few tokens exist</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <p className="text-sm">Price increases as more tokens are purchased</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <p className="text-sm">Early investors get better prices</p>
            </div>
          </CardContent>
        </Card>
      </div>
    ),
  },
  {
    title: "Project Lifecycle",
    description: "From launch to graduation",
    content: (
      <div className="space-y-4">
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Active</Badge>
                <CardTitle className="text-base">Fundraising Phase</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Projects raise funds through bonding curve sales. Users can buy/sell tokens instantly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Graduated</Badge>
                <CardTitle className="text-base">Independent Chain</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                When funding target is reached, the project becomes a full blockchain with traditional trading.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    title: "Making Your First Investment",
    description: "How to participate in projects",
    content: (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Investment Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Browse Active Projects</p>
                  <p className="text-xs text-muted-foreground">
                    Review project details, progress, and team information
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Click &quot;Quick Trade&quot;</p>
                  <p className="text-xs text-muted-foreground">Enter the amount you want to invest</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Confirm Transaction</p>
                  <p className="text-xs text-muted-foreground">Your tokens are added to your wallet instantly</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    ),
  },
  {
    title: "Ready to Explore!",
    description: "You're all set to use the launchpad",
    content: (
      <div className="space-y-4 text-center">
        <Target className="h-16 w-16 text-primary mx-auto" />
        <div className="space-y-2">
          <p className="font-medium">You&apos;re ready to start exploring projects!</p>
          <p className="text-sm text-muted-foreground">
            Remember: You can always hover over terms with dotted underlines to see explanations.
          </p>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Pro tip:</strong> Start with smaller investments to get familiar with the platform before making
            larger commitments.
          </p>
        </div>
      </div>
    ),
  },
];

export function OnboardingGuide({ isOpen, onClose }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
    // Mark onboarding as completed in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("canopy-onboarding-completed", "true");
    }
  };

  const step = onboardingSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{step.title}</DialogTitle>
              <DialogDescription>{step.description}</DialogDescription>
            </div>
            <Badge variant="outline">
              {currentStep + 1} of {onboardingSteps.length}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={((currentStep + 1) / onboardingSteps.length) * 100} className="h-2" />

          <div className="min-h-[300px]">{step.content}</div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0} className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep === onboardingSteps.length - 1 ? (
              <Button onClick={handleClose} className="gap-2">
                Get Started
                <Rocket className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={nextStep} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
