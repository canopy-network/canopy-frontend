"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import { useState } from "react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  triggerClassName?: string;
}

/**
 * Reusable dropdown component for selecting options
 * Simple and flexible for use across the application
 */
export const Dropdown = ({
  options,
  value,
  onValueChange,
  placeholder = "Select option",
  label,
  className = "",
  triggerClassName = "",
}: DropdownProps) => {
  const [open, setOpen] = useState(false);

  // Get current option display text
  const getCurrentLabel = () => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : placeholder;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 border-[#2a2a2a] text-white hover:bg-[#1a1a1a] bg-transparent font-medium ${triggerClassName}`}
        >
          <Filter className="h-4 w-4" />
          {getCurrentLabel()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`w-56 ${className}`} align="end">
        {label && (
          <>
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => onValueChange(option.value)}
            className={`cursor-pointer ${
              value === option.value ? "bg-gray-100 dark:bg-gray-800" : ""
            }`}
          >
            {option.icon && <span className="mr-2">{option.icon}</span>}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Dropdown;
