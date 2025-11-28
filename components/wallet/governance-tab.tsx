"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    AlertCircle,
    ChevronRight,
    Clock,
    Check,
    X,
    AlertTriangle,
    ChevronDown,
} from "lucide-react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { portfolioApi, chainsApi, governanceApi } from "@/lib/api";
import { formatTokenAmount, withCommas } from "@/lib/utils/denomination";
import { generateChainColor } from "@/lib/utils/chain-ui-helpers";
import type { TokenBalance } from "@/types/wallet";
import type { Chain } from "@/types/chains";
import type {
    GovernanceProposal,
    ProposalStatus,
    VotingPowerByChain,
} from "@/types/governance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface GovernanceTabProps {
    tokens: TokenBalance[];
}

// Generate chain symbol from chain ID
function generateChainSymbol(chainId: number): string {
    return `C${chainId.toString().padStart(3, "0")}`;
}

// Get color for chain - use brand_color from chain or generate based on name
function getChainColor(chain: Chain | undefined, chainId: number): string {
    if (chain?.brand_color) {
        return chain.brand_color;
    }
    if (chain?.chain_name) {
        return generateChainColor(chain.chain_name);
    }
    // Fallback to generated color based on chain ID
    return generateChainColor(`Chain ${chainId}`);
}

// All data comes from real API endpoints
// - Chains: GET /api/v1/chains (status: virtual_active)
// - Portfolio: POST /api/v1/wallet/portfolio/overview
// - Governance proposals: GET /api/v1/governance/proposals (if available)

export function GovernanceTab({ tokens }: GovernanceTabProps) {
    const router = useRouter();
    const { currentWallet } = useWalletStore();
    const [filter, setFilter] = useState<ProposalStatus | "all">("all");
    const [selectedChain, setSelectedChain] = useState<number | null>(null);
    const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
    const [chains, setChains] = useState<Chain[]>([]);
    const [votingPowerByChain, setVotingPowerByChain] = useState<VotingPowerByChain[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showLeftGradient, setShowLeftGradient] = useState(false);
    const [showRightGradient, setShowRightGradient] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Fetch chains and calculate voting power
    useEffect(() => {
        const fetchData = async () => {
            if (!currentWallet) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Fetch chains
                const chainsResponse = await chainsApi.getChains({
                    status: "virtual_active",
                    limit: 100,
                });
                const fetchedChains = chainsResponse.data || [];
                setChains(fetchedChains);

                // Fetch portfolio overview for voting power
                const portfolioResponse = await portfolioApi.getPortfolioOverview({
                    addresses: [currentWallet.address],
                });

                // Calculate voting power by chain - only chains with balance > 0
                const accounts = portfolioResponse.accounts || [];
                const powerByChain: VotingPowerByChain[] = accounts
                    .map((account) => {
                        const chain = fetchedChains.find(
                            (c) => c.chain_id && parseInt(c.chain_id) === account.chain_id
                        );

                        // Calculate total balance (liquid + staked + delegated) as voting power
                        const liquid = parseFloat(account.available_balance || "0");
                        const staked = parseFloat(account.staked_balance || "0");
                        const delegated = parseFloat(account.delegated_balance || "0");
                        const totalBalance = liquid + staked + delegated;

                        // Use real USD value from portfolio API
                        // Calculate price per token from total portfolio values
                        const portfolioTotalUSD = parseFloat(portfolioResponse.total_value_usd || "0");
                        const portfolioTotalCNPY = parseFloat(portfolioResponse.total_value_cnpy || "0");

                        // If we have USD value, use it to calculate price per token
                        let balanceUSD = 0;
                        if (portfolioTotalCNPY > 0 && portfolioTotalUSD > 0) {
                            const pricePerToken = portfolioTotalUSD / portfolioTotalCNPY;
                            balanceUSD = totalBalance * pricePerToken;
                        } else {
                            // Fallback: if no USD data, use 0 (will be filtered out if balance > 0)
                            balanceUSD = 0;
                        }

                        return {
                            chainId: account.chain_id,
                            chainName: chain?.chain_name || account.chain_name || `Chain ${account.chain_id}`,
                            chainColor: getChainColor(chain, account.chain_id),
                            balance: balanceUSD,
                            symbol: chain?.token_symbol || generateChainSymbol(account.chain_id),
                        };
                    })
                    .filter((item) => item.balance > 0) // Only show chains with voting power
                    .sort((a, b) => b.balance - a.balance); // Sort by balance descending (top)

                setVotingPowerByChain(powerByChain);

            } catch (error) {
                console.error("Failed to fetch governance data:", error);
                toast.error("Error loading governance data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentWallet, tokens]);

    // Fetch proposals when filters change
    // NOTE: Governance endpoints may not be available yet - show empty state if API fails
    useEffect(() => {
        const fetchProposals = async () => {
            if (!currentWallet) {
                setProposals([]);
                return;
            }

            try {
                // Try to fetch proposals from API
                // If endpoint doesn't exist, it will fail gracefully
                const proposalsResponse = await governanceApi.getProposals({
                    address: currentWallet.address,
                    status: filter !== "all" ? filter : undefined,
                    chain_ids: selectedChain ? [selectedChain] : undefined,
                });

                // Only set proposals if response has data
                if (proposalsResponse && proposalsResponse.proposals) {
                    setProposals(proposalsResponse.proposals);
                } else {
                    setProposals([]);
                }
            } catch (error) {
                // If API endpoint doesn't exist or fails, show empty state
                console.warn("Governance proposals endpoint not available:", error);
                setProposals([]);
            }
        };

        fetchProposals();
    }, [currentWallet, filter, selectedChain]);

    // Handle scroll to show/hide gradients
    useEffect(() => {
        const handleScroll = () => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                setShowLeftGradient(scrollLeft > 0);
                setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 10);
            }
        };

        const container = scrollContainerRef.current;
        if (container) {
            handleScroll();
            container.addEventListener("scroll", handleScroll);
            window.addEventListener("resize", handleScroll);
            return () => {
                container.removeEventListener("scroll", handleScroll);
                window.removeEventListener("resize", handleScroll);
            };
        }
    }, [chains]);

    // Calculate total voting power
    const totalVotingPower = votingPowerByChain.reduce((sum, item) => sum + item.balance, 0);

    // Get all active chains from API - show all chains that are virtual_active
    // Sort chains: first by voting power (if exists), then alphabetically
    const uniqueChains = chains
        .map((chain) => {
            const chainId = chain.chain_id ? parseInt(chain.chain_id) : 0;
            const power = votingPowerByChain.find((v) => v.chainId === chainId)?.balance || 0;
            return { chain, power };
        })
        .sort((a, b) => {
            // Sort by voting power descending, then alphabetically
            if (b.power !== a.power) {
                return b.power - a.power;
            }
            return (a.chain.chain_name || "").localeCompare(b.chain.chain_name || "");
        })
        .map((item) => item.chain);

    // Filter proposals
    const getFilteredProposals = () => {
        let filtered = proposals;

        // Filter by status
        if (filter !== "all") {
            filtered = filtered.filter((p) => p.status === filter);
        }

        // Filter by selected chain
        if (selectedChain !== null) {
            filtered = filtered.filter((p) => p.chainId === selectedChain);
        }

        return filtered;
    };

    const filteredProposals = getFilteredProposals();

    // Count proposals by status
    const activeProposalsCount = proposals.filter((p) => p.status === "active").length;
    const passedProposalsCount = proposals.filter((p) => p.status === "passed").length;
    const failedProposalsCount = proposals.filter((p) => p.status === "failed").length;

    const getStatusLabel = () => {
        switch (filter) {
            case "all":
                return "All Proposals";
            case "active":
                return `Active (${activeProposalsCount})`;
            case "passed":
                return `Passed (${passedProposalsCount})`;
            case "failed":
                return `Not Passed (${failedProposalsCount})`;
            default:
                return "All Proposals";
        }
    };

    const getUrgencyBadge = (urgency: string) => {
        if (urgency === "urgent") {
            return (
                <Badge variant="outline" className="border-orange-500/50 text-orange-500 gap-1">
                    <AlertCircle className="w-3 h-3" />
                    URGENT
                </Badge>
            );
        }
        return null;
    };

    const getStatusBadge = (status: ProposalStatus) => {
        switch (status) {
            case "passed":
                return (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                        Passed
                    </Badge>
                );
            case "failed":
                return (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                        Not Passed
                    </Badge>
                );
            default:
                return null;
        }
    };

    const handleProposalClick = (proposal: GovernanceProposal) => {
        // TODO: Navigate to proposal detail page
        router.push(`/governance/${proposal.id}`);
    };

    const handleChainClick = (chainId: number | null) => {
        setSelectedChain(selectedChain === chainId ? null : chainId);
    };

    if (!currentWallet) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="text-center py-12 text-muted-foreground">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm mb-2">Connect your wallet to view governance proposals</p>
                        <p className="text-xs">Connect your wallet to participate in governance</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-muted rounded w-1/3"></div>
                            <div className="h-12 bg-muted rounded w-1/4"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Voting Power Card */}
            <Card>
                <CardContent className="px-5 py-4">
                    <div className="space-y-5">
                        <div className="space-y-1">
                            <p className="text-lg font-bold">Total Voting Power</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold">${withCommas(totalVotingPower, 0)}</p>
                                <span className="text-sm text-muted-foreground">USD</span>
                            </div>
                        </div>
                        {votingPowerByChain.length > 0 && (
                            <TooltipProvider>
                                <div className="flex items-center gap-2">
                                    {votingPowerByChain.slice(0, 3).map((item) => (
                                        <Tooltip key={item.chainId}>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center gap-1.5 text-xs cursor-pointer">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: item.chainColor }}
                                                    />
                                                    <span className="text-muted-foreground">
                                                        ${withCommas(item.balance)}
                                                    </span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.chainName}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                    {votingPowerByChain.length > 3 && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer bg-muted/50 rounded-md">
                                                    +{votingPowerByChain.length - 3}
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                {votingPowerByChain.slice(3).map((item) => (
                                                    <div
                                                        key={item.chainId}
                                                        className="flex items-center justify-between gap-3 px-2 py-1.5 text-xs"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: item.chainColor }}
                                                            />
                                                            <span className="font-medium">{item.chainName}</span>
                                                        </div>
                                                        <span className="text-muted-foreground">
                                                            ${withCommas(item.balance)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </TooltipProvider>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Filters Section */}
            <div className="mt-10 mb-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                    {/* Chain Pills with Scroll Container */}
                    <div className="relative flex-1 min-w-0 w-[300px]">
                        {/* Left Gradient */}
                        {showLeftGradient && (
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                        )}

                        {/* Scrollable Container */}
                        <div
                            ref={scrollContainerRef}
                            className="flex items-center gap-2 overflow-x-auto scrollbar-hide"
                            style={{
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                            }}
                        >
                            {/* All Chains Pill */}
                            <button
                                onClick={() => handleChainClick(null)}
                                className={`h-9 px-4 rounded-full text-sm font-medium transition-colors shrink-0 ${selectedChain === null
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                All Chains
                            </button>

                            {/* Chain Pills - Show chains with voting power or proposals */}
                            {uniqueChains.map((chain) => {
                                const chainId = chain.chain_id ? parseInt(chain.chain_id) : 0;
                                const chainColor = getChainColor(chain, chainId);
                                const chainInitial = chain.chain_name?.substring(0, 1).toUpperCase() || "C";
                                return (
                                    <button
                                        key={chain.id}
                                        onClick={() => handleChainClick(chainId)}
                                        className={`h-9 px-4 rounded-full text-sm font-medium transition-colors flex items-center gap-2 shrink-0 ${selectedChain === chainId
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            }`}
                                    >
                                        <div
                                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: chainColor }}
                                        >
                                            <span className="text-[8px] font-bold text-white">
                                                {chainInitial}
                                            </span>
                                        </div>
                                        <span>{chain.chain_name}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right Gradient */}
                        {showRightGradient && (
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
                        )}
                    </div>

                    {/* Status Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-9 rounded-full">
                                {getStatusLabel()}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuCheckboxItem
                                checked={filter === "all"}
                                onCheckedChange={() => setFilter("all")}
                            >
                                All Proposals
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={filter === "active"}
                                onCheckedChange={() => setFilter("active")}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span>Active</span>
                                    <Badge variant="secondary" className="ml-2">
                                        {activeProposalsCount}
                                    </Badge>
                                </div>
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={filter === "passed"}
                                onCheckedChange={() => setFilter("passed")}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span>Passed</span>
                                    <Badge variant="secondary" className="ml-2">
                                        {passedProposalsCount}
                                    </Badge>
                                </div>
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={filter === "failed"}
                                onCheckedChange={() => setFilter("failed")}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span>Not Passed</span>
                                    <Badge variant="secondary" className="ml-2">
                                        {failedProposalsCount}
                                    </Badge>
                                </div>
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Proposals List */}
                <div className="space-y-4">
                    {filteredProposals.length > 0 ? (
                        filteredProposals.map((proposal) => {
                            const chain = chains.find(
                                (c) => c.chain_id && parseInt(c.chain_id) === proposal.chainId
                            );
                            const chainColor = getChainColor(chain, proposal.chainId);
                            const chainName = chain?.chain_name || `Chain ${proposal.chainId}`;
                            const tokenSymbol = chain?.token_symbol || generateChainSymbol(proposal.chainId);
                            const chainInitial = chainName.substring(0, 1).toUpperCase();

                            return (
                                <Card
                                    key={proposal.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow px-2 flex flex-col gap-2"
                                    onClick={() => handleProposalClick(proposal)}
                                >
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-4 flex-1">
                                                {/* Network info with avatar */}
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                                        style={{ backgroundColor: chainColor }}
                                                    >
                                                        {chainInitial}
                                                    </div>
                                                    <span className="font-semibold">{chainName}</span>
                                                </div>

                                                {/* Title */}
                                                <CardTitle className="text-base font-semibold">{proposal.title}</CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground">{proposal.description}</p>

                                        {/* Voting Progress */}
                                        <div className="space-y-2">
                                            {/* Progress Bar */}
                                            <div className="relative h-2 w-full flex items-center gap-0.5 rounded-full overflow-hidden bg-muted/50">
                                                {/* For Section */}
                                                {proposal.votesFor > 0 && (
                                                    <div
                                                        className={`h-full min-w-[2px] transition-all ${proposal.status === "active"
                                                            ? "bg-green-500"
                                                            : proposal.status === "passed"
                                                                ? "bg-green-500"
                                                                : "bg-green-500/30"
                                                            } rounded-full`}
                                                        style={{
                                                            width: `${proposal.votesFor}%`,
                                                            opacity: proposal.status === "active" ? 0.7 : proposal.status === "passed" ? 0.7 : 0.2
                                                        }}
                                                    />
                                                )}
                                                {/* Gap */}
                                                {proposal.votesFor > 0 && proposal.votesAgainst > 0 && (
                                                    <div className="w-0.5 h-full bg-background shrink-0" />
                                                )}
                                                {/* Against Section */}
                                                {proposal.votesAgainst > 0 && (
                                                    <div
                                                        className={`h-full min-w-[2px] transition-all ${proposal.status === "active"
                                                            ? "bg-red-500"
                                                            : proposal.status === "passed"
                                                                ? "bg-red-500"
                                                                : "bg-red-500"
                                                            } rounded-full`}
                                                        style={{
                                                            width: `${proposal.votesAgainst}%`,
                                                            opacity: proposal.status === "active" ? 0.6 : proposal.status === "passed" ? 0.15 : 0.6
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            {/* Labels Below */}
                                            <div className="flex justify-between text-xs">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Check className="w-3 h-3 text-green-600" />
                                                    <span className="font-medium">For</span>
                                                    <span>
                                                        ({proposal.votesFor}%) ·{" "}
                                                        {withCommas((proposal.totalVotes * proposal.votesFor) / 100, 0)}{" "}
                                                        {tokenSymbol}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <span>
                                                        {withCommas((proposal.totalVotes * proposal.votesAgainst) / 100, 0)}{" "}
                                                        {tokenSymbol} · ({proposal.votesAgainst}%)
                                                    </span>
                                                    <span className="font-medium">Against</span>
                                                    <X className="w-3 h-3 text-red-600" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Divider Line */}
                                        <div className="border-t" />

                                        {/* Bottom Section: Badges on left, Vote + Chevron on right */}
                                        <div className="flex items-center justify-between">
                                            {/* Left: Badges */}
                                            <div className="flex items-center gap-2">
                                                {getUrgencyBadge(proposal.urgency)}
                                                {getStatusBadge(proposal.status)}
                                                {proposal.status === "active" && proposal.endsIn && (
                                                    <Badge variant="outline" className="gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Ends in {proposal.endsIn}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Right: Your Vote + Chevron */}
                                            <div className="flex items-center gap-2">
                                                {proposal.userVote && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Your Vote: {proposal.userVote === "for" ? "✓" : "✗"}
                                                    </Badge>
                                                )}
                                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        // Empty State
                        <Card className="p-12 border-0">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-muted rounded-full">
                                    <AlertTriangle className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">No proposals found</h3>
                                    <p className="text-sm text-muted-foreground max-w-md">
                                        {selectedChain !== null || filter !== "all"
                                            ? "Try adjusting your filters to see more proposals"
                                            : "There are no governance proposals at this time. Check back later for new proposals."}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div >
    );
}

