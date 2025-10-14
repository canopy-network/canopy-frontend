"use client";

import { useWallet } from "@/components/wallet/wallet-provider";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { useChainsStore } from "@/lib/stores/chains-store";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

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
  const currentChain = useChainsStore((state) => state.currentChain);
  const chains = useChainsStore((state) => state.chains);
  const fetchChains = useChainsStore((state) => state.fetchChains);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

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

  // Chain search filter
  const filteredChains = searchQuery.trim()
    ? chains
        .filter((chain) =>
          chain.chain_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10)
    : [];

  const handleChainSelect = (chainId: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(`/launchpad/${chainId}`);
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

      if (mainSection === "launchpad" && currentChain) {
        // Use the chain name from the store if available
        label = currentChain.chain_name || segments[1];
      } else if (segments[1].length > 20) {
        // Truncate long IDs
        label = `${segments[1].substring(0, 20)}...`;
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
    <header
      id="superapp-header"
      data-page-type={pageType}
      className="flex items-center justify-between px-6 py-4 border-b border-white/[0.1]"
    >
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
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#2a2a2a] border-white/[0.1] text-white placeholder:text-white/50"
                                autoFocus
                              />
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                              {filteredChains.length > 0 ? (
                                filteredChains.map((chain) => (
                                  <button
                                    key={chain.id}
                                    onClick={() => handleChainSelect(chain.id)}
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
      <Button onClick={() => togglePopup()}>Open Wallet</Button>
    </header>
  );
}
