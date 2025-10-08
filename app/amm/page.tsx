"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import { AMMDashboard } from "@/components/amm/amm-dashboard";

export default function AMMPage() {
  return <AMMDashboard />;
}
