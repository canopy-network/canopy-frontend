import { BlocksExplorer } from "@/components/blocks/blocks-explorer";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blocks | Canopy",
    description: "Browse and explore blockchain blocks on Canopy",
    openGraph: {
      title: "Blocks | Canopy",
      description: "Browse and explore blockchain blocks on Canopy",
      type: "website",
      siteName: "Canopy",
    },
    twitter: {
      card: "summary",
      title: "Blocks | Canopy",
      description: "Browse and explore blockchain blocks on Canopy",
    },
  };
}

export default function BlocksPage() {
  return <BlocksExplorer />;
}
