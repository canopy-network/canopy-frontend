"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import { LaunchpadDashboard } from "@/components/chain/launchpad-dashboard";

export default function HomePage() {
  return <LaunchpadDashboard />;
}
