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
    <section className="flex min-h-screen max-h-screen overflow-hidden bg-background">
      {/* Launch Progress Sidebar */}
      <LaunchpadSidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        repoConnected={formData.githubValidated}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="flex justify-end p-2 border-b mb-10 sticky top-0 bg-background z-10">
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
      </div>
    </section>
  );
}
