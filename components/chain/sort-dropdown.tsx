"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Activity,
  DollarSign,
  ArrowUpDown,
  LucideIcon,
  Sparkles,
  Target,
} from "lucide-react";

// Sort options configuration
interface SortOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

const sortOptions: SortOption[] = [
  { value: "default", label: "Default", icon: Sparkles },
  {
    value: "market-cap-high",
    label: "Market Cap:[split]High to Low",
    icon: TrendingUp,
  },
  {
    value: "market-cap-low",
    label: "Market Cap:[split]Low to High",
    icon: TrendingUp,
  },
  {
    value: "volume-high",
    label: "Volume:[split]High to Low",
    icon: Activity,
  },
  {
    value: "volume-low",
    label: "Volume:[split]Low to High",
    icon: Activity,
  },
  {
    value: "price-high",
    label: "Price:[split]High to Low",
    icon: DollarSign,
  },
  {
    value: "price-low",
    label: "Price:[split]Low to High",
    icon: DollarSign,
  },
  {
    value: "completion-percentage-high",
    label: "Completion:[split]High to Low",
    icon: Target,
  },
  {
    value: "completion-percentage-low",
    label: "Completion:[split]Low to High",
    icon: Target,
  },
];

interface SortDropdownProps {
  value: string;
  onSort: (value: string) => void;
  className?: string;
  mobile?: boolean;
}

export function SortDropdown({
  value,
  onSort,
  className,
  mobile = false,
}: SortDropdownProps) {
  if (mobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="card-like h-11.5 w-11.5 justify-center items-center flex !leading-none hover:bg-muted rounded-lg">
            <ArrowUpDown className="w-4 h-4 mx-auto text-white block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[242px]">
          {sortOptions.map((option) => {
            const OptionIcon = option.icon;
            const [mainLabel, subLabel] = option.label.split("[split]");
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSort(option.value)}
                className={`cursor-pointer ${
                  value === option.value ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <OptionIcon className="w-4 h-4 text-white" />
                  <span>{mainLabel}</span>
                  {subLabel && (
                    <span className="text-muted-foreground">{subLabel}</span>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Select value={value} onValueChange={onSort}>
      <SelectTrigger className={`h-9 w-[180px] gap-2 ${className}`}>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent align="end" className="w-[242px]">
        {sortOptions.map((option) => {
          const OptionIcon = option.icon;
          const [mainLabel, subLabel] = option.label.split("[split]");
          return (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <OptionIcon className="w-4 h-4 text-white" />
                <span>{mainLabel}</span>
                {subLabel && (
                  <span className="text-muted-foreground">{subLabel}</span>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
