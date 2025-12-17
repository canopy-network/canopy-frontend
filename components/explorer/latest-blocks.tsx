"use client";

import * as React from "react";
import Link from "next/link";
import { Box } from "lucide-react";
import { TableCard, TableColumn } from "./table-card";
import { Block } from "@/types/blocks";
import { canopyIconSvg, getCanopyAccent, EXPLORER_ICON_GLOW } from "@/lib/utils/brand";

const formatAddress = (value: string, prefix = 6, suffix = 6) =>
    `${value.slice(0, prefix)}...${value.slice(-suffix)}`;

// Format time ago from ISO timestamp string
const formatTimeAgo = (timestamp: string): string => {
    const now = Date.now();
    const blockTime = new Date(timestamp).getTime();
    const seconds = Math.floor((now - blockTime) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

interface LatestBlocksProps {
    blocks: Block[];
    isLoading?: boolean;
}

export function LatestBlocks({ blocks, isLoading = false }: LatestBlocksProps) {
    // Helper function to get validator name from address
    const getValidatorName = React.useCallback(
        (address: string): string => {
            // Format address as "Val-XX" based on last 2 chars of first 6 chars
            const shortAddr = address.slice(0, 6);
            return `Val-${shortAddr.slice(-2)}`;
        },
        []
    );

    // Get the most recent block timestamp for LatestUpdated component
    const mostRecentTimestamp = React.useMemo(() => {
        if (blocks.length === 0) return undefined;
        return blocks[0].timestamp; // Blocks are sorted newest first
    }, [blocks]);

    const columns: TableColumn[] = [
        { label: "Height", width: "w-32" },
        { label: "Hash", width: "w-32" },
        { label: "Txns", width: "w-24" },
        { label: "Time", width: "w-32" },
        { label: "Fee", width: "w-32" },
        { label: "Producer", width: "w-40" },
    ];

    const rows = blocks.map((block) => {
        const validatorName = block.proposer_address ? getValidatorName(block.proposer_address) : "";
        const feeInCNPY = block.total_fees ? (block.total_fees / 1_000_000).toFixed(2) : "0.00";

        return [
            // Height - with green cube icon
            <Link
                key="height"
                href={`/blocks/${block.height}`}
                className="flex items-center gap-2 text-xs text-white/80 hover:opacity-80 transition-opacity hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-center w-5 h-5 border border-[#00a63d] rounded bg-black/30">
                    <Box className={`w-3 h-3 text-[#00a63d] ${EXPLORER_ICON_GLOW}`} />
                </div>
                {block.height.toLocaleString()}
            </Link>,
            // Hash
            <Link
                key="hash"
                href={`/blocks/${block.height}`}
                className="text-xs text-white/80 hover:opacity-80 transition-opacity hover:underline"
                onClick={(e) => e.stopPropagation()}
            >
                {formatAddress(block.hash, 6, 6)}
            </Link>,
            // Txns
            <span key="txs" className="text-xs text-white font-medium">
                {block.num_txs.toLocaleString()}
            </span>,
            // Time
            <span key="time" className="text-sm text-muted-foreground">
                {formatTimeAgo(block.timestamp)}
            </span>,
            // Fee
            <span key="fee" className="text-xs text-white font-medium">
                {feeInCNPY} CNPY
            </span>,
            // Producer - with icon, name and address
            <div key="producer" className="flex items-center gap-2">
                {block.proposer_address ? (
                    <>
                        <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                            dangerouslySetInnerHTML={{
                                __html: canopyIconSvg(getCanopyAccent(block.proposer_address)),
                            }}
                        />
                        <div className="flex flex-col">
                            <Link
                                href={`/accounts/${block.proposer_address}`}
                                className="text-xs text-white hover:opacity-80 transition-opacity hover:underline font-medium"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {validatorName}
                            </Link>
                            <span className="text-xs text-muted-foreground">
                                {formatAddress(block.proposer_address, 6, 6)}
                            </span>
                        </div>
                    </>
                ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                )}
            </div>,
        ];
    });

    return (
        <TableCard
            id="latest-blocks"
            title="Latest Blocks"
            live={true}
            columns={columns}
            rows={rows}
            viewAllPath="/blocks"
            loading={isLoading || blocks.length === 0}
            updatedTime={mostRecentTimestamp ? formatTimeAgo(mostRecentTimestamp) : undefined}
            compactFooter={true}
            spacing={3}
            className="gap-2 lg:gap-6"
            viewAllText="Blocks"
        />
    );
}

