"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Rocket, Code, Settings, DollarSign } from "lucide-react";
import { useCreateChainDialog } from "@/lib/stores/use-create-chain-dialog";

const templates = [
  {
    id: "defi",
    name: "DeFi Chain",
    description: "Optimized for decentralized finance applications",
    features: ["AMM Support", "Lending Protocols", "Yield Farming"],
    estimatedCost: "500 CNPY",
  },
  {
    id: "gamefi",
    name: "GameFi Chain",
    description: "Built for gaming and NFT applications",
    features: ["NFT Marketplace", "Gaming APIs", "Low Latency"],
    estimatedCost: "400 CNPY",
  },
  {
    id: "enterprise",
    name: "Enterprise Chain",
    description: "Private blockchain for enterprise use cases",
    features: ["Privacy Features", "Permissioned", "Compliance Tools"],
    estimatedCost: "800 CNPY",
  },
];

export function CreateChainDialog() {
  const { isOpen, setOpen } = useCreateChainDialog();
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    githubRepo: "",
    targetRaise: "",
    launchDate: "",
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Handle chain creation
    console.log("Creating chain:", { selectedTemplate, formData });
    setOpen(false);
    setStep(1);
    setSelectedTemplate("");
    setFormData({
      name: "",
      description: "",
      githubRepo: "",
      targetRaise: "",
      launchDate: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Launch New Chain
          </DialogTitle>
          <DialogDescription>
            Create and deploy a new blockchain chain in under 10 minutes using
            our templates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && <div className="w-12 h-px bg-border mx-2" />}
              </div>
            ))}
          </div>

          {/* Step 1: Template Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Choose a Template
                </h3>
                <p className="text-muted-foreground text-sm">
                  Select a pre-configured template that matches your use case.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? "ring-2 ring-primary"
                        : "hover:bg-accent/50"
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-base">
                        {template.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((feature) => (
                            <Badge
                              key={feature}
                              variant="secondary"
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Est. Cost:
                          </span>
                          <span className="font-medium">
                            {template.estimatedCost}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Chain Configuration */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Configure Your Chain
                </h3>
                <p className="text-muted-foreground text-sm">
                  Customize your chain settings and branding.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Chain Name</Label>
                    <Input
                      id="name"
                      placeholder="My Awesome Chain"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your chain's purpose and features..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="github">GitHub Repository (Optional)</Label>
                    <Input
                      id="github"
                      placeholder="https://github.com/username/repo"
                      value={formData.githubRepo}
                      onChange={(e) =>
                        setFormData({ ...formData, githubRepo: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="target">Target Raise (CNPY)</Label>
                    <Input
                      id="target"
                      placeholder="500000"
                      value={formData.targetRaise}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetRaise: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="launch">Launch Date</Label>
                    <Input
                      id="launch"
                      type="date"
                      value={formData.launchDate}
                      onChange={(e) =>
                        setFormData({ ...formData, launchDate: e.target.value })
                      }
                    />
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Template:{" "}
                        {templates.find((t) => t.id === selectedTemplate)?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground">
                        {
                          templates.find((t) => t.id === selectedTemplate)
                            ?.description
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Launch */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Review & Launch</h3>
                <p className="text-muted-foreground text-sm">
                  Review your configuration and launch your chain.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    {formData.name || "Unnamed Chain"}
                  </CardTitle>
                  <CardDescription>{formData.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">Template</Label>
                      <p className="text-sm text-muted-foreground">
                        {templates.find((t) => t.id === selectedTemplate)?.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Target Raise
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {formData.targetRaise} CNPY
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Launch Date</Label>
                      <p className="text-sm text-muted-foreground">
                        {formData.launchDate}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Estimated Cost
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {
                          templates.find((t) => t.id === selectedTemplate)
                            ?.estimatedCost
                        }
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span>
                      Your chain will be created with a bonding curve starting
                      at $0.10 per token.
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={step === 1 && !selectedTemplate}
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit}>Launch Chain</Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
