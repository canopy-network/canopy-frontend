"use client";

import { Card } from "@/components/ui/card";
import { ChainExtended, Accolade } from "@/types/chains";
import { MediaGallery } from "./media-gallery";
import { AchievementsList } from "./achievements-list";
import { InfoCard } from "./info-card";
import { TokenomicsCard } from "./tokenomics-card";
import {
  Users,
  CodeXml,
  Activity,
  Globe,
  Github,
  BookOpen,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ChainHolder, SocialPlatform } from "@/types/chains";
import type { ReactElement } from "react";
import { GitHubRepository } from "@/lib/api/github-repos";

// Social platform icon mapping - all icons are 16px (w-4 h-4)
const SOCIAL_ICONS: Record<SocialPlatform, ReactElement> = {
  website: <Globe className="w-4 h-4" />,
  twitter: (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 fill-current"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  discord: (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 fill-current"
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  ),
  telegram: (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 fill-current"
      aria-hidden="true"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345c-.48.33-.913.49-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789c.027-.216.325-.437.893-.663c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  ),
  github: <Github className="w-4 h-4" />,
  medium: (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 fill-current"
      aria-hidden="true"
    >
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    </svg>
  ),
  youtube: (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 fill-current"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  linkedin: (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 fill-current"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
};

interface ChainOverviewProps {
  chain: ChainExtended;
  holders: ChainHolder[];
  holdersCount: number;
  accolades?: Accolade[];
}
export function ChainOverview({
  chain,
  holdersCount,
  holders,
  accolades = [],
}: ChainOverviewProps) {
  const [repository, setRepository] = useState<GitHubRepository | null>(null);
  // Fetch GitHub stars if repository exists
  useEffect(() => {
    const fetchGithubStars = async () => {
      if (
        chain.repository?.repository_owner &&
        chain.repository?.repository_name
      ) {
        try {
          const response = await fetch(
            `https://api.github.com/repos/${chain.repository.repository_owner}/${chain.repository.repository_name}`,
            {
              headers: {
                Accept: "application/vnd.github.v3+json",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setRepository({
              ...data,
              stargazers_count: data.stargazers_count,
              forks_count: data.forks_count,
            });
          }
        } catch (error) {
          console.error("Failed to fetch GitHub stars:", error);
        }
      }
    };

    fetchGithubStars();
  }, [chain.repository?.repository_owner, chain.repository?.repository_name]);

  return (
    <>
      <Card className="mb-6">
        <div className="flex gap-4 pb-8 flex-col border-b ">
          <div className="flex items-center gap-2">
            {/* Social Links */}
            {chain.social_links?.map((link) => {
              const icon = SOCIAL_ICONS[link.platform];
              if (!icon) return null;

              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
                  aria-label={link.display_name || link.platform}
                >
                  {icon}
                </a>
              );
            })}

            {/* GitHub Repository Link with Stars */}
            {chain.repository?.github_url && (
              <a
                href={chain.repository.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="w-4 h-4" />
                {repository?.stargazers_count !== null && (
                  <span className="text-sm font-medium">
                    {repository?.stargazers_count &&
                    repository?.stargazers_count >= 1000
                      ? `${(repository?.stargazers_count / 1000).toFixed(1)}k`
                      : repository?.stargazers_count}{" "}
                    stars
                  </span>
                )}
              </a>
            )}
          </div>
          <h2 className="text-xl font-semibold mb-3">{chain.chain_name}</h2>
          <p className="text-[#737373] leading-relaxed">
            {chain.chain_description ||
              "Introducing the Token Chain Project, a revolutionary platform designed to enhance the way digital assets are managed, traded, and secured. Built on cutting-edge blockchain technology, this project aims to provide users with a seamless and secure experience for managing their cryptocurrency portfolios."}
          </p>
        </div>

        <AchievementsList accolades={accolades} />

        {((chain.media && chain.media.length > 0) ||
          (chain.assets &&
            chain.assets.some(
              (asset) =>
                asset.asset_type === "media" ||
                asset.asset_type === "screenshot" ||
                asset.asset_type === "video" ||
                asset.asset_type === "banner"
            ))) && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Gallery</h3>
            <MediaGallery media={chain.media || []} assets={chain.assets} />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <InfoCard
          icon={Users}
          label="Holders"
          mainValue={holdersCount}
          buttonText="View All Holders"
          isHolders={true}
          holders={holders}
        />
        <InfoCard
          icon={CodeXml}
          label="Repository"
          mainValue={chain.repository?.repository_name || ""}
          stats={[
            { label: "Stars", value: repository?.stargazers_count || 0 },
            { label: "Forks", value: repository?.forks_count || 0 },
          ]}
          buttonText="View Repository"
        />
        <InfoCard
          icon={Activity}
          label="Block Height"
          mainValue={128900}
          stats={[
            { label: "Total Transactions", value: 567800 },
            { label: "Avg Block Time", value: "10s" },
          ]}
          buttonText="View Explorer"
        />
      </div>

      <TokenomicsCard
        data={{
          totalSupply:
            chain.token_total_supply && chain.token_total_supply > 0
              ? chain.initial_token_supply.toLocaleString()
              : "1,000,000,000",
          tokenSymbol: chain.token_symbol || "TOKEN",
          blockTime: chain.block_time || "10s", // Placeholder - not available in API
          halvingSchedule: "Every 365 days", // Placeholder - not available in API
          blocksPerDay: "8,640", // Placeholder - not available in API
          yearOneEmission: "~137,442,250", // Placeholder - not available in API
        }}
      />

      {/* Resources & Documentation */}
      {chain.assets &&
        chain.assets.length > 0 &&
        chain.assets.some((asset) => asset.asset_type === "documentation") && (
          <Card className="p-6 my-6">
            <div className="flex items-center gap-2 ">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">
                Resources & Documentation
              </h3>
            </div>
            <div className="space-y-3">
              {chain.assets
                .filter((asset) => asset.asset_type === "documentation")
                .map((asset) => (
                  <a
                    key={asset.id}
                    href={asset.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="p-2 bg-background rounded-md">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">
                        {asset.title || asset.file_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(asset.file_size_bytes / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </a>
                ))}
            </div>
          </Card>
        )}
    </>
  );
}
