"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import { GraduationDashboard } from "@/components/graduation/graduation-dashboard";

export default function GraduationPage() {
  return <GraduationDashboard />;
}
