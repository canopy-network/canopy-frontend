import { ChainPageSkeleton } from "@/components/skeletons";

/**
 * Loading state for chain details page
 * Next.js will automatically show this while the page is loading
 */
export default function ChainLoading() {
  return <ChainPageSkeleton />;
}
