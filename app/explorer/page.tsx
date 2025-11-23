import { ExplorerDashboard } from "@/components/explorer/explorer-dashboard";
import { getExplorerOverview } from "@/lib/api/explorer";

export default async function ExplorerPage() {
  let overviewData = null;

  try {
    overviewData = await getExplorerOverview();
    console.log("[ExplorerPage] overviewData", overviewData);
  } catch (error) {
    console.error("Failed to fetch explorer overview:", error);
    // Continue with null data - component will handle fallback
  }

  return <ExplorerDashboard overviewData={overviewData} />;
}
