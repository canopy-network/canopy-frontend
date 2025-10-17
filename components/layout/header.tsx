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
import { ChevronDown, Search, X, Menu, Plus, Github, Mail } from "lucide-react";
import clsx from "clsx";
import { MainNav } from "@/components/navigation/main-nav";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useCreateChainDialog } from "@/lib/stores/use-create-chain-dialog";
import { signIn, signOut, useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/stores/auth-store";

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
  launchpad: { label: "Launchpad", href: "/" },
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
  const fetchChains = useChainsStore((state) => state.fetchChains);

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
  const { open } = useCreateChainDialog();
  const { data: session } = useSession();
  const { user, isAuthenticated } = useAuthStore();
  const isLoggedIn = isAuthenticated || !!session;

  // Get current filter from URL
  const projectStatus = searchParams.get("project_status") || "new";

  // Fetch chains on mount if not already loaded
  // BUT: Don't fetch on chain detail pages - they have their own fetch
  useEffect(() => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const isDetailPage =
      pathname.startsWith("/launchpad/") && pathSegments.length >= 2;

    console.log("[Header] useEffect triggered:", {
      pathname,
      pathSegments,
      isDetailPage,
      chainsLength: chains.length,
      willFetch: chains.length === 0 && !isDetailPage,
    });

    if (chains.length === 0 && !isDetailPage) {
      console.log("[Header] Calling fetchChains()");
      fetchChains();
    } else {
      console.log(
        "[Header] Skipping fetchChains - isDetailPage:",
        isDetailPage,
        "chains.length:",
        chains.length
      );
    }
  }, [chains.length, fetchChains, pathname]);

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

  // Chain search filter
  const filteredChains = searchQuery.trim()
    ? chains
        .filter((chain) =>
          chain.chain_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10)
    : [];

  // Homepage chain search filter
  const homepageFilteredChains = homepageSearchQuery.trim()
    ? chains
        .filter((chain) =>
          chain.chain_name
            .toLowerCase()
            .includes(homepageSearchQuery.toLowerCase())
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
    router.push(`/launchpad/${chainId}`);
  };

  const handleHomepageChainSelect = (chainId: string) => {
    setIsHomepageSearchOpen(false);
    setHomepageSearchQuery("");
    router.push(`/launchpad/${chainId}`);
  };

  const handleMobileChainSelect = (chainId: string) => {
    setIsMobileSearchOpen(false);
    setMobileSearchQuery("");
    router.push(`/launchpad/${chainId}`);
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

  // You can use pageType for conditional rendering:
  // if (pageType === "home") { ... }
  // if (pageType === "chain-detail") { ... }

  // Parse pathname to get breadcrumb segments
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
      return null;
    }

    const breadcrumbs: Array<{
      label: string;
      href?: string;
      isLast: boolean;
    }> = [];

    // First segment (main section)
    const mainSection = segments[0];
    const config = routeConfig[mainSection];

    if (config) {
      breadcrumbs.push({
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

      if (mainSection === "launchpad" && currentChain) {
        // Use the chain name from the store if available
        label = currentChain.chain_name || segments[1];

        // If there's a third segment (like /edit), make this breadcrumb clickable
        if (segments.length > 2) {
          href = `/launchpad/${segments[1]}`;
          isLast = false;
        }
      } else if (segments[1].length > 20) {
        // Truncate long IDs
        label = `${segments[1].substring(0, 20)}...`;
      }

      breadcrumbs.push({
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

      breadcrumbs.push({
        label,
        isLast: true,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <header
        id="superapp-header"
        data-page-type={pageType}
        className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-white/[0.1] relative"
      >
        {/* Mobile Header - visible only on mobile */}
        <div className="flex lg:hidden items-center justify-between w-full">
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
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                🌳
              </span>
            </div>
            <span className="font-semibold text-lg text-white tracking-tight">
              CANOPY
            </span>
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
                            {crumb.label}
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
          >
            {pageType === "home" && (
              <>
                {/* Search Button & Dropdown */}
                <div
                  className="absolute top-0 bottom-0  z-50  flex flex-col justify-center"
                  ref={homepageSearchRef}
                >
                  {/* Search Input Container */}
                  <div
                    className={clsx(
                      "bg-black rounded-full min-w-10 h-10   flex items-center transition-all overflow-hidden relative",
                      isHomepageSearchOpen
                        ? "w-[400px] border-white border"
                        : "w-[40px]  "
                    )}
                  >
                    {/* Search Icon Button */}
                    <Button
                      id="search-button"
                      variant="clear"
                      size="icon"
                      className="text-white/70 hover:text-white rounded-full flex-shrink-0 w-10 h-10 hover:border-white/[0.1]"
                      onClick={() =>
                        setIsHomepageSearchOpen(!isHomepageSearchOpen)
                      }
                    >
                      <Search className="w-5 h-5" />
                    </Button>

                    {/* Search Input (visible when open) */}
                    {isHomepageSearchOpen && (
                      <>
                        <Input
                          type="text"
                          placeholder="Type to search for a chain"
                          value={homepageSearchQuery}
                          onChange={(e) =>
                            setHomepageSearchQuery(e.target.value)
                          }
                          variant="ghost"
                          className="text-white placeholder:text-white/50 flex-1 px-2 h-full focus:outline-none border-none focus:ring-0 focus:border-none"
                          autoFocus
                        />
                        {/* Close Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white/70 hover:text-white hover:bg-white/[0.05] rounded-full flex-shrink-0"
                          onClick={() => {
                            setIsHomepageSearchOpen(false);
                            setHomepageSearchQuery("");
                          }}
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {isHomepageSearchOpen && (
                    <div className="absolute top-full right-0 mt-2 w-[400px] bg-[#1a1a1a] border border-white/[0.1] rounded-lg shadow-xl z-50">
                      <div className="max-h-[400px] overflow-y-auto">
                        {homepageFilteredChains.length > 0 ? (
                          homepageFilteredChains.map((chain) => (
                            <button
                              key={chain.id}
                              onClick={() =>
                                handleHomepageChainSelect(chain.id)
                              }
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors text-left"
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
                            {homepageSearchQuery.trim()
                              ? "No chains found"
                              : "Type to search for a chain"}
                          </div>
                        )}
                      </div>

                      {homepageFilteredChains.length > 0 && (
                        <div className="border-t border-white/[0.1] p-3">
                          <Link
                            href="/"
                            className="text-white/50 hover:text-white text-sm transition-colors"
                            onClick={() => {
                              setIsHomepageSearchOpen(false);
                              setHomepageSearchQuery("");
                            }}
                          >
                            See all search results
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Toggle Filter Button */}
                <div className="flex items-center bg-[#2a2a2a] rounded-full p-1 min-w-[280px] ml-12">
                  <button
                    onClick={() => handleFilterToggle("new")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all w-full ${
                      projectStatus === "new"
                        ? "bg-white text-black"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    New
                    {projectStatus === "new" && (
                      <span className="ml-2 text-black/70">21</span>
                    )}
                  </button>
                  <button
                    onClick={() => handleFilterToggle("graduated")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all w-full ${
                      projectStatus === "graduated"
                        ? "bg-white text-black"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    Graduated
                  </button>
                </div>
              </>
            )}
          </div>

          <Button onClick={() => togglePopup()} className="hidden lg:block">
            Open Wallet
          </Button>
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
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex h-16 items-center border-b border-[#2a2a2a] px-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    🌳
                  </span>
                </div>
                <span className="font-semibold text-lg text-white tracking-tight">
                  CANOPY
                </span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-[#2a2a2a]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search chains"
                  className="pl-10 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsMobileSearchOpen(true);
                  }}
                  readOnly
                />
              </div>
            </div>

            {/* Create Chain Button */}
            {isLoggedIn && (
              <div className="px-4 py-2 border-b border-[#2a2a2a]">
                <Button
                  className="w-full justify-start gap-2 bg-transparent hover:bg-[#1a1a1a] text-white border-none font-medium"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    open();
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create chain
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex-1 overflow-auto p-4">
              <MainNav isAuthenticated={isLoggedIn} />
            </div>

            {/* Footer - Auth Section */}
            <div className="border-t border-[#2a2a2a] p-4 space-y-3">
              {/* Email Authentication */}
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded-lg">
                    {user.email ? (
                      <>
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-primary-foreground text-xs font-bold">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-white truncate">
                          {user.email}
                        </span>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setLoginDialogOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    Manage Account
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setLoginDialogOpen(true);
                  }}
                  className="w-full gap-2 bg-transparent hover:bg-[#1a1a1a] text-white border border-[#2a2a2a] font-medium"
                  variant="outline"
                >
                  <Mail className="h-4 w-4" />
                  Login
                </Button>
              )}

              {isLoggedIn && <WalletConnectButton />}

              {/* GitHub Login Button */}
              {isLoggedIn && (
                <div className="space-y-2">
                  {session ? (
                    <>
                      <div className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded-lg">
                        <img
                          src={session.user?.image || ""}
                          alt={session.user?.name || ""}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-white truncate">
                          {session.user?.name || session.user?.email}
                        </span>
                      </div>
                      <Button
                        onClick={() => signOut()}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => signIn("github")}
                      variant="outline"
                      className="w-full justify-start gap-2 bg-transparent hover:bg-[#1a1a1a] text-white border-[#2a2a2a]"
                    >
                      <Github className="h-4 w-4" />
                      Connect GitHub
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Login Dialog */}
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </>
  );
}
