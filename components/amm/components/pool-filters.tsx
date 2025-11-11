"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter } from "lucide-react";
import { PoolType } from "../types/amm/pool";
import { PoolFilters as PoolFiltersType } from "../types/amm/filters";

const POOLS_TYPE_QUANTITY = Object.keys(PoolType).length;

interface PoolFiltersProps {
  filters: PoolFiltersType;
  onFiltersChange: (filters: PoolFiltersType) => void;
}

export function PoolFilters({ filters, onFiltersChange }: PoolFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof PoolFiltersType>(
    key: K,
    value: PoolFiltersType[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const togglePoolType = (poolType: PoolType) => {
    const newTypes = filters.poolTypes.includes(poolType)
      ? filters.poolTypes.filter((t) => t !== poolType)
      : [...filters.poolTypes, poolType];
    updateFilter("poolTypes", newTypes);
  };

  const handleReset = () => {
    onFiltersChange({
      search: filters.search,
      poolTypes: [PoolType.Virtual, PoolType.Graduated],
      tvlMin: undefined,
      tvlMax: undefined,
      volume24hMin: undefined,
      volume24hMax: undefined,
      aprMin: undefined,
      aprMax: undefined,
    });
  };

  const hasActiveFilters =
    filters.poolTypes.length !== POOLS_TYPE_QUANTITY ||
    filters.tvlMin !== undefined ||
    filters.tvlMax !== undefined ||
    filters.volume24hMin !== undefined ||
    filters.volume24hMax !== undefined ||
    filters.aprMin !== undefined ||
    filters.aprMax !== undefined;

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Search pools..."
        value={filters.search}
        onChange={(event) => updateFilter("search", event.target.value)}
        className="max-w-sm"
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Filter className="h-4 w-4" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Filters</div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset
                </Button>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Pool Type</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="virtual"
                    checked={filters.poolTypes.includes(PoolType.Virtual)}
                    onCheckedChange={() => togglePoolType(PoolType.Virtual)}
                  />
                  <label
                    htmlFor="virtual"
                    className="text-sm leading-none cursor-pointer"
                  >
                    Virtual Pools
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="graduated"
                    checked={filters.poolTypes.includes(PoolType.Graduated)}
                    onCheckedChange={() => togglePoolType(PoolType.Graduated)}
                  />
                  <label
                    htmlFor="graduated"
                    className="text-sm leading-none cursor-pointer"
                  >
                    Graduated Pools
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">TVL Range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.tvlMin ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "tvlMin",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="h-8"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.tvlMax ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "tvlMax",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="h-8"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Volume 24H Range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.volume24hMin ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "volume24hMin",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="h-8"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.volume24hMax ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "volume24hMax",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="h-8"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">APR Range (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.aprMin ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "aprMin",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="h-8"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.aprMax ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "aprMax",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="h-8"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
