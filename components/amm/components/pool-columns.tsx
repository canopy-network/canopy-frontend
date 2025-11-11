"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LiquidityPool, PoolType } from "../types/amm/pool";

interface SortableHeaderProps {
  column: any;
  label: string;
}

interface PriceChangeProps {
  change?: number;
}

// Sortable header component
function SortableHeader({ column, label }: SortableHeaderProps) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="hover:bg-muted/50"
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

// Price change component
function PriceChange({ change }: PriceChangeProps) {
  if (!change) return <span className="text-muted-foreground">-</span>;

  const isPositive = change >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className={`flex items-center gap-1 ${isPositive ? "text-green-500" : "text-red-500"}`}
    >
      <Icon className="h-4 w-4" />
      <span>{Math.abs(change).toFixed(2)}%</span>
    </div>
  );
}

export const columns: ColumnDef<LiquidityPool>[] = [
  {
    accessorKey: "pair",
    header: ({ column }) => <SortableHeader column={column} label="Pool" />,
    cell: ({ row }) => {
      const pool = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarImage src={pool.baseToken.icon} />
              <AvatarFallback>{pool.baseToken.symbol[0]}</AvatarFallback>
            </Avatar>
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarImage src={pool.quoteToken.icon} />
              <AvatarFallback>{pool.quoteToken.symbol[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="font-medium">{pool.pair}</div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  pool.type === PoolType.Virtual ? "secondary" : "default"
                }
                className="text-xs"
              >
                {pool.type === PoolType.Virtual ? "Virtual" : "Graduated"}
              </Badge>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "tvl",
    header: ({ column }) => <SortableHeader column={column} label="TVL" />,
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("tvl")}</div>;
    },
  },
  {
    accessorKey: "volume24h",
    header: ({ column }) => (
      <SortableHeader column={column} label="Volume 24H" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("volume24h")}</div>;
    },
  },
  {
    accessorKey: "priceChange24h",
    header: ({ column }) => (
      <SortableHeader column={column} label="24H Change" />
    ),
    cell: ({ row }) => {
      return <PriceChange change={row.getValue("priceChange24h")} />;
    },
  },
  {
    accessorKey: "apr",
    header: ({ column }) => <SortableHeader column={column} label="APR" />,
    cell: ({ row }) => {
      const apr = row.getValue("apr") as number | undefined;
      return (
        <div className="font-medium">
          {apr ? `${apr.toFixed(2)}%` : <span className="text-muted-foreground">-</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "graduationProgress",
    header: "Progress",
    cell: ({ row }) => {
      const pool = row.original;
      if (pool.type !== PoolType.Virtual || !pool.graduationProgress) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <div className="w-full">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Graduation</span>
            <span className="font-medium">
              {pool.graduationProgress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${pool.graduationProgress}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "myLiquidity",
    header: "My Liquidity",
    cell: ({ row }) => {
      const myLiquidity = row.getValue("myLiquidity") as string | undefined;
      return (
        <div className="font-medium">
          {myLiquidity || (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      );
    },
  },
];
