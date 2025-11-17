"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, Box } from "lucide-react";
import Link from "next/link";
import { LiveStatusComponent } from "./live-status-component";

interface Validator {
  name: string;
  address: string;
  stake: string;
  apr: string;
  uptime: number;
}

interface TopValidatorsProps {
  validators: Validator[];
}

export function TopValidators({ validators }: TopValidatorsProps) {
  return (
    <div className="card-like p-4">
      <div className="flex items-center justify-between leading-none mb-4 lg:pl-3">
        <h2 className="text-xl font-bold text-white">Top Validators</h2>
        <div className="flex items-center gap-4">
          <LiveStatusComponent />
          <div className="flex items-center gap-2 text-muted-foreground text-sm bg-white/[0.05] rounded-lg px-4 py-2">
            <Box className="w-4 h-4" />
            <span>Latest update 44 secs ago</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {validators.map((validator, index) => (
          <div
            key={validator.address}
            className="rounded-xl p-4 bg-background hover:bg-background/75 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-medium">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium px-3 py-1.5 bg-muted rounded-md inline-block">
                    {validator.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-medium">{validator.stake}</div>
                  <div className="text-sm text-muted-foreground">Stake</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{validator.apr}</div>
                  <div className="text-sm text-muted-foreground">APR</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <Link href="/explorer/validators">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1"
          >
            View All Validators
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
