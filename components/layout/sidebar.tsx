"use client";

import { useState, useEffect } from "react";
import { MainNav } from "@/components/navigation/main-nav";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { LoginDialog } from "@/components/auth/login-dialog";
import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, WINDOW_BREAKPOINTS } from "@/lib/utils";
import LaunchOverviewDialog from "@/components/launchpad/launch-overview-dialog";
import Image from "next/image";
import { CommandSearchTrigger } from "@/components/command-search-trigger";
import { toast } from "sonner";

export function Sidebar() {
  const { user, isAuthenticated, logout } = useAuthStore();
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

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

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
            isCondensed ? "w-[24px] max-w-[24px] mx-auto" : "w-38 mr-auto xl:px-4"
          )}
        >
          <Image
            width={128}
            height={128}
            src="/images/logo.svg"
            alt="Logo"
            className={cn(isCondensed ? "w-26 min-w-26" : "w-auto min-w-auto", "h-auto object-contain")}
          />
        </Link>
      </div>

      {/* Search and Create */}
      <div
        className={cn(
          " py-3 border-b border-[#2a2a2a] transition-all duration-300",
          isCondensed ? "flex flex-col items-center gap-2 px-5" : "px-4 space-y-3"
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
              const hasSeenDialog = sessionStorage.getItem("hasSeenLaunchDialog");
              if (!hasSeenDialog) {
                setShowLaunchDialog(true);
                sessionStorage.setItem("hasSeenLaunchDialog", "true");
              } else {
                router.push("/launchpad/");
              }
            }}
            className={cn(
              "flex  rounded-full bg-transparent text-sm font-medium text-white hover:bg-white/5 transition-colors",
              isCondensed ? "w-10 h-10 justify-center" : "w-full h-9 gap-3 pl-4 text-left justify-start"
            )}
          >
            <Plus className="w-5 h-5" />
            <span className={cn("transition-all duration-300", isCondensed ? "hidden" : "block")}>Create L1 chain</span>
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
          "border-t border-[#2a2a2a] transition-all duration-300 py-4 flex flex-col gap-3 items-center",
          isCondensed ? "px-5" : "px-4"
        )}
      >
        {/* Unified Wallet Button - Shows SIWE login if not authenticated, or wallet connection if authenticated */}
        {!isLoggedIn ? (
          <>
            {isCondensed ? (
              <Button
                onClick={() => setLoginDialogOpen(true)}
                variant="default"
                size="icon"
                className={"w-full h-11 rounded-xl bg-[#0e200e] border border-white/15 text-sm font-medium text-[#1dd13a] backdrop-blur transition-colors hover:bg-[#0e200e]/80"}
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
                className="w-full h-11 rounded-xl bg-[#0e200e] border border-white/15 text-sm font-medium text-[#1dd13a] backdrop-blur transition-colors hover:bg-[#0e200e]/80"
              >

                Connect Wallet
              </Button>
            )}
          </>
        ) : (
          <>
            <WalletConnectButton isCondensed={isCondensed} />
            {isCondensed ? (
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full text-red-500 hover:text-red-500 hover:bg-red-500/10"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="w-full text-sm font-semibold text-red-500 hover:text-red-500 hover:bg-red-500/10 gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            )}
          </>
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
