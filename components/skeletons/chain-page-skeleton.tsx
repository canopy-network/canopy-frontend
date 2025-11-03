import React from "react";
import { Container } from "@/components/layout/container";
import { ChainDetailsHeaderSkeleton } from "./chain-details-header-skeleton";
import { ChainDetailsSkeleton } from "./chain-details-skeleton";
import { WalletContentSkeleton } from "./wallet-content-skeleton";

/**
 * Full page skeleton for the chain details page
 * Displays loading state with header, chart, tabs, and sidebar
 */
export const ChainPageSkeleton = () => {
  return (
    <Container type="boxed" className="">
      <div className="w-full max-w-7xl mx-auto lg:flex gap-4">
        {/* Main Content */}
        <main id="chain-details" className="flex-1 min-w-0">
          <ChainDetailsHeaderSkeleton />
          <ChainDetailsSkeleton />
        </main>

        {/* Sidebar */}
        <aside className="w-[352px] flex-shrink-0 h-fit lg:block hidden">
          <WalletContentSkeleton />
        </aside>
      </div>
    </Container>
  );
};
