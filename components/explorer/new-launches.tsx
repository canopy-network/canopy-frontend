"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Box } from "lucide-react";
import Link from "next/link";
import { Chain } from "@/types/chains";
import { LatestUpdated } from "./latest-updated";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { canopyIconSvg, getCanopyAccent, EXPLORER_ICON_GLOW, EXPLORER_NEON_GREEN } from "@/lib/utils/brand";
import { ChainDetailModal } from "./chain-detail-modal";

interface NewLaunchesProps {
  chains: Chain[];
}

export function NewLaunches({ chains }: NewLaunchesProps) {
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatValue = (value?: number | null) => {
    if (value === undefined || value === null) return "N/A";
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  };

  const handleRowClick = (chain: Chain) => {
    setSelectedChain(chain);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card padding="explorer" className="gap-2 lg:gap-6">
        <div className="flex items-center justify-between leading-none">
          <h2 className="text-lg lg:text-2xl font-bold text-white pl-2 lg:pl-0">
            New Launches
          </h2>
          <LatestUpdated timeAgo="44 secs ago" />
        </div>

        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow appearance="plain">
                <TableHead className="pl-0 lg:pl-4">Chain</TableHead>
                <TableHead className="pl-0 lg:pl-4">Token</TableHead>
                <TableHead className="pl-0 lg:pl-4">Market Cap</TableHead>
                <TableHead className="pl-0 lg:pl-4">Volume 24H</TableHead>
                <TableHead className="pl-0 lg:pl-4">Unique Traders</TableHead>
                <TableHead className="pl-0 lg:pl-4 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chains.map((chain) => (
                <TableRow
                  key={chain.id}
                  appearance="plain"
                  className="hover:bg-primary/5 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(chain)}
                >
                  <TableCell className="pl-0 lg:pl-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center bg-muted"
                        dangerouslySetInnerHTML={{
                          __html: canopyIconSvg(getCanopyAccent(chain.id)),
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium hover:text-primary transition-colors">
                          {chain.chain_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {chain.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="pl-0 lg:pl-4">
                    <div className="flex items-center gap-2">
                      <Box className={`w-4 h-4 text-muted-foreground ${EXPLORER_ICON_GLOW}`} />
                      <span className="font-mono">${chain.token_symbol}</span>
                    </div>
                  </TableCell>
                  <TableCell className="pl-0 lg:pl-4">
                    {formatValue(chain.virtual_pool?.market_cap_usd)}
                  </TableCell>
                  <TableCell className="pl-0 lg:pl-4">
                    {formatValue(chain.virtual_pool?.volume_24h_cnpy)}
                  </TableCell>
                  <TableCell className="pl-0 lg:pl-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <span
                          className="w-6 h-6 inline-flex items-center justify-center border-2 border-background rounded-full bg-muted"
                          dangerouslySetInnerHTML={{
                            __html: canopyIconSvg(getCanopyAccent(chain.id)),
                          }}
                        />
                        <span
                          className="w-6 h-6 inline-flex items-center justify-center border-2 border-background rounded-full bg-muted"
                          dangerouslySetInnerHTML={{
                            __html: canopyIconSvg(getCanopyAccent(`${chain.id}-b`)),
                          }}
                        />
                      </div>
                      <span className="text-sm whitespace-nowrap">
                        +
                        {(
                          chain.virtual_pool?.unique_traders ??
                          (chain as any)?.graduated_pool?.unique_traders ??
                          0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="pl-0 lg:pl-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(chain);
                      }}
                    >
                      View
                      <ArrowUpRight className="w-4 h-4" style={{ color: EXPLORER_NEON_GREEN }} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between lg:mt-4 mt- lg:pt-4 pt-3 border-t border-border">
            <Link href="/chains">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground gap-1"
              >
                View All Chains
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {selectedChain && (
        <ChainDetailModal
          chain={selectedChain}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </>
  );
}
