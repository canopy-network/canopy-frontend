import { ExplorerDashboard } from "@/components/explorer/explorer-dashboard";
import { getExplorerOverview } from "@/lib/api/explorer";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Explorer | Canopy",
    description:
      "Explore blockchain transactions, blocks, and network statistics on Canopy",
    openGraph: {
      title: "Explorer | Canopy",
      description:
        "Explore blockchain transactions, blocks, and network statistics on Canopy",
      type: "website",
      siteName: "Canopy",
    },
    twitter: {
      card: "summary",
      title: "Explorer | Canopy",
      description:
        "Explore blockchain transactions, blocks, and network statistics on Canopy",
    },
  };
}

export default async function ExplorerPage() {
  // Pre-fetch overview data for SSR (React Query will use it as initialData)
  let overviewData = null;

  try {
    overviewData = await getExplorerOverview();
  } catch (error) {
    console.error("Failed to fetch explorer overview:", error);
    // Continue with null data - React Query will fetch it on client
  }

  return <ExplorerDashboard overviewData={overviewData} />;
}
