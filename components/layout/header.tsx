"use client";

import { useWallet } from "@/components/wallet/wallet-provider";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Link from "next/link";
import { useChainsStore } from "@/lib/stores/chains-store";
import { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, Menu } from "lucide-react";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Badge } from "../ui/badge";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { WINDOW_BREAKPOINTS, chainStatusesLabels } from "@/lib/utils";
import { ChainStatus } from "@/types";
import { getSampleValidatorByAddress } from "@/lib/demo-data/sample-validators";
import { ChainSelect } from "@/components/explorer/chain-select";

// Page type definitions
export type PageType =
  | "home"
  | "chain-detail"
  | "dashboard"
  | "explorer"
  | "graduation"
  | "amm"
  | "orderbook"
  | "wallet"
  | "settings"
  | "unknown";

// Route configuration for breadcrumbs
const routeConfig: Record<string, { label: string; href?: string }> = {
  chains: { label: "Launchpad", href: "/" },
  dashboard: { label: "Dashboard", href: "/dashboard" },
  explorer: { label: "Explorer", href: "/explorer" },
  graduation: { label: "Graduation", href: "/graduation" },
  amm: { label: "AMM", href: "/amm" },
  orderbook: { label: "Order Book", href: "/orderbook" },
  wallet: { label: "Wallet", href: "/wallet" },
  settings: { label: "Settings", href: "/settings" },
};

export function Header() {
  const { togglePopup } = useWallet();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChain = useChainsStore((state) => state.currentChain);
  const chains = useChainsStore((state) => state.chains);
  const fetchChain = useChainsStore((state) => state.fetchChain);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // Homepage search state
  const [isHomepageSearchOpen, setIsHomepageSearchOpen] = useState(false);
  const [homepageSearchQuery, setHomepageSearchQuery] = useState("");
  const homepageSearchRef = useRef<HTMLDivElement>(null);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Auth state
  const { user, isAuthenticated } = useAuthStore();
  const isLoggedIn = isAuthenticated;

  // Get current filter from URL
  const projectStatus = searchParams.get("project_status") || "new";

  const current_explorer_selected_chain = useChainsStore(
    (state) => state.currentExplorerSelectedChain
  );
  const getChainById = useChainsStore((state) => state.getChainById);

  // Check if we're on explorer page
  const isExplorerPage = pathname.startsWith("/explorer") || pathname.startsWith("/blocks") || pathname.startsWith("/transactions") || pathname.startsWith("/validators");
  
  // Check if we're on account/address page
  const isAccountPage = pathname.startsWith("/accounts/") || pathname.startsWith("/address/");
  
  // Check if we're on validator detail page (don't show chain selector here)
  // Matches /validators/[address] with or without trailing slash
  const isValidatorDetailPage = pathname.match(/^\/validators\/[^/]+\/?$/);
  
  // Check if we're on block detail page
  const isBlockDetailPage = pathname.match(/^\/blocks\/[^/]+\/?$/);
  
  // Check if we're on transaction detail page
  const isTransactionDetailPage = pathname.match(/^\/transactions\/[^/]+\/?$/);
  
  // Combined check for all detail pages
  const isDetailPage = isValidatorDetailPage || isAccountPage || isBlockDetailPage || isTransactionDetailPage;

  // Get selected chain for explorer from URL or store
  const chainIdFromUrl = searchParams.get("chain");
  const explorerSelectedChain = useMemo(() => {
    console.log("[Header] chainIdFromUrl:", chainIdFromUrl, "chains count:", chains.length);
    if (chainIdFromUrl) {
      const chainIdNum = parseInt(chainIdFromUrl, 10);
      if (chainIdNum === 0) {
        return { id: 0, chain_name: "All Chains" };
      }
      // Try to find chain by ID (both string and number formats)
      const chain = getChainById(chainIdFromUrl) || getChainById(chainIdNum.toString());
      console.log("[Header] Found chain:", chain ? { id: chain.id, name: chain.chain_name } : "not found");
      if (chain) {
        const id = typeof chain.id === "string" ? parseInt(chain.id, 10) : Number(chain.id);
        return { id, chain_name: chain.chain_name };
      }
      // If chain not found in store, return a temporary object with the ID from URL
      console.log("[Header] Chain not found in store, using URL ID:", chainIdNum);
      return { id: chainIdNum, chain_name: `Chain ${chainIdNum}` };
    }
    return current_explorer_selected_chain || { id: 0, chain_name: "All Chains" };
  }, [chainIdFromUrl, current_explorer_selected_chain, getChainById, chains.length]);

  // Prepare chain options for select
  const chainOptions = useMemo(() => {
    return [
      { id: "0", chain_name: "All Chains" },
      ...chains.map((chain) => ({
        id: chain.id.toString(),
        chain_name: chain.chain_name,
      })),
    ];
  }, [chains]);

  // Handle chain select in explorer
  const handleExplorerChainSelect = (chain: { id: number; chain_name: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (chain.id === 0) {
      // Remove chain parameter for "All Chains"
      params.delete("chain");
    } else {
      params.set("chain", chain.id.toString());
    }
    // Only add query string if there are params, otherwise just use pathname
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth <= WINDOW_BREAKPOINTS.XL);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Breadcrumbs state
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{
    label: string;
    href?: string;
    isLast: boolean;
  }> | null>(null);
  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  // Handle click outside to close homepage search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        homepageSearchRef.current &&
        !homepageSearchRef.current.contains(event.target as Node)
      ) {
        setIsHomepageSearchOpen(false);
        setHomepageSearchQuery("");
      }
    };

    if (isHomepageSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isHomepageSearchOpen]);

  // Calculate breadcrumbs when dependencies change
  useEffect(() => {
    // Remove trailing slash and split
    const cleanPathname = pathname.replace(/\/$/, "");
    const segments = cleanPathname.split("/").filter(Boolean);

    if (segments.length === 0) {
      setBreadcrumbs(null);
      return;
    }

    // Don't show breadcrumbs on /explorer page
    if (pathname === "/explorer") {
      setBreadcrumbs(null);
      return;
    }

    const breadcrumbArray: Array<{
      label: string;
      href?: string;
      isLast: boolean;
    }> = [];

    // Handle explorer sub-pages: /transactions, /validators, /blocks
    if (
      segments[0] === "transactions" ||
      segments[0] === "validators" ||
      segments[0] === "blocks"
    ) {
      const pageLabels: Record<string, string> = {
        transactions: "Transactions",
        validators: "Validators",
        blocks: "Blocks",
      };

      breadcrumbArray.push({
        label: "Explorer",
        href: "/explorer",
        isLast: false,
      });

      // Handle detail pages (segments.length === 2)
      if (segments.length === 2) {
        const detailId = decodeURIComponent(segments[1]);

        breadcrumbArray.push({
          label: pageLabels[segments[0]],
          href: `/${segments[0]}`,
          isLast: false,
        });

        // Format the detail label based on page type
        let detailLabel = detailId;
        if (segments[0] === "blocks") {
          // For blocks, show "#{number}" or "{hash}"
          detailLabel = `#${detailId}`;
        } else if (segments[0] === "transactions") {
          // For transactions, show the hash (truncate if too long)
          detailLabel =
            detailId.length > 20 ? `${detailId.substring(0, 20)}...` : detailId;
        } else if (segments[0] === "validators") {
          // For validators, try to get the validator name, fallback to address
          const validator = getSampleValidatorByAddress(detailId);
          detailLabel = validator?.name || detailId;
          // Truncate if still too long
          if (detailLabel.length > 20) {
            detailLabel = `${detailLabel.substring(0, 20)}...`;
          }
        }

        breadcrumbArray.push({
          label: detailLabel,
          isLast: true,
        });
      } else {
        // List page (segments.length === 1)
        breadcrumbArray.push({
          label: pageLabels[segments[0]],
          isLast: true,
        });
      }

      setBreadcrumbs(breadcrumbArray);
      return;
    }

    // Handle address pages: /address/{address} or /accounts/{address} - show Explorer -> Account -> {address}
    if ((segments[0] === "address" || segments[0] === "accounts") && segments.length === 2) {
      const address = decodeURIComponent(segments[1]);

      breadcrumbArray.push({
        label: "Explorer",
        href: "/explorer",
        isLast: false,
      });

      breadcrumbArray.push({
        label: "Account",
        isLast: false,
      });

      // Format address: show first 6 and last 5 characters
      const formattedAddress =
        address.length > 11
          ? `${address.substring(0, 6)}...${address.substring(
            address.length - 5
          )}`
          : address;

      breadcrumbArray.push({
        label: formattedAddress,
        isLast: true,
      });

      setBreadcrumbs(breadcrumbArray);
      return;
    }

    // Handle /chains/{id}/transactions - show Explorer -> Transactions -> {chain name}

    // First segment (main section)
    const mainSection = segments[0];
    const config = routeConfig[mainSection];

    if (config) {
      breadcrumbArray.push({
        label: config.label,
        href: segments.length === 1 ? undefined : config.href,
        isLast: segments.length === 1,
      });
    }

    // Second segment (if exists, usually an ID or subsection)
    if (segments.length > 1) {
      // For launchpad routes, try to get the chain name from the store
      let label = segments[1];
      let href: string | undefined = undefined;
      let isLast = segments.length === 2;

      if (mainSection === "chains" && currentChain) {
        // Use the chain name from the store if available
        label = currentChain.chain_name || segments[1];

        // If there's a third segment (like /edit), make this breadcrumb clickable
        if (segments.length > 2) {
          href = `/chains/${segments[1]}`;
          isLast = false;
        }
      } else if (segments[1].length > 20) {
        // Truncate long IDs
        label = `${segments[1].substring(0, 20)}...`;
      }

      breadcrumbArray.push({
        label,
        href,
        isLast,
      });
    }

    // Third segment (if exists, like /edit)
    if (segments.length > 2) {
      const thirdSegment = segments[2];
      let label = thirdSegment;

      // Capitalize and format the segment
      if (thirdSegment === "edit") {
        label = "Edit Chain";
      }

      breadcrumbArray.push({
        label,
        isLast: true,
      });
    }

    setBreadcrumbs(breadcrumbArray);
  }, [pathname, currentChain, chains, fetchChain]);

  // Calculate breadcrumbs when dependencies change
  useEffect(() => {
    if (
      current_explorer_selected_chain &&
      breadcrumbs &&
      breadcrumbs.length > 0 &&
      breadcrumbs[breadcrumbs.length - 1].label === "transactions" &&
      pathname.includes("/transactions") &&
      pathname.includes("/chains")
    ) {
      const chainName = current_explorer_selected_chain.chain_name;

      setBreadcrumbs([
        {
          label: "Explorer",
          href: "/explorer",
          isLast: false,
        },

        {
          label: "Transactions",
          href: `/transactions`,
          isLast: false,
        },
        {
          label: chainName,
          isLast: true,
        },
      ]);
    }
  }, [pathname, breadcrumbs, current_explorer_selected_chain]);

  // Chain search filter - Memoized for performance
  const filteredChains = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return chains
      .filter((chain) => chain.chain_name.toLowerCase().includes(query))
      .slice(0, 10);
  }, [searchQuery, chains]);

  // Mobile chain search filter - Memoized for performance
  const mobileFilteredChains = useMemo(() => {
    if (!mobileSearchQuery.trim()) return [];

    const query = mobileSearchQuery.toLowerCase();
    return chains
      .filter((chain) => chain.chain_name.toLowerCase().includes(query))
      .slice(0, 10);
  }, [mobileSearchQuery, chains]);

  const handleChainSelect = (chainId: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(`/chains/${chainId}`);
  };

  const handleHomepageChainSelect = (chainId: string) => {
    setIsHomepageSearchOpen(false);
    setHomepageSearchQuery("");
    router.push(`/chains/${chainId}`);
  };

  const handleMobileChainSelect = (chainId: string) => {
    setIsMobileSearchOpen(false);
    setMobileSearchQuery("");
    router.push(`/chains/${chainId}`);
  };

  // Handle project status filter toggle
  const handleFilterToggle = (status: "new" | "graduated") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("project_status", status);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Determine current page type
  const getPageType = (): PageType => {
    const segments = pathname.split("/").filter(Boolean);

    // Home page
    if (
      segments.length === 0 ||
      (segments.length === 1 && segments[0] === "launchpad")
    ) {
      return "home";
    }

    // Detail pages (2nd level routes)
    if (segments.length === 2) {
      switch (segments[0]) {
        case "launchpad":
          return "chain-detail";
        case "dashboard":
        case "explorer":
        case "graduation":
        case "amm":
        case "orderbook":
        case "wallet":
        case "settings":
          return segments[0] as PageType;
        default:
          return "unknown";
      }
    }

    // Main section pages (1st level routes)
    if (segments.length === 1) {
      switch (segments[0]) {
        case "dashboard":
        case "explorer":
        case "graduation":
        case "amm":
        case "orderbook":
        case "wallet":
        case "settings":
          return segments[0] as PageType;
        default:
          return "unknown";
      }
    }

    return "unknown";
  };

  const pageType = getPageType();
  const shouldShowCollapsedWalletButton = isLoggedIn && isSidebarCollapsed;

  // Early return for launchpad pages - after all hooks
  if (pathname.includes("/launchpad")) {
    return null;
  }

  return (
    <>
      <header
        id="superapp-header"
        data-page-type={pageType}
        className="flex items-center justify-between px-4 lg:px-6  sticky top-0 z-100  lg:relative h-16 bg-background"
      >
        {/* Mobile Header - visible only on mobile */}
        <div className="flex lg:hidden items-center justify-between w-full relative">
          {/* Left: Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-white"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Center: Logo */}
          <Link href="/" className="block ml-4 mx-auto py-2">
            <img
              src="/images/logo.svg"
              alt="Logo"
              className="h-6 w-auto object-contain"
            />
          </Link>

          {/* Right: Search & Login */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSearchOpen(true)}
              className="text-white"
            >
              <Search className="h-5 w-5" />
            </Button>
            {isDetailPage ? null : isLoggedIn ? (
              <WalletConnectButton isCondensed />
            ) : (
              <Button
                onClick={() => setLoginDialogOpen(true)}
                variant="ghost"
                size="sm"
                className="text-sm font-semibold px-3 py-2 hover:bg-transparent gap-2 text-[#7cff9d] border border-[#36d26a] bg-black/30 rounded-md shadow-[0_0_14px_rgba(124,255,157,0.4)] hover:shadow-[0_0_18px_rgba(124,255,157,0.55)]"
              >
                <img
                  src="/images/ethereum-logo.png"
                  alt="Ethereum"
                  className="h-4 w-4 object-contain drop-shadow-[0_0_8px_rgba(124,255,157,0.8)]"
                />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Header - hidden on mobile */}
        <div className="hidden lg:flex items-center gap-4 w-full justify-between">
          <div className="flex items-center gap-4">
            {breadcrumbs && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center">
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem
                        className={
                          crumb.isLast && pageType === "chain-detail"
                            ? "relative"
                            : ""
                        }
                      >
                        {crumb.isLast && pageType === "chain-detail" ? (
                          <>
                            <button
                              onClick={() => setIsSearchOpen(!isSearchOpen)}
                              className="text-white hover:text-white/80 transition-colors flex items-center gap-1"
                            >
                              {crumb.label}
                              <ChevronDown className="w-4 h-4" />
                            </button>

                            {/* Chain Search Dropdown */}
                            {isSearchOpen && (
                              <div
                                ref={searchRef}
                                className="absolute top-full left-0 mt-2 w-[480px] bg-[#1a1a1a] border border-white/[0.1] rounded-lg shadow-xl z-50"
                              >
                                <div className="p-4">
                                  <Input
                                    type="text"
                                    placeholder="Type to search for a chain"
                                    value={searchQuery}
                                    onChange={(e) =>
                                      setSearchQuery(e.target.value)
                                    }
                                    className="bg-[#2a2a2a] border-white/[0.1] text-white placeholder:text-white/50"
                                    autoFocus
                                  />
                                </div>

                                <div className="max-h-[400px] overflow-y-auto">
                                  {filteredChains.length > 0 ? (
                                    filteredChains.map((chain) => (
                                      <button
                                        key={chain.id}
                                        onClick={() =>
                                          handleChainSelect(chain.id)
                                        }
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors text-left"
                                      >
                                        <div className="w-10 h-10 rounded-full bg-white/[0.1] flex items-center justify-center flex-shrink-0">
                                          <span className="text-white text-sm font-medium">
                                            {chain.chain_name
                                              .charAt(0)
                                              .toUpperCase()}
                                          </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-white font-medium truncate">
                                            {chain.chain_name}
                                          </div>
                                          <div className="text-white/50 text-sm">
                                            ${chain.token_symbol}
                                          </div>
                                        </div>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="px-4 py-8 text-center text-white/50">
                                      {searchQuery.trim()
                                        ? "No chains found"
                                        : "Type to search for a chain"}
                                    </div>
                                  )}
                                </div>

                                {filteredChains.length > 0 && (
                                  <div className="border-t border-white/[0.1] p-3">
                                    <Link
                                      href="/"
                                      className="text-white/50 hover:text-white text-sm transition-colors"
                                      onClick={() => {
                                        setIsSearchOpen(false);
                                        setSearchQuery("");
                                      }}
                                    >
                                      See all search results
                                    </Link>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : crumb.isLast ? (
                          <BreadcrumbPage className="text-white">
                            {crumb.label}{" "}
                            {currentChain && currentChain?.status && (
                              <Badge
                                variant={currentChain?.status as ChainStatus}
                                className="text-xs ml-3"
                              >
                                {
                                  chainStatusesLabels[
                                  currentChain?.status as ChainStatus
                                  ]
                                }
                              </Badge>
                            )}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link
                              href={crumb.href || "#"}
                              className="text-white/[0.5] hover:text-white"
                            >
                              {crumb.label}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-4 ml-auto">
            {isExplorerPage && !isDetailPage ? (
              // Show Canopy Network selector in explorer pages (but not on detail pages)
              <ChainSelect
                value={chainIdFromUrl || explorerSelectedChain.id.toString()}
                key={`${chainIdFromUrl || explorerSelectedChain.id.toString()}-${chains.length}`}
                onValueChange={(value) => {
                  if (value === "0") {
                    // Handle "All Chains" selection
                    handleExplorerChainSelect({ id: 0, chain_name: "All Chains" });
                  } else {
                    const chain = chainOptions.find((c) => c.id === value);
                    if (chain) {
                      const chainId = parseInt(value, 10);
                      handleExplorerChainSelect({ id: chainId, chain_name: chain.chain_name });
                    } else {
                      // Fallback: try to get chain from store
                      const chainFromStore = getChainById(value);
                      if (chainFromStore) {
                        const chainId = typeof chainFromStore.id === "string" ? parseInt(chainFromStore.id, 10) : Number(chainFromStore.id);
                        handleExplorerChainSelect({ id: chainId, chain_name: chainFromStore.chain_name });
                      }
                    }
                  }
                }}
              />
            ) : (
              <>
                {!isDetailPage && (
                  <>
                    {shouldShowCollapsedWalletButton && (
                      <div className="w-[200px]">
                        <WalletConnectButton hideBalance />
                      </div>
                    )}
                    {!isLoggedIn && (
                      <Button
                        onClick={() => setLoginDialogOpen(true)}
                        variant="ghost"
                        size="sm"
                        className="text-[#7cff9d] text-sm font-semibold px-3 py-2 hover:bg-transparent gap-2 border border-[#36d26a] bg-black/30 rounded-md shadow-[0_0_14px_rgba(124,255,157,0.4)] hover:shadow-[0_0_18px_rgba(124,255,157,0.55)]"
                      >
                        <img
                          src="/images/ethereum-logo.png"
                          alt="Ethereum"
                          className="h-4 w-4 object-contain drop-shadow-[0_0_8px_rgba(124,255,157,0.8)]"
                        />
                        Connect Wallet
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Sheet */}
      <Sheet open={isMobileSearchOpen} onOpenChange={setIsMobileSearchOpen}>
        <SheetContent
          side="top"
          className="h-screen bg-[#0e0e0e] border-gray-800"
        >
          <SheetHeader>
            <SheetTitle className="text-white">Search Chains</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <Input
              type="text"
              placeholder="Type to search for a chain"
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-white/50"
              autoFocus
            />
          </div>
          <div className="mt-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {mobileFilteredChains.length > 0 ? (
              mobileFilteredChains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => handleMobileChainSelect(chain.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors text-left rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-white/[0.1] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">
                      {chain.chain_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {chain.chain_name}
                    </div>
                    <div className="text-white/50 text-sm">
                      ${chain.token_symbol}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-white/50">
                {mobileSearchQuery.trim()
                  ? "No chains found"
                  : "Type to search for a chain"}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Menu Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[280px] bg-[#0e0e0e] border-gray-800 p-0"
        >
          <MobileSidebar
            isLoggedIn={isLoggedIn}
            isAuthenticated={isAuthenticated}
            user={user}
            onCreateChain={() => open()}
            onSearchClick={() => setIsMobileSearchOpen(true)}
            onLoginClick={() => setLoginDialogOpen(true)}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Login Dialog */}
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </>
  );
}
