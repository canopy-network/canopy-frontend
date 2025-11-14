"use client";

import { useState, useEffect } from "react";
import { MainNav } from "@/components/navigation/main-nav";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { LoginDialog } from "@/components/auth/login-dialog";
import CommandSearchDialog from "@/components/command-search-dialog";
import { Button } from "@/components/ui/button";
import { Search, Plus, Mail, Wallet } from "lucide-react";
import { useCreateChainDialog } from "@/lib/stores/use-create-chain-dialog";
import { useAuthStore } from "@/lib/stores/auth-store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, WINDOW_BREAKPOINTS } from "@/lib/utils";
import LaunchOverviewDialog from "@/components/launchpad/launch-overview-dialog";
import Image from "next/image";

export function Sidebar() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [showCommandSearch, setShowCommandSearch] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showLaunchDialog, setShowLaunchDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

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
              ? "w-[16px] max-w-[16px] mx-auto"
              : "w-38 mr-auto xl:px-4"
          )}
        >
          <Image
            width={128}
            height={128}
            src="/images/logo.svg"
            alt="Logo"
            className={cn("invert w-32 min-w-32")}
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
        <button
          onClick={() => setShowCommandSearch(true)}
          className={cn(
            "flex items-center rounded-full bg-transparent hover:bg-white/5 transition-colors",
            isCondensed
              ? "w-10 h-10 justify-center text-white/50"
              : "w-full h-9 justify-between pl-4 pr-2 text-sm text-white/50"
          )}
        >
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4" />
            <span
              className={cn(
                "transition-all duration-300",
                isCondensed ? "hidden" : "block"
              )}
            >
              Search chains...
            </span>
          </div>
          <kbd
            className={cn(
              "h-5 select-none items-center gap-1 rounded-2xl bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white/70 transition-all duration-300",
              isCondensed ? "hidden" : "hidden sm:inline-flex"
            )}
          >
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {isLoggedIn && !isMobile && (
          <Button
            onClick={() => {
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
          "border-t border-[#2a2a2a] transition-all duration-300 py-4 px-4 transition-all duration-300 flex flex-col gap-3 items-center"
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
              <div className="h-6 w-6 min-w-6  rounded-full bg-primary flex items-center justify-center">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.email || ""}
                    className="h-6 w-6  min-w-6 rounded-full"
                  />
                ) : (
                  <span className="text-primary-foreground text-xs font-bold">
                    {user.email?.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              {isCondensed ? null : (
                <span className="text-sm text-white truncate">
                  {user.email}
                </span>
              )}
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setLoginDialogOpen(true)}
            variant="outline"
            size="sm"
            className="w-full text-xs"
          >
            Login
          </Button>
        )}

        {isLoggedIn && <WalletConnectButton isCondensed={isCondensed} />}
      </div>

      {/* Login Dialog */}
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />

      {/* Command Search Dialog */}
      <CommandSearchDialog
        open={showCommandSearch}
        onOpenChange={setShowCommandSearch}
      />

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
