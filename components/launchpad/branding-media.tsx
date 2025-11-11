"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Upload,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Trash2,
  GripVertical,
} from "lucide-react";
import { showErrorToast } from "@/lib/utils/error-handler";

interface GalleryItem {
  file: File;
  preview: string;
  type: "image" | "video";
  customName?: string;
}

// Video validation constants
const ALLOWED_VIDEO_TYPES = [
  "video/webm",
  "video/mp4",
  "video/x-msvideo", // AVI
  "video/quicktime", // MOV
];
const ALLOWED_VIDEO_EXTENSIONS = /\.(webm|mp4|avi|mov)$/i;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

interface BrandingMediaProps {
  initialData?: {
    logo?: File | null;
    logoUrl?: string; // For existing logo preview
    chainDescription?: string;
    gallery?: File[];
    existingGalleryUrls?: Array<{
      url: string;
      type: "image" | "video";
      id?: string;
    }>; // For existing gallery previews
    brandColor?: string;
  };
  onDataSubmit?: (
    data: {
      logo: File | null;
      chainDescription: string;
      gallery: File[];
      brandColor: string;
    },
    isValid: boolean
  ) => void;
}

export default function BrandingMedia({
  initialData,
  onDataSubmit,
}: BrandingMediaProps) {
  // Generate a random hex color
  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const [logo, setLogo] = useState<File | null>(initialData?.logo || null);
  const [logoUrl, setLogoUrl] = useState<string | null>(
    initialData?.logoUrl || null
  );
  const [chainDescription, setChainDescription] = useState(
    initialData?.chainDescription || ""
  );
  const [gallery, setGallery] = useState<File[]>(initialData?.gallery || []);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<
    Array<{ url: string; type: "image" | "video"; id?: string }>
  >(initialData?.existingGalleryUrls || []);
  const [brandColor, setBrandColor] = useState<string>(
    initialData?.brandColor || ""
  );
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [editingNameIndex, setEditingNameIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate random color when logo is set (only once)
  useEffect(() => {
    if ((logo || logoUrl) && !brandColor) {
      setBrandColor(generateRandomColor());
    }
  }, [logo, logoUrl, brandColor]);

  // Update logoUrl when initialData changes
  useEffect(() => {
    if (initialData?.logoUrl && !logo) {
      setLogoUrl(initialData.logoUrl);
    }
  }, [initialData?.logoUrl, logo]);

  // Update existing gallery URLs when initialData changes
  useEffect(() => {
    if (initialData?.existingGalleryUrls) {
      setExistingGalleryUrls(initialData.existingGalleryUrls);
    }
  }, [initialData?.existingGalleryUrls]);

  // Initialize gallery items from files and existing URLs
  useEffect(() => {
    // Create items from existing URLs (these are read-only previews)
    const existingItems: GalleryItem[] = existingGalleryUrls.map((item) => ({
      file: new File([], item.url.split("/").pop() || "existing", {
        type: item.type === "video" ? "video/mp4" : "image/png",
      }),
      preview: item.url,
      type: item.type,
    }));

    // Create items from new file uploads
    const newItems: GalleryItem[] = gallery.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("image/") ? "image" : "video",
    }));

    const allItems = [...existingItems, ...newItems];
    setGalleryItems(allItems);

    // Reset current index if out of bounds
    setCurrentGalleryIndex((prevIndex) => {
      if (prevIndex >= allItems.length && allItems.length > 0) {
        return 0;
      } else if (allItems.length === 0) {
        return 0;
      }
      return prevIndex;
    });

    // Cleanup URLs for new file uploads only
    return () => {
      newItems.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [gallery, existingGalleryUrls]);

  // Notify parent when data changes
  useEffect(() => {
    if (onDataSubmit) {
      // Logo is valid if we have either a new file or an existing URL
      const isValid =
        (logo !== null || logoUrl !== null) && chainDescription.length >= 10;
      onDataSubmit({ logo, chainDescription, gallery, brandColor }, isValid);
    }
  }, [logo, logoUrl, chainDescription, gallery, brandColor, onDataSubmit]);

  // Validation functions
  const isValidVideoFormat = (file: File): boolean => {
    return (
      ALLOWED_VIDEO_TYPES.includes(file.type) ||
      ALLOWED_VIDEO_EXTENSIONS.test(file.name)
    );
  };

  const isValidVideoSize = (file: File): boolean => {
    return file.size <= MAX_VIDEO_SIZE;
  };

  const validateVideoFile = (
    file: File
  ): { valid: boolean; error?: string } => {
    if (
      !file.type.startsWith("video/") &&
      !ALLOWED_VIDEO_EXTENSIONS.test(file.name)
    ) {
      // Not a video, skip video validation (will be handled as image)
      return { valid: true };
    }

    if (!isValidVideoFormat(file)) {
      return {
        valid: false,
        error: `${file.name}: Invalid video format. Supported formats: WebM, MP4, or H264 (AVI/MOV)`,
      };
    }

    if (!isValidVideoSize(file)) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      return {
        valid: false,
        error: `${file.name}: File size (${sizeMB}MB) exceeds the 100MB limit for videos`,
      };
    }

    return { valid: true };
  };

  // Gallery handlers
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate each file
    files.forEach((file) => {
      // Check if it's a video file
      if (
        file.type.startsWith("video/") ||
        ALLOWED_VIDEO_EXTENSIONS.test(file.name)
      ) {
        const validation = validateVideoFile(file);
        if (!validation.valid) {
          errors.push(validation.error || "Invalid video file");
        } else {
          validFiles.push(file);
        }
      } else {
        // Image files - add without validation (existing behavior)
        validFiles.push(file);
      }
    });

    // Show errors if any
    if (errors.length > 0) {
      errors.forEach((error) => {
        showErrorToast(new Error(error), error);
      });
    }

    // Add valid files (respecting the 10 file limit)
    const remainingSlots = 10 - gallery.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length > 0) {
      setGallery([...gallery, ...filesToAdd]);
    }

    // Warn if some files were skipped due to limit
    if (validFiles.length > remainingSlots) {
      showErrorToast(
        new Error("File limit reached"),
        `Only ${remainingSlots} file(s) were added. Maximum of 10 files allowed.`
      );
    }

    e.target.value = ""; // Reset input
  };

  const handleGalleryRemove = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    setGallery(newGallery);
    if (currentGalleryIndex >= newGallery.length) {
      setCurrentGalleryIndex(Math.max(0, newGallery.length - 1));
    }
  };

  const handleNameClick = (index: number) => {
    setEditingNameIndex(index);
  };

  const handleNameEdit = (index: number, newName: string) => {
    const updatedItems = [...galleryItems];
    updatedItems[index].customName = newName;
    setGalleryItems(updatedItems);
  };

  const handleNameBlur = () => {
    setEditingNameIndex(null);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setEditingNameIndex(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newGallery = [...gallery];
    const draggedItem = newGallery[draggedIndex];
    newGallery.splice(draggedIndex, 1);
    newGallery.splice(index, 0, draggedItem);

    setGallery(newGallery);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Add your branding</h1>
          <p className="text-muted-foreground">
            Make your chain stand out with custom branding
          </p>
        </div>

        {/* Logo Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Logo</Label>
          <p className="text-sm text-muted-foreground">
            This appears in wallets, explorers, and trading interfaces.
          </p>

          {logo || logoUrl ? (
            /* Show file card when logo is set */
            <Card className="p-4">
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <img
                    src={logo ? URL.createObjectURL(logo) : logoUrl || ""}
                    alt="Logo preview"
                    className="w-20 h-20 rounded-lg object-cover border border-border"
                  />
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {logo ? logo.name : "Current Logo"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {logo
                      ? `${(logo.size / 1024).toFixed(2)} KB`
                      : "Existing logo"}
                  </p>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setLogo(null);
                    setLogoUrl(null);
                  }}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ) : (
            /* Show upload area when no logo */
            <div
              className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById("logo")?.click()}
            >
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-base font-medium mb-1">Upload from device</p>
              <p className="text-sm text-muted-foreground">
                1000×1000 pixels recommended. PNG or JPG file.
              </p>
            </div>
          )}

          <Input
            id="logo"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => setLogo(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>

        {/* Brand Color Section - Only show when logo is set */}
        {logo && (
          <div className="space-y-3">
            <Label className="text-base font-medium">Brand Color</Label>
            <p className="text-sm text-muted-foreground">
              Choose a primary color that represents your brand
            </p>

            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={brandColor}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow valid hex color format
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === "") {
                    setBrandColor(value);
                  }
                }}
                placeholder="#000000"
                className="flex-1 max-w-xs"
              />
            </div>
          </div>
        )}

        {/* Describe your chain Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Describe your chain</Label>
          <Textarea
            id="chainDescription"
            placeholder="e.g., Integrated with Canopy's robust infrastructure, our platform is designed to enhance the way digital assets are managed and exchanged..."
            value={chainDescription}
            onChange={(e) => setChainDescription(e.target.value)}
            className="min-h-[160px] resize-none"
            maxLength={500}
          />
          <p className="text-sm text-muted-foreground">
            A detailed description of your blockchain&apos;s purpose and
            features. Example: &quot;A revolutionary blockchain designed
            specifically for gaming applications, enabling seamless in-game
            asset transactions...&quot;
          </p>
          <p className="text-sm text-muted-foreground">
            {chainDescription.length}/500 characters
          </p>
        </div>

        {/* Gallery Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-base font-medium">Gallery</Label>
            <Badge variant="secondary" className="text-xs">
              Optional
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            This will help your chain stand out and build trust among others. We
            recommend adding at least three images or videos.
          </p>

          {galleryItems.length === 0 && existingGalleryUrls.length === 0 ? (
            /* Upload Area - Show when no gallery items */
            <div
              className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => galleryInputRef.current?.click()}
            >
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-base font-medium mb-1">
                Upload from your device.
              </p>
              <p className="text-sm text-muted-foreground">
                Add up to 10 images or videos. Images: PNG, JPG. Videos: WebM,
                MP4, H264 (max 100MB).
              </p>
            </div>
          ) : (
            /* Gallery Preview - Show when items exist */
            <div className="space-y-4">
              {/* Main Preview */}
              <Card className="p-4">
                <div className="relative">
                  {/* Left Arrow on Main Preview */}
                  {currentGalleryIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setCurrentGalleryIndex(currentGalleryIndex - 1)
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                  )}

                  {/* Right Arrow on Main Preview */}
                  {currentGalleryIndex < galleryItems.length - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setCurrentGalleryIndex(currentGalleryIndex + 1)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  )}

                  {galleryItems[currentGalleryIndex] &&
                    (galleryItems[currentGalleryIndex].type === "image" ? (
                      <img
                        src={galleryItems[currentGalleryIndex].preview}
                        alt={`Gallery item ${currentGalleryIndex + 1}`}
                        className="w-full h-80 object-contain rounded-lg bg-muted"
                      />
                    ) : (
                      <video
                        src={galleryItems[currentGalleryIndex].preview}
                        controls
                        className="w-full h-80 rounded-lg bg-muted"
                      />
                    ))}
                </div>

                {/* Current item info with editable name */}
                {galleryItems[currentGalleryIndex] && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex-1 min-w-0 mr-4">
                      {editingNameIndex === currentGalleryIndex ? (
                        <Input
                          value={
                            galleryItems[currentGalleryIndex].customName ||
                            galleryItems[currentGalleryIndex].file.name
                          }
                          onChange={(e) =>
                            handleNameEdit(currentGalleryIndex, e.target.value)
                          }
                          onBlur={handleNameBlur}
                          onKeyDown={handleNameKeyDown}
                          autoFocus
                          className="font-medium"
                        />
                      ) : (
                        <p
                          className="font-medium cursor-text hover:bg-muted px-2 py-1 -mx-2 -my-1 rounded transition-colors truncate"
                          onClick={() => handleNameClick(currentGalleryIndex)}
                          title="Click to edit name"
                        >
                          {galleryItems[currentGalleryIndex].customName ||
                            galleryItems[currentGalleryIndex].file.name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentGalleryIndex + 1} of {galleryItems.length}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleGalleryRemove(currentGalleryIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </Card>

              {/* Thumbnail Scrollable List */}
              <div className="flex gap-3 p-1 overflow-hidden">
                {/* Add More Button - Fixed Position */}
                <Card
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex-shrink-0 w-32 h-24 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Upload className="w-6 h-6" />
                    <p className="text-xs font-medium">Add more</p>
                  </div>
                </Card>

                {/* Scrollable Container */}
                <div
                  ref={scrollContainerRef}
                  className="flex gap-3 p-1 overflow-x-auto scrollbar-hide flex-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {/* Gallery Items */}
                  {galleryItems.map((item, index) => (
                    <Card
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setCurrentGalleryIndex(index)}
                      className={`relative flex-shrink-0 w-32 cursor-pointer overflow-hidden group ${
                        currentGalleryIndex === index
                          ? "ring-2 ring-primary"
                          : "hover:ring-2 hover:ring-primary/50"
                      } ${draggedIndex === index ? "opacity-50" : ""}`}
                    >
                      {/* Drag handle */}
                      <div className="absolute top-1 left-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-background/80 rounded p-1">
                          <GripVertical className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Delete button */}
                      <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGalleryRemove(index);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Thumbnail */}
                      {item.type === "image" ? (
                        <img
                          src={item.preview}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-24 bg-muted flex items-center justify-center">
                          <video
                            src={item.preview}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs font-medium">
                            VIDEO
                          </div>
                        </div>
                      )}

                      {/* Order number */}
                      <div className="absolute bottom-1 right-1">
                        <div className="bg-background/80 rounded px-1.5 py-0.5 text-xs font-medium">
                          {index + 1}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*,video/webm,video/mp4,video/x-msvideo,video/quicktime,.webm,.mp4,.avi,.mov"
            multiple
            onChange={handleGalleryUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
