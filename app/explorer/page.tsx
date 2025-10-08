"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import { ExplorerDashboard } from "@/components/explorer/explorer-dashboard";

export default function ExplorerPage() {
  return <ExplorerDashboard />;
}
