import { Coins, Layers, Clock, Calendar, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TokenomicsData {
  totalSupply: string;
  tokenSymbol: string;
  blockTime: string;
  halvingSchedule: string;
  blocksPerDay: string;
  yearOneEmission: string;
}

interface TokenomicsCardProps {
  data?: TokenomicsData;
}

// Placeholder data
const PLACEHOLDER_DATA: TokenomicsData = {
  totalSupply: "1,000,000,000",
  tokenSymbol: "DYPRO",
  blockTime: "10 sec",
  halvingSchedule: "Every 365 days",
  blocksPerDay: "8,640",
  yearOneEmission: "~137,442,250",
};

export function TokenomicsCard({ data }: TokenomicsCardProps) {
  const tokenomics = data || PLACEHOLDER_DATA;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Coins className="w-5 h-5 text-primary" aria-hidden="true" />
        <h3 className="text-lg font-semibold">Tokenomics</h3>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Row 1: Total Supply & Block Time */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="w-4 h-4" aria-hidden="true" />
              <span>Total Supply</span>
            </div>
            <p className="text-lg font-semibold">
              {tokenomics.totalSupply} {tokenomics.tokenSymbol}
            </p>
          </div>

          <div className="h-px bg-border"></div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>Block Time</span>
            </div>
            <p className="text-lg font-semibold">{tokenomics.blockTime}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border"></div>

        {/* Row 2: Halving Schedule */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>Halving Schedule</span>
          </div>
          <p className="text-lg font-semibold">{tokenomics.halvingSchedule}</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border"></div>

        {/* Row 3: Blocks per Day & Est. Year 1 Emission */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="w-4 h-4" aria-hidden="true" />
              <span>Blocks per Day</span>
            </div>
            <p className="text-lg font-semibold">{tokenomics.blocksPerDay}</p>
          </div>

          <div className="h-px bg-border lg:hidden"></div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
              <span>Est. Year 1 Emission</span>
            </div>
            <p className="text-lg font-semibold">
              {tokenomics.yearOneEmission} {tokenomics.tokenSymbol}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
