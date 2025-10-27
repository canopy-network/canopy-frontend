import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, GitFork, ExternalLink } from "lucide-react";

interface RepositoryStats {
  stars: number;
  forks: number;
}

interface ChainCodeProps {
  repositoryUrl?: string;
  repositoryName?: string;
  primaryLanguage?: string;
  languageColor?: string;
  license?: string;
  description?: string;
  topics?: string[];
  stats?: RepositoryStats;
  deploymentStatus?: "deployed" | "building" | "failed" | null;
}

// Language color mapping (common programming languages)
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Solidity: "#AA6746",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Unity: "#4285F4",
};

export function ChainCode({
  repositoryUrl,
  repositoryName = "metaverse-land/platform",
  primaryLanguage = "Solidity",
  languageColor,
  license = "MIT",
  description = "This repository contains the core blockchain implementation for Metaverse Land. Built with Unity, it provides a robust foundation for decentralized applications and smart contract execution.",
  topics = ["blockchain", "unity", "smart-contracts", "decentralized"],
  stats = { stars: 23, forks: 8 },
  deploymentStatus = "deployed",
}: ChainCodeProps) {
  const displayLanguageColor =
    languageColor || LANGUAGE_COLORS[primaryLanguage] || "#858585";

  const getStatusBadge = () => {
    if (!deploymentStatus) return null;

    const statusConfig = {
      deployed: {
        label: "Deployed",
        className: "bg-green-500/10 text-green-500 border-green-500/20",
      },
      building: {
        label: "Building",
        className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      },
      failed: {
        label: "Failed",
        className: "bg-red-500/10 text-red-500 border-red-500/20",
      },
    };

    const config = statusConfig[deploymentStatus];

    return (
      <Badge variant="outline" className={`${config.className} text-xs`}>
        <span className="mr-1.5">✓</span>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="p-6">
      {/* Repository Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3 flex-1">
          {/* GitHub Icon */}
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold">{repositoryName}</h3>
              {getStatusBadge()}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4" />
                <span>{stats.stars.toLocaleString()} stars</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GitFork className="w-4 h-4" />
                <span>{stats.forks.toLocaleString()} forks</span>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 flex-shrink-0"
          asChild
        >
          <a
            href={repositoryUrl || `https://github.com/${repositoryName}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </a>
        </Button>
      </div>

      {/* Language and License */}
      <div className="grid grid-cols-2 gap-6 py-6 border-t border-b border-border mb-6">
        <div>
          <h4 className="text-sm text-muted-foreground mb-2">
            Primary Language
          </h4>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: displayLanguageColor }}
            />
            <span className="font-medium">{primaryLanguage}</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm text-muted-foreground mb-2">License</h4>
          <span className="font-medium">{license}</span>
        </div>
      </div>

      {/* About Section */}
      <div className="mb-6">
        <h4 className="text-base font-semibold mb-3">About</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Topics */}
      {topics && topics.length > 0 && (
        <div>
          <h4 className="text-base font-semibold mb-3">Topics</h4>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Badge
                key={topic}
                variant="secondary"
                className="px-3 py-1 bg-muted hover:bg-muted/80 text-sm font-normal"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!repositoryUrl && !repositoryName && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 text-muted-foreground"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No Repository Linked</h3>
          <p className="text-sm text-muted-foreground">
            Connect a GitHub repository to display code information
          </p>
        </div>
      )}
    </Card>
  );
}
