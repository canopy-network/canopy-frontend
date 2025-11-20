"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Box } from "lucide-react";
import Link from "next/link";
import { LiveStatusComponent } from "./live-status-component";
import { Progress } from "@/components/ui/progress";
import { Chain } from "@/types/chains";

interface NewLaunchesProps {
  chains: Chain[];
}

export function NewLaunches({ chains }: NewLaunchesProps) {
  // Initialize progress for each chain with random values between 50-90%
  const [progressMap, setProgressMap] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>();
    chains.forEach((chain) => {
      map.set(chain.id, Math.floor(Math.random() * 40) + 50); // 50-90%
    });
    return map;
  });

  // Increment progress by 1% every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressMap((prev) => {
        const newMap = new Map(prev);
        chains.forEach((chain) => {
          const currentProgress = newMap.get(chain.id) || 50;
          const newProgress = Math.min(currentProgress + 1, 100); // Cap at 100%
          newMap.set(chain.id, newProgress);
        });
        return newMap;
      });
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [chains]);
  return (
    <div className="card-like p-4">
      <div className="flex items-center justify-between leading-none mb-4 lg:pl-3">
        <h2 className="text-xl font-bold text-white">New Launches</h2>
        <div className="flex items-center gap-4">
          <LiveStatusComponent />
          <div className="flex items-center gap-2 text-muted-foreground text-sm bg-white/[0.05] rounded-lg px-4 py-2">
            <Box className="w-4 h-4" />
            <span>Latest update 44 secs ago</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {chains.map((chain) => (
          <div
            key={chain.id}
            className="rounded-xl p-4 bg-background hover:bg-background/75 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-purple-500 to-pink-500" />
                <div className="min-w-40">
                  <div className="font-medium">{chain.chain_name}</div>
                  <div className="text-sm text-muted-foreground">
                    ${chain.token_symbol}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8 w-full ml-auto justify-end">
                <div className="text-left">
                  <div className="font-medium">
                    {chain.virtual_pool?.market_cap_usd
                      ? chain.virtual_pool.market_cap_usd >= 1000000
                        ? `$${(
                            chain.virtual_pool.market_cap_usd / 1000000
                          ).toFixed(2)}M`
                        : `$${(
                            chain.virtual_pool.market_cap_usd / 1000
                          ).toFixed(1)}K`
                      : "N/A"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Market Cap
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-background" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-background" />
                  </div>
                  <span className="text-sm">
                    +{chain.virtual_pool?.unique_traders || 0}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-md text-sm font-medium">
                    {progressMap.get(chain.id) || 50}%
                  </div>
                  <Progress
                    value={progressMap.get(chain.id) || 50}
                    className="w-full min-w-24 max-w-24 h-2"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <Link href="/explorer/chains?filter=new">
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
  );
}
