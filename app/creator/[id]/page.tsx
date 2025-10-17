"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart, ChevronDown, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { SmallProjectCard } from "@/components/launchpad/small-project-card";
import { useChainsStore } from "@/lib/stores/chains-store";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface CreatorPageProps {
  params: {
    id: string;
  };
}

// Placeholder data
const creatorData = {
  id: "1",
  username: "alexthompson",
  walletAddress: "9gQAzD...XeG2",
  fullWalletAddress:
    "9gQAzDxK8Zv3mNpQrStUvWxYz1A2bC3dE4fG5hI6jK7lM8nO9pQ0rXeG2",
  avatar: "https://picsum.photos/seed/creator1/200/200",
  banner: "https://picsum.photos/seed/banner1/1400/400",
  bio: "I specialize in blockchain architecture and smart contract development with a focus on DeFi protocols, scalability, and security. From concept to deployment, I bring innovative solutions to life using cutting-edge technology and best practices.",
  stats: {
    createdChains: 12,
    followers: 1234,
  },
};

export default function CreatorPage({ params }: CreatorPageProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(creatorData.fullWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch chains from store
  const chains = useChainsStore((state) => state.chains);
  const isLoading = useChainsStore((state) => state.isLoading);
  const fetchChains = useChainsStore((state) => state.fetchChains);
  const getChainsWithUI = useChainsStore((state) => state.getChainsWithUI);

  // Fetch chains on mount
  useEffect(() => {
    if (chains.length === 0) {
      fetchChains({ include: ["template", "creator"] });
    }
  }, [chains.length, fetchChains]);

  // Get chains with UI data
  const chainsWithUI = getChainsWithUI();

  // Filter chains by status
  const newChains = chainsWithUI.filter(
    (chain) => chain.status === "active" || chain.status === "pending"
  );
  const graduatedChains = chainsWithUI.filter(
    (chain) => chain.status === "graduated"
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        {/* Banner */}
        <div className="relative w-full h-[400px] ">
          <img
            src={creatorData.banner}
            alt="Creator banner"
            className="w-full h-full object-cover opacity-50"
          />
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
            {/* Left Sidebar - Profile Info */}
            <div className="space-y-6">
              <Card className="border-2 border-border">
                <CardContent className="p-6">
                  {/* Avatar */}
                  <div className="flex justify-center -mt-16 mb-4">
                    <div className="w-32 h-32 rounded-full border-4 border-background bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
                      <img
                        src={creatorData.avatar}
                        alt={creatorData.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold">
                      {creatorData.username}
                    </h1>
                  </div>

                  {/* Wallet Address */}
                  <div className="mb-6 space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-muted-foreground font-mono">
                        {creatorData.walletAddress}
                      </span>
                      <button
                        onClick={handleCopyAddress}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy address"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <a
                        href={`https://solscan.io/account/${creatorData.fullWalletAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        View on RandoScan
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    {copied && (
                      <div className="text-center text-xs text-green-500">
                        Copied!
                      </div>
                    )}
                  </div>

                  {/* Follow Button */}
                  <div className="mb-6">
                    <Button
                      className="w-full"
                      onClick={() => setIsFollowing(!isFollowing)}
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${
                          isFollowing ? "fill-current" : ""
                        }`}
                      />
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-6 pb-6 border-b">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Created Chains
                      </span>
                      <span className="font-semibold">
                        {creatorData.stats.createdChains.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Followers
                      </span>
                      <span className="font-semibold">
                        {creatorData.stats.followers.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Profile Description */}
                  <div>
                    <h3 className="font-semibold mb-3">PROFILE</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {showFullBio
                        ? creatorData.bio
                        : `${creatorData.bio.substring(0, 150)}...`}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 p-0 h-auto"
                      onClick={() => setShowFullBio(!showFullBio)}
                    >
                      {showFullBio ? "Show Less" : "Read More"}
                      <ChevronDown
                        className={`h-4 w-4 ml-1 transition-transform ${
                          showFullBio ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Projects */}
            <div>
              <Tabs defaultValue="new" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="new">New</TabsTrigger>
                  <TabsTrigger value="graduated">Graduated</TabsTrigger>
                </TabsList>

                <TabsContent value="new">
                  {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Loading chains...
                    </div>
                  ) : newChains.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        No active chains yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {newChains.map((chain) => (
                        <SmallProjectCard
                          key={chain.id}
                          project={chain}
                          href={`/launchpad/${chain.id}`}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="graduated">
                  {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Loading chains...
                    </div>
                  ) : graduatedChains.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        No graduated chains yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {graduatedChains.map((chain) => (
                        <SmallProjectCard
                          key={chain.id}
                          project={chain}
                          href={`/launchpad/${chain.id}`}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
