"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { X, ArrowLeft, Check, Info, Wallet, Loader2, AlertCircle, Copy } from "lucide-react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { portfolioApi, chainsApi, walletTransactionApi, stakingApi } from "@/lib/api";
import { generateChainColor } from "@/lib/utils/chain-ui-helpers";
import type { Chain } from "@/types/chains";
import type { LocalWallet } from "@/types/wallet";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { formatBalanceWithCommas, fromMicroUnits, withCommas } from "@/lib/utils/denomination";
import { CommitteeMultiSelect } from "@/components/wallet/committee-multi-select";
import {
    buildCommitteeOptions,
    buildStakeTx,
    estimateStakeFee,
    mergeCommittees,
    normalizeChainId,
} from "@/lib/staking/staking-utils";

interface StakeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedChain?: Chain | null;
    initialChainId?: number;
    initialCommittees?: number[]; // Committee chain IDs from the position
    initialStakedAmount?: number; // Current staked amount (for updates, to prevent decrementing)
    mode?: "create" | "edit";
    disallowChainIds?: number[]; // Chains that already have an open stake (hide for create)
}

interface ChainWithBalance {
    chain: Chain;
    balance: number;
    balanceUSD: number;
    stakedBalance: number; // Total staked + delegated balance
    apy: number;
}

interface WalletWithBalance {
    wallet: LocalWallet;
    balance: number;
    balanceUSD: number;
}

type StakeStep = 1 | 2 | 3 | 4;

export function StakeDialog({
    open,
    onOpenChange,
    selectedChain,
    initialChainId,
    initialCommittees = [],
    initialStakedAmount = 0,
    mode,
    disallowChainIds = [],
}: StakeDialogProps) {
    const { currentWallet, wallets } = useWalletStore();
    const derivedMode: "create" | "edit" =
        mode || (initialStakedAmount > 0 || (initialCommittees?.length ?? 0) > 0 ? "edit" : "create");
    const headingLabel = derivedMode === "edit" ? "Edit Stake" : "Stake";
    const successHeading = derivedMode === "edit" ? "Stake Updated" : "Staking Successful!";
    const normalizedInitialCommittees = useMemo(
        () => Array.from(new Set(initialCommittees || [])),
        [JSON.stringify(initialCommittees || [])]
    );
    const [step, setStep] = useState<StakeStep>(1);
    const [amount, setAmount] = useState("");
    const [source, setSource] = useState("wallet");
    const [autoCompound, setAutoCompound] = useState(true);
    const [internalSelectedChain, setInternalSelectedChain] = useState<Chain | null>(null);
    const [committeesInput, setCommitteesInput] = useState<number[]>(normalizedInitialCommittees);
    const [committeeChains, setCommitteeChains] = useState<Chain[]>([]);
    const [committeePage, setCommitteePage] = useState(1);
    const [committeeHasMore, setCommitteeHasMore] = useState(true);
    const [committeeQuery, setCommitteeQuery] = useState("");
    const [committeeLoading, setCommitteeLoading] = useState(false);
    const [chainsWithBalance, setChainsWithBalance] = useState<ChainWithBalance[]>([]);
    const [allChains, setAllChains] = useState<Chain[]>([]); // All available chains for committee selection
    const [showCommittees, setShowCommittees] = useState(normalizedInitialCommittees.length > 0);
    const [walletsWithBalance, setWalletsWithBalance] = useState<WalletWithBalance[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [takenChainIds, setTakenChainIds] = useState<number[]>([]);

    // Transaction states (aligned with send-transaction-dialog)
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    // Fee estimation states
    const [estimatedFee, setEstimatedFee] = useState<string | null>(null);
    const [isEstimatingFee, setIsEstimatingFee] = useState(false);
    const [feeError, setFeeError] = useState<string | null>(null);

    const activeChain = selectedChain || internalSelectedChain;
    const chainSelectionLocked = Boolean(selectedChain || initialChainId);
    const activeChainId = activeChain ? normalizeChainId(activeChain) : 0;

    // Fetch chains and balances
    useEffect(() => {
        const fetchData = async () => {
            if (!open) return;

            setIsLoading(true);
            try {
                // Fetch chains
                const chainsResponse = await chainsApi.getChains({
                    status: "graduated",
                    limit: 100,
                });
                const fetchedChains = chainsResponse.data || [];

                // Get all wallet addresses
                const walletAddresses = wallets.map(w => w.address);

                if (walletAddresses.length === 0) {
                    setIsLoading(false);
                    return;
                }

                // Fetch portfolio overview for all wallets
                const portfolioResponse = await portfolioApi.getPortfolioOverview({
                    addresses: walletAddresses,
                });


                // Calculate price per token
                const portfolioTotalUSD = parseFloat(portfolioResponse.total_value_usd || "0");
                const portfolioTotalCNPY = parseFloat(portfolioResponse.total_value_cnpy || "0");
                const pricePerToken = portfolioTotalCNPY > 0 && portfolioTotalUSD > 0
                    ? portfolioTotalUSD / portfolioTotalCNPY
                    : 0.1; // Fallback

                // Build chains with balance - show ONLY chains that have staked balance
                const accounts = portfolioResponse.accounts || [];


                // First, try to match with fetched chains
                const chainsFromApi: ChainWithBalance[] = fetchedChains
                    .map((chain) => {
                        // Find ALL accounts for this chain (from all wallets)
                        // Account chain_id is numeric, chain.chain_id can be string like "virt-chain-10011" or null
                        let matchingAccounts: typeof accounts = [];

                        // Try matching by chain.id (string but numeric) with account.chain_id (number)
                        matchingAccounts = accounts.filter((a) => {
                            // Match by numeric chain id (chain.id is string, convert to number)
                            const chainIdNum = parseInt(chain.id);
                            if (!isNaN(chainIdNum) && a.chain_id === chainIdNum) {
                                return true;
                            }
                            // Match by chain_id string
                            if (chain.chain_id && typeof a.chain_id === "string" && chain.chain_id === a.chain_id) {
                                return true;
                            }
                            // Try to extract number from chain_id string like "virt-chain-10011"
                            if (chain.chain_id) {
                                const chainIdMatch = chain.chain_id.match(/\d+/);
                                if (chainIdMatch) {
                                    const extractedChainId = parseInt(chainIdMatch[0]);
                                    if (a.chain_id === extractedChainId) {
                                        return true;
                                    }
                                }
                            }
                            return false;
                        });

                        // If no accounts found by chain_id, try to match by chain name (fallback)
                        if (matchingAccounts.length === 0) {
                            matchingAccounts = accounts.filter((a) => {
                                return a.chain_name === chain.chain_name;
                            });
                        }

                        // Calculate total available balance across all wallets for this chain
                        const totalAvailable = matchingAccounts.reduce((sum, account) => {
                            return sum + parseFloat(account.available_balance || "0");
                        }, 0);

                        // Calculate total staked balance across all wallets for this chain
                        const totalStaked = matchingAccounts.reduce((sum, account) => {
                            const staked = parseFloat(account.staked_balance || "0");
                            const delegated = parseFloat(account.delegated_balance || "0");
                            return sum + staked + delegated;
                        }, 0);

                        // Debug log for chains with balance
                        if (totalAvailable > 0 || totalStaked > 0) {
                        }

                        // Only include chains that have available balance > 0 (can stake)
                        if (totalAvailable <= 0) {
                            return null;
                        }

                        // Use the total available balance across all wallets
                        const availableBalance = totalAvailable;
                        const balanceUSD = availableBalance * pricePerToken;

                        // TODO: Get real APY from API when endpoint is available
                        // For now, use a consistent calculation based on chain ID
                        // Extract numeric ID from chain_id string or use chain.id
                        let chainIdForApy = 0;
                        if (chain.chain_id) {
                            const match = chain.chain_id.toString().match(/\d+/);
                            if (match) {
                                chainIdForApy = parseInt(match[0]);
                            }
                        }
                        if (chainIdForApy === 0) {
                            // Use chain.id as fallback (it's a string, extract number if possible)
                            const idMatch = chain.id.toString().match(/\d+/);
                            if (idMatch) {
                                chainIdForApy = parseInt(idMatch[0]);
                            }
                        }
                        // APY calculation: 8% base + (chainId % 8) for variation (8-15% range)
                        const apy = 8 + ((chainIdForApy || 0) % 8);

                        return {
                            chain,
                            balance: availableBalance,
                            balanceUSD,
                            stakedBalance: totalStaked,
                            apy,
                        };
                    })
                    .filter((item): item is ChainWithBalance => item !== null);

                // Also create chains from portfolio accounts that have balance but weren't matched
                // Group accounts by chain_id to aggregate balances
                const accountsByChainId = new Map<number, typeof accounts>();
                accounts.forEach(account => {
                    const existing = accountsByChainId.get(account.chain_id) || [];
                    existing.push(account);
                    accountsByChainId.set(account.chain_id, existing);
                });

                const chainsFromPortfolio: ChainWithBalance[] = [];

                accountsByChainId.forEach((chainAccounts, chainId) => {

                    // Check if this chain_id was already matched with a fetched chain
                    const alreadyMatched = chainsFromApi.some(c => {
                        const cId = parseInt(c.chain.id);
                        if (!isNaN(cId) && cId === chainId) return true;
                        if (c.chain.chain_id) {
                            const match = c.chain.chain_id.match(/\d+/);
                            if (match && parseInt(match[0]) === chainId) return true;
                        }
                        return false;
                    });


                    if (!alreadyMatched) {
                        // Calculate totals for this chain
                        const totalAvailable = chainAccounts.reduce((sum, a) =>
                            sum + parseFloat(a.available_balance || "0"), 0);
                        const totalStaked = chainAccounts.reduce((sum, a) =>
                            sum + parseFloat(a.staked_balance || "0") + parseFloat(a.delegated_balance || "0"), 0);

                        if (totalAvailable > 0) {
                            const firstAccount = chainAccounts[0];
                            const apy = 8 + (chainId % 8);

                            // Create a synthetic chain object from portfolio data
                            const syntheticChain = {
                                id: String(chainId),
                                chain_name: firstAccount.chain_name || `Chain ${chainId}`,
                                token_symbol: `C${String(chainId).padStart(3, '0')}`,
                                chain_description: "",
                                template_id: "",
                                consensus_mechanism: "",
                                chain_id: String(chainId),
                                brand_color: null,
                                status: "active",
                            } as unknown as Chain;

                            chainsFromPortfolio.push({
                                chain: syntheticChain,
                                balance: totalAvailable,
                                balanceUSD: totalAvailable * pricePerToken,
                                stakedBalance: totalStaked,
                                apy,
                            });

                        }
                    }
                });

                // Combine both sources
                const chainsData = [...chainsFromApi, ...chainsFromPortfolio];

                // Store ALL chains (including synthetic) for committee selection
                const uniqueChainsMap = new Map<string, Chain>();
                [...fetchedChains, ...chainsFromPortfolio.map((c) => c.chain)].forEach((chain) => {
                    const key = chain.chain_id ?? chain.id;
                    uniqueChainsMap.set(String(key), chain);
                });
                setAllChains(Array.from(uniqueChainsMap.values()));

                setChainsWithBalance(chainsData);

                // Set initial selected chain if provided
                if (selectedChain) {
                    setInternalSelectedChain(selectedChain);
                } else if (initialChainId) {
                    const matched = chainsData.find((entry) => {
                        const numericChainId =
                            (entry.chain.chain_id && entry.chain.chain_id.match(/\d+/))
                                ? parseInt(entry.chain.chain_id.match(/\d+/)![0])
                                : parseInt(entry.chain.id);
                        return numericChainId === initialChainId;
                    });
                    if (matched) {
                        setInternalSelectedChain(matched.chain);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch staking data:", error);
                toast.error("Error loading staking data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [open, selectedChain, wallets, initialChainId]);

    // Reset state when dialog closes or initialCommittees change
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep(1);
                setAmount("");
                setSource("wallet");
                setAutoCompound(true);
                setCommitteesInput(normalizedInitialCommittees);
                setShowCommittees(normalizedInitialCommittees.length > 0);
                setCommitteeQuery("");
                setCommitteePage(1);
                setCommitteeChains([]);
                setCommitteeHasMore(true);
                setTxHash(null);
                setError(null);
                setIsSending(false);
                setEstimatedFee(null);
                setIsEstimatingFee(false);
                setFeeError(null);
                if (!selectedChain) {
                    setInternalSelectedChain(null);
                }
            }, 300);
        } else {
            // When dialog opens, set initial committees
            setCommitteesInput(normalizedInitialCommittees);
            setShowCommittees(normalizedInitialCommittees.length > 0);
            setCommitteeQuery("");
            setCommitteePage(1);
        }
    }, [open, selectedChain, initialChainId, normalizedInitialCommittees]);

    // Fetch wallet balances for the selected chain
    useEffect(() => {
        const fetchWalletBalances = async () => {
            if (!activeChain || !open || wallets.length === 0) {
                setWalletsWithBalance([]);
                return;
            }

            try {
                const walletAddresses = wallets.map(w => w.address);
                const portfolioResponse = await portfolioApi.getPortfolioOverview({
                    addresses: walletAddresses,
                });

                // Calculate price per token
                const portfolioTotalUSD = parseFloat(portfolioResponse.total_value_usd || "0");
                const portfolioTotalCNPY = parseFloat(portfolioResponse.total_value_cnpy || "0");
                const pricePerToken = portfolioTotalCNPY > 0 && portfolioTotalUSD > 0
                    ? portfolioTotalUSD / portfolioTotalCNPY
                    : 0.1;

                const accounts = portfolioResponse.accounts || [];
                const walletsData: WalletWithBalance[] = wallets.map((wallet) => {
                    // Find account for this wallet and chain
                    let account = null;

                    if (activeChain.chain_id && activeChain.chain_id.trim() !== "") {
                        account = accounts.find((a) => {
                            if (a.address !== wallet.address) return false;

                            if (typeof a.chain_id === "string" && activeChain.chain_id === a.chain_id) {
                                return true;
                            }

                            const chainIdMatch = activeChain.chain_id?.match(/\d+/);
                            if (chainIdMatch) {
                                const chainIdNum = parseInt(chainIdMatch[0]);
                                if (a.chain_id === chainIdNum) {
                                    return true;
                                }
                            }
                            return false;
                        });
                    }

                    if (!account) {
                        account = accounts.find((a) => {
                            return a.address === wallet.address && a.chain_name === activeChain.chain_name;
                        });
                    }

                    const balance = account ? parseFloat(account.available_balance || "0") : 0;
                    const balanceUSD = balance * pricePerToken;

                    return {
                        wallet,
                        balance,
                        balanceUSD,
                    };
                });

                setWalletsWithBalance(walletsData);
            } catch (error) {
                console.error("Failed to fetch wallet balances:", error);
                setWalletsWithBalance([]);
            }
        };

        fetchWalletBalances();
    }, [activeChain, open, wallets]);

    const handleChainSelect = (chainId: string) => {
        const targetId = normalizeChainId(chainId);
        const chainData = chainsWithBalance.find(
            (c) => normalizeChainId(c.chain) === targetId
        );
        if (chainData) {
            setInternalSelectedChain(chainData.chain);
        } else {
            console.warn("Chain not found for chainId:", chainId);
        }
    };

    const chainData = activeChain
        ? chainsWithBalance.find((c) => normalizeChainId(c.chain) === activeChainId)
        : null;

    // Get selected wallet balance
    const selectedWallet = source === "wallet" && currentWallet
        ? walletsWithBalance.find(w => w.wallet.address === currentWallet.address)
        : walletsWithBalance.find(w => w.wallet.address === source);

    const availableBalance = selectedWallet?.balance || chainData?.balance || 0;
    const amountNum = parseFloat(amount) || 0;
    const amountUSD = chainData ? amountNum * (chainData.balanceUSD / chainData.balance || 0) : 0;
    const apy = chainData?.apy || 0;
    const projectedYearlyInterest = chainData ? amountNum * (apy / 100) : 0;
    const projectedYearlyInterestUSD = chainData
        ? projectedYearlyInterest * (chainData.balanceUSD / chainData.balance || 0)
        : 0;

    const handleMaxClick = () => {
        if (chainData) {
            setAmount(formatBalanceWithCommas(availableBalance));
        }
    };

    const handleContinueFromStep1 = async () => {
        if (!activeChain || !amountNum || amountNum <= 0 || !currentWallet) {
            return;
        }

        // Estimate fee before showing confirmation
        setIsEstimatingFee(true);
        setFeeError(null);

        try {
            const chainIdNum = activeChainId || 1;
            const estimated = await estimateStakeFee({
                fromAddress: currentWallet.address,
                amount: amountNum.toString(),
                chainId: chainIdNum,
            });

            setEstimatedFee(estimated);
            setIsEstimatingFee(false);
            setStep(2);
        } catch (err) {
            setIsEstimatingFee(false);
            setFeeError(err instanceof Error ? err.message : "Failed to estimate fee");
            toast.error("Failed to estimate transaction fee. Please try again.");
        }
    };

    const handleConfirmStake = async () => {
        if (!currentWallet || !activeChain) return;

        // Check if wallet is unlocked
        if (!currentWallet.isUnlocked || !currentWallet.privateKey) {
            setError("Wallet is locked. Please unlock your wallet first.");
            return;
        }

        setStep(3);
        setIsSending(true);
        setError(null);

        try {
            const chainIdNum = activeChainId || 1;

            // Convert amount to micro units
            const { toMicroUnits } = await import("@/lib/utils/denomination");
            const amountInMicro = parseInt(toMicroUnits(amountNum.toString()));

            const committees = mergeCommittees(chainIdNum, committeesInput, true);

            const signedTx = await buildStakeTx({
                mode: derivedMode,
                wallet: currentWallet,
                chainId: chainIdNum,
                amountMicro: amountInMicro,
                committees,
                autoCompound,
                fee: Number(estimatedFee) || 0,
            });

            // Submit transaction
            const response = await walletTransactionApi.sendRawTransaction(signedTx);

            setTxHash(response.transaction_hash);
            setIsSending(false);
            toast.success("Staking transaction submitted successfully!");
        } catch (err) {
            setIsSending(false);
            setError(err instanceof Error ? err.message : "Transaction failed");
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
            setEstimatedFee(null);
            setFeeError(null);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    const handleStakeAgain = () => {
        setStep(1);
        setAmount("");
        setAutoCompound(true);
        setTxHash(null);
        setError(null);
        setEstimatedFee(null);
        setFeeError(null);
    };

    const handleTryAgain = () => {
        setStep(1);
        setError(null);
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const formatAddress = (addr: string) => {
        if (!addr) return "";
        if (addr.length <= 12) return addr;
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const getChainColor = (chain: Chain | null): string => {
        if (!chain) return "#666";
        // Use brand_color from chain data (real API data)
        if (chain.brand_color) {
            return chain.brand_color;
        }
        // Fallback to generated color if brand_color not available
        return generateChainColor(chain.chain_name || "");
    };

    const getChainInitial = (chain: Chain | null): string => {
        if (!chain) return "C";
        const name = chain.chain_name || "";
        // Get first 2 letters, uppercase
        return name.substring(0, 2).toUpperCase() || "C";
    };

    const getChainSymbol = (chain: Chain | null): string => {
        if (!chain) return "";
        return chain.token_symbol || `C${chain.chain_id?.padStart(3, "0") || "000"}`;
    };

    const dedupeChains = (chains: Chain[]): Chain[] => {
        const map = new Map<string, Chain>();
        chains.forEach((c) => {
            const key = String(c.chain_id ?? c.id);
            if (!map.has(key)) {
                map.set(key, c);
            }
        });
        return Array.from(map.values());
    };

    const committeeOptions = useMemo(
        () => buildCommitteeOptions(allChains, activeChainId),
        [allChains, activeChainId]
    );
    const committeeOptionsFiltered = useMemo(
        () => committeeOptions.filter((opt) => opt.chainId !== activeChainId),
        [committeeOptions, activeChainId]
    );

    const combinedDisallow = useMemo(() => {
        const set = new Set<number>();
        disallowChainIds.forEach((id) => set.add(id));
        takenChainIds.forEach((id) => set.add(id));
        return set;
    }, [disallowChainIds, takenChainIds]);

    useEffect(() => {
        if (!open || derivedMode === "edit" || !currentWallet?.address) return;
        let cancelled = false;
        (async () => {
            try {
                const posRes = await stakingApi.getPositions({
                    address: currentWallet.address,
                    limit: 100,
                });
                const positions = (posRes as any)?.positions || posRes?.data?.positions || [];
                const activeIds = positions
                    .filter((p: any) => p?.status !== "unstaking")
                    .map((p: any) => Number(p.chain_id))
                    .filter((n: number) => !Number.isNaN(n) && n > 0);
                if (!cancelled) {
                    setTakenChainIds(Array.from(new Set(activeIds)));
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Failed to fetch positions for disallow list", err);
                    setTakenChainIds([]);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [open, derivedMode, currentWallet?.address]);

    // Fetch committees list via chains API with pagination + search
    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        const limit = 30;
        const fetchPage = async () => {
            setCommitteeLoading(true);
            try {
                const res = await chainsApi.getChains({
                    status: "virtual_active",
                    filter: committeeQuery || undefined,
                    page: 1,
                    limit,
                });
                const data = Array.isArray(res) ? res : res?.data || [];
                const unique = dedupeChains(data);
                if (cancelled) return;
                setCommitteeChains(unique);
                setAllChains(unique);
                const hasMore = data.length === limit;
                setCommitteeHasMore(hasMore);
                setCommitteePage(hasMore ? 2 : 1);
            } catch (err) {
                if (!cancelled) {
                    console.error("Failed to fetch committee chains", err);
                    setCommitteeChains([]);
                    setAllChains([]);
                    setCommitteeHasMore(false);
                }
            } finally {
                if (!cancelled) {
                    setCommitteeLoading(false);
                }
            }
        };
        fetchPage();
        return () => {
            cancelled = true;
        };
    }, [open, committeeQuery]);

    const loadMoreCommittees = useCallback(() => {
        if (!open || committeeLoading || !committeeHasMore) return;
        const limit = 30;
        const nextPage = committeePage;
        setCommitteeLoading(true);
        chainsApi
            .getChains({
                status: "virtual_active",
                filter: committeeQuery || undefined,
                page: nextPage,
                limit,
            })
            .then((res) => {
                const data = Array.isArray(res) ? res : res?.data || [];
                setCommitteeChains((prev) => dedupeChains([...prev, ...data]));
                setAllChains((prev) => dedupeChains([...prev, ...data]));
                const hasMore = data.length === limit;
                setCommitteeHasMore(hasMore);
                setCommitteePage(hasMore ? nextPage + 1 : nextPage);
            })
            .catch((err) => {
                console.error("Failed to load more committee chains", err);
                setCommitteeHasMore(false);
            })
            .finally(() => {
                setCommitteeLoading(false);
            });
    }, [open, committeeLoading, committeeHasMore, committeePage, committeeQuery]);

    // Ensure active chain is not in the editable committees list (especially in edit mode)
    useEffect(() => {
        if (!activeChainId) return;
        setCommitteesInput((prev) => prev.filter((id) => id !== activeChainId));
    }, [activeChainId, derivedMode]);

    // Don't render until we have basic data or we're on step 2+
    if (!open) {
        return null;
    }

    return (
        <TooltipProvider>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 flex flex-col" showCloseButton={false}>
                    {/* Step 1: Select Chain and Amount */}
                    {step === 1 && (
                        <>
                            <VisuallyHidden>
                                <DialogTitle>Stake - Select Chain and Amount</DialogTitle>
                            </VisuallyHidden>
                            {/* Header */}
                            <div className="relative px-6 py-3 border-b flex-shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-2"
                                    onClick={handleClose}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold">{headingLabel}</h2>
                                </div>
                            </div>

                            <div className="px-6 pt-6 space-y-6 overflow-y-auto flex-1">
                                {/* Chain Selection - Only show if chain is NOT locked */}
                                {!chainSelectionLocked && !activeChain && (
                                    <div className="space-y-2">
                                        <Label className="block text-sm font-medium">
                                            Select Chain
                                        </Label>
                                        <Select
                                            value={
                                                activeChain
                                                    ? activeChain.chain_id || `chain-${activeChain.id}`
                                                    : ""
                                            }
                                            onValueChange={handleChainSelect}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger className="h-auto py-6 w-full [&>span]:line-clamp-none [&>span]:block">
                                                <SelectValue placeholder="Choose a chain to stake" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px]">
                                                {isLoading ? (
                                                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                                        Loading chains...
                                                    </div>
                                                ) : chainsWithBalance.length === 0 ? (
                                                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                                        No chains available
                                                    </div>
                    ) : (
                    chainsWithBalance
                        .filter((chainData) => {
                            if (derivedMode === "edit") return true;
                            const chainIdNum = normalizeChainId(chainData.chain);
                            return !combinedDisallow.has(chainIdNum);
                        })
                        .map((chainData) => {
                            const chainIdValue = chainData.chain.chain_id
                                ? chainData.chain.chain_id
                                : `chain-${chainData.chain.id}`;
                            return (
                                <SelectItem
                                    key={chainData.chain.id}
                                    value={chainIdValue}
                                    className="h-auto py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                            style={{
                                                backgroundColor: getChainColor(
                                                    chainData.chain
                                                ),
                                            }}
                                        >
                                            <span className="text-[10px] font-bold text-white leading-tight px-0.5">
                                                {getChainInitial(chainData.chain)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="font-medium">
                                                {chainData.chain.chain_name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {getChainSymbol(chainData.chain)}
                                                {chainData.balance > 0 && (
                                                    <> - Balance: {formatBalanceWithCommas(chainData.balance)}</>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </SelectItem>
                            );
                        })
                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Loading State - Show when chain is locked but data is still loading */}
                                {chainSelectionLocked && isLoading && (
                                    <div className="p-4 mt-2 bg-muted/30 rounded-lg border">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                                                <div className="space-y-2">
                                                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                                                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
                                                <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Loading chain information...
                                        </p>
                                    </div>
                                )}

                                {/* Chain Display (when chain is set/locked and data is loaded) */}
                                {activeChain && chainData && (
                                    <div className="p-4 mt-2 bg-muted/30 rounded-lg border">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                                    style={{
                                                        backgroundColor: getChainColor(activeChain),
                                                    }}
                                                >
                                                    <span className="text-[10px] font-bold text-white leading-tight px-0.5">
                                                        {getChainInitial(activeChain)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">
                                                        {activeChain.chain_name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {getChainSymbol(activeChain)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold">{apy}%</p>
                                                <p className="text-xs text-muted-foreground">APY</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Source - Info panel showing current wallet */}
                                {activeChain && chainData && currentWallet && (
                                    <div className="space-y-2">
                                        <Label className="block text-sm font-medium">Source</Label>
                                        <div className="flex items-center gap-3 w-full p-2 px-3 border rounded-lg bg-muted/20">
                                            <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center shrink-0">
                                                <Wallet className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col items-start flex-1 min-w-0">
                                                <span className="font-medium text-sm truncate w-full">
                                                    {currentWallet.wallet_name || `Wallet ${currentWallet.address.slice(0, 8)}...`}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate w-full">
                                                    {currentWallet.address.slice(0, 10)}...{currentWallet.address.slice(-8)}
                                                </span>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="font-semibold text-sm">
                                                    {formatBalanceWithCommas(availableBalance)}
                                                </span>
                                                <span className="text-xs text-muted-foreground block">
                                                    {getChainSymbol(activeChain)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Amount - Only show if we have an active chain */}
                                {activeChain && chainData && (
                                    <>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="block text-sm font-medium">
                                                    Amount {initialStakedAmount > 0 && "(add more)"}
                                                </Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-xs"
                                                    onClick={handleMaxClick}
                                                >
                                                    Max
                                                </Button>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder="0"
                                                    value={amount}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        // Only allow numbers and decimal point
                                                        if (
                                                            value === "" ||
                                                            /^\d*\.?\d*$/.test(value)
                                                        ) {
                                                            setAmount(value);
                                                        }
                                                    }}
                                                    className="pr-16 text-lg h-11 z-10"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                    {getChainSymbol(activeChain)}
                                                </span>
                                            </div>
                                            {initialStakedAmount > 0 && amountNum > 0 && amountNum < initialStakedAmount && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    Cannot decrease stake. Minimum: {withCommas(initialStakedAmount)}
                                                </p>
                                            )}
                                            {initialStakedAmount > 0 && (
                                                <p className="text-xs text-muted-foreground">
                                                    Currently staked: {withCommas(initialStakedAmount)} {getChainSymbol(activeChain)}
                                                </p>
                                            )}
                                            <p className="text-sm text-muted-foreground">
                                                approx. ${withCommas(amountUSD)} USD
                                            </p>
                                        </div>

                                        {allChains.length > 0 && (
                                            <div className="space-y-3 pt-4 border-t">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="space-y-0.5">
                                                        <p className="text-sm font-medium">
                                                            Delegate to other chains (optional)
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Select additional chains to earn native rewards.
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {committeesInput.length > 0 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8"
                                                                onClick={() => setCommitteesInput([])}
                                                            >
                                                                Clear
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8"
                                                            onClick={() => setShowCommittees((prev) => !prev)}
                                                        >
                                                            {showCommittees ? "Hide" : "Add"}
                                                        </Button>
                                                    </div>
                                                </div>
                                                {showCommittees && (
                                                    <>
                                                        <CommitteeMultiSelect
                                                            options={committeeOptionsFiltered}
                                                            value={committeesInput}
                                                            onChange={setCommitteesInput}
                                                            onClear={() => setCommitteesInput([])}
                                                            query={committeeQuery}
                                                            onQueryChange={(v) => {
                                                                setCommitteeQuery(v);
                                                                setCommitteePage(1);
                                                            }}
                                                            onLoadMore={loadMoreCommittees}
                                                            hasMore={committeeHasMore}
                                                            loading={committeeLoading}
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            Staking is multichain: tokens stay locked once, rewards flow from all selected chains.
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {/* Auto-compound Toggle */}
                                        <div className="space-y-2 pt-4 border-t">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor="auto-compound" className="text-sm font-medium cursor-pointer">
                                                        Auto-compound rewards
                                                    </Label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs">
                                                            <p>
                                                                When enabled, your staking rewards will be automatically
                                                                reinvested to maximize your earnings through compound interest.
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Switch
                                                    id="auto-compound"
                                                    checked={autoCompound}
                                                    onCheckedChange={setAutoCompound}
                                                />
                                            </div>
                                            {!autoCompound && (
                                                <div className="flex items-start gap-3 p-3 border border-yellow-500/30 bg-yellow-500/10 rounded-lg">
                                                    <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                                                    <div className="space-y-1 text-xs">
                                                        <p className="font-semibold text-yellow-700">20% reward penalty</p>
                                                        <p className="text-muted-foreground">
                                                            Disabling auto-compound incurs a 20% penalty on your staking rewards to help maintain network security and stability.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Projected Interest */}
                                        <div className="space-y-2 pt-4 border-t">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-sm">
                                                    Projected 1 year interest
                                                </Label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs">
                                                        <p>
                                                            Estimated interest earnings after 1 year
                                                            based on current APY{autoCompound ? ' with auto-compounding' : ''}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                                <div className="text-center py-2">
                                                    <p className="text-2xl font-bold">
                                                        {amountNum > 0
                                                            ? withCommas(projectedYearlyInterest, 4)
                                                            : "--"}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        approx. $
                                                        {withCommas(projectedYearlyInterestUSD)} USD
                                                    </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Fee Estimation Error */}
                                {feeError && (
                                    <div className="flex gap-2 p-3 border border-red-500/20 bg-red-500/5 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div className="space-y-1 text-sm">
                                            <p className="font-medium text-red-500">Fee Estimation Failed</p>
                                            <p className="text-muted-foreground">{feeError}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Continue Button - Fixed at bottom */}
                            <div className="px-6 pb-6 pt-4 border-t flex-shrink-0 bg-background">
                                <Button
                                    className="w-full h-12"
                                    onClick={handleContinueFromStep1}
                                    disabled={
                                        !activeChain ||
                                        !amountNum ||
                                        amountNum <= 0 ||
                                        amountNum > availableBalance ||
                                        (initialStakedAmount > 0 && amountNum < initialStakedAmount) ||
                                        isEstimatingFee
                                    }
                                >
                                    {isEstimatingFee ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Estimating Fee...
                                        </>
                                    ) : (
                                        "Continue"
                                    )}
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Step 2: Review & Confirm */}
                    {step === 2 && activeChain && chainData && (
                        <>
                            <VisuallyHidden>
                                <DialogTitle>Stake - Review & Confirm</DialogTitle>
                            </VisuallyHidden>
                            <div className="relative p-6 pb-4 flex-shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-2 top-2"
                                    onClick={handleBack}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-2"
                                    onClick={handleClose}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                                <h2 className="text-xl font-bold text-center">
                                    Review & Confirm
                                </h2>
                            </div>

                            <div className="px-6 pb-6 space-y-6 overflow-y-auto flex-1">
                                {/* Summary */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Summary</h3>

                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">From</span>
                                            <span className="text-sm font-medium">Wallet balance</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">To</span>
                                            <span className="text-sm font-medium">Staking</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Amount</span>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">
                                                    {amountNum} {getChainSymbol(activeChain)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Chain</span>
                                            <span className="text-sm font-medium">
                                                {activeChain.chain_name}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Annual % yield
                                            </span>
                                            <span className="text-sm font-medium">{apy}%</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Auto-compound</span>
                                            <span className="text-sm font-medium">
                                                {autoCompound ? (
                                                    <span className="text-green-600 dark:text-green-400">Enabled</span>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-yellow-600">
                                                        <span>Disabled (20% penalty)</span>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="w-3.5 h-3.5" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-xs">
                                                                <p>
                                                                    Disabling auto-compound incurs a 20% penalty on your staking rewards to help maintain network security and stability.
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Network Fee</span>
                                            <div className="text-right">
                                                {isEstimatingFee ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        <p className="text-sm font-medium text-muted-foreground">Estimating...</p>
                                                    </div>
                                                ) : estimatedFee ? (
                                                    <p className="text-sm font-medium">{fromMicroUnits(estimatedFee, 6)} {getChainSymbol(activeChain)}</p>
                                                ) : (
                                                    <p className="text-sm font-medium text-red-500">Fee estimation failed</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-between pt-2 border-t">
                                            <span className="text-sm font-semibold">Total</span>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold">
                                                    {amountNum} {getChainSymbol(activeChain)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Warning */}
                                {!currentWallet?.isUnlocked && (
                                    <div className="flex gap-2 p-3 border border-red-500/20 bg-red-500/5 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div className="space-y-1 text-sm">
                                            <p className="font-medium text-red-500">Wallet Locked</p>
                                            <p className="text-muted-foreground">
                                                Your wallet must be unlocked to stake. Please unlock your wallet before proceeding.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Disclaimer */}
                                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                    <div className="flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-foreground">
                                            By staking, you agree to delegate your tokens. Please ensure you understand the risks involved.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons - Fixed at bottom */}
                            <div className="px-6 pb-6 pt-4 border-t flex-shrink-0 bg-background space-y-3">
                                <Button
                                    className="w-full h-12"
                                    onClick={handleConfirmStake}
                                    disabled={!currentWallet?.isUnlocked || !estimatedFee}
                                >
                                    {derivedMode === "edit" ? "Confirm & Update" : "Confirm & Stake"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={handleBack}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Step 3: Transaction Status */}
                    {step === 3 && activeChain && chainData && (
                        <>
                            <VisuallyHidden>
                                <DialogTitle>Stake - Transaction Status</DialogTitle>
                            </VisuallyHidden>
                            <div className="relative p-6 pb-4 flex-shrink-0">
                                {!isSending && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-2"
                                        onClick={handleClose}
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                )}
                            </div>

                            <div className="px-6 pb-6 space-y-6 overflow-y-auto flex-1">
                                {/* Sending State */}
                                {isSending && (
                                    <div className="flex flex-col items-center space-y-4 pb-8">
                                        <div className="w-16 h-16 rounded-full border-2 border-foreground/40 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                        </div>
                                        <h2 className="text-2xl font-bold">Sending Transaction</h2>
                                        <p className="text-center text-muted-foreground">
                                            Please wait while your staking transaction is being processed...
                                        </p>
                                    </div>
                                )}

                                {/* Success State */}
                                {!isSending && !error && txHash && (
                                    <>
                                        <div className="flex flex-col items-center space-y-4 py-8">
                                            <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center">
                                                <Check className="w-8 h-8 text-green-500" />
                                            </div>
                                            <h2 className="text-2xl font-bold">{successHeading}</h2>
                                            <p className="text-center text-muted-foreground">
                                                Your{" "}
                                                <span className="font-semibold text-foreground">
                                                    {amountNum} {getChainSymbol(activeChain)}
                                                </span>{" "}
                                                has been staked successfully
                                            </p>
                                        </div>

                                        {/* Transaction Details */}
                                        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Transaction Hash</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-mono break-all">{formatAddress(txHash)}</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 flex-shrink-0"
                                                        onClick={() => copyToClipboard(txHash, "Transaction hash")}
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Amount</p>
                                                <p className="text-sm font-medium">
                                                    {amountNum} {getChainSymbol(activeChain)}
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Chain</p>
                                                <p className="text-sm font-medium">{activeChain.chain_name}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">APY</p>
                                                <p className="text-sm font-medium">{apy}%</p>
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="space-y-3">
                                            <Button className="w-full h-12" onClick={handleStakeAgain}>
                                                Stake Again
                                            </Button>
                                        </div>
                                    </>
                                )}

                                {/* Failed State */}
                                {!isSending && error && (
                                    <>
                                        <div className="flex flex-col items-center space-y-4 py-8">
                                            <div className="w-16 h-16 rounded-full border-2 border-red-500 flex items-center justify-center">
                                                <X className="w-8 h-8 text-red-500" />
                                            </div>
                                            <h2 className="text-2xl font-bold">Transaction Failed</h2>
                                            <p className="text-center text-muted-foreground">{error}</p>
                                        </div>

                                        {/* Buttons */}
                                        <div className="space-y-3">
                                            <Button className="w-full h-12" onClick={handleTryAgain}>
                                                Try Again
                                            </Button>
                                            <Button variant="ghost" className="w-full" onClick={handleClose}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
