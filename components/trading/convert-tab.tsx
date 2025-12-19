"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  ArrowDown,
  Check,
  Zap,
  Loader2,
  AlertCircle,
  Minus,
  AlertTriangle,
} from "lucide-react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import BridgeTokenDialog from "@/components/trading/bridge-token-dialog";
import DestinationCurrencyDialog from "@/components/trading/destination-currency-dialog";
import SellOrderConfirmationDialog from "@/components/trading/sell-order-confirmation-dialog";
import ConvertTransactionDialog from "@/components/trading/convert-transaction-dialog";
import { orderbookApi } from "@/lib/api";
import { useChainId } from "wagmi";
import { USDC_ADDRESSES } from "@/lib/web3/config";
import toast from "react-hot-toast";
import type { ChainData, BridgeToken, ConnectedWallets, OrderBookOrder, OrderSelection } from "@/types/trading";
import type { OrderBookApiOrder } from "@/types/orderbook";

// Chain IDs for cross-chain swaps:
// Chain 1: Root chain (CNPY)
// Chain 3: USDC (oracle)
const DECIMALS = 1_000_000; // 6 decimals

// USDC Committee ID
const USDC_COMMITTEE_ID = 3;

// USDC Contract Address on Ethereum Mainnet
const USDC_CONTRACT_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

// Fee percentage for instant sells (protocol fee)
const INSTANT_FEE_PERCENT = 10;

// Direction of conversion
type ConvertDirection = "buy" | "sell";

// Sell mode: instant (match existing buy orders) or create (create new sell order)
type SellMode = "instant" | "create";

// CNPY Logo SVG Component
function CnpyLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.7649 0.880227C12.658 0.827134 12.5342 0.905351 12.5342 1.02378V3.04351C12.5342 3.18794 12.7104 3.26027 12.8135 3.15814L14.069 1.91394C14.1383 1.84534 14.1317 1.73215 14.0535 1.67368C13.6439 1.36708 13.2123 1.10259 12.7649 0.880227Z"
        fill="currentColor"
      />
      <path
        d="M10.4705 0.127791C10.5477 0.141319 10.6032 0.208239 10.6032 0.285896V5.28157C10.6032 5.32456 10.586 5.36579 10.5553 5.3962L8.90769 7.02887C8.80463 7.13099 8.62842 7.05867 8.62842 6.91423V0.163239C8.62842 0.0764816 8.69735 0.00493239 8.78487 0.00272091C9.34863 -0.0115243 9.91358 0.0301658 10.4705 0.127791Z"
        fill="currentColor"
      />
      <path
        d="M6.64953 9.26628C6.68021 9.23588 6.69744 9.19464 6.69744 9.15164V0.531669C6.69744 0.424066 6.59358 0.346317 6.48993 0.37839C5.89636 0.562066 5.31929 0.812546 4.77074 1.12983C4.72107 1.15856 4.69092 1.21149 4.69092 1.26849V10.8158C4.69092 10.9602 4.86713 11.0325 4.97019 10.9304L6.64953 9.26628Z"
        fill="currentColor"
      />
      <path
        d="M2.4827 3.0726C2.57734 2.95748 2.75983 3.02558 2.75983 3.17407L2.75984 13.0535C2.75984 13.0965 2.7426 13.1377 2.71192 13.1681L2.53426 13.3441C2.46504 13.4128 2.35058 13.4059 2.29159 13.3285C-0.0224758 10.292 0.0412298 6.04232 2.4827 3.0726Z"
        fill="currentColor"
      />
      <path
        d="M10.3924 8.65513C10.2467 8.65513 10.1737 8.48052 10.2768 8.37839L11.9244 6.74572C11.9551 6.71532 11.9966 6.69824 12.04 6.69824H17.1031C17.1812 6.69824 17.2486 6.75292 17.2625 6.82908C17.3635 7.38074 17.408 7.94056 17.396 8.49942C17.3942 8.58642 17.3219 8.65513 17.234 8.65513H10.3924Z"
        fill="currentColor"
      />
      <path
        d="M14.1825 4.50709C14.0795 4.60922 14.1525 4.78383 14.2982 4.78383H16.3466C16.4664 4.78383 16.5454 4.66045 16.4911 4.55456C16.2638 4.11067 15.9935 3.68279 15.6806 3.27689C15.6215 3.20007 15.5077 3.19389 15.4388 3.26223L14.1825 4.50709Z"
        fill="currentColor"
      />
      <path
        d="M8.13428 10.5684C8.09089 10.5684 8.04928 10.5854 8.0186 10.6158L6.33926 12.28C6.2362 12.3821 6.30919 12.5567 6.45493 12.5567H16.1382C16.196 12.5567 16.2496 12.5265 16.2784 12.4769C16.5952 11.933 16.8447 11.3612 17.027 10.7733C17.0588 10.6707 16.9803 10.5684 16.8721 10.5684H8.13428Z"
        fill="currentColor"
      />
      <path
        d="M3.91045 14.9412C3.83293 14.8825 3.82636 14.7696 3.89534 14.7013L4.08101 14.5173C4.11169 14.4868 4.1533 14.4697 4.19669 14.4697H14.2374C14.3867 14.4697 14.4559 14.6496 14.3406 14.7438C11.33 17.208 6.99201 17.2737 3.91045 14.9412Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Chain badge component
interface ChainBadgeProps {
  chain: string;
  size?: "sm" | "md";
}

function ChainBadge({ chain, size = "sm" }: ChainBadgeProps) {
  const chainConfig: Record<string, { color: string; label: string }> = {
    ethereum: { color: "#627EEA", label: "ETH" },
  };
  const config = chainConfig[chain] || chainConfig.ethereum;
  const sizeClass = size === "sm" ? "w-4 h-4 text-[8px]" : "w-5 h-5 text-[10px]";

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white absolute -bottom-0.5 -right-0.5 border-2 border-background`}
      style={{ backgroundColor: config.color }}
    >
      {config.label[0]}
    </div>
  );
}

// Calculate order selection
function calculateOrderSelection(
  orders: OrderBookOrder[],
  inputAmount: number,
  sortMode: "best_price" | "best_fill"
): OrderSelection {
  if (!inputAmount || inputAmount <= 0) {
    return {
      selectedOrders: [],
      totalSavings: 0,
      totalCost: 0,
      cnpyReceived: 0,
      gap: 0,
    };
  }

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortMode === "best_price") return a.price - b.price;
    return b.amount - a.amount;
  });

  let remainingBudget = inputAmount;
  const selectedOrders: (OrderBookOrder & { cost: number; savings: number })[] = [];
  let totalSavings = 0;
  let totalCost = 0;
  let cnpyReceived = 0;

  for (const order of sortedOrders) {
    const orderCost = order.amount * order.price;
    if (orderCost <= remainingBudget) {
      const savings = order.amount - orderCost;
      selectedOrders.push({ ...order, cost: orderCost, savings });
      totalSavings += savings;
      totalCost += orderCost;
      cnpyReceived += order.amount;
      remainingBudget -= orderCost;
    }
  }

  return {
    selectedOrders,
    totalSavings,
    totalCost,
    cnpyReceived,
    gap: inputAmount - totalCost,
    isFullyFilled: inputAmount - totalCost < 1,
  };
}

// Compact Order Row with fill percentage
interface OrderRowProps {
  order: OrderBookOrder & { cost?: number; savings?: number };
  isSelected: boolean;
  index: number;
  percentOfBudget: number;
}

function OrderRow({ order, isSelected, index, percentOfBudget }: OrderRowProps) {
  return (
    <div
      className={`relative flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 overflow-hidden ${
        isSelected ? "border border-green-500/20" : "opacity-40"
      }`}
      style={{ transitionDelay: isSelected ? `${index * 30}ms` : "0ms" }}
    >
      {/* Background fill showing % of budget */}
      {isSelected && (
        <div
          className="absolute inset-0 bg-green-500/15 transition-all duration-300 ease-out"
          style={{ width: `${percentOfBudget}%` }}
        />
      )}

      <div className="relative flex items-center gap-2">
        <div
          className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
            isSelected ? "bg-green-500 text-white" : "border border-muted-foreground/30"
          }`}
        >
          {isSelected && <Check className="w-2.5 h-2.5" />}
        </div>
        <span className="text-sm font-medium">${order.amount}</span>
        <span className="text-xs text-green-500">{order.discount}%</span>
        {isSelected && <span className="text-xs text-muted-foreground">({Math.round(percentOfBudget)}%)</span>}
      </div>
      {isSelected && order.savings !== undefined && (
        <span className="relative text-xs text-green-500 font-medium">+${order.savings.toFixed(2)}</span>
      )}
    </div>
  );
}

interface ConvertTabProps {
  chainData?: ChainData | null;
  isPreview?: boolean;
  onSelectToken?: (mode: "from" | "to" | "tokenA" | "tokenB") => void;
  onOpenWalletDialog?: () => void;
  onAmountChange?: (amount: number) => void;
  onSourceTokenChange?: (token: BridgeToken | null) => void;
  orderBookSelection?: OrderSelection;
}

interface ButtonState {
  disabled: boolean;
  text: string;
  variant: "connect" | "disabled" | "error" | "convert" | "sell";
}

type ConversionPair = "USDC-CNPY" | "CNPY-USDC";

export default function ConvertTab({
  isPreview = false,
  onOpenWalletDialog,
  onAmountChange,
  onSourceTokenChange,
}: ConvertTabProps) {
  const { wallets, currentWallet, createOrder, balance } = useWalletStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const isConnected = wallets.length > 0;
  const ethAddress = user?.wallet_address; // Ethereum address from SIWE sign-in

  const [conversionPair, setConversionPair] = useState<ConversionPair | null>(null);

  // Get chain ID for USDC contract address lookup
  const chainId = useChainId();
  const usdcAddress = chainId ? USDC_ADDRESSES[chainId] : undefined;

  // Get actual CNPY balance from wallet store
  // CNPY is on chain 1, look for token with chainId === 1 or symbol "C001"
  // Use liquid/available balance (not total, which includes staked/delegated)
  const cnpyBalance = useMemo(() => {
    if (!balance?.tokens) return 0;
    // Find CNPY token (chain 1) - it could be "C001" or have chainId === 1
    const cnpyToken = balance.tokens.find((token) => token.chainId === 1 || token.symbol === "C001");
    if (!cnpyToken) return 0;
    // Use liquid/available balance if available, otherwise fall back to total balance
    const liquidBalance = cnpyToken.distribution?.liquid;
    const balanceStr = liquidBalance || cnpyToken.balance;
    // Parse balance string to number (balance is already in standard units, not micro)
    const balanceNum = parseFloat(balanceStr);
    return isNaN(balanceNum) ? 0 : balanceNum;
  }, [balance]);

  // Direction state: "buy" = USDC→CNPY, "sell" = CNPY→USDC
  const [direction, setDirection] = useState<ConvertDirection>("buy");
  const [sellMode, setSellMode] = useState<SellMode>("instant");
  const [sellPrice, setSellPrice] = useState("2"); // Custom price for "create" mode, default to 2
  const [priceType, setPriceType] = useState<"market" | "-1%" | "-2%" | "-5%" | "custom">("market");
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showReceiveSection, setShowReceiveSection] = useState(false); // Collapsible "You receive" section

  // Market price constant
  const MARKET_PRICE = 2.0;

  const [showBridgeDialog, setShowBridgeDialog] = useState(false);
  const [showDestinationDialog, setShowDestinationDialog] = useState(false);
  const [showSellConfirmationDialog, setShowSellConfirmationDialog] = useState(false);
  const [sourceToken, setSourceToken] = useState<BridgeToken | null>(null);
  const [destinationCurrency, setDestinationCurrency] = useState<BridgeToken | null>(null);
  const [amount, setAmount] = useState("");
  const [sortMode, setSortMode] = useState<"best_price" | "best_fill">("best_price");
  const [showOrders, setShowOrders] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);

  // Order submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Real orderbook data
  const [realOrders, setRealOrders] = useState<OrderBookApiOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Connected wallets state - will be populated from BridgeTokenDialog
  // which fetches real balances using wagmi
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallets>({
    ethereum: {
      connected: !!ethAddress,
      address: ethAddress || null,
      balances: { USDC: 0, USDT: 0 },
    },
  });

  // Calculate price based on price type
  const getPriceFromType = useCallback(
    (type: typeof priceType): number => {
      switch (type) {
        case "market":
          return MARKET_PRICE;
        case "-1%":
          return MARKET_PRICE * 0.99;
        case "-2%":
          return MARKET_PRICE * 0.98;
        case "-5%":
          return MARKET_PRICE * 0.95;
        case "custom":
          return parseFloat(sellPrice) || MARKET_PRICE;
        default:
          return MARKET_PRICE;
      }
    },
    [sellPrice]
  );

  // Calculate USDC receive amount for sell mode
  const sellCalculation = useMemo(() => {
    const cnpyAmount = parseFloat(amount) || 0;
    if (cnpyAmount <= 0) return { usdcReceive: 0, fee: 0, pricePerCnpy: 0, gross: 0 };

    if (sellMode === "instant") {
      // Instant mode: fixed price with fee
      const pricePerCnpy = 1.0; // Default price - in real app would come from market
      const gross = cnpyAmount * pricePerCnpy;
      const fee = (gross * INSTANT_FEE_PERCENT) / 100;
      const usdcReceive = gross - fee;
      return { usdcReceive, fee, pricePerCnpy, gross };
    } else {
      // Create order mode: user sets the price
      const pricePerCnpy = getPriceFromType(priceType);
      const usdcReceive = cnpyAmount * pricePerCnpy;
      return { usdcReceive, fee: 0, pricePerCnpy, gross: usdcReceive };
    }
  }, [amount, sellMode, priceType, getPriceFromType]);

  // Fetch real orders from the orderbook API (USDC only)
  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      // Fetch orders for USDC committee
      const response = await orderbookApi.getOrderBook({
        chainId: USDC_COMMITTEE_ID,
      });
      const orderBooks = response.data || [];
      const allOrders = orderBooks.flatMap((book) => book.orders || []);
      // Sort by price ascending (best price first for buyers)
      allOrders.sort((a, b) => {
        const priceA = a.requestedAmount / a.amountForSale;
        const priceB = b.requestedAmount / b.amountForSale;
        return priceA - priceB;
      });
      setRealOrders(allOrders);
    } catch (err) {
      console.error("Failed to fetch orderbook:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Fetch balance when wallet is available
  useEffect(() => {
    if (currentWallet) {
      const { fetchBalance } = useWalletStore.getState();
      fetchBalance(currentWallet.id);
    }
  }, [currentWallet]);

  // Update connected wallets when ethAddress changes
  useEffect(() => {
    if (ethAddress) {
      setConnectedWallets((prev) => ({
        ...prev,
        ethereum: {
          ...prev.ethereum,
          connected: true,
          address: ethAddress,
        },
      }));
    }
  }, [ethAddress]);

  useEffect(() => {
    if (sourceToken) {
      if (direction === "buy") {
        setConversionPair(`${sourceToken.symbol}-CNPY` as ConversionPair);
      } else {
        setConversionPair(`CNPY-${sourceToken.symbol}` as ConversionPair);
      }
    }
  }, [sourceToken, direction]);

  const handleConnectWallet = async (chainId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setConnectedWallets((prev) => ({
      ...prev,
      [chainId]: {
        connected: true,
        address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
        balances: { USDC: 2100.0, USDT: 500.75 },
      },
    }));
  };

  const handleTokenSelected = (token: BridgeToken) => {
    setSourceToken(token);
    setAmount("");
    setSubmitError(null);
    setSubmitSuccess(null);
    onSourceTokenChange?.(token);
    onAmountChange?.(0);
  };

  // Handle swapping direction (buy <-> sell)
  const handleSwapDirection = () => {
    setDirection((prev) => (prev === "buy" ? "sell" : "buy"));
    setAmount("");
    setSubmitError(null);
    setSubmitSuccess(null);
    setSellPrice("2"); // Reset to default price of 2
    setPriceType("market");
    setShowReceiveSection(false); // Collapse receive section when switching
  };

  // Handle price type selection
  const handlePriceTypeSelect = (type: typeof priceType) => {
    setPriceType(type);
    setShowPriceDropdown(false);
    if (type !== "custom") {
      setSellPrice(getPriceFromType(type).toFixed(2));
    }
  };

  // Handle price increment/decrement
  const handlePriceChange = (delta: number) => {
    const currentPrice = parseFloat(sellPrice) || MARKET_PRICE;
    const newPrice = Math.max(0.01, currentPrice + delta);
    setSellPrice(newPrice.toFixed(2));
    setPriceType("custom");
  };

  // Handle destination currency selection
  const handleDestinationSelected = (token: BridgeToken) => {
    setDestinationCurrency(token);
    setShowDestinationDialog(false);
  };

  // Transform real API orders to the OrderBookOrder format for display
  const availableOrders = useMemo(() => {
    return realOrders.map((order) => {
      const cnpyAmount = order.amountForSale / DECIMALS;
      const usdcAmount = order.requestedAmount / DECIMALS;
      const price = usdcAmount / cnpyAmount;
      // Calculate discount compared to $1 per CNPY
      const discount = Math.max(0, (1 - price) * 100);
      return {
        id: order.id,
        amount: cnpyAmount,
        price,
        token: "USDC", // These are USDC orders from committee 3
        discount: Math.round(discount * 10) / 10,
        // Keep reference to original order
        _original: order,
      } as OrderBookOrder & { _original: OrderBookApiOrder };
    });
  }, [realOrders]);

  const selection = useMemo(
    () => calculateOrderSelection(availableOrders, parseFloat(amount) || 0, sortMode),
    [availableOrders, amount, sortMode]
  );

  const selectedOrderIds = new Set(selection.selectedOrders.map((o) => o.id));

  const displayOrders = useMemo(() => {
    return [...availableOrders].sort((a, b) => {
      if (sortMode === "best_price") return a.price - b.price;
      return b.amount - a.amount;
    });
  }, [availableOrders, sortMode]);

  // Notify parent
  useEffect(() => {
    onAmountChange?.(parseFloat(amount) || 0);
  }, [amount, onAmountChange]);

  const handleUseMax = () => {
    if (direction === "sell") {
      setAmount(cnpyBalance.toString());
      setShowReceiveSection(true); // Show receive section when using max
    } else if (sourceToken) {
      // Use the actual balance from the selected token (fetched from wallet)
      const maxBalance = sourceToken.balance || 0;
      setAmount(maxBalance.toString());
    }
  };

  const getButtonState = (): ButtonState => {
    if (!isConnected) return { disabled: false, text: "Connect Wallet", variant: "connect" };
    if (!currentWallet)
      return {
        disabled: true,
        text: "Connect Canopy Wallet",
        variant: "disabled",
      };
    if (!currentWallet.isUnlocked)
      return {
        disabled: true,
        text: "Unlock Canopy Wallet",
        variant: "disabled",
      };
    if (!ethAddress)
      return {
        disabled: true,
        text: "Sign in with Ethereum",
        variant: "disabled",
      };

    // Sell mode validations
    if (direction === "sell") {
      if (!destinationCurrency) return { disabled: true, text: "Select destination", variant: "disabled" };
      if (!amount || parseFloat(amount) <= 0) return { disabled: true, text: "Enter amount", variant: "disabled" };
      if (parseFloat(amount) > cnpyBalance)
        return {
          disabled: true,
          text: "Insufficient CNPY balance",
          variant: "error",
        };
      if (sellMode === "create" && (!sellPrice || parseFloat(sellPrice) <= 0))
        return { disabled: true, text: "Enter price", variant: "disabled" };
      if (isSubmitting) return { disabled: true, text: "Processing...", variant: "disabled" };

      return {
        disabled: false,
        text: sellMode === "create" ? "Create Order" : "Place Order",
        variant: "sell",
      };
    }

    // Buy mode validations (existing logic)
    if (!sourceToken) return { disabled: true, text: "Select token", variant: "disabled" };
    if (!amount || parseFloat(amount) <= 0) return { disabled: true, text: "Enter amount", variant: "disabled" };
    if (parseFloat(amount) > sourceToken.balance)
      return { disabled: true, text: "Insufficient balance", variant: "error" };
    if (selection.selectedOrders.length === 0)
      return {
        disabled: true,
        text: "No orders available",
        variant: "disabled",
      };
    if (isSubmitting) return { disabled: true, text: "Processing...", variant: "disabled" };
    return {
      disabled: false,
      text: `Convert $${selection.totalCost.toFixed(2)}`,
      variant: "convert",
    };
  };

  // Handle the actual order creation (for sell mode, called from confirmation dialog)
  const handleCreateSellOrder = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    // Validation
    if (!currentWallet) {
      setSubmitError("Please connect a Canopy wallet first");
      return;
    }

    if (!currentWallet.isUnlocked) {
      setSubmitError("Please unlock your Canopy wallet first");
      return;
    }

    if (!ethAddress) {
      setSubmitError("Please sign in with Ethereum (SIWE)");
      return;
    }

    if (!usdcAddress) {
      setSubmitError("USDC not supported on this network");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setSubmitError("Please enter an amount");
      return;
    }

    if (!destinationCurrency) {
      setSubmitError("Please select a destination currency");
      return;
    }

    setIsSubmitting(true);

    try {
      const DATA_ADDRESS = USDC_CONTRACT_ADDRESS;
      const cnpyAmount = parseFloat(amount);

      if (cnpyAmount > cnpyBalance) {
        setSubmitError("Insufficient CNPY balance");
        setIsSubmitting(false);
        return;
      }

      // Determine USDC amount based on mode
      let usdcAmount: number;
      let finalPricePerCnpy: number;
      if (sellMode === "instant") {
        // Instant: use market price with fee already calculated
        usdcAmount = sellCalculation.usdcReceive;
        finalPricePerCnpy = sellCalculation.pricePerCnpy;
      } else {
        // Create order: user-specified price
        finalPricePerCnpy = getPriceFromType(priceType);
        if (!finalPricePerCnpy || finalPricePerCnpy <= 0) {
          setSubmitError("Please enter a valid price");
          setIsSubmitting(false);
          return;
        }
        usdcAmount = cnpyAmount * finalPricePerCnpy;
      }

      // Convert to micro units
      const amountForSale = Math.round(cnpyAmount * DECIMALS);
      const requestedAmount = Math.round(usdcAmount * DECIMALS);

      // Create sell order
      const txHash = await createOrder(
        USDC_COMMITTEE_ID, // Committee ID 3 for USDC
        amountForSale, // CNPY amount in micro units
        requestedAmount, // USDC amount in micro units
        ethAddress, // sellerReceiveAddress: Ethereum address to receive USDC
        DATA_ADDRESS // data: USDC contract address
      );

      // Close confirmation dialog
      setShowSellConfirmationDialog(false);

      // Show success toast
      toast.success(
        (t) => (
          <div className="flex items-start gap-3 w-full">
            <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white mb-1">Order created successfully</p>
              <p className="text-sm text-muted-foreground">
                Selling {cnpyAmount.toLocaleString()} CNPY at ${finalPricePerCnpy.toFixed(3)}/CNPY
              </p>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                router.push("/orderbook");
              }}
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              View Orders
            </button>
          </div>
        ),
        {
          duration: 5000,
          position: "bottom-center",
          style: {
            background: "rgba(0, 0, 0, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
            backdropFilter: "blur(8px)",
            borderRadius: "12px",
            padding: "16px",
            maxWidth: "500px",
          },
        }
      );

      // Reset form
      setAmount("");
      setSellPrice("");

      // Refresh orders after delay
      setTimeout(() => {
        fetchOrders();
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create order");
      setShowSellConfirmationDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle the button click - for sell mode, show confirmation dialog
  // Buy: USDC → CNPY (filling existing sell orders)
  // Sell: CNPY → USDC (creating a sell order)
  const handleConvert = async () => {
    // For sell mode, show confirmation dialog instead of directly creating order
    if (direction === "sell") {
      // Check if destination is selected
      if (!destinationCurrency) {
        setShowDestinationDialog(true);
        return;
      }
      setShowSellConfirmationDialog(true);
      return;
    }

    // For buy mode, continue with existing logic
    setSubmitError(null);
    setSubmitSuccess(null);

    // Validation
    if (!currentWallet) {
      setSubmitError("Please connect a Canopy wallet first");
      return;
    }

    if (!currentWallet.isUnlocked) {
      setSubmitError("Please unlock your Canopy wallet first");
      return;
    }

    if (!ethAddress) {
      setSubmitError("Please sign in with Ethereum (SIWE)");
      return;
    }

    if (!usdcAddress) {
      setSubmitError("USDC not supported on this network");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setSubmitError("Please enter an amount");
      return;
    }

    setIsSubmitting(true);

    try {
      let DATA_ADDRESS;

      if (conversionPair === "CNPY-USDC") {
        DATA_ADDRESS = USDC_CONTRACT_ADDRESS;
      } else if (conversionPair === "USDC-CNPY") {
        DATA_ADDRESS = ethAddress;
      }

      if (!DATA_ADDRESS) {
        setSubmitError("Unable to determine data address for conversion");
        setIsSubmitting(false);
        return;
      }

      // BUY CNPY with USDC
      if (!sourceToken) {
        setSubmitError("Please select a token");
        setIsSubmitting(false);
        return;
      }

      if (selection.selectedOrders.length === 0) {
        setSubmitError("No orders available to fill");
        setIsSubmitting(false);
        return;
      }

      const totalCnpyToReceive = Math.round(selection.cnpyReceived * DECIMALS);
      const totalUsdcToSpend = Math.round(selection.totalCost * DECIMALS);

      // Buy CNPY with USDC
      const txHash = await createOrder(
        USDC_COMMITTEE_ID, // Committee ID 3 for USDC
        totalCnpyToReceive, // CNPY amount to receive
        totalUsdcToSpend, // USDC amount to pay
        currentWallet.address, // Canopy address to receive CNPY
        DATA_ADDRESS // data: USDC contract address
      );

      setSubmitSuccess(
        `Order created! TX: ${txHash.slice(
          0,
          16
        )}... | Buying ${selection.cnpyReceived.toLocaleString()} CNPY with USDC`
      );

      // Reset form
      setAmount("");
      setSellPrice("");

      // Refresh orders after delay
      setTimeout(() => {
        fetchOrders();
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonState = getButtonState();

  // Render SELL mode UI
  if (direction === "sell") {
    return (
      <>
        {/* Input Token Card - CNPY */}
        <div className="px-4">
          <Card className="bg-muted/30 p-4 space-y-3 gap-0">
            {/* CNPY Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CnpyLogo className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-base font-semibold">CNPY</p>
                  <p className="text-sm text-muted-foreground">{cnpyBalance.toLocaleString()} CNPY</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={handleUseMax}>
                Use max
              </Button>
            </div>

            {/* Amount Input - Centered */}
            <div className="flex items-center justify-center">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    setAmount(value);
                    // Show receive section when amount is entered
                    if (parseFloat(value) > 0) {
                      setShowReceiveSection(true);
                    } else {
                      setShowReceiveSection(false);
                    }
                    if (parseFloat(value) > cnpyBalance && parseFloat(amount) <= cnpyBalance) {
                      setIsShaking(true);
                      setTimeout(() => setIsShaking(false), 400);
                    }
                  }
                }}
                placeholder="0"
                className={`text-4xl font-bold bg-transparent border-0 outline-none p-0 h-auto text-center w-full placeholder:text-muted-foreground ${
                  isShaking ? "animate-shake" : ""
                }`}
              />
            </div>

            {/* Price Info */}
            {amount && parseFloat(amount) > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                ${(parseFloat(amount) * sellCalculation.pricePerCnpy).toFixed(2)} • $
                {sellCalculation.pricePerCnpy.toFixed(2)}/CNPY
              </div>
            )}
          </Card>
        </div>

        {/* Arrow Divider - Clickable to swap direction */}
        <div className="relative flex justify-center">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-8 w-8 bg-background border-2 hover:bg-muted cursor-pointer"
            onClick={handleSwapDirection}
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        </div>

        {/* Output Token Card - Destination Currency */}
        <div className="px-4">
          <Card className="bg-muted/30 p-4 gap-4">
            {/* Destination Currency Header */}
            {destinationCurrency ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowDestinationDialog(true)}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="relative">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: destinationCurrency.color }}
                    >
                      {destinationCurrency.symbol === "USDC" ? "$" : destinationCurrency.symbol[0]}
                    </div>
                    <ChainBadge chain={destinationCurrency.chain} />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold">{destinationCurrency.symbol}</p>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {destinationCurrency.chainName}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {destinationCurrency.balance.toLocaleString()} {destinationCurrency.symbol}
                    </p>
                  </div>
                </button>
                <div className="text-right">
                  <p className="text-base font-semibold">${sellCalculation.usdcReceive.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">@${sellCalculation.pricePerCnpy.toFixed(3)}/CNPY</p>
                </div>
              </div>
            ) : (
              <Card
                className="bg-muted/30 p-4 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => setShowDestinationDialog(true)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
                      <Plus className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-base font-semibold">Select destination</p>
                      <p className="text-sm text-muted-foreground">Choose where to receive funds</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            )}

            {/* Sell Mode Toggle: Instant vs Create Order */}
            <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
              <button
                onClick={() => setSellMode("instant")}
                className={`flex-col w-full flex items-center justify-center  py-2 rounded-md text-sm font-medium transition-all ${
                  sellMode === "instant"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Instant
                </span>
                <span className="text-muted-foreground text-xs">-${sellCalculation.fee.toFixed(2)}</span>
              </button>
              <button
                onClick={() => setSellMode("create")}
                className={`flex-col  flex w-full py-2 rounded-md text-sm font-medium transition-all ${
                  sellMode === "create"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="">Create Order</span>
                <span className="text-green-500 text-xs">
                  +$
                  {((parseFloat(amount) || 0) * (parseFloat(sellPrice) || 1) - sellCalculation.gross).toFixed(2)}
                </span>
              </button>
            </div>

            {/* Mode-specific content */}
            {parseFloat(amount) > 0 ? (
              <>
                {/* You receive section - collapsible */}
                {sellMode === "instant" ? (
                  <>
                    <div className="bg-muted/30 py-3 px-3 rounded-lg">
                      <button
                        onClick={() => setShowReceiveSection(!showReceiveSection)}
                        className="w-full flex items-center justify-between"
                      >
                        <div className="text-left">
                          <p className="text-sm text-muted-foreground">You receive (if filled)</p>
                          <p className="text-xl font-bold">${sellCalculation.usdcReceive.toFixed(2)} USDC</p>
                          <p className="text-sm text-muted-foreground">
                            Fee:{" "}
                            <span className="text-white">
                              {" "}
                              {INSTANT_FEE_PERCENT}% ($
                              {sellCalculation.fee.toFixed(2)})
                            </span>
                          </p>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-white transition-transform ${
                            showReceiveSection ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {showReceiveSection && (
                        <div className="mt-4 pt-4 border-t border-border space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Rate: <span className="text-white">${sellCalculation.pricePerCnpy.toFixed(3)}/CNPY</span>
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm">
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-muted-foreground">Instant</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-muted-foreground">Guaranteed</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-muted/30 py-3 px-3 rounded-lg">
                      <button
                        onClick={() => setShowReceiveSection(!showReceiveSection)}
                        className="w-full flex items-center justify-between"
                      >
                        <div className="text-left">
                          <p className="text-sm text-muted-foreground">You receive (if filled)</p>
                          <p className="text-xl font-bold">${sellCalculation.usdcReceive.toFixed(2)} USDC</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Est. fill time: <span className="text-white">2-4 hours</span>
                          </p>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-white transition-transform ${
                            showReceiveSection ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {showReceiveSection && (
                        <div className="mt-4 pt-4 border-t border-border space-y-4">
                          {/* Price input for "Create Order" mode - only show when expanded */}
                          {sellMode === "create" && (
                            <div className="space-y-3">
                              <label className="text-sm text-muted-foreground">Set your price:</label>

                              {/* Price Input Group */}
                              <div className="flex items-center gap-2">
                                {/* Dropdown */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                                    className="flex flex-row items-center whitespace-nowrap  pl-3 py-2 pr-1 bg-muted/50 border border-border rounded-lg text-xs hover:bg-muted/70 transition-colors"
                                  >
                                    <span>
                                      {priceType === "market"
                                        ? `Market ($${MARKET_PRICE.toFixed(2)})`
                                        : priceType === "custom"
                                        ? "Custom"
                                        : `${priceType} ($${getPriceFromType(priceType).toFixed(2)})`}
                                    </span>
                                    <ChevronDown
                                      className={`w-4 h-4 transition-transform ${
                                        showPriceDropdown ? "rotate-180" : ""
                                      }`}
                                    />
                                  </button>

                                  {/* Dropdown Menu */}
                                  {showPriceDropdown && (
                                    <>
                                      <div className="fixed inset-0 z-10" onClick={() => setShowPriceDropdown(false)} />
                                      <div className="absolute top-full left-0 mt-1 w-48 bg-background border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                                        <button
                                          onClick={() => handlePriceTypeSelect("market")}
                                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center justify-between"
                                        >
                                          <span>Market (${MARKET_PRICE.toFixed(2)})</span>
                                          {priceType === "market" && <Check className="w-4 h-4 text-green-500" />}
                                        </button>
                                        <button
                                          onClick={() => handlePriceTypeSelect("-1%")}
                                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center justify-between"
                                        >
                                          <span>-1% (${getPriceFromType("-1%").toFixed(2)})</span>
                                          {priceType === "-1%" && <Check className="w-4 h-4 text-green-500" />}
                                        </button>
                                        <button
                                          onClick={() => handlePriceTypeSelect("-2%")}
                                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center justify-between"
                                        >
                                          <span>-2% (${getPriceFromType("-2%").toFixed(2)})</span>
                                          {priceType === "-2%" && <Check className="w-4 h-4 text-green-500" />}
                                        </button>
                                        <button
                                          onClick={() => handlePriceTypeSelect("-5%")}
                                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center justify-between"
                                        >
                                          <span>-5% (${getPriceFromType("-5%").toFixed(2)})</span>
                                          {priceType === "-5%" && <Check className="w-4 h-4 text-green-500" />}
                                        </button>
                                        <button
                                          onClick={() => handlePriceTypeSelect("custom")}
                                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center justify-between"
                                        >
                                          <span>Custom</span>
                                          {priceType === "custom" && <Check className="w-4 h-4 text-green-500" />}
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>

                                {/* Price Input with +/- buttons */}
                                <div className="flex items-center gap-1 ">
                                  <span className="text-muted-foreground">$</span>
                                  <button
                                    type="button"
                                    onClick={() => handlePriceChange(-0.01)}
                                    className="p-1 bg-black text-white hover:bg-muted/50 rounded transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={sellPrice}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                        setSellPrice(value);
                                        setPriceType("custom");
                                      }
                                    }}
                                    className="flex-1 text-lg font-medium bg-transparent border-0 outline-none max-w-[80px] w-full py-2 text-center"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handlePriceChange(0.01)}
                                    className="p-1 bg-black text-white hover:bg-muted/50 rounded transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <span className="text-muted-foreground text-xs">/CNPY</span>
                                </div>
                              </div>

                              {/* Rate and Fees */}
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-muted-foreground">
                                  Rate:{" "}
                                  <span className="text-white">${getPriceFromType(priceType).toFixed(3)}/CNPY</span>
                                </span>
                                <span className="text-green-500">No fees</span>
                              </div>

                              {/* Warning */}
                              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-muted-foreground">May not fill immediately</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground pt-2">Enter an amount to see create order details</div>
            )}
          </Card>
        </div>

        {/* Action Button */}
        <div className="px-4 pt-4 pb-3">
          {/* Error/Success Messages */}
          {submitError && (
            <div className="flex items-center gap-2 p-3 mb-3 bg-red-500/10 text-red-500 rounded-md text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="p-3 mb-3 bg-green-500/10 text-green-500 rounded-md text-sm">{submitSuccess}</div>
          )}

          <Button
            className="w-full h-11 bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white"
            size="lg"
            disabled={buttonState.disabled || isPreview}
            onClick={handleConvert}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : isPreview ? (
              "Preview Mode"
            ) : (
              buttonState.text
            )}
          </Button>
        </div>

        {/* Exchange Rate Info */}
        {amount && parseFloat(amount) > 0 && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {parseFloat(amount).toLocaleString()} CNPY → ${sellCalculation.usdcReceive.toFixed(2)} USDC
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Destination Currency Selection Dialog */}
        <DestinationCurrencyDialog
          open={showDestinationDialog}
          onOpenChange={setShowDestinationDialog}
          onSelectToken={handleDestinationSelected}
          connectedWallets={connectedWallets}
          onConnectWallet={handleConnectWallet}
        />

        {/* Sell Order Confirmation Dialog */}
        {destinationCurrency && (
          <SellOrderConfirmationDialog
            open={showSellConfirmationDialog}
            onClose={() => setShowSellConfirmationDialog(false)}
            onConfirm={handleCreateSellOrder}
            cnpyAmount={parseFloat(amount) || 0}
            pricePerCnpy={sellCalculation.pricePerCnpy}
            usdcReceive={sellCalculation.usdcReceive}
            destinationCurrency={destinationCurrency.symbol}
            sellMode={sellMode}
            estimatedFillTime={sellMode === "instant" ? "Instant" : "2-4 hours"}
            isSubmitting={isSubmitting}
          />
        )}
      </>
    );
  }

  // Render BUY mode UI (existing)

  return (
    <>
      {/* Input Token Card */}
      <div className="px-4">
        {sourceToken ? (
          <Card className="bg-muted/30 p-4 space-y-3">
            {/* Token Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowBridgeDialog(true)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {/* Token Avatar with Chain Badge */}
                <div className="relative">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: sourceToken.color }}
                  >
                    {sourceToken.symbol === "USDC" ? "$" : "T"}
                  </div>
                  <ChainBadge chain={sourceToken.chain} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold">{sourceToken.symbol}</p>
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                      {sourceToken.chain}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {sourceToken.balance.toLocaleString()} {sourceToken.symbol}
                  </p>
                </div>
              </button>
              <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={handleUseMax}>
                Use max
              </Button>
            </div>

            {/* Budget Label */}
            {amount && parseFloat(amount) > 0 && (
              <div className="text-center">
                <span className="text-xs text-muted-foreground tracking-wider">BUDGET</span>
              </div>
            )}

            {/* Amount Input - Centered */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setAmount(value);
                      // Trigger shake when exceeding balance
                      if (parseFloat(value) > sourceToken.balance && parseFloat(amount) <= sourceToken.balance) {
                        setIsShaking(true);
                        setTimeout(() => setIsShaking(false), 400);
                      }
                    }
                  }}
                  placeholder="0"
                  className={`text-4xl font-bold bg-transparent border-0 outline-none p-0 h-auto text-center w-full placeholder:text-muted-foreground ${
                    isShaking ? "animate-shake" : ""
                  }`}
                />
              </div>
            </div>

            {/* Spending Display */}
            {selection.totalCost > 0 && parseFloat(amount) > 0 && (
              <div className="space-y-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-muted-foreground tracking-wider">SPENDING</span>
                  <span className="text-lg font-semibold text-green-500">
                    $
                    {selection.totalCost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {selection.gap > 0.01 && (
                  <div className="text-sm text-muted-foreground">${selection.gap.toFixed(2)} unused</div>
                )}
              </div>
            )}
          </Card>
        ) : (
          <Card
            className="bg-muted/30 p-4 hover:bg-muted/40 transition-colors cursor-pointer"
            onClick={() => setShowBridgeDialog(true)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-base font-semibold">Select token</p>
                  <p className="text-sm text-muted-foreground">Choose USDC to convert</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        )}
      </div>

      {/* Arrow Divider - Clickable to swap direction */}
      <div className="relative flex justify-center">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-8 w-8 bg-background border-2 hover:bg-muted cursor-pointer"
          onClick={handleSwapDirection}
        >
          <ArrowDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Output Token Card (CNPY) with Orders */}
      <div className="px-4">
        <Card className="bg-muted/30 p-4">
          {/* CNPY Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <CnpyLogo className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-base font-semibold">CNPY</p>
                <p className="text-sm text-muted-foreground">0 CNPY</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-semibold">
                {selection.cnpyReceived > 0 ? selection.cnpyReceived.toLocaleString() : "0"}
              </p>
              {selection.totalSavings > 0 ? (
                <p className="text-sm text-green-500">+${selection.totalSavings.toFixed(2)} bonus</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  ${selection.cnpyReceived > 0 ? selection.cnpyReceived.toFixed(2) : "0.00"}
                </p>
              )}
            </div>
          </div>

          {/* Collapsible Orders Section */}
          {sourceToken && (
            <div className="mt-4 pt-4 border-t border-border">
              {/* Orders Header */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowOrders(!showOrders)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showOrders ? "" : "-rotate-90"}`} />
                  <span>Orders</span>
                  {selection.selectedOrders.length > 0 && (
                    <span className="text-xs bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded">
                      {selection.selectedOrders.length} matched
                    </span>
                  )}
                </button>
                <div className="flex gap-1 p-0.5 bg-muted/50 rounded-md">
                  <button
                    onClick={() => setSortMode("best_price")}
                    className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                      sortMode === "best_price" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    Best price
                  </button>
                  <button
                    onClick={() => setSortMode("best_fill")}
                    className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                      sortMode === "best_fill" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    Best fill
                  </button>
                </div>
              </div>

              {/* Order List */}
              {showOrders && (
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                  {isLoadingOrders ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading orders...</span>
                    </div>
                  ) : displayOrders.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground py-3">No sell orders available</p>
                  ) : (
                    displayOrders.slice(0, 6).map((order, index) => {
                      const selectedOrder = selection.selectedOrders.find((o) => o.id === order.id);
                      const isSelected = selectedOrderIds.has(order.id);
                      // Calculate what % of the total budget this order's cost represents
                      const orderCost = order.amount * order.price;
                      const budgetAmount = parseFloat(amount) || 0;
                      const percentOfBudget = budgetAmount > 0 ? (orderCost / budgetAmount) * 100 : 0;
                      return (
                        <OrderRow
                          key={order.id}
                          order={selectedOrder || order}
                          isSelected={isSelected}
                          index={index}
                          percentOfBudget={percentOfBudget}
                        />
                      );
                    })
                  )}
                </div>
              )}

              {/* No amount state */}
              {(!amount || parseFloat(amount) <= 0) && showOrders && (
                <p className="text-center text-xs text-muted-foreground py-3">Enter an amount to see matched orders</p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Action Button */}
      <div className="px-4 pt-4 pb-3">
        {/* Error/Success Messages */}
        {submitError && (
          <div className="flex items-center gap-2 p-3 mb-3 bg-red-500/10 text-red-500 rounded-md text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {submitError}
          </div>
        )}
        {submitSuccess && (
          <div className="p-3 mb-3 bg-green-500/10 text-green-500 rounded-md text-sm">{submitSuccess}</div>
        )}

        <Button
          className={`w-full h-11 ${
            buttonState.variant === "convert"
              ? "bg-linear-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white"
              : buttonState.variant === "connect"
              ? "bg-linear-to-b from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white"
              : buttonState.variant === "error"
              ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15"
              : ""
          }`}
          size="lg"
          disabled={buttonState.disabled || isPreview}
          onClick={() => {
            if (buttonState.variant === "connect" && onOpenWalletDialog) {
              onOpenWalletDialog();
            } else if (buttonState.variant === "convert") {
              handleConvert();
            }
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : isPreview ? (
            "Preview Mode"
          ) : (
            buttonState.text
          )}
        </Button>
      </div>

      {/* Exchange Rate Info */}
      {sourceToken && selection.cnpyReceived > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              <span>
                ${selection.totalCost.toFixed(2)} → {selection.cnpyReceived.toLocaleString()} CNPY
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bridge Token Selection Dialog */}
      <BridgeTokenDialog
        open={showBridgeDialog}
        onOpenChange={setShowBridgeDialog}
        onSelectToken={handleTokenSelected}
        connectedWallets={connectedWallets}
        onConnectWallet={handleConnectWallet}
      />

      {/* Destination Currency Selection Dialog */}
      <DestinationCurrencyDialog
        open={showDestinationDialog}
        onOpenChange={setShowDestinationDialog}
        onSelectToken={handleDestinationSelected}
        connectedWallets={connectedWallets}
        onConnectWallet={handleConnectWallet}
      />

      {/* Sell Order Confirmation Dialog */}
      {destinationCurrency && (
        <SellOrderConfirmationDialog
          open={showSellConfirmationDialog}
          onClose={() => setShowSellConfirmationDialog(false)}
          onConfirm={handleCreateSellOrder}
          cnpyAmount={parseFloat(amount) || 0}
          pricePerCnpy={sellCalculation.pricePerCnpy}
          usdcReceive={sellCalculation.usdcReceive}
          destinationCurrency={destinationCurrency.symbol}
          sellMode={sellMode}
          estimatedFillTime={sellMode === "instant" ? "Instant" : "2-4 hours"}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Convert Transaction Progress Dialog */}
      {showTransactionDialog && sourceToken && (
        <ConvertTransactionDialog
          open={showTransactionDialog}
          onClose={() => {
            setShowTransactionDialog(false);
            // Reset form after successful transaction
            setAmount("");
          }}
          sourceToken={sourceToken}
          cnpyReceived={selection.cnpyReceived}
          totalCost={selection.totalCost}
          totalSavings={selection.totalSavings}
          ordersMatched={selection.selectedOrders.length}
          conversionPair={conversionPair as ConversionPair}
        />
      )}
    </>
  );
}
