"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, RefreshCw, Search, ChevronDown, Calendar as CalendarIcon, Check } from "lucide-react";
import { useWalletEventsHistory } from "@/lib/hooks/use-wallet-events";
import { extractStakeRewards } from "@/lib/utils/wallet-events";
import type { WalletEventsHistoryParams } from "@/types/wallet-events";
import { formatBalance } from "@/lib/utils/wallet-helpers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { chainsApi } from "@/lib/api";
import { Chain } from "@/types/chains";
import { cn } from "@/lib/utils";

const CHAIN_COLORS: Record<number, string> = {
  1: "#1dd13a",
  2: "#8b5cf6",
  3: "#06b6d4",
  5: "#f59e0b",
  6: "#ec4899",
};

interface RewardsActivityProps {
  addresses: string[];
  limit?: number;
  filters?: Omit<WalletEventsHistoryParams, "addresses">;
  relatedStakeKey?: string;
  compact?: boolean;
}

function getExplorerUrl(
  reward: ReturnType<typeof extractStakeRewards>[number]
): string | undefined {
  const metadata = reward.metadata || {};
  return (
    (metadata["explorer_url"] as string) ||
    (metadata["explorerUrl"] as string) ||
    (metadata["tx_url"] as string) ||
    (reward.txHash
      ? `https://explorer.canopy.network/tx/${reward.txHash}`
      : undefined)
  );
}

export function RewardsActivity({
  addresses,
  limit = 10,
  filters,
  relatedStakeKey,
  compact = false,
}: RewardsActivityProps) {
  const [groupingWindow, setGroupingWindow] = useState<number>(0); // minutes; 0 = show all
  const [selectedChainId, setSelectedChainId] = useState<string>("all");
  const [chains, setChains] = useState<Chain[]>([]);
  const [chainSearchQuery, setChainSearchQuery] = useState("");
  const [isLoadingChains, setIsLoadingChains] = useState(false);
  const [chainPopoverOpen, setChainPopoverOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [draftDateRange, setDraftDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const {
    events,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useWalletEventsHistory(
    {
      ...filters,
      addresses,
      limit,
      sort: "desc",
      chain_ids:
        selectedChainId !== "all" ? [Number(selectedChainId)] : undefined,
      start_date: dateRange.from
        ? dateRange.from.toISOString()
        : filters?.start_date,
      end_date: dateRange.to ? dateRange.to.toISOString() : filters?.end_date,
    },
    {
      enabled: addresses.length > 0,
      pageSize: limit,
    }
  );

  useEffect(() => {
    const fetchChains = async () => {
      try {
        setIsLoadingChains(true);
        const result = await chainsApi.getChains({
          filter: chainSearchQuery || undefined,
          limit: 50,
        });
        setChains(result.data || []);
      } catch (error) {
        console.error("[Rewards] Failed to fetch chains", error);
        setChains([]);
      } finally {
        setIsLoadingChains(false);
      }
    };

    const debounce = setTimeout(fetchChains, 300);
    return () => clearTimeout(debounce);
  }, [chainSearchQuery]);

  const rewards = useMemo(
    () => extractStakeRewards(events, { relatedStakeKey }),
    [events, relatedStakeKey]
  );

  const chainOptions = useMemo(() => {
    const dedup = new Map<number, string>();

    const addChain = (idRaw: number | undefined, name?: string) => {
      if (idRaw === undefined || !Number.isFinite(idRaw)) return;
      const idNum = Number(idRaw);
      if (Number.isNaN(idNum)) return;
      if (dedup.has(idNum)) return;
      dedup.set(idNum, name || `Chain ${idNum}`);
    };

    chains.forEach((c) => {
      const idNum =
        c.chain_id !== undefined
          ? Number(c.chain_id)
          : c.id !== undefined
          ? Number(c.id)
          : undefined;
      const name = c.chain_name || c.name || (idNum !== undefined && !Number.isNaN(idNum) ? `Chain ${idNum}` : undefined);
      addChain(idNum, name);
    });

    rewards.forEach((reward) => {
      const metaChain = reward.metadata?.["chain_id"];
      const chainId = metaChain !== undefined ? Number(metaChain) : undefined;
      const name =
        (reward.metadata?.["chain_name"] as string | undefined) ||
        (chainId !== undefined && !Number.isNaN(chainId) ? `Chain ${chainId}` : undefined);
      addChain(chainId, name);
    });

    return Array.from(dedup.entries())
      .sort(([a], [b]) => a - b)
      .map(([id, name]) => ({ id, name }));
  }, [chains, rewards]);

  const chainNameMap = useMemo(() => {
    const map = new Map<number, string>();
    chainOptions.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [chainOptions]);

  const filteredRewards = useMemo(() => {
    if (selectedChainId === "all") return rewards;
    const chainNum = Number(selectedChainId);
    return rewards.filter((reward) => {
      const metaChain = reward.metadata?.["chain_id"];
      return metaChain !== undefined && Number(metaChain) === chainNum;
    });
  }, [rewards, selectedChainId]);

  const displayedTotal = useMemo(
    () =>
      filteredRewards.reduce((sum, reward) => {
        return sum + (Number.isFinite(reward.amount) ? reward.amount : 0);
      }, 0),
    [filteredRewards]
  );

  const getChainInfo = (reward: ReturnType<typeof extractStakeRewards>[number]) => {
    const chainIdRaw = reward.metadata?.["chain_id"];
    const chainId = chainIdRaw !== undefined ? Number(chainIdRaw) : undefined;
    const chainName =
      (reward.metadata?.["chain_name"] as string | undefined) ||
      (chainId !== undefined ? chainNameMap.get(chainId) : undefined) ||
      (chainId !== undefined ? `Chain ${chainId}` : undefined);
    const color =
      chainId !== undefined && CHAIN_COLORS[chainId]
        ? CHAIN_COLORS[chainId]
        : "#1f2937";
    const initials =
      chainName?.slice(0, 2)?.toUpperCase() ??
      (chainId !== undefined ? String(chainId) : "NA");
    return { chainId, chainName, color, initials };
  };

  const groupedByDate = useMemo(() => {
    type BucketGroup = {
      label: string;
      bucketTotal: number;
      count: number;
      source: "autocompound" | "withdrawal" | "mixed" | "unknown";
      token?: string;
      ts: number;
      chainIds: Set<number>;
      chainName?: string;
    };
    type DateGroup = {
      label: string;
      dateTotal: number;
      buckets: BucketGroup[];
    };

    const dateMap = new Map<
      string,
      { label: string; dateTotal: number; buckets: Map<string, BucketGroup> }
    >();

    const windowMs =
      groupingWindow > 0 ? groupingWindow * 60 * 1000 : 0;

    filteredRewards.forEach((reward) => {
      const dateObj = new Date(reward.timestamp);
      const dateKey = format(dateObj, "yyyy-MM-dd");
      const dateLabel = format(dateObj, "MMM d, yyyy");
      const baseTs = dateObj.getTime();
      const bucketStart =
        windowMs > 0 ? Math.floor(baseTs / windowMs) * windowMs : baseTs;
      const chainKey = reward.metadata?.["chain_id"];
      const bucketKey = `${dateKey}-${chainKey ?? "unknown"}-${bucketStart}`;
      const bucketLabel =
        windowMs > 0
          ? format(new Date(bucketStart), "HH:mm")
          : format(dateObj, "HH:mm:ss");

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          label: dateLabel,
          dateTotal: 0,
          buckets: new Map(),
        });
      }

      const dateEntry = dateMap.get(dateKey)!;
      dateEntry.dateTotal += reward.amount;

      if (!dateEntry.buckets.has(bucketKey)) {
        dateEntry.buckets.set(bucketKey, {
          label: bucketLabel,
          bucketTotal: 0,
          count: 0,
          source: "unknown",
          token: reward.token,
          ts: bucketStart,
          chainIds: new Set<number>(),
          chainName:
            (reward.metadata?.["chain_name"] as string | undefined) || undefined,
        });
      }

      const bucketEntry = dateEntry.buckets.get(bucketKey)!;
      bucketEntry.bucketTotal += reward.amount;
      bucketEntry.count += 1;
      bucketEntry.token = bucketEntry.token ?? reward.token;
      if (reward.metadata?.["chain_id"] !== undefined) {
        const chainIdNum = Number(reward.metadata["chain_id"]);
        if (!Number.isNaN(chainIdNum)) {
          bucketEntry.chainIds.add(chainIdNum);
          if (!bucketEntry.chainName) {
            bucketEntry.chainName =
              (reward.metadata?.["chain_name"] as string | undefined) ||
              chainNameMap.get(chainIdNum) ||
              `Chain ${chainIdNum}`;
          }
        }
      } else if (reward.metadata?.["chain_name"] && !bucketEntry.chainName) {
        bucketEntry.chainName = reward.metadata["chain_name"] as string;
      }

      const currentSource = bucketEntry.source;
      const rewardSource = reward.source;
      if (currentSource === "mixed") {
        // already mixed
      } else if (currentSource === "unknown") {
        bucketEntry.source =
          rewardSource === "autocompound" || rewardSource === "withdrawal"
            ? rewardSource
            : "unknown";
      } else if (currentSource !== rewardSource) {
        bucketEntry.source = "mixed";
      }
    });

    return Array.from(dateMap.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([, value]) => ({
        label: value.label,
        dateTotal: value.dateTotal,
        buckets: Array.from(value.buckets.entries())
          .sort(([, a], [, b]) => (a.ts > b.ts ? -1 : 1))
          .map(([, m]) => m),
      }));
  }, [filteredRewards, groupingWindow, chainNameMap]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      { root: scrollRef.current, rootMargin: "120px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className={cn("space-y-3", compact && "text-sm")}>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Rewards Activity</h3>
        <p className="text-xs text-muted-foreground">
          Rewards are automatically compounded or withdrawn to your wallet; there is no manual claim.
          Use filters to focus by chain, time window, or date range.
        </p>
      </div>

      <div className="rounded-md border bg-muted/30 p-3 flex flex-wrap items-center gap-2">
        <Select
          value={String(groupingWindow)}
          onValueChange={(val) => setGroupingWindow(Number(val))}
        >
          <SelectTrigger className="h-8 w-[150px]">
            <SelectValue placeholder="Grouping" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Show all</SelectItem>
            <SelectItem value="5">Group 5m</SelectItem>
            <SelectItem value="15">Group 15m</SelectItem>
            <SelectItem value="30">Group 30m</SelectItem>
          </SelectContent>
        </Select>

        <Popover open={chainPopoverOpen} onOpenChange={setChainPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <Search className="h-4 w-4" />
              {selectedChainId === "all"
                ? "All chains"
                : chainOptions.find((c) => String(c.id) === selectedChainId)?.name ||
                  `Chain ${selectedChainId}`}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-64" align="start" sideOffset={6}>
            <Command>
              <CommandInput
                placeholder="Search chains..."
                value={chainSearchQuery}
                onValueChange={setChainSearchQuery}
              />
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setSelectedChainId("all");
                      setChainPopoverOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedChainId === "all" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All chains
                  </CommandItem>
                  {isLoadingChains && (
                    <CommandItem disabled>Loading...</CommandItem>
                  )}
                  {chainOptions.map((chain) => (
                    <CommandItem
                      key={chain.id}
                      onSelect={() => {
                        setSelectedChainId(String(chain.id));
                        setChainPopoverOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedChainId === String(chain.id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {chain.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <CalendarIcon className="h-4 w-4" />
              {dateRange.from
                ? `${format(dateRange.from, "MMM d")} - ${
                    dateRange.to ? format(dateRange.to, "MMM d") : ""
                  }`
                : "Date range"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0 w-auto border bg-popover"
            align="start"
            sideOffset={8}
          >
            <div className="p-3 space-y-3">
              <Calendar
                mode="range"
                selected={draftDateRange}
                onSelect={(range) => setDraftDateRange(range ?? {})}
                numberOfMonths={2}
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDraftDateRange({});
                    setDateRange({});
                    setDatePopoverOpen(false);
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setDateRange(draftDateRange);
                    setDatePopoverOpen(false);
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="secondary" className="text-xs">
            {formatBalance(displayedTotal, 2)} {filteredRewards[0]?.token || "CNPY"} shown
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border p-3 gap-3"
            >
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-sm text-destructive">
          Unable to load rewards. Please try again later.
        </div>
      ) : filteredRewards.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No rewards recorded yet. As soon as rewards are compounded or
          withdrawn, they will show up here.
        </div>
      ) : groupingWindow === 0 ? (
        <div
          ref={scrollRef}
          className="space-y-2 max-h-[600px] overflow-y-auto pr-1"
        >
          {filteredRewards.map((reward, idx) => {
            const explorerUrl = getExplorerUrl(reward);
            const chainInfo = getChainInfo(reward);
            return (
              <div
                key={`${reward.txHash || reward.timestamp}-${idx}`}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                    style={{ backgroundColor: chainInfo.color }}
                  >
                    {chainInfo.initials}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">
                        +{formatBalance(reward.amount, 4)}{" "}
                        {reward.token || "CNPY"}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {reward.source === "autocompound"
                          ? "Autocompound"
                          : reward.source === "withdrawal"
                          ? "Withdrawal"
                          : "Reward"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(reward.timestamp), "MMM d, yyyy HH:mm:ss")}
                      {reward.relatedStakeKey && (
                        <span className="ml-2">
                          - Stake {reward.relatedStakeKey}
                        </span>
                      )}
                      <span className="ml-2">
                        &middot; {chainInfo.chainName || "Chain"}
                      </span>
                    </div>
                  </div>
                </div>
                {explorerUrl && (
                  <a
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                    href={explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View tx
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            );
          })}
          <div ref={loadMoreRef} className="h-6" />
          {isFetchingNextPage && (
            <div className="space-y-2">
              {[...Array(2)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border p-3 gap-3"
                >
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="space-y-4 max-h-[460px] overflow-y-auto pr-1"
        >
          {groupedByDate.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">{group.label}</h4>
                <span className="text-xs text-muted-foreground">
                  {formatBalance(group.dateTotal, 2)} {rewards[0]?.token || "CNPY"}
                </span>
              </div>
              <div className="space-y-2">
                {group.buckets.map((bucketGroup, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                        style={{
                          backgroundColor:
                            bucketGroup.chainIds.size === 1
                              ? CHAIN_COLORS[
                                  Array.from(bucketGroup.chainIds)[0] as keyof typeof CHAIN_COLORS
                                ] || "#1f2937"
                              : "#6b7280",
                        }}
                      >
                        {bucketGroup.chainName
                          ? bucketGroup.chainName.slice(0, 2).toUpperCase()
                          : bucketGroup.chainIds.size === 1
                          ? String(Array.from(bucketGroup.chainIds)[0])
                          : "MC"}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {bucketGroup.label}
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {bucketGroup.source === "mixed"
                              ? "Mixed"
                              : bucketGroup.source === "autocompound"
                              ? "Autocompound"
                              : bucketGroup.source === "withdrawal"
                              ? "Withdrawal"
                              : "Reward"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {bucketGroup.count} event{bucketGroup.count !== 1 ? "s" : ""} ·{" "}
                          {bucketGroup.chainIds.size > 1
                            ? "Multiple chains"
                            : bucketGroup.chainName ||
                              (bucketGroup.chainIds.size === 1
                                ? `Chain ${Array.from(bucketGroup.chainIds)[0]}`
                                : "Chain")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        +{formatBalance(bucketGroup.bucketTotal, 4)}{" "}
                        {bucketGroup.token || rewards[0]?.token || "CNPY"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div ref={loadMoreRef} className="h-6" />
          {isFetchingNextPage && (
            <div className="space-y-2">
              {[...Array(2)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border p-3 gap-3"
                >
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}




