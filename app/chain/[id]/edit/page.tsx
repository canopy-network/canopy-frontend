"use client";

import { useEffect, useState, use, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Edit2, X } from "lucide-react";
import { ChainExtended } from "@/types/chains";
import { useChainsStore } from "@/lib/stores/chains-store";
import { chainsApi } from "@/lib/api";
import { apiClient } from "@/lib/api/client";
import { uploadLogo, uploadGallery } from "@/lib/api/media";
import BrandingMedia from "@/components/launchpad/branding-media";
import LinksDocumentation from "@/components/launchpad/links-documentation";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface EditChainPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface SocialLink {
  id: number;
  platform: string;
  url: string;
}

export default function EditChainPage(props: EditChainPageProps) {
  const params = use(props.params);
  const router = useRouter();
  const [chain, setChain] = useState<ChainExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const setCurrentChain = useChainsStore((state) => state.setCurrentChain);

  // Form state from components
  const [brandingData, setBrandingData] = useState<{
    logo: File | null;
    chainDescription: string;
    gallery: File[];
    brandColor: string;
  } | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [brandingValid, setBrandingValid] = useState(false);

  // Track existing assets for updates and previews
  const [existingLogoAsset, setExistingLogoAsset] = useState<{
    id: string;
    file_url: string;
  } | null>(null);
  const [existingGalleryAssets, setExistingGalleryAssets] = useState<
    Array<{
      id: string;
      file_url: string;
      asset_type: string;
      mime_type: string;
    }>
  >([]);
  const [existingResources, setExistingResources] = useState<
    Array<{
      id: string;
      file_url: string;
      file_name: string;
      file_size_bytes: number;
      title?: string | null;
    }>
  >([]);

  useEffect(() => {
    const fetchChainData = async () => {
      try {
        const chainId = decodeURIComponent(params.id);

        // Fetch chain data with all required includes
        const response = await chainsApi.getChain(chainId, {
          include:
            "creator,template,assets,holders,graduation,repository,social_links,graduated_pool,virtual_pool",
        });

        if (!response.data) {
          console.error("API returned no chain data:", {
            responseData: response,
            chainId: chainId,
          });
          notFound();
          return;
        }

        const chainData = response.data as ChainExtended;

        setChain(chainData);
        setCurrentChain(chainData);

        // Extract existing assets
        const logoAsset = chainData.assets?.find(
          (asset) => asset.asset_type === "logo"
        );
        const galleryAssets =
          chainData.assets?.filter(
            (asset) =>
              asset.asset_type === "media" ||
              asset.asset_type === "video" ||
              asset.asset_type === "banner"
          ) || [];
        const resourceAssets =
          chainData.assets?.filter(
            (asset) => asset.asset_type === "documentation"
          ) || [];

        setExistingLogoAsset(logoAsset || null);
        setExistingGalleryAssets(galleryAssets);
        setExistingResources(resourceAssets);

        // Initialize branding data
        setBrandingData({
          logo: null, // New uploads only
          chainDescription: chainData.chain_description || "",
          gallery: [], // New uploads only
          brandColor: chainData.brand_color || "",
        });

        // Initialize social links from existing data
        if (chainData.social_links && chainData.social_links.length > 0) {
          const links: SocialLink[] = chainData.social_links.map(
            (link, index) => ({
              id: typeof link.id === "number" ? link.id : index + 1,
              platform: link.platform,
              url: link.url,
            })
          );
          setSocialLinks(links);
        } else {
          // Default empty social link
          setSocialLinks([{ id: 1, platform: "telegram", url: "" }]);
        }

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
  }, [params.id, setCurrentChain]);

  const handleBrandingSubmit = useCallback(
    (
      data: {
        logo: File | null;
        chainDescription: string;
        gallery: File[];
        brandColor: string;
      },
      isValid: boolean
    ) => {
      setBrandingData(data);
      setBrandingValid(isValid);
    },
    []
  );

  const handleSocialSubmit = useCallback(
    (data: { social: SocialLink[]; resources: unknown[] }) => {
      setSocialLinks(data.social);
    },
    []
  );

  // Memoize initial data to prevent infinite loops
  const brandingInitialData = useMemo(
    () =>
      brandingData
        ? {
            logo: brandingData.logo,
            logoUrl: existingLogoAsset?.file_url,
            chainDescription: brandingData.chainDescription,
            gallery: brandingData.gallery,
            existingGalleryUrls: existingGalleryAssets.map((asset) => ({
              url: asset.file_url,
              type:
                asset.asset_type === "video" ||
                asset.mime_type?.startsWith("video/")
                  ? ("video" as const)
                  : ("image" as const),
              id: asset.id,
            })),
            brandColor: brandingData.brandColor,
          }
        : undefined,
    [brandingData, existingLogoAsset, existingGalleryAssets]
  );

  const socialInitialData = useMemo(
    () => ({
      social: socialLinks,
      resources: existingResources.map((resource) => ({
        id: parseInt(resource.id) || Date.now(),
        type: "url" as const,
        name: resource.file_name,
        url: resource.file_url,
        size: 0,
        title: resource.title || resource.file_name,
      })),
    }),
    [socialLinks, existingResources]
  );

  const handleSave = async () => {
    if (!chain || !brandingData) return;

    setSaving(true);
    setError(null);

    try {
      const chainId = chain.id;

      // Step 1: Upload logo to S3 if a new one is selected
      if (brandingData.logo) {
        const logoUploadResult = await uploadLogo(
          chain.token_symbol,
          brandingData.logo
        );

        if (!logoUploadResult.success || !logoUploadResult.urls?.[0]) {
          throw new Error(logoUploadResult.error || "Failed to upload logo");
        }

        const logoUrl = logoUploadResult.urls[0].url;

        const logoAssetData = {
          asset_type: "logo" as const,
          file_name: brandingData.logo.name,
          file_url: logoUrl,
          file_size_bytes: brandingData.logo.size,
          mime_type: brandingData.logo.type,
          is_primary: true,
          is_featured: true,
          is_active: true,
        };

        if (existingLogoAsset) {
          await chainsApi.updateAsset(
            chainId,
            existingLogoAsset.id,
            logoAssetData
          );
        } else {
          await chainsApi.createAsset(chainId, logoAssetData);
        }
      }

      // Step 2: Upload gallery files to S3 if any are selected
      if (brandingData.gallery.length > 0) {
        const galleryUploadResult = await uploadGallery(
          chain.token_symbol,
          brandingData.gallery
        );

        if (!galleryUploadResult.success || !galleryUploadResult.urls) {
          throw new Error(
            galleryUploadResult.error || "Failed to upload gallery"
          );
        }

        // Create assets for each uploaded gallery file
        for (let i = 0; i < galleryUploadResult.urls.length; i++) {
          const uploadedFile = galleryUploadResult.urls[i];
          const originalFile = brandingData.gallery[i];

          const galleryAssetData = {
            asset_type: originalFile.type.startsWith("video/")
              ? ("video" as const)
              : ("media" as const),
            file_name: uploadedFile.originalName,
            file_url: uploadedFile.url,
            file_size_bytes: originalFile.size,
            mime_type: originalFile.type,
            is_primary: false,
            is_featured: true,
            is_active: true,
            display_order: existingGalleryAssets.length + i,
          };

          await chainsApi.createAsset(chainId, galleryAssetData);
        }
      }

      // Step 3: Update chain description
      if (brandingData.chainDescription !== chain.chain_description) {
        await apiClient.patch<ChainExtended>(`/api/v1/chains/${chainId}`, {
          chain_description: brandingData.chainDescription,
        });
      }

      // Step 4: Update social links
      // First, get existing social links to compare
      const existingSocialLinks = chain.social_links || [];

      // Delete social links that are no longer present
      for (const existingLink of existingSocialLinks) {
        const stillExists = socialLinks.some(
          (link) => link.platform === existingLink.platform
        );
        if (!stillExists) {
          try {
            await apiClient.delete(
              `/api/v1/chains/${chainId}/socials/${existingLink.id}`
            );
          } catch (err) {
            console.error(
              `Error deleting social link ${existingLink.id}:`,
              err
            );
          }
        }
      }

      // Create or update social links
      for (let i = 0; i < socialLinks.length; i++) {
        const link = socialLinks[i];
        if (!link.url.trim()) continue; // Skip empty links

        const existingLink = existingSocialLinks.find(
          (l) => l.platform === link.platform
        );

        if (existingLink) {
          // Update existing link if URL changed
          if (existingLink.url !== link.url) {
            try {
              await apiClient.put(
                `/api/v1/chains/${chainId}/socials/${existingLink.id}`,
                {
                  platform: link.platform,
                  url: link.url,
                  display_order: i,
                }
              );
            } catch (err) {
              console.error(
                `Error updating social link ${existingLink.id}:`,
                err
              );
            }
          }
        } else {
          // Create new link
          try {
            await chainsApi.createSocial(chainId, {
              platform: link.platform,
              url: link.url,
              display_order: i,
            });
          } catch (err) {
            console.error(
              `Error creating social link for ${link.platform}:`,
              err
            );
          }
        }
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
      setBrandingData({
        logo: null,
        chainDescription: chain.chain_description || "",
        gallery: [],
        brandColor: chain.brand_color || "",
      });

      if (chain.social_links && chain.social_links.length > 0) {
        const links: SocialLink[] = chain.social_links.map((link, index) => ({
          id: typeof link.id === "number" ? link.id : index + 1,
          platform: link.platform,
          url: link.url,
        }));
        setSocialLinks(links);
      } else {
        setSocialLinks([{ id: 1, platform: "telegram", url: "" }]);
      }
    }
    setIsEditMode(false);
    setError(null);
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

  if (!chain || !brandingData) {
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
              Update your chain branding, media, and social links
            </p>
          </div>
          {!isEditMode ? (
            <Button onClick={() => setIsEditMode(true)} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Chain
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={saving || !brandingValid}
                className="gap-2"
              >
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
        {brandingInitialData && (
          <div className={isEditMode ? "" : "pointer-events-none opacity-60"}>
            <BrandingMedia
              initialData={brandingInitialData}
              onDataSubmit={handleBrandingSubmit}
            />
          </div>
        )}

        {/* Social Links */}
        <div className={isEditMode ? "" : "pointer-events-none opacity-60"}>
          <LinksDocumentation
            initialData={socialInitialData}
            onDataSubmit={handleSocialSubmit}
          />
        </div>
      </div>
    </div>
  );
}
