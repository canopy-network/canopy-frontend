"use client";

import LaunchpadSidebar from "@/components/launchpad/launchpad-sidebar";
import { useCreateChainStore } from "@/lib/stores/create-chain-store";

interface LaunchpadLayoutProps {
  children: React.ReactNode;
}

export default function LaunchpadLayout({ children }: LaunchpadLayoutProps) {
  const { currentStep, completedSteps, formData } = useCreateChainStore();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Launch Progress Sidebar */}
      <LaunchpadSidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        repoConnected={formData.githubValidated}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
