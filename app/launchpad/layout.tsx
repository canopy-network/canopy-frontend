"use client";

import LaunchpadSidebar from "@/components/launchpad/launchpad-sidebar";
import { usePathname } from "next/navigation";

interface LaunchpadLayoutProps {
  children: React.ReactNode;
}

export default function LaunchpadLayout({ children }: LaunchpadLayoutProps) {
  const pathname = usePathname();

  // Determine current step from pathname
  const getCurrentStep = () => {
    if (pathname?.includes("/repo")) return 2;
    if (pathname?.includes("/main-info")) return 3;
    if (pathname?.includes("/branding")) return 4;
    if (pathname?.includes("/links")) return 5;
    if (pathname?.includes("/settings")) return 6;
    if (pathname?.includes("/review")) return 7;
    return 1; // default to language step
  };

  const currentStep = getCurrentStep();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Launch Progress Sidebar */}
      <LaunchpadSidebar
        currentStep={currentStep}
        completedSteps={[]}
        repoConnected={false}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
