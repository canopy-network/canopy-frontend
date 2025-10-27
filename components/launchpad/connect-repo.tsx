"use client";

import { useState, useEffect } from "react";
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
import {
  Github,
  ExternalLink,
  CheckCircle2,
  Search,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { fetchUserRepositories, type Repository } from "@/lib/api/github-repos";

interface ConnectRepoProps {
  initialRepo?: string;
  initialValidated?: boolean;
  templateName?: string;
  templateLanguage?: string;
  onDataSubmit?: (data: {
    repo: string;
    validated: boolean;
    repoData: {
      name: string;
      fullName: string;
      htmlUrl: string;
      defaultBranch: string;
      owner: string;
      language?: string;
      description?: string | null;
      cloneUrl: string;
    } | null;
  }) => void;
}

export default function ConnectRepo({
  initialRepo = "",
  initialValidated = false,
  templateName = "Python",
  templateLanguage = "python",
  onDataSubmit,
}: ConnectRepoProps) {
  const { data: session, status } = useSession();
  const [connectedRepo, setConnectedRepo] = useState<string | null>(
    initialValidated ? initialRepo : null
  );
  const [showRepoDialog, setShowRepoDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  // Fetch repositories when dialog opens and user is authenticated
  useEffect(() => {
    if (showRepoDialog && session?.accessToken && repositories.length === 0) {
      loadRepositories();
    }
  }, [showRepoDialog, session?.accessToken]);

  const loadRepositories = async () => {
    if (!session?.accessToken) return;

    setIsLoadingRepos(true);
    setRepoError(null);

    try {
      const repos = await fetchUserRepositories(session.accessToken);
      setRepositories(repos);
    } catch (error) {
      console.error("Error loading repositories:", error);
      setRepoError("Failed to load repositories. Please try again.");
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const filteredRepos = repositories.filter(
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
    if (!session) {
      // Initialize GitHub OAuth flow - user authorizes Canopy to access their repos
      signIn("github", { callbackUrl: window.location.href });
    } else {
      // User is authenticated - show repository selection dialog
      setShowRepoDialog(true);
    }
  };

  const handleSelectRepository = () => {
    if (selectedRepo) {
      setConnectedRepo(selectedRepo.fullName);
      setShowRepoDialog(false);

      // Notify parent with full repository data
      if (onDataSubmit) {
        onDataSubmit({
          repo: selectedRepo.fullName,
          validated: true,
          repoData: {
            name: selectedRepo.name,
            fullName: selectedRepo.fullName,
            htmlUrl: selectedRepo.htmlUrl,
            defaultBranch: selectedRepo.defaultBranch,
            owner: selectedRepo.owner.login,
            language: selectedRepo.language,
            description: selectedRepo.description,
            cloneUrl: selectedRepo.cloneUrl,
          },
        });
      }
    }
  };

  const handleDisconnect = async () => {
    setConnectedRepo(null);
    setSelectedRepo(null);
    setRepositories([]);

    // Notify parent
    if (onDataSubmit) {
      onDataSubmit({ repo: "", validated: false, repoData: null });
    }

    // Sign out from GitHub
    await signOut({ redirect: false });
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
                  <div className="flex flex-col items-center space-y-4 py-2">
                    <Github className="w-12 h-12 text-muted-foreground" />
                    <div className="text-center space-y-1">
                      <p className="font-medium">Connect Your Repository</p>
                      <p className="text-sm text-muted-foreground">
                        You can always update your code later.
                      </p>
                    </div>
                    {status === "loading" ? (
                      <Button variant="outline" disabled className="gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </Button>
                    ) : !session ? (
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          onClick={handleConnectRepository}
                          variant="outline"
                          className="gap-2"
                        >
                          <Github className="w-4 h-4" />
                          Authorize GitHub
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Canopy needs permission to read your repositories
                        </p>
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={handleConnectRepository}
                          variant="outline"
                          className="gap-2"
                        >
                          <Github className="w-4 h-4" />
                          Select Repository
                        </Button>

                        <Button
                          variant="ghost"
                          className="text-destructive hover:text-destructive text-xs px-2"
                          onClick={handleDisconnect}
                        >
                          Disconnect
                        </Button>
                      </>
                    )}
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
              {isLoadingRepos ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Loading your repositories...
                  </p>
                </div>
              ) : repoError ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                  <div className="text-center">
                    <p className="text-destructive font-medium">{repoError}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Make sure you've authorized Canopy to access your repos
                    </p>
                  </div>
                  <Button
                    onClick={loadRepositories}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              ) : filteredRepos.length > 0 ? (
                filteredRepos.map((repo) => (
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
                        <div className="flex items-center gap-2 mt-1">
                          {repo.forkedFrom && (
                            <p className="text-xs text-muted-foreground">
                              Forked from {repo.forkedFrom}
                            </p>
                          )}
                          {repo.language && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">
                              {repo.language}
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedRepo?.id === repo.id && (
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </div>
                ))
              ) : repositories.length === 0 && !isLoadingRepos ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No repositories found</p>
                  <p className="text-sm mt-1">
                    {searchQuery
                      ? "Try a different search term"
                      : "Make sure you've forked the template first"}
                  </p>
                </div>
              ) : null}
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
