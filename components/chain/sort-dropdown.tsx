"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  ArrowUpDown,
  LucideIcon,
  Sparkles,
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
    label: "Market Cap: High to Low",
    icon: TrendingUp,
  },
  {
    value: "market-cap-low",
    label: "Market Cap: Low to High",
    icon: TrendingUp,
  },
  {
    value: "holders-high",
    label: "Holders:[split]High to Low",
    icon: Users,
  },
  {
    value: "holders-low",
    label: "Holders:[split]Low to High",
    icon: Users,
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
];

interface SortDropdownProps {
  value: string;
  onSort: (value: string) => void;
  className?: string;
}

export function SortDropdown({ value, onSort, className }: SortDropdownProps) {
  const currentOption = sortOptions.find((opt) => opt.value === value);
  const Icon = currentOption?.icon || Sparkles;

  return (
    <Select value={value} onValueChange={onSort}>
      <SelectTrigger className={`h-9 w-[180px] gap-2 ${className}`}>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent align="end" className="w-[220px]">
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
