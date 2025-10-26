"use client";

import { MainNav } from "@/components/navigation/main-nav";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Github, Mail } from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  user: any;
  session: any;
  onCreateChain: () => void;
  onSearchClick: () => void;
  onLoginClick: () => void;
  onClose: () => void;
}

export function MobileSidebar({
  isLoggedIn,
  isAuthenticated,
  user,
  session,
  onCreateChain,
  onSearchClick,
  onLoginClick,
  onClose,
}: MobileSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={cn(
          "py-6 border-b border-zinc-800 transition-all duration-300 px-4"
        )}
      >
        <Link
          href="/"
          className={cn(
            "overflow-hidden transition-all duration-300 block w-32 mr-auto"
          )}
          onClick={onClose}
        >
          <img
            src="/images/logo.svg"
            alt="Logo"
            className={cn("invert w-32 min-w-32")}
          />
        </Link>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-[#2a2a2a]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chains"
            className="pl-10 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            onClick={() => {
              onClose();
              onSearchClick();
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
              onClose();
              onCreateChain();
            }}
          >
            <Plus className="h-4 w-4" />
            Create chain
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-auto p-4">
        <div onClick={onClose}>
          <MainNav isAuthenticated={isLoggedIn} />
        </div>
      </div>

      {/* Footer - Auth Section */}
      <div className="border-t border-[#2a2a2a] p-4 space-y-3">
        {/* Email Authentication */}
        {isAuthenticated && user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded-lg">
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-white truncate">{user.email}</span>
            </div>
            <Button
              onClick={() => {
                onClose();
                onLoginClick();
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
              onClose();
              onLoginClick();
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
  );
}
