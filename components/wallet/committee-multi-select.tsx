"use client";

import { useCallback, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CommitteeOption } from "@/lib/staking/staking-utils";

interface CommitteeMultiSelectProps {
    options: CommitteeOption[];
    value: number[];
    onChange: (next: number[]) => void;
    label?: string;
    onClear?: () => void;
    clearLabel?: string;
    query: string;
    onQueryChange: (next: string) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    loading?: boolean;
}

export function CommitteeMultiSelect({
    options,
    value,
    onChange,
    label,
    onClear,
    clearLabel = "Clear",
    query,
    onQueryChange,
    onLoadMore,
    hasMore = false,
    loading = false,
}: CommitteeMultiSelectProps) {
    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return options;
        return options.filter((opt) => {
            return (
                opt.name.toLowerCase().includes(q) ||
                opt.symbol.toLowerCase().includes(q) ||
                String(opt.chainId).includes(q)
            );
        });
    }, [options, query]);

    const toggle = (id: number) => {
        onChange(
            value.includes(id)
                ? value.filter((v) => v !== id)
                : [...value, id]
        );
    };

    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const target = e.currentTarget;
            const nearBottom =
                target.scrollHeight - target.scrollTop <=
                target.clientHeight + 48;
            if (nearBottom && hasMore && onLoadMore && !loading) {
                onLoadMore();
            }
        },
        [hasMore, onLoadMore, loading]
    );

    return (
        <div className="space-y-3">
            {label && (
                <div className="text-sm font-medium text-foreground">
                    {label}
                </div>
            )}
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Search chains..."
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                />
                <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {value.length} selected
                    </div>
                    {onClear && value.length > 0 && (
                        <button
                            type="button"
                            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                            onClick={() => {
                                onClear();
                                onQueryChange("");
                            }}
                        >
                            {clearLabel}
                        </button>
                    )}
                </div>
            </div>
            <div
                className="max-h-[320px] overflow-y-auto space-y-2 pr-1"
                onScroll={handleScroll}
            >
                {filtered.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-3">
                        No chains found
                    </div>
                ) : (
                    filtered.map((opt) => (
                        <label
                            key={opt.chainId}
                            className={cn(
                                "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                                value.includes(opt.chainId)
                                    ? "border-primary/40 bg-primary/5"
                                    : "border-border"
                            )}
                        >
                            <Checkbox
                                checked={value.includes(opt.chainId)}
                                onCheckedChange={() => toggle(opt.chainId)}
                            />
                            <Badge
                                className="text-white"
                                style={{ backgroundColor: opt.color }}
                            >
                                {opt.symbol.slice(0, 2)}
                            </Badge>
                            <div className="flex flex-col">
                                <span className="font-medium truncate">{opt.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    ID: {opt.chainId} · {opt.symbol}
                                </span>
                            </div>
                        </label>
                    ))
                )}
                {loading && (
                    <div className="py-2 text-center text-xs text-muted-foreground">
                        Loading...
                    </div>
                )}
                {hasMore && !loading && (
                    <div className="py-2 text-center text-xs text-muted-foreground">
                        Scroll for more
                    </div>
                )}
            </div>
            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((id) => {
                        const opt = options.find((o) => o.chainId === id);
                        if (!opt) return null;
                        return (
                            <Badge
                                key={id}
                                variant="secondary"
                                className={cn("text-xs pl-1.5 pr-1 py-0.5 gap-1")}
                            >
                                <span
                                    className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                                    style={{ backgroundColor: opt.color }}
                                >
                                    {opt.symbol.slice(0, 2)}
                                </span>
                                {opt.name}
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
