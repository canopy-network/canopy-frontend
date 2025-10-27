"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Github, ExternalLink, CheckCircle2, Search, X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface ConnectRepoProps {
  initialRepo?: string;
  initialValidated?: boolean;
  templateName?: string;
  templateLanguage?: string;
  onDataSubmit?: (data: { repo: string; validated: boolean }) => void;
}

interface Repository {
  id: string;
  name: string;
  fullName: string;
  forkedFrom?: string;
}

export default function ConnectRepo({
  initialRepo = "",
  initialValidated = false,
  templateName = "Python",
  templateLanguage = "python",
  onDataSubmit,
}: ConnectRepoProps) {
  const { data: session } = useSession();
  const [connectedRepo, setConnectedRepo] = useState<string | null>(
    initialValidated ? initialRepo : null
  );
  const [showRepoDialog, setShowRepoDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  // Mock repositories - replace with actual GitHub API call
  const mockRepositories: Repository[] = [
    {
      id: "1",
      name: "chain-python",
      fullName: "eliezerpujols/chain-python",
      forkedFrom: "canopy/chain-template-python",
    },
    {
      id: "2",
      name: "my-blockchain",
      fullName: "eliezerpujols/my-blockchain",
    },
    {
      id: "3",
      name: "python-template-fork",
      fullName: "eliezerpujols/python-template-fork",
      forkedFrom: "canopy/chain-template-python",
    },
  ];

  const filteredRepos = mockRepositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenTemplate = () => {
    // Open template repository in new tab
    window.open(
      `https://github.com/canopy/chain-template-${templateLanguage.toLowerCase()}`,
      "_blank"
    );
  };

  const handleConnectRepository = () => {
    // if (!session) {
    // Initialize GitHub OAuth flow
    signIn("github");
    // } else {
    //   // Show repository selection dialog
    //   setShowRepoDialog(true);
    // }
  };

  const handleSelectRepository = () => {
    if (selectedRepo) {
      setConnectedRepo(selectedRepo.fullName);
      setShowRepoDialog(false);

      // Notify parent
      if (onDataSubmit) {
        onDataSubmit({ repo: selectedRepo.fullName, validated: true });
      }
    }
  };

  const handleDisconnect = () => {
    setConnectedRepo(null);
    setSelectedRepo(null);

    // Notify parent
    if (onDataSubmit) {
      onDataSubmit({ repo: "", validated: false });
    }
  };

  const getLanguageIcon = (lang: string) => {
    const langLower = lang.toLowerCase();
    return `/images/languages/${langLower}.svg`;
  };

  return (
    <>
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                <img
                  src={getLanguageIcon(templateLanguage)}
                  alt={`${templateName} icon`}
                  className="w-8 h-8 brightness-0 invert"
                />
              </div>
              <div className="flex-1 space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  Fork {templateName} Template to Your GitHub
                </h1>
                <p className="text-muted-foreground text-lg">
                  Get started with a production-ready blockchain template
                </p>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="px-3 py-1.5 text-xs">
                ✓ Basic token functionality
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5 text-xs">
                ✓ Consensus mechanism
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5 text-xs">
                ✓ Ready to launch as-is
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5 text-xs">
                ✓ Customizable
              </Badge>
            </div>
          </div>

          {/* Steps Section */}
          <div className="space-y-4">
            {/* Step 1 */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    1
                  </div>
                  <h3 className="font-semibold">
                    Fork the {templateName} Template to your GitHub
                  </h3>
                </div>
                <Button
                  onClick={handleOpenTemplate}
                  className="w-full"
                  size="lg"
                  variant="secondary"
                >
                  Open Template on GitHub
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">
                    Customize the code if you want (or leave it as-is)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    If you're new to blockchain development, you can launch the
                    template without changing anything! It's fully functional
                    out of the box.
                  </p>
                </div>
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  3
                </div>
                <h3 className="font-semibold">
                  Connect your GitHub repository
                </h3>
              </div>

              <div className="border rounded-lg p-4">
                {!connectedRepo ? (
                  <div className="flex flex-col items-center space-y-4">
                    <Github className="w-12 h-12 text-muted-foreground" />
                    <div className="text-center space-y-1">
                      <p className="font-medium">Connect Your Repository</p>
                      <p className="text-sm text-muted-foreground">
                        You can always update your code later.
                      </p>
                    </div>
                    <Button
                      onClick={handleConnectRepository}
                      variant="outline"
                      className="gap-2"
                    >
                      <Github className="w-4 h-4" />
                      Connect Repository
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Github className="w-8 h-8" />
                      <div>
                        <p className="font-medium">{connectedRepo}</p>
                        <p className="text-sm text-muted-foreground">
                          Connected repository
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={handleDisconnect}
                      className="text-destructive hover:text-destructive"
                    >
                      Disconnect
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Repository Selection Dialog */}
      <Dialog open={showRepoDialog} onOpenChange={setShowRepoDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Github className="w-6 h-6" />
                <DialogTitle>Connect GitHub Repository</DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRepoDialog(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-2">
              Select the repository you forked from the {templateName} template
            </p>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* User Info */}
            {session?.user && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  {session.user.name?.[0] || "U"}
                </div>
                <span>{session.user.name || session.user.email}</span>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Repository List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className={cn(
                    "border-2 rounded-lg p-4 cursor-pointer transition-all",
                    selectedRepo?.id === repo.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setSelectedRepo(repo)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{repo.fullName}</p>
                      {repo.forkedFrom && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Forked from {repo.forkedFrom}
                        </p>
                      )}
                    </div>
                    {selectedRepo?.id === repo.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                    )}
                  </div>
                </div>
              ))}

              {filteredRepos.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No repositories found</p>
                  <p className="text-sm mt-1">
                    Make sure you've forked the template first
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowRepoDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSelectRepository} disabled={!selectedRepo}>
                Connect Repository
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
