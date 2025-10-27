"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowLeft,
  Save,
  Edit2,
  X,
  CalendarIcon,
  Upload,
  FileText,
  Globe,
  Twitter,
  Github,
  MessageCircle,
  Youtube,
  Twitch,
} from "lucide-react";
import Link from "next/link";
import { Chain } from "@/types/chains";
import { cn } from "@/lib/utils";
import { useChainsStore } from "@/lib/stores/chains-store";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface EditChainPageProps {
  params: {
    id: string;
  };
}

interface ApiResponse {
  data: Chain;
}

export default function EditChainPage({ params }: EditChainPageProps) {
  const router = useRouter();
  const [chain, setChain] = useState<Chain | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const setCurrentChain = useChainsStore((state) => state.setCurrentChain);

  // Form state
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [chainDescription, setChainDescription] = useState("");
  const [gallery, setGallery] = useState<File[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [twitchUrl, setTwitchUrl] = useState("");
  const [launchDate, setLaunchDate] = useState<Date | undefined>(undefined);
  const [launchNow, setLaunchNow] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchChainData = async () => {
      try {
        const chainId = decodeURIComponent(params.id);
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").trim();
        const requestUrl = `${apiUrl}/api/v1/chains/${chainId}`;

        console.log("Fetching chain for edit:", requestUrl);

        const response = await fetch(requestUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API request failed:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          notFound();
          return;
        }

        const data: ApiResponse = await response.json();

        if (!data.data) {
          console.error("API returned no chain data");
          notFound();
          return;
        }

        setChain(data.data);
        // Set current chain in store for breadcrumb
        setCurrentChain(data.data);
        // Initialize form with existing data
        setChainDescription(data.data.chain_description || "");
        if (data.data.scheduled_launch_time) {
          setLaunchDate(new Date(data.data.scheduled_launch_time));
        }
        // TODO: Load image and social URLs from chain metadata when available
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chain:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load chain"
        );
        setLoading(false);
      }
    };

    fetchChainData();
  }, [params.id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate logo
    if (logo) {
      if (logo.size > 15 * 1024 * 1024) {
        newErrors.logo = "Logo must be less than 15MB";
      }
      if (!["image/jpeg", "image/png", "image/gif"].includes(logo.type)) {
        newErrors.logo = "Logo must be JPG, PNG, or GIF";
      }
    }

    // Validate description
    if (chainDescription && chainDescription.length < 10) {
      newErrors.chainDescription = "Description must be at least 10 characters";
    }
    if (chainDescription && chainDescription.length > 500) {
      newErrors.chainDescription = "Description must be at most 500 characters";
    }

    // Validate gallery
    for (let i = 0; i < gallery.length; i++) {
      const file = gallery[i];
      if (file.size > 30 * 1024 * 1024) {
        newErrors.gallery = "Each file must be less than 30MB";
        break;
      }
      if (
        !["image/jpeg", "image/png", "image/gif", "video/mp4"].includes(
          file.type
        )
      ) {
        newErrors.gallery = "Gallery files must be JPG, PNG, GIF, or MP4";
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!chain) return;

    // Validate form
    if (!validateForm()) {
      setError("Please fix the validation errors before saving");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").trim();
      const requestUrl = `${apiUrl}/api/v1/chains/${chain.id}`;

      const updateData: any = {
        chain_description: chainDescription,
      };

      // Add launch date if changed
      if (launchNow) {
        updateData.scheduled_launch_time = new Date().toISOString();
      } else if (launchDate) {
        updateData.scheduled_launch_time = launchDate.toISOString();
      }

      // TODO: Add image and social URLs to metadata when backend supports it
      // TODO: Upload logo and gallery files to media API
      // For now, we'll just update the description and launch date

      const response = await fetch(requestUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update chain: ${errorText}`);
      }

      // Exit edit mode and redirect to the chain detail page
      setIsEditMode(false);
      router.push(`/chain/${chain.id}`);
    } catch (error) {
      console.error("Error saving chain:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save changes"
      );
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (chain) {
      setChainDescription(chain.chain_description || "");
      if (chain.scheduled_launch_time) {
        setLaunchDate(new Date(chain.scheduled_launch_time));
      }
      setLaunchNow(false);
      setLogo(null);
      setLogoPreview("");
      setGallery([]);
    }
    setIsEditMode(false);
    setError(null);
    setErrors({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading chain data...</div>
      </div>
    );
  }

  if (error && !chain) {
    notFound();
    return null;
  }

  if (!chain) {
    notFound();
    return null;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="gap-2 mb-6 !px-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Chain
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {chain.chain_name}{" "}
              <span className="text-primary">${chain.token_symbol}</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Update your chain information
            </p>
          </div>
          {!isEditMode ? (
            <Button onClick={() => setIsEditMode(true)} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Chain
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={saving}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Branding & Media */}
        <Card>
          <CardHeader>
            <CardTitle>Branding & Media</CardTitle>
            <CardDescription>
              Add visual identity and content for your chain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-12">
            {/* Logo Section */}
            <div>
              <h3 className="text-2xl font-semibold mb-2">Logo</h3>
              <p className="text-muted-foreground mb-6">
                This appears in wallets, explorers, and trading interfaces.
              </p>
              <div className="flex items-start gap-6">
                {/* Logo Upload Box */}
                <div
                  className={cn(
                    "w-40 h-40 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors",
                    isEditMode
                      ? "border-border bg-muted/30 hover:bg-muted/50 cursor-pointer"
                      : "border-border/50 bg-muted/10 cursor-not-allowed"
                  )}
                  onClick={() =>
                    isEditMode && document.getElementById("logo")?.click()
                  }
                >
                  {logo || logoPreview ? (
                    <img
                      src={logo ? URL.createObjectURL(logo) : logoPreview}
                      alt="Logo preview"
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                  <Input
                    id="logo"
                    type="file"
                    accept="image/png,image/jpeg,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setLogo(file);
                      if (file) {
                        setLogoPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                    disabled={!isEditMode}
                  />
                </div>
                {/* Upload Instructions */}
                <div className="flex-1">
                  <button
                    onClick={() =>
                      isEditMode && document.getElementById("logo")?.click()
                    }
                    className={cn(
                      "text-base font-medium underline hover:no-underline mb-2 block",
                      !isEditMode && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!isEditMode}
                  >
                    Upload from device
                  </button>
                  <p className="text-sm text-muted-foreground">
                    1000×1000 pixels recommended. PNG, JPG, or GIF file. Maximum
                    15MB.
                  </p>
                  {(logo || logoPreview) && isEditMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogo(null);
                        setLogoPreview("");
                      }}
                      className="mt-3"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              {errors.logo && (
                <p className="text-xs text-destructive mt-2">{errors.logo}</p>
              )}
            </div>

            {/* Describe your chain Section */}
            <div>
              <h3 className="text-2xl font-semibold mb-6">
                Describe your chain
              </h3>
              <div className="border-2 rounded-lg p-6">
                <Label
                  htmlFor="chainDescription"
                  className="text-base font-semibold mb-4 block"
                >
                  What does your chain do?
                </Label>
                <Textarea
                  id="chainDescription"
                  placeholder="A short explanation of what your blockchain does"
                  value={chainDescription}
                  onChange={(e) => setChainDescription(e.target.value)}
                  className="min-h-[120px] resize-none border-0 shadow-none focus-visible:ring-0 p-0 text-muted-foreground placeholder:text-muted-foreground/50"
                  rows={5}
                  disabled={!isEditMode}
                />
              </div>
              {errors.chainDescription && (
                <p className="text-xs text-destructive mt-2">
                  {errors.chainDescription}
                </p>
              )}
            </div>

            {/* Gallery Section */}
            <div>
              <h3 className="text-2xl font-semibold mb-2">Gallery</h3>
              <p className="text-muted-foreground mb-6">
                This will help your chain stand out and build trust among
                others. We recommend adding at least three images or videos.
              </p>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-16 flex flex-col items-center justify-center transition-colors",
                  isEditMode
                    ? "border-border bg-muted/30 hover:bg-muted/50 cursor-pointer"
                    : "border-border/50 bg-muted/10 cursor-not-allowed"
                )}
                onClick={() =>
                  isEditMode && document.getElementById("gallery")?.click()
                }
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-base text-foreground">
                  Upload from your device.
                </p>
                <Input
                  id="gallery"
                  type="file"
                  accept="image/png,image/jpeg,image/gif,video/mp4"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setGallery([...gallery, ...files]);
                  }}
                  className="hidden"
                  disabled={!isEditMode}
                />
              </div>

              {/* Gallery Preview */}
              {gallery.length > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {gallery.map((file, index) => (
                    <div
                      key={index}
                      className="relative group aspect-video border-2 rounded-lg overflow-hidden"
                    >
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {isEditMode && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newGallery = gallery.filter(
                              (_, i) => i !== index
                            );
                            setGallery(newGallery);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {errors.gallery && (
                <p className="text-xs text-destructive mt-2">
                  {errors.gallery}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Launch Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Launch Settings
            </CardTitle>
            <CardDescription>
              Configure when your chain will launch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="launchNow" className="text-base font-medium">
                  Launch Now
                </Label>
                <p className="text-sm text-muted-foreground">
                  Immediately launch your chain and start trading
                </p>
              </div>
              <Switch
                id="launchNow"
                checked={launchNow}
                onCheckedChange={setLaunchNow}
                disabled={!isEditMode}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-700"
              />
            </div>

            {!launchNow && (
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Scheduled Launch Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-gray-700 h-12",
                        !launchDate && "text-muted-foreground"
                      )}
                      disabled={!isEditMode}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {launchDate ? (
                        <span className="text-base">
                          {format(launchDate, "PPP")}
                        </span>
                      ) : (
                        <span className="text-base">Pick a launch date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={launchDate}
                      onSelect={setLaunchDate}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-muted-foreground">
                  Your chain will become active on this date
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Media Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Media & Links
            </CardTitle>
            <CardDescription>
              Add links to your project's website and media content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="websiteUrl" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Label>
              <Input
                id="websiteUrl"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourproject.com"
                disabled={!isEditMode}
                className="border border-gray-700 focus-visible:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeUrl" className="flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                YouTube
              </Label>
              <Input
                id="youtubeUrl"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/@yourproject"
                disabled={!isEditMode}
                className="border border-gray-700 focus-visible:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitchUrl" className="flex items-center gap-2">
                <Twitch className="h-4 w-4" />
                Twitch
              </Label>
              <Input
                id="twitchUrl"
                value={twitchUrl}
                onChange={(e) => setTwitchUrl(e.target.value)}
                placeholder="https://twitch.tv/yourproject"
                disabled={!isEditMode}
                className="border border-gray-700 focus-visible:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Networks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Twitter className="h-5 w-5" />
              Social Networks
            </CardTitle>
            <CardDescription>
              Connect your social media accounts to build community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twitterUrl" className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter / X
              </Label>
              <Input
                id="twitterUrl"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="https://twitter.com/yourproject"
                disabled={!isEditMode}
                className="border border-gray-700 focus-visible:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegramUrl" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Telegram
              </Label>
              <Input
                id="telegramUrl"
                value={telegramUrl}
                onChange={(e) => setTelegramUrl(e.target.value)}
                placeholder="https://t.me/yourproject"
                disabled={!isEditMode}
                className="border border-gray-700 focus-visible:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </Label>
              <Input
                id="githubUrl"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/yourproject"
                disabled={!isEditMode}
                className="border border-gray-700 focus-visible:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Read-only Chain Details */}
        <Card>
          <CardHeader>
            <CardTitle>Chain Details</CardTitle>
            <CardDescription>
              Core chain information (read-only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Chain Name</Label>
                <p className="font-medium">{chain.chain_name}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Token Symbol</Label>
                <p className="font-medium">${chain.token_symbol}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Chain ID</Label>
                <p className="font-mono text-sm">{chain.id}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Status</Label>
                <p className="font-medium capitalize">
                  {chain.status.replace(/_/g, " ")}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">
                  Total Token Supply
                </Label>
                <p className="font-medium">
                  {chain.token_total_supply.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">
                  Graduation Threshold
                </Label>
                <p className="font-medium">
                  {chain.graduation_threshold.toLocaleString()} CNPY
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Created At</Label>
                <p className="font-medium">
                  {new Date(chain.created_at).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">
                  Consensus Mechanism
                </Label>
                <p className="font-medium">{chain.consensus_mechanism}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
