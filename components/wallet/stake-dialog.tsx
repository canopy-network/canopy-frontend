"use client";

import { useState, useEffect } from "react";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { X, ArrowLeft, Check, Info, Wallet, Loader2, AlertCircle, Copy } from "lucide-react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { portfolioApi, chainsApi, walletTransactionApi } from "@/lib/api";
import { generateChainColor } from "@/lib/utils/chain-ui-helpers";
import type { Chain } from "@/types/chains";
import type { LocalWallet } from "@/types/wallet";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { fromMicroUnits } from "@/lib/utils/denomination";

interface StakeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedChain?: Chain | null;
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
}: StakeDialogProps) {
    const { currentWallet, wallets } = useWalletStore();
    const [step, setStep] = useState<StakeStep>(1);
    const [amount, setAmount] = useState("");
    const [source, setSource] = useState("wallet");
    const [internalSelectedChain, setInternalSelectedChain] = useState<Chain | null>(null);
    const [chainsWithBalance, setChainsWithBalance] = useState<ChainWithBalance[]>([]);
    const [walletsWithBalance, setWalletsWithBalance] = useState<WalletWithBalance[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Transaction states (aligned with send-transaction-dialog)
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    // Fee estimation states
    const [estimatedFee, setEstimatedFee] = useState<string | null>(null);
    const [isEstimatingFee, setIsEstimatingFee] = useState(false);
    const [feeError, setFeeError] = useState<string | null>(null);

    const activeChain = selectedChain || internalSelectedChain;

    // Fetch chains and balances
    useEffect(() => {
        const fetchData = async () => {
            if (!open) return;

            setIsLoading(true);
            try {
                // Fetch chains
                const chainsResponse = await chainsApi.getChains({
                    status: "virtual_active",
                    limit: 100,
                });
                const fetchedChains = chainsResponse.data || [];

                console.log("========== STAKE DIALOG DEBUG ==========");
                console.log("📋 Fetched chains:", fetchedChains.length);
                console.log("📋 Chain IDs from API:", fetchedChains.map(c => ({ id: c.id, chain_id: c.chain_id, name: c.chain_name })));

                // Get all wallet addresses
                const walletAddresses = wallets.map(w => w.address);
                console.log("👛 Wallet addresses:", walletAddresses);

                if (walletAddresses.length === 0) {
                    console.log("❌ No wallets found");
                    setIsLoading(false);
                    return;
                }

                // Fetch portfolio overview for all wallets
                const portfolioResponse = await portfolioApi.getPortfolioOverview({
                    addresses: walletAddresses,
                });

                console.log("📊 Full Portfolio Response:", portfolioResponse);

                // Calculate price per token
                const portfolioTotalUSD = parseFloat(portfolioResponse.total_value_usd || "0");
                const portfolioTotalCNPY = parseFloat(portfolioResponse.total_value_cnpy || "0");
                const pricePerToken = portfolioTotalCNPY > 0 && portfolioTotalUSD > 0
                    ? portfolioTotalUSD / portfolioTotalCNPY
                    : 0.1; // Fallback

                // Build chains with balance - show ONLY chains that have staked balance
                const accounts = portfolioResponse.accounts || [];

                // Debug: Log all accounts to see staking data
                console.log("🔍 Portfolio accounts:", accounts);
                console.log("🔍 Each account staking info:");
                accounts.forEach((a, i) => {
                    console.log(`  Account ${i}: chain_id=${a.chain_id}, chain_name=${a.chain_name}`);
                    console.log(`    - staked_balance: ${a.staked_balance}`);
                    console.log(`    - delegated_balance: ${a.delegated_balance}`);
                    console.log(`    - available_balance: ${a.available_balance}`);
                });
                console.log("🔍 Accounts with staked balance > 0:", accounts.filter(a =>
                    parseFloat(a.staked_balance || "0") > 0 || parseFloat(a.delegated_balance || "0") > 0
                ));

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
                            console.log(`✅ Chain ${chain.chain_name}: available=${totalAvailable}, staked=${totalStaked}`);
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
                console.log("🔍 Chains from API with balance:", chainsFromApi.length, chainsFromApi.map(c => c.chain.chain_name));
                console.log("🔍 Portfolio chain_ids:", Array.from(accountsByChainId.keys()));

                accountsByChainId.forEach((chainAccounts, chainId) => {
                    console.log(`🔍 Processing portfolio chain_id=${chainId}, accounts=${chainAccounts.length}`);

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

                    console.log(`   Already matched in API chains: ${alreadyMatched}`);

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

                            console.log(`✅ Added chain from portfolio: ${firstAccount.chain_name} (id=${chainId}), available=${totalAvailable}`);
                        }
                    }
                });

                // Combine both sources
                const chainsData = [...chainsFromApi, ...chainsFromPortfolio];
                console.log("📋 Final chains with balance:", chainsData.length, chainsData);

                setChainsWithBalance(chainsData);

                // Set initial selected chain if provided
                if (selectedChain) {
                    setInternalSelectedChain(selectedChain);
                }
            } catch (error) {
                console.error("Failed to fetch staking data:", error);
                toast.error("Error loading staking data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [open, selectedChain, wallets]);

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep(1);
                setAmount("");
                setSource("wallet");
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
        }
    }, [open, selectedChain]);

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
        // Find chain by chain_id or by id (if chain_id is null)
        const chainData = chainsWithBalance.find(
            (c) => {
                if (c.chain.chain_id === chainId) return true;
                if (chainId.startsWith("chain-") && chainId === `chain-${c.chain.id}`) return true;
                if (String(c.chain.id) === chainId) return true;
                return false;
            }
        );
        if (chainData) {
            setInternalSelectedChain(chainData.chain);
        } else {
            console.warn("Chain not found for chainId:", chainId);
            console.log("Available chains:", chainsWithBalance.map(c => ({ id: c.chain.id, chain_id: c.chain.chain_id, name: c.chain.chain_name })));
        }
    };

    const chainData = activeChain
        ? chainsWithBalance.find((c) => c.chain.id === activeChain.id)
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
            setAmount(availableBalance.toString());
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
            // Get chain ID (numeric)
            let chainIdNum = 1; // Default
            if (activeChain.chain_id) {
                const match = activeChain.chain_id.match(/\d+/);
                if (match) {
                    chainIdNum = parseInt(match[0]);
                }
            } else {
                const idMatch = activeChain.id.toString().match(/\d+/);
                if (idMatch) {
                    chainIdNum = parseInt(idMatch[0]);
                }
            }

            const feeResponse = await walletTransactionApi.estimateFee({
                transaction_type: "stake",
                from_address: currentWallet.address,
                to_address: currentWallet.address, // For stake, to_address is same as from
                amount: amountNum.toString(),
                chain_id: chainIdNum,
            });

            setEstimatedFee(feeResponse.estimated_fee);
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
            // Get chain ID (numeric)
            let chainIdNum = 1; // Default
            if (activeChain.chain_id) {
                const match = activeChain.chain_id.match(/\d+/);
                if (match) {
                    chainIdNum = parseInt(match[0]);
                }
            } else {
                const idMatch = activeChain.id.toString().match(/\d+/);
                if (idMatch) {
                    chainIdNum = parseInt(idMatch[0]);
                }
            }

            // Get current height
            const heightResponse = await chainsApi.getChainHeight(String(chainIdNum));
            const currentHeight = heightResponse.data.height;

            // Convert amount to micro units
            const { toMicroUnits } = await import("@/lib/utils/denomination");
            const amountInMicro = parseInt(toMicroUnits(amountNum.toString()));

            // Create stake message
            const { createStakeMessage } = await import("@/lib/crypto/transaction");
            const stakeMsg = createStakeMessage(
                currentWallet.public_key,
                amountInMicro,
                [chainIdNum], // committees - use chainId as committee
                "", // netAddress - MUST be empty for delegation (passive staking)
                currentWallet.address, // outputAddress - rewards go to wallet
                true, // delegate - true for passive staking
                true // compound - compound rewards
                // signer parameter is optional, defaults to empty string
            );

            // Create and sign transaction
            const { createAndSignTransaction } = await import("@/lib/crypto/transaction");
            const { CurveType } = await import("@/lib/crypto/types");
            const signedTx = createAndSignTransaction(
                {
                    type: 'stake',
                    msg: stakeMsg,
                    fee: Number(estimatedFee) || 1000,
                    memo: " ", // CRITICAL: Always empty string, never undefined/null
                    networkID: 1,
                    chainID: chainIdNum,
                    height: currentHeight,
                },
                currentWallet.privateKey,
                currentWallet.public_key,
                currentWallet.curveType as any
            );

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

    return (
        <TooltipProvider>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px] p-0" showCloseButton={false}>
                    {/* Step 1: Select Chain and Amount */}
                    {step === 1 && (
                        <>
                            <VisuallyHidden>
                                <DialogTitle>Stake - Select Chain and Amount</DialogTitle>
                            </VisuallyHidden>
                            {/* Header */}
                            <div className="relative px-6 py-3 border-b">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-2"
                                    onClick={handleClose}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold">Stake</h2>
                                </div>
                            </div>

                            <div className="px-6 pb-6 space-y-6">
                                {/* Chain Selection */}
                                {!selectedChain && (
                                    <div className="space-y-2">
                                        <Label className="block text-sm font-medium">
                                            Select Chain
                                        </Label>
                                        <Select
                                            value={activeChain ? (activeChain.chain_id || `chain-${activeChain.id}`) : ""}
                                            onValueChange={handleChainSelect}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger className="h-auto py-6 w-full [&>span]:line-clamp-none [&>span]:block">
                                                <SelectValue placeholder="Choose a chain to stake">
                                                    {activeChain && chainData ? (
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                                                style={{
                                                                    backgroundColor: getChainColor(
                                                                        activeChain
                                                                    ),
                                                                }}
                                                            >
                                                                <span className="text-[10px] font-bold text-white leading-tight px-0.5">
                                                                    {getChainInitial(activeChain)}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col items-start">
                                                                <span className="font-medium text-sm">
                                                                    {activeChain.chain_name}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {getChainSymbol(activeChain)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : undefined}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
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
                                                        .map((chainData) => {
                                                            // Use chain_id if available, otherwise use chain.id as value
                                                            // chain.id is always a string, so it's safe to use
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
                                                                                    <> • Balance: {chainData.balance.toFixed(2)}</>
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

                                {/* Chain Display (when chain is pre-selected) */}
                                {selectedChain && activeChain && chainData && (
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
                                                    {availableBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
                                                    Amount
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
                                                    className="pr-16 text-lg h-11"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                    {getChainSymbol(activeChain)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                approx. ${amountUSD.toFixed(2)} USD
                                            </p>
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
                                                            based on current APY
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <div className="text-center py-2">
                                                <p className="text-2xl font-bold">
                                                    {amountNum > 0
                                                        ? projectedYearlyInterest.toFixed(4)
                                                        : "−"}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    approx. $
                                                    {projectedYearlyInterestUSD.toFixed(2)} USD
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

                                {/* Continue Button */}
                                <Button
                                    className="w-full h-12"
                                    onClick={handleContinueFromStep1}
                                    disabled={
                                        !activeChain ||
                                        !amountNum ||
                                        amountNum <= 0 ||
                                        amountNum > availableBalance ||
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
                            <div className="relative p-6 pb-4">
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

                            <div className="px-6 pb-6 space-y-6">
                                {/* Summary */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Summary</h3>

                                    <div className="space-y-3">
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
                                            <span className="text-sm text-muted-foreground">Network Fee</span>
                                            <div className="text-right">
                                                {isEstimatingFee ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        <p className="text-sm font-medium text-muted-foreground">Estimating...</p>
                                                    </div>
                                                ) : estimatedFee ? (
                                                    <p className="text-sm font-medium">{fromMicroUnits(estimatedFee, 6)} CNPY</p>
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

                                {/* Buttons */}
                                <div className="space-y-3">
                                    <Button
                                        className="w-full h-12"
                                        onClick={handleConfirmStake}
                                        disabled={!currentWallet?.isUnlocked || !estimatedFee}
                                    >
                                        Confirm & Stake
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full"
                                        onClick={handleBack}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 3: Transaction Status */}
                    {step === 3 && activeChain && chainData && (
                        <>
                            <VisuallyHidden>
                                <DialogTitle>Stake - Transaction Status</DialogTitle>
                            </VisuallyHidden>
                            <div className="relative p-6 pb-4">
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

                            <div className="px-6 pb-6 space-y-6">
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
                                            <h2 className="text-2xl font-bold">Staking Successful!</h2>
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

