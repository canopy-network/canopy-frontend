"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import { LaunchpadDashboard } from "@/components/launchpad/launchpad-dashboard";

export default function HomePage() {
  return <LaunchpadDashboard />;
}
