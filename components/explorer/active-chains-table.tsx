"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download } from "lucide-react";
import { canopyIconSvg, getCanopyAccent } from "@/lib/utils/brand";
import { ChainDetailModal } from "./chain-detail-modal";
import type { Chain } from "@/types/chains";

interface ActiveChainsTableProps {
  chains: Chain[];
}

const formatValue = (value?: number | null) => {
  if (value === undefined || value === null) return "$0";
  if (value === 0) return "$0";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
};

export function ActiveChainsTable({ chains }: ActiveChainsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredChains = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return chains;
    return chains.filter(
      (chain) =>
        chain.chain_name?.toLowerCase().includes(query) ||
        chain.token_symbol?.toLowerCase().includes(query) ||
        chain.token_name?.toLowerCase().includes(query)
    );
  }, [chains, searchQuery]);

  const handleRowClick = (chain: Chain) => {
    setSelectedChain(chain);
    setIsModalOpen(true);
  };

  const handleDownloadCSV = () => {
    const headers = ["Chain Name", "Stake", "Market Cap", "TVL", "Security Root"];
    const rows = filteredChains.map((chain) => [
      chain.chain_name,
      formatValue(chain.virtual_pool?.total_volume_cnpy),
      formatValue(chain.virtual_pool?.market_cap_usd),
      formatValue(chain.virtual_pool?.total_volume_cnpy),
      formatValue(chain.virtual_pool?.market_cap_usd),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "active-chains.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card padding="explorer" id="active-chains" className="gap-2 lg:gap-6">
        <div className="flex items-center justify-between leading-none">
          <h2 className="text-lg lg:text-2xl font-bold text-white pl-2 lg:pl-0">
            Chains
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[200px] max-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/5 border-white/15 text-white placeholder:text-muted-foreground h-9"
              />
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              size="sm"
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>

            {/* CSV Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCSV}
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow appearance="plain">
                <TableHead className="pl-0 lg:pl-4">Chain Name</TableHead>
                <TableHead className="pl-0 lg:pl-4">Stake</TableHead>
                <TableHead className="pl-0 lg:pl-4">Market Cap</TableHead>
                <TableHead className="pl-0 lg:pl-4">TVL</TableHead>
                <TableHead className="pl-0 lg:pl-4">Security Root</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChains.length === 0 ? (
                <TableRow appearance="plain">
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No chains found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredChains.map((chain) => (
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
                        <span className="font-medium">{chain.chain_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="pl-0 lg:pl-4">
                      {formatValue(chain.virtual_pool?.total_volume_cnpy)}
                    </TableCell>
                    <TableCell className="pl-0 lg:pl-4">
                      {formatValue(chain.virtual_pool?.market_cap_usd)}
                    </TableCell>
                    <TableCell className="pl-0 lg:pl-4">
                      {formatValue(chain.virtual_pool?.total_volume_cnpy)}
                    </TableCell>
                    <TableCell className="pl-0 lg:pl-4">
                      {formatValue(chain.virtual_pool?.market_cap_usd)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal */}
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
