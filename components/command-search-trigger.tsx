"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CommandSearchDialog from "@/components/command-search-dialog";
import { ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandSearchTriggerProps {
  variant?: "explorer" | "sidebar";
  displayChainName?: string;
  explorerMode?: boolean;
  onChainSelect?: (chain: { id: number; chain_name: string }) => void;
  isCondensed?: boolean;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  noRouterPush?: boolean;
  chainSearchOnly?: boolean;
}

export function CommandSearchTrigger({
  variant = "explorer",
  displayChainName,
  explorerMode = false,
  onChainSelect,
  isCondensed = false,
  className,
  open,
  onOpenChange,
  noRouterPush = false,
  chainSearchOnly = false,
}: CommandSearchTriggerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const handleTriggerClick = () => handleOpenChange(true);

  const trigger =
    variant === "sidebar" ? (
      <button
        onClick={handleTriggerClick}
        className={cn(
          "flex items-center rounded-full bg-transparent hover:bg-white/5 transition-colors",
          isCondensed
            ? "w-10 h-10 justify-center text-white/50"
            : "w-full h-9 justify-between pl-4 pr-2 text-sm text-white/50"
        )}
      >
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4" />
          <span
            className={cn(
              "transition-all duration-300",
              isCondensed ? "hidden" : "block"
            )}
          >
            Search chains...
          </span>
        </div>
        <kbd
          className={cn(
            "h-5 select-none items-center gap-1 rounded-2xl bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white/70 transition-all duration-300",
            isCondensed ? "hidden" : "hidden sm:inline-flex"
          )}
        >
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    ) : (
      <Button
        variant="ghost"
        role="combobox"
        aria-expanded={isOpen}
        onClick={handleTriggerClick}
        className="h-10 gap-2 text-green-500 border border-green-500 min-w-36 truncate px-8 mr-1 hover:text-green-400 hover:bg-green-500/10"
      >
        <ChevronsUpDown className="h-4 w-4" />

        <span className="text-sm capitalize truncate">{displayChainName}</span>
      </Button>
    );

  return (
    <>
      {className ? <div className={className}>{trigger}</div> : trigger}
      <CommandSearchDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        explorerMode={explorerMode}
        onChainSelect={onChainSelect}
        noRouterPush={noRouterPush}
        chainSearchOnly={chainSearchOnly}
      />
    </>
  );
}
