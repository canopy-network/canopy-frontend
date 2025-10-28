"use client";

import LaunchpadSidebar from "@/components/launchpad/launchpad-sidebar";
import { useCreateChainStore } from "@/lib/stores/create-chain-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface LaunchpadLayoutProps {
  children: React.ReactNode;
}

export default function LaunchpadLayout({ children }: LaunchpadLayoutProps) {
  const { currentStep, completedSteps, formData, resetFormData } =
    useCreateChainStore();
  const router = useRouter();

  const handleClose = () => {
    // Reset the persisted store data
    resetFormData();
    // Navigate back to the previous page
    router.back();
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Launch Progress Sidebar */}
      <LaunchpadSidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        repoConnected={formData.githubValidated}
      />

      {/* Main Content Area */}
      <main className="flex flex-col overflow-auto w-full">
        <div className="flex justify-end p-2 border-b mb-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        {children}
      </main>
    </div>
  );
}
