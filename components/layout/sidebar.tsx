"use client";

import { useState } from "react";
import { MainNav } from "@/components/navigation/main-nav";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { LoginDialog } from "@/components/auth/login-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Github, Mail } from "lucide-react";
import { useCreateChainDialog } from "@/lib/stores/use-create-chain-dialog";
import { signIn, signOut, useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/stores/auth-store";

export function Sidebar() {
  const { open } = useCreateChainDialog();
  const { data: session, status } = useSession();
  const { user, isAuthenticated } = useAuthStore();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  return (
    <div className="flex h-full w-64 flex-col bg-[#0e0e0e] border-r border-[#2a2a2a]">
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

      <div className="p-4 border-b border-[#2a2a2a]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chains"
            className="pl-10 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="px-4 py-2 border-b border-[#2a2a2a]">
        <Button
          className="w-full justify-start gap-2 bg-transparent hover:bg-[#1a1a1a] text-white border-none font-medium"
          onClick={open}
        >
          <Plus className="h-4 w-4" />
          Create chain
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <MainNav />
      </div>

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
              onClick={() => setLoginDialogOpen(true)}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              Manage Account
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setLoginDialogOpen(true)}
            className="w-full gap-2 bg-transparent hover:bg-[#1a1a1a] text-white border border-[#2a2a2a] font-medium"
            variant="outline"
          >
            <Mail className="h-4 w-4" />
            Login
          </Button>
        )}

        <WalletConnectButton />

        {/* GitHub Login Button - Temporary */}
        <div className="space-y-2">
          {session ? (
            <div className="space-y-2">
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
            </div>
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
      </div>

      {/* Login Dialog */}
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </div>
  );
}
