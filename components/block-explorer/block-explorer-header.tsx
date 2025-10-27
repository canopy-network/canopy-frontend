import { Card } from "@/components/ui/card";
import { Box, Activity, RefreshCw, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BlockExplorerHeaderProps {
  blockHeight?: number;
  avgBlockTime?: string;
  totalTransactions?: number;
  networkStatus?: "Active" | "Inactive";
}

export function BlockExplorerHeader({
  blockHeight = 145600,
  avgBlockTime = "10s",
  totalTransactions = 678900,
  networkStatus = "Active",
}: BlockExplorerHeaderProps) {
  return (
    <Card className="p-6 mb-4">
      <div className="grid lg:grid-cols-2 xl:grid-cols-4 grid-cols-2 gap-8">
        {/* Block Height */}
        <div className="flex items-start gap-3">
          <Box className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1 whitespace-nowrap">
              Block Height
            </p>
            <p className="text-3xl font-bold whitespace-nowrap">
              {blockHeight.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Avg Block Time */}
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1 whitespace-nowrap">
              Avg Block Time
            </p>
            <p className="text-3xl font-bold whitespace-nowrap">
              {avgBlockTime}
            </p>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1 whitespace-nowrap">
              Total Transactions
            </p>
            <p className="text-3xl font-bold whitespace-nowrap">
              {totalTransactions.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Network Status */}
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1 whitespace-nowrap">
              Network Status
            </p>
            <Badge
              variant={networkStatus === "Active" ? "default" : "secondary"}
              className={`text-base px-4 py-1 mt-1 whitespace-nowrap ${
                networkStatus === "Active"
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : ""
              }`}
            >
              {networkStatus}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
