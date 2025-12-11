"use client";

import { useState, useEffect } from "react";
import { MainNav } from "@/components/navigation/main-nav";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { LoginDialog } from "@/components/auth/login-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";
import { useCreateChainDialog } from "@/lib/stores/use-create-chain-dialog";
import { useAuthStore } from "@/lib/stores/auth-store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, WINDOW_BREAKPOINTS } from "@/lib/utils";
import LaunchOverviewDialog from "@/components/launchpad/launch-overview-dialog";
import Image from "next/image";
import { CommandSearchTrigger } from "@/components/command-search-trigger";

export function Sidebar() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [showCommandSearch, setShowCommandSearch] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showLaunchDialog, setShowLaunchDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [addressVisibleChars, setAddressVisibleChars] = useState(22);
  const pathname = usePathname();

  const formatWalletAddress = (address?: string, maxVisible: number = 22) => {
    if (!address) return "";
    if (address.length <= maxVisible) return address;
    const front = Math.ceil((maxVisible - 1) / 2);
    const back = maxVisible - front - 1; // 1 char for ellipsis
    return `${address.slice(0, front)}…${address.slice(-back)}`;
  };

  // User is considered logged in if either email auth or GitHub auth is active
  const checkCompact = () => {
    if (pathname?.includes("/launchpad")) {
      setIsCompact(true);

      return;
    }
    const isSmallScreen = window.innerWidth <= WINDOW_BREAKPOINTS.XL;

    console.log("isSmallScreen", isSmallScreen);
    setIsCompact(isSmallScreen);
  };

  // Check if device is mobile
  const checkMobile = () => {
    setIsMobile(window.innerWidth < WINDOW_BREAKPOINTS.LG);
  };

  // Adjust visible characters for wallet address based on viewport width
  useEffect(() => {
    const updateVisibleChars = () => {
      const width = window.innerWidth;
      setAddressVisibleChars(18);
    };

    updateVisibleChars();
    window.addEventListener("resize", updateVisibleChars);
    return () => window.removeEventListener("resize", updateVisibleChars);
  }, []);

  // Check if sidebar should be compact
  useEffect(() => {
    checkCompact();
    checkMobile();
    window.addEventListener("resize", checkCompact);
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkCompact);
      window.removeEventListener("resize", checkMobile);
    };
  }, [pathname]);

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    checkCompact();
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowCommandSearch((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Show expanded view on hover when compact
  const shouldExpand = isCompact && isHovered;
  const isCondensed = isCompact && !shouldExpand;

  const isLoggedIn = isAuthenticated;

  return (
    <div
      className={cn(
        "border-r border-zinc-800 bg-card flex flex-col pb-7 h-screen sticky top-0 transition-all duration-300 overflow-hidden",
        isCondensed ? "w-[90px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "h-16 border-b flex items-center border-zinc-800 transition-all duration-300",
          isCondensed ? "px-5" : "px-4"
        )}
      >
        <Link
          href="/"
          className={cn(
            "overflow-hidden transition-all duration-300  block  ",
            isCondensed
              ? "w-[24px] max-w-[24px] mx-auto"
              : "w-38 mr-auto xl:px-4"
          )}
        >
          <Image
            width={128}
            height={128}
            src="/images/logo.svg"
            alt="Logo"
            className={cn(
              isCondensed ? "w-26 min-w-26" : "w-auto min-w-auto",
              "h-auto object-contain"
            )}
          />
        </Link>
      </div>

      {/* Search and Create */}
      <div
        className={cn(
          " py-3 border-b border-[#2a2a2a] transition-all duration-300",
          isCondensed
            ? "flex flex-col items-center gap-2 px-5"
            : "px-4 space-y-3"
        )}
      >
        <CommandSearchTrigger
          variant="sidebar"
          isCondensed={isCondensed}
          open={showCommandSearch}
          onOpenChange={setShowCommandSearch}
        />

        {!isMobile && (
          <Button
            onClick={() => {
              if (!isLoggedIn) {
                setLoginDialogOpen(true);
                return;
              }

              // Check if dialog has been shown this session
              const hasSeenDialog = sessionStorage.getItem(
                "hasSeenLaunchDialog"
              );
              if (!hasSeenDialog) {
                setShowLaunchDialog(true);
                sessionStorage.setItem("hasSeenLaunchDialog", "true");
              } else {
                router.push("/launchpad/");
              }
            }}
            className={cn(
              "flex  rounded-full bg-transparent text-sm font-medium text-white hover:bg-white/5 transition-colors",
              isCondensed
                ? "w-10 h-10 justify-center"
                : "w-full h-9 gap-3 pl-4 text-left justify-start"
            )}
          >
            <Plus className="w-5 h-5" />
            <span
              className={cn(
                "transition-all duration-300",
                isCondensed ? "hidden" : "block"
              )}
            >
              Create L1 chain
            </span>
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div
        className={cn(
          "flex-1 overflow-auto py-4 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          isCondensed ? "px-5" : "px-4"
        )}
      >
        <MainNav isAuthenticated={isLoggedIn} isCondensed={isCondensed} />
      </div>

      {/* Bottom Section */}
      <div
        className={cn(
          "border-t border-[#2a2a2a] transition-all duration-300 py-4 transition-all duration-300 flex flex-col gap-3 items-center",
          isCondensed ? "px-5" : "px-4"
        )}
      >
        {/* Email Authentication */}
        {isLoggedIn && user ? (
          <>
            <Button
              onClick={() => setLoginDialogOpen(true)}
              variant="clear"
              className="w-full  py-3 px-2 rounded-xl"
            >
              <div className="h-6 w-6 min-w-6 rounded bg-gradient-to-br from-[#0a2a12] via-[#103a1b] to-[#164c25] flex items-center justify-center border border-[#36d26a] shadow-[0_0_8px_rgba(54,210,106,0.4)]">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.email || user.wallet_address || ""}
                    className="h-6 w-6 min-w-6 rounded object-cover"
                  />
                ) : (
                  <img
                    src="/images/ethereum-logo.png"
                    alt="Ethereum"
                    className="h-5 w-5 object-contain"
                  />
                )}
              </div>
              {isCondensed ? null : (
                <span className="text-sm text-white truncate font-mono flex-1 text-left">
                  {user.email ||
                    (user.wallet_address
                      ? formatWalletAddress(
                          user.wallet_address,
                          addressVisibleChars
                        )
                      : "Anonymous")}
                </span>
              )}
            </Button>
          </>
        ) : (
          <>
            {isCondensed ? (
              <Button
                onClick={() => setLoginDialogOpen(true)}
                variant="default"
                size="icon"
                className="bg-black/30 text-[#7cff9d] border border-[#36d26a] shadow-[0_0_12px_2px_rgba(124,255,157,0.3)] hover:shadow-[0_0_16px_3px_rgba(124,255,157,0.45)] transition-transform hover:-translate-y-[1px] rounded-full"
                aria-label="Connect Wallet"
              >
                <img
                  src="/images/ethereum-logo.png"
                  alt="Ethereum"
                  className="h-4 w-4 object-contain drop-shadow-[0_0_8px_rgba(124,255,157,0.8)]"
                />
              </Button>
            ) : (
              <Button
                onClick={() => setLoginDialogOpen(true)}
                variant="ghost"
                size="sm"
                className="w-full text-sm font-semibold text-[#7cff9d] border border-[#36d26a] bg-black/30 rounded-md shadow-[0_0_14px_rgba(124,255,157,0.4)] hover:shadow-[0_0_18px_rgba(124,255,157,0.55)] transition-transform hover:-translate-y-[1px] gap-2"
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

        {isLoggedIn && user && (
          <WalletConnectButton isCondensed={isCondensed} />
        )}
      </div>

      {/* Login Dialog */}
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />

      {/* Launch Overview Dialog */}
      <LaunchOverviewDialog
        open={showLaunchDialog}
        onClose={() => setShowLaunchDialog(false)}
        onStart={() => {
          setShowLaunchDialog(false);
          router.push("/launchpad/");
        }}
      />
    </div>
  );
}
