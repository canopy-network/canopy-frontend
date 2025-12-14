"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Download, ExternalLink, Heart, Share2 } from "lucide-react";
import { canopyIconSvg, getCanopyAccent } from "@/lib/utils/brand";
import type { Chain } from "@/types/chains";

interface ChainDetailModalProps {
  chain: Chain;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatValue = (value?: number | null) => {
  if (value === undefined || value === null) return "N/A";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
};

const formatNumber = (value?: number | null) => {
  if (value === undefined || value === null) return "N/A";
  return value.toLocaleString();
};

const formatPercentage = (value?: number | null) => {
  if (value === undefined || value === null) return "N/A";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function ChainDetailModal({
  chain,
  open,
  onOpenChange,
}: ChainDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center bg-muted"
                dangerouslySetInnerHTML={{
                  __html: canopyIconSvg(getCanopyAccent(chain.id)),
                }}
              />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <DialogTitle className="text-2xl font-bold">
                    {chain.chain_name}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className="capitalize border-[#00a63d] bg-[#00a63d]/10 text-[#00a63d]"
                  >
                    {chain.status === "graduated" ? "Healthy" : chain.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>${chain.token_symbol}</span>
                  <span>•</span>
                  <span>Chain ID: {chain.chain_id || chain.id}</span>
                  {chain.virtual_pool?.price_24h_change_percent !== undefined && (
                    <>
                      <span>•</span>
                      <span
                        className={
                          chain.virtual_pool.price_24h_change_percent >= 0
                            ? "text-[#00a63d] font-medium"
                            : "text-red-500 font-medium"
                        }
                      >
                        {formatPercentage(chain.virtual_pool.price_24h_change_percent)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList variant="outline" className="w-full justify-start border-b">
            <TabsTrigger variant="outline" value="overview">
              Overview
            </TabsTrigger>
            <TabsTrigger variant="outline" value="project-info">
              Project Information
            </TabsTrigger>
            <TabsTrigger variant="outline" value="holders">
              Holders
            </TabsTrigger>
            <TabsTrigger variant="outline" value="code">
              Code
            </TabsTrigger>
            <TabsTrigger variant="outline" value="network">
              Network
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Chain ID</div>
                <div className="text-2xl font-bold">{chain.chain_id || chain.id}</div>
                <div className="text-xs text-muted-foreground mt-1">{chain.status}</div>
              </Card>

              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Market Cap</div>
                <div className="text-2xl font-bold">
                  {formatValue(chain.virtual_pool?.market_cap_usd)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">USD</div>
              </Card>

              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Block Time</div>
                <div className="text-2xl font-bold">{chain.block_time_seconds}s</div>
                <div className="text-xs text-muted-foreground mt-1">{chain.consensus_mechanism}</div>
              </Card>

              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Age</div>
                <div className="text-2xl font-bold">
                  {chain.actual_launch_time
                    ? `${Math.floor((Date.now() - new Date(chain.actual_launch_time).getTime()) / (1000 * 60 * 60 * 24))}d`
                    : "N/A"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDate(chain.actual_launch_time)}
                </div>
              </Card>
            </div>

            {/* Token Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Token Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Symbol</div>
                  <div className="text-lg font-bold">{chain.token_symbol}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Name</div>
                  <div className="text-lg font-bold">{chain.token_name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Genesis Supply</div>
                  <div className="text-lg font-bold">{formatNumber(chain.genesis_supply)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Brand Color</div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: chain.brand_color }} />
                    <span className="text-sm font-mono">{chain.brand_color}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Virtual Pool */}
            {chain.virtual_pool && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Virtual Pool</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">CNPY Reserve</div>
                    <div className="text-lg font-bold">{formatNumber(chain.virtual_pool.cnpy_reserve)}</div>
                    <div className="text-xs text-muted-foreground">Initial: {formatNumber(chain.virtual_pool.initial_cnpy_reserve)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Token Reserve</div>
                    <div className="text-lg font-bold">{formatNumber(chain.virtual_pool.token_reserve)}</div>
                    <div className="text-xs text-muted-foreground">Initial: {formatNumber(chain.virtual_pool.initial_token_supply)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                    <div className="text-lg font-bold">{formatNumber(chain.virtual_pool.current_price_cnpy)} CNPY</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Total Volume</div>
                    <div className="text-lg font-bold">{formatNumber(chain.virtual_pool.total_volume_cnpy)} CNPY</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Creator Purchase</div>
                    <div className="text-lg font-bold">{formatNumber(chain.virtual_pool.creator_initial_purchase_cnpy)} CNPY</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Pool Status</div>
                    <div className="text-lg font-bold">{chain.virtual_pool.is_active ? "Active" : "Inactive"}</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Graduation Progress */}
            {chain.graduation && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Graduation Status</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completion</span>
                    <span className="text-lg font-bold">{chain.graduation.completion_percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-[#00a63d] h-3 rounded-full transition-all"
                      style={{ width: `${chain.graduation.completion_percentage}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Threshold</div>
                      <div className="text-sm font-medium">{formatNumber(chain.graduation.threshold_cnpy)} CNPY</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Current</div>
                      <div className="text-sm font-medium">{formatNumber(chain.graduation.current_cnpy_reserve)} CNPY</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Remaining</div>
                      <div className="text-sm font-medium">{formatNumber(chain.graduation.cnpy_remaining)} CNPY</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Graduated</div>
                      <div className="text-sm font-medium">{chain.is_graduated ? "Yes" : "No"}</div>
                    </div>
                    {chain.graduation_time && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Graduation Date</div>
                        <div className="text-sm font-medium">{formatDate(chain.graduation_time)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Timestamps */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Timeline</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-medium">{formatDate(chain.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Updated</span>
                  <span className="text-sm font-medium">{formatDate(chain.updated_at)}</span>
                </div>
                {chain.scheduled_launch_time && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Scheduled Launch</span>
                    <span className="text-sm font-medium">{formatDate(chain.scheduled_launch_time)}</span>
                  </div>
                )}
                {chain.actual_launch_time && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Actual Launch</span>
                    <span className="text-sm font-medium">{formatDate(chain.actual_launch_time)}</span>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Project Information Tab */}
          <TabsContent value="project-info" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <div className="text-sm leading-relaxed">{chain.chain_description}</div>
            </Card>

            {/* Creator Information */}
            {chain.creator && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Creator Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-medium">{chain.creator.display_name}</div>
                      <div className="text-sm text-muted-foreground">@{chain.creator.username}</div>
                    </div>
                    {chain.creator.is_verified && (
                      <Badge variant="outline" className="border-[#00a63d] text-[#00a63d]">
                        {chain.creator.verification_tier.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Wallet Address</div>
                      <div className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                        {chain.creator.wallet_address}
                      </div>
                    </div>
                    {chain.creator.email && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Email</div>
                        <div className="text-sm">{chain.creator.email}</div>
                      </div>
                    )}
                  </div>

                  {chain.creator.bio && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Bio</div>
                      <div className="text-sm">{chain.creator.bio}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Chains Created</div>
                      <div className="text-xl font-bold">{chain.creator.total_chains_created}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">CNPY Invested</div>
                      <div className="text-xl font-bold">{formatNumber(chain.creator.total_cnpy_invested)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Reputation</div>
                      <div className="text-xl font-bold">{formatNumber(chain.creator.reputation_score)}</div>
                    </div>
                  </div>

                  {(chain.creator.website_url || chain.creator.twitter_handle || chain.creator.github_username || chain.creator.telegram_handle) && (
                    <div className="pt-4 border-t border-border">
                      <div className="text-xs text-muted-foreground mb-2">Social Links</div>
                      <div className="grid grid-cols-2 gap-2">
                        {chain.creator.website_url && (
                          <div className="text-sm">Website: {chain.creator.website_url}</div>
                        )}
                        {chain.creator.twitter_handle && (
                          <div className="text-sm">Twitter: @{chain.creator.twitter_handle}</div>
                        )}
                        {chain.creator.github_username && (
                          <div className="text-sm">GitHub: @{chain.creator.github_username}</div>
                        )}
                        {chain.creator.telegram_handle && (
                          <div className="text-sm">Telegram: @{chain.creator.telegram_handle}</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    {chain.creator.email_verified_at && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Email Verified</div>
                        <div className="text-sm">{formatDate(chain.creator.email_verified_at)}</div>
                      </div>
                    )}
                    {chain.creator.last_active_at && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Last Active</div>
                        <div className="text-sm">{formatDate(chain.creator.last_active_at)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Template Information */}
            {chain.template && chain.template.template_name && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Template</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Name</div>
                    <div className="text-lg font-medium">{chain.template.template_name}</div>
                  </div>
                  {chain.template.template_description && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Description</div>
                      <div className="text-sm">{chain.template.template_description}</div>
                    </div>
                  )}
                  {chain.template.template_category && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Category</div>
                      <div className="text-sm">{chain.template.template_category}</div>
                    </div>
                  )}
                  {chain.template.supported_language && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Language</div>
                      <div className="text-sm">{chain.template.supported_language}</div>
                    </div>
                  )}
                  {chain.template.version && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Version</div>
                      <div className="text-sm">{chain.template.version}</div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Holders Tab */}
          <TabsContent value="holders" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Token Distribution</h3>
              </div>

              <div className="space-y-6">
                {/* Virtual Pool Stats */}
                {chain.virtual_pool && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-3">Pool Information</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Initial Token Supply</div>
                        <div className="text-lg font-bold">
                          {formatNumber(chain.virtual_pool.initial_token_supply)} {chain.token_symbol}
                        </div>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Current Token Reserve</div>
                        <div className="text-lg font-bold">
                          {formatNumber(chain.virtual_pool.token_reserve)} {chain.token_symbol}
                        </div>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Creator Initial Purchase</div>
                        <div className="text-lg font-bold">
                          {formatNumber(chain.virtual_pool.creator_initial_purchase_cnpy)} CNPY
                        </div>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Pool Status</div>
                        <div className="text-lg font-bold">
                          {chain.virtual_pool.is_active ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Genesis Supply */}
                <div>
                  <div className="text-sm text-muted-foreground mb-3">Supply Information</div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Genesis Supply</span>
                      <span className="text-lg font-bold">
                        {formatNumber(chain.genesis_supply)} {chain.token_symbol}
                      </span>
                    </div>
                    {chain.virtual_pool && (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Circulating</span>
                          <span className="text-lg font-bold">
                            {formatNumber((chain.virtual_pool.initial_token_supply || 0) - chain.virtual_pool.token_reserve)} {chain.token_symbol}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">In Pool</span>
                          <span className="text-lg font-bold">
                            {formatNumber(chain.virtual_pool.token_reserve)} {chain.token_symbol}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </Card>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Blockchain Configuration</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Consensus</div>
                  <div className="text-lg font-bold uppercase">{chain.consensus_mechanism}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Block Time</div>
                  <div className="text-lg font-bold">{chain.block_time_seconds}s</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Min Validator Stake</div>
                  <div className="text-lg font-bold">{formatNumber(chain.validator_min_stake)} CNPY</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Genesis Supply</div>
                  <div className="text-lg font-bold">{formatNumber(chain.genesis_supply)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Graduation Threshold</div>
                  <div className="text-lg font-bold">{formatNumber(chain.graduation_threshold)} CNPY</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Status</div>
                  <div className="text-lg font-bold capitalize">{chain.status.replace("_", " ")}</div>
                </div>
                {chain.block_reward_amount !== null && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Block Reward</div>
                    <div className="text-lg font-bold">{formatNumber(chain.block_reward_amount)}</div>
                  </div>
                )}
                {chain.halving_schedule !== null && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Halving Schedule</div>
                    <div className="text-lg font-bold">{formatNumber(chain.halving_schedule)} blocks</div>
                  </div>
                )}
                {chain.upgrade_block_height !== null && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Upgrade Block Height</div>
                    <div className="text-lg font-bold">{formatNumber(chain.upgrade_block_height)}</div>
                  </div>
                )}
              </div>
            </Card>

            {/* Genesis Hash */}
            {chain.genesis_hash && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Genesis Hash</h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded break-all">
                    {chain.genesis_hash}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(chain.genesis_hash || "")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Chain ID */}
            {chain.chain_id && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Chain ID</h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-muted px-3 py-2 rounded">
                    {chain.chain_id}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(chain.chain_id || "")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Created By */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Created By</h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded break-all">
                  {chain.created_by}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(chain.created_by)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Template ID */}
            {chain.template_id && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Template ID</h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-muted px-3 py-2 rounded break-all">
                    {chain.template_id}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(chain.template_id || "")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network" className="space-y-6 mt-6">
            <Card className="p-6 ">
              {/* Public RPC */}
              <div >
                <div className="text-sm text-muted-foreground mb-2">Public RPC</div>
                <div className="flex items-center gap-2 border border-muted rounded-xl p-1.5">
                  <code className="flex-1 text-sm">
                    https://rpc.{chain.chain_name.toLowerCase().replace(/\s+/g, '')}.network
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      copyToClipboard(`https://rpc.${chain.chain_name.toLowerCase().replace(/\s+/g, '')}.network`)
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Snapshot URL */}
              <div>
                <div className="text-sm text-muted-foreground mb-2">Snapshot URL</div>
                <div className="flex items-center gap-2 border border-muted rounded-xl p-1.5  ">
                  <code className="flex-1 text-sm">
                    https://snapshots.cosmoshub.io/latest.tar.lz4
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      copyToClipboard("https://snapshots.cosmoshub.io/latest.tar.lz4")
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Genesis.json */}
              <div>
                <div className="text-sm text-muted-foreground mb-2">Genesis.json</div>
                <div className="flex items-center gap-2 border border-muted rounded-xl p-1.5">
                  <code className="flex-1 text-sm">
                    https://snapshots.cosmoshub.io/latest.tar.lz4
                  </code>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Github Repo */}
              <div>
                <div className="text-sm text-muted-foreground mb-2">Github Repo</div>
                <div className="flex items-center gap-2 border border-muted rounded-xl p-1.5">
                  <code className="flex-1 text-sm">
                    https://github.com/org/{chain.chain_name.toLowerCase().replace(/\s+/g, '-')}
                  </code>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Seeds List */}
              <div>
                <div className="text-sm text-muted-foreground mb-2">Seeds List</div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border border-muted rounded-xl p-1.5 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Seed {i}</span>
                        <code className="text-xs text-muted-foreground">
                          seed{i}.{chain.chain_name.toLowerCase().replace(/\s+/g, '')}.network:26656
                        </code>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          copyToClipboard(`seed${i}.${chain.chain_name.toLowerCase().replace(/\s+/g, '')}.network:26656`)
                        }
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
