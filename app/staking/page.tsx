"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StakingTab } from "@/components/wallet/staking-tab";
import { useWallet } from "@/components/wallet/wallet-provider";
import { useAuthStore } from "@/lib/stores/auth-store";
import { AlertCircle, Coins } from "lucide-react";

function StakingContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { currentWallet, connectWallet } = useWallet();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              Please sign in to view and manage your staking positions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button onClick={() => router.push("/login")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentWallet) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="max-w-lg w-full text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Coins className="h-5 w-5 text-muted-foreground" />
              No Wallet Connected
            </CardTitle>
            <CardDescription>
              Connect your wallet to view and manage your staking positions across all Canopy chains.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={connectWallet}>Connect Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold">Staking</h1>
        <p className="text-muted-foreground max-w-3xl">
          Vista basada en el wireframe con datos mock para stakes, recompensas y la cola de
          unstaking. Integraremos Launchpad sobre esta logica mas adelante.
        </p>
      </div>

      <StakingTab addresses={[currentWallet.address]} />
    </div>
  );
}

export default function StakingPage() {
  return <StakingContent />;
}
