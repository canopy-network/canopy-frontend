"use client";

import { PortfolioOverview } from "./portfolio-overview";

interface AssetsTabProps {
  addresses: string[];
}

export function AssetsTab({ addresses }: AssetsTabProps) {
  return <PortfolioOverview addresses={addresses} />;
}