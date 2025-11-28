"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { portfolioApi, chainsApi } from "@/lib/api";
import { formatTokenAmount, withCommas } from "@/lib/utils/denomination";
import type { TokenBalance } from "@/types/wallet";
import type { Chain } from "@/types/chains";
import { toast } from "sonner";

interface StakingTabProps {
    tokens: TokenBalance[];
}

interface StakingChain {
    chainId: number;
    chainName: string;
    symbol: string;
    annualYield: number;
    earnedBalance: string;
    earnedBalanceUSD: string;
    stakedBalance: string;
    hasEarnings: boolean;
}

// Generate chain symbol from chain ID
function generateChainSymbol(chainId: number): string {
    return `C${chainId.toString().padStart(3, '0')}`;
}

// Get color for chain icon based on chain ID
function getChainColor(chainId: number): string {
    const colors = [
        "bg-purple-500",
        "bg-orange-500",
        "bg-green-500",
        "bg-pink-500",
        "bg-blue-500",
        "bg-yellow-500",
        "bg-indigo-500",
        "bg-red-500",
    ];
    return colors[chainId % colors.length];
}

export function StakingTab({ tokens }: StakingTabProps) {
    const { currentWallet } = useWalletStore();
    const [activeSubTab, setActiveSubTab] = useState("rewards");
    const [stakingChains, setStakingChains] = useState<StakingChain[]>([]);
    const [chains, setChains] = useState<Chain[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalInterestEarned, setTotalInterestEarned] = useState(0);

    // Fetch chains and calculate staking data
    useEffect(() => {
        const fetchData = async () => {
            if (!currentWallet) return;

            setIsLoading(true);
            try {
                // Fetch chains to get names and symbols
                const chainsResponse = await chainsApi.getChains({
                    status: "virtual_active",
                    limit: 100,
                });
                const fetchedChains = chainsResponse.data || [];
                setChains(fetchedChains);

                // Fetch portfolio overview for staking balances
                const portfolioResponse = await portfolioApi.getPortfolioOverview({
                    addresses: [currentWallet.address],
                });

                // Build staking chains data
                const accounts = portfolioResponse.accounts || [];
                const stakingData: StakingChain[] = accounts.map((account) => {
                    const chain = fetchedChains.find(
                        (c) => c.chain_id && parseInt(c.chain_id) === account.chain_id
                    );

                    const stakedBalance = parseFloat(account.staked_balance || "0");
                    const delegatedBalance = parseFloat(account.delegated_balance || "0");
                    const totalStaked = stakedBalance + delegatedBalance;

                    // Calculate earned balance (simplified: assume 1% of staked as earned)
                    // In production, this should come from the API
                    const earnedBalance = totalStaked > 0 ? totalStaked * 0.01 : 0;
                    const earnedBalanceUSD = earnedBalance * 0.1; // Mock USD conversion

                    // Calculate annual yield (mock: 8-18% range based on chain)
                    const baseYield = 8 + (account.chain_id % 10);
                    const annualYield = totalStaked > 0 ? baseYield : baseYield;

                    return {
                        chainId: account.chain_id,
                        chainName: chain?.chain_name || account.chain_name || `Chain ${account.chain_id}`,
                        symbol: chain?.token_symbol || generateChainSymbol(account.chain_id),
                        annualYield,
                        earnedBalance: withCommas(earnedBalance),
                        earnedBalanceUSD: withCommas(earnedBalanceUSD),
                        stakedBalance: withCommas(totalStaked),
                        hasEarnings: earnedBalance > 0,
                    };
                });

                // Calculate total interest earned
                const total = stakingData.reduce((sum, chain) => {
                    return sum + parseFloat(chain.earnedBalanceUSD);
                }, 0);
                setTotalInterestEarned(total);

                setStakingChains(stakingData);
            } catch (error) {
                console.error("Failed to fetch staking data:", error);
                toast.error("Error loading staking data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentWallet, tokens]);

    // Count active stakes and unstaking queue
    const activeStakesCount = stakingChains.filter(
        (chain) => parseFloat(chain.stakedBalance) > 0
    ).length;

    const unstakingQueueCount = 0; // TODO: Get from API when available

    const handleClaim = (chain: StakingChain) => {
        toast.info(`Claiming rewards from ${chain.chainName}...`);
        // TODO: Implement claim functionality
    };

    const handleStake = (chain: StakingChain) => {
        toast.info(`Opening staking dialog for ${chain.chainName}...`);
        // TODO: Implement stake functionality
    };

    if (!currentWallet) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="text-center py-12 text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm mb-2">Connect your wallet to view staking opportunities</p>
                        <p className="text-xs">
                            Connect your wallet to start earning rewards
                        </p>
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
        <div className="space-y-4 sm:space-y-6">
            {/* Total Interest Earned Card */}
            <Card className="p-2 px-2">
                <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-base sm:text-xl">
                                    Total interest earned to date
                                </p>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold break-all">${withCommas(totalInterestEarned)} <span className="text-xs sm:text-sm text-muted-foreground font-normal">USD</span></p>
                            <div className="flex items-start sm:items-end gap-2 mt-2 sm:mt-3">
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Earn up to 8.05% APY on your crypto. Redeem any time.
                                </p>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground cursor-help shrink-0 mt-0.5 sm:mt-0" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">
                                                Annual Percentage Yield (APY) varies by asset and network conditions.
                                                You can unstake and withdraw your funds at any time.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full sm:w-auto shrink-0 text-xs sm:text-sm">View Earned Balances</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Staking Tabs */}
            <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                <div className="w-full bg-muted rounded-lg p-0.5">
                    <TabsList className="w-full flex justify-start overflow-x-auto scrollbar-hide">
                        <TabsTrigger value="rewards" className="text-xs sm:text-sm shrink-0">
                            Rewards
                        </TabsTrigger>
                        <TabsTrigger value="active" className="text-xs sm:text-sm shrink-0">
                            Active Stakes {activeStakesCount > 0 && ` ${activeStakesCount}`}
                        </TabsTrigger>
                        <TabsTrigger value="unstaking" className="text-xs sm:text-sm shrink-0">
                            Unstaking Queue {unstakingQueueCount > 0 && ` ${unstakingQueueCount}`}
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Rewards Tab */}
                <TabsContent value="rewards" className="mt-4 sm:mt-6">
                    <Card className="p-2 px-2">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Available Staking Opportunities</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                Stake your tokens on different chains to earn rewards
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            {stakingChains.length === 0 ? (
                                <div className="text-center py-8 sm:py-12 text-muted-foreground">
                                    <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-xs sm:text-sm mb-2">No staking opportunities available</p>
                                    <p className="text-xs">
                                        Staking opportunities will appear when chains are active
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Chain</TableHead>
                                                    <TableHead className="text-right">Annual yield</TableHead>
                                                    <TableHead className="text-right">Current Earned Balance</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {stakingChains.map((chain) => (
                                                    <TableRow key={chain.chainId}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className={`w-10 h-10 rounded-full ${getChainColor(
                                                                        chain.chainId
                                                                    )} flex items-center justify-center shrink-0`}
                                                                >
                                                                    <span className="text-sm font-bold text-white">
                                                                        {chain.symbol.slice(0, 2)}
                                                                    </span>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-medium truncate">{chain.chainName}</p>
                                                                    <p className="text-sm text-muted-foreground truncate">{chain.symbol}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className="font-medium">{withCommas(chain.annualYield, 1)}%</span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {chain.hasEarnings ? (
                                                                <div>
                                                                    <p className="font-medium">
                                                                        {formatTokenAmount(chain.earnedBalance)} {chain.symbol}
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        ${chain.earnedBalanceUSD} USD
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground">Not yet earning</p>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {chain.hasEarnings && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleClaim(chain)}
                                                                    >
                                                                        Claim
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleStake(chain)}
                                                                >
                                                                    Stake
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="md:hidden space-y-3">
                                        {stakingChains.map((chain) => (
                                            <Card key={chain.chainId} className="cursor-pointer hover:bg-muted/30 transition-colors px-2 py-2">
                                                <CardContent className="p-3">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                <div
                                                                    className={`w-8 h-8 rounded-full ${getChainColor(
                                                                        chain.chainId
                                                                    )} flex items-center justify-center shrink-0`}
                                                                >
                                                                    <span className="text-xs font-bold text-white">
                                                                        {chain.symbol.slice(0, 2)}
                                                                    </span>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-medium text-sm truncate">{chain.chainName}</p>
                                                                    <p className="text-xs text-muted-foreground truncate">{chain.symbol}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <span className="font-medium text-sm">{withCommas(chain.annualYield, 1)}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between pt-2 border-t">
                                                            <div>
                                                                {chain.hasEarnings ? (
                                                                    <div>
                                                                        <p className="font-medium text-xs">
                                                                            {formatTokenAmount(chain.earnedBalance)} {chain.symbol}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            ${chain.earnedBalanceUSD} USD
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-muted-foreground">Not yet earning</p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {chain.hasEarnings && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-xs h-8"
                                                                        onClick={() => handleClaim(chain)}
                                                                    >
                                                                        Claim
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    className="text-xs h-8"
                                                                    onClick={() => handleStake(chain)}
                                                                >
                                                                    Stake
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Active Stakes Tab */}
                <TabsContent value="active" className="mt-4 sm:mt-6">
                    <Card className="p-2 px-2">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Your Active Stakes</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                Manage your current staking positions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-2 py-0 sm:p-6">
                            {activeStakesCount === 0 ? (
                                <div className="text-center py-8 sm:py-12 text-muted-foreground">
                                    <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-xs sm:text-sm mb-2">No active stakes</p>
                                    <p className="text-xs">
                                        Your active staking positions will appear here
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {stakingChains
                                        .filter((chain) => parseFloat(chain.stakedBalance) > 0)
                                        .map((chain) => (
                                            <Card key={chain.chainId} className="px-2 py-2">
                                                <CardContent className="p-2 sm:p-6">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                                            <div
                                                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getChainColor(
                                                                    chain.chainId
                                                                )} flex items-center justify-center shrink-0`}
                                                            >
                                                                <span className="text-xs sm:text-sm font-bold text-white">
                                                                    {chain.symbol.slice(0, 2)}
                                                                </span>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-medium text-sm sm:text-base truncate">{chain.chainName}</p>
                                                                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                                    {formatTokenAmount(chain.stakedBalance)} {chain.symbol} staked
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-left sm:text-right shrink-0">
                                                            <p className="font-medium text-primary text-sm sm:text-base">
                                                                {withCommas(chain.annualYield, 1)}% APY
                                                            </p>
                                                            <p className="text-xs sm:text-sm text-muted-foreground">
                                                                {formatTokenAmount(chain.earnedBalance)} {chain.symbol} earned
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Unstaking Queue Tab */}
                <TabsContent value="unstaking" className="mt-4 sm:mt-6">
                    <Card className="p-2 px-2">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Unstaking Queue</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                Track your pending unstakes during the lockup period
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="text-center py-8 sm:py-12 text-muted-foreground">
                                <Clock className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-xs sm:text-sm mb-2">Unstaking queue is empty</p>
                                <p className="text-xs">
                                    Pending unstakes will appear here during the lockup period
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

