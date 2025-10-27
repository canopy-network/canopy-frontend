import { Card } from "@/components/ui/card";
import { ChainWithUI } from "@/lib/stores/chains-store";
import { MediaGallery } from "./media-gallery";
import { AchievementsList } from "./achievements-list";
import { InfoCard } from "./info-card";
import { TokenomicsCard } from "./tokenomics-card";
import { Users, CodeXml, Activity } from "lucide-react";

interface ChainOverviewProps {
  chain: ChainWithUI;
}

export function ChainOverview({ chain }: ChainOverviewProps) {
  // Placeholder holder data
  const placeholderHolders = [
    { address: "0x74...", label: "74" },
    { address: "0x86...", label: "86" },
    { address: "0xDD...", label: "DD" },
    { address: "0xBD...", label: "BD" },
    { address: "0x25...", label: "25" },
  ];

  return (
    <>
      <Card className="mb-6">
        <div className="flex gap-4 pb-8 flex-col border-b ">
          <div className="flex items-center gap-2">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-sm transition-colors"
            >
              <span>🌐</span>
            </a>

            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-sm transition-colors"
            >
              <span>𝕏</span>
              <span>3.3k</span>
            </a>

            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-sm transition-colors"
            >
              <span>⭐</span>
              <span>23 stars</span>
            </a>
          </div>
          <h2 className="text-xl font-semibold mb-3">
            {chain.chain_name}: Revolutionizing Digital Asset Management
          </h2>
          <p className="text-[#737373] leading-relaxed">
            {chain.chain_description ||
              "Introducing the Token Chain Project, a revolutionary platform designed to enhance the way digital assets are managed, traded, and secured. Built on cutting-edge blockchain technology, this project aims to provide users with a seamless and secure experience for managing their cryptocurrency portfolios."}
          </p>
        </div>

        <div className="flex flex-col gap-4 border-b pb-8">
          <AchievementsList />
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Gallery</h3>
          <MediaGallery />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <InfoCard
          icon={Users}
          label="Holders"
          mainValue={892}
          buttonText="View All Holders"
          isHolders={true}
          holders={placeholderHolders}
        />
        <InfoCard
          icon={CodeXml}
          label="Repository"
          mainValue="Solidity"
          stats={[
            { label: "Stars", value: 23 },
            { label: "Forks", value: 8 },
          ]}
          buttonText="View Repository"
        />
        <InfoCard
          icon={Activity}
          label="Block Height"
          mainValue={128900}
          stats={[
            { label: "Total Transactions", value: 567800 },
            { label: "Avg Block Time", value: "10s" },
          ]}
          buttonText="View Explorer"
        />
      </div>

      <TokenomicsCard />
    </>
  );
}
