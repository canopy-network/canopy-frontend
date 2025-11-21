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
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, X, Menu } from "lucide-react";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Badge } from "../ui/badge";
import { chainStatusesLabels } from "@/lib/utils";
import { ChainStatus } from "@/types";
import { getSampleValidatorByAddress } from "@/lib/demo-data/sample-validators";

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
  chain: { label: "Launchpad", href: "/" },
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

  // Auth state
  const { user, isAuthenticated } = useAuthStore();
  const isLoggedIn = isAuthenticated;

  // Get current filter from URL
  const projectStatus = searchParams.get("project_status") || "new";

  const current_explorer_selected_chain = useChainsStore(
    (state) => state.currentExplorerSelectedChain
  );

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
    const segments = pathname.split("/").filter(Boolean);

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

      if (mainSection === "chain" && currentChain) {
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

  // Early return for launchpad pages - after all hooks
  if (pathname.includes("/launchpad")) {
    return null;
  }

  // Chain search filter
  const filteredChains = searchQuery.trim()
    ? chains
        .filter((chain) =>
          chain.chain_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10)
    : [];

  // Mobile chain search filter
  const mobileFilteredChains = mobileSearchQuery.trim()
    ? chains
        .filter((chain) =>
          chain.chain_name
            .toLowerCase()
            .includes(mobileSearchQuery.toLowerCase())
        )
        .slice(0, 10)
    : [];

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

  return (
    <>
      <header
        id="superapp-header"
        data-page-type={pageType}
        className="flex items-center justify-between px-4 lg:px-6   relative h-16 bg-background"
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
          <Link href="/" className="block h-4 ml-4 mx-auto">
            <img src="/images/logo.svg" alt="Logo" className="invert h-4" />
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
            <Button
              onClick={() =>
                isLoggedIn ? togglePopup() : setLoginDialogOpen(true)
              }
              variant="default"
              size="sm"
              className="text-xs px-3"
            >
              {isLoggedIn ? "Wallet" : "Login"}
            </Button>
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

          <div
            className="absolute top-0 bottom-0 right-0 z-50 left-0 mx-auto w-[400px] flex items-center hidden lg:flex"
            id="homepage-actions"
          ></div>

          {!isLoggedIn && (
            <Button
              onClick={() => setLoginDialogOpen(true)}
              variant="default"
              size="sm"
              className="text-xs px-3 xl:hidden ml-auto"
            >
              Login
            </Button>
          )}
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
