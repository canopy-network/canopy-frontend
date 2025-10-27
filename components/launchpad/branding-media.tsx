"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";

interface BrandingMediaProps {
  initialData?: {
    logo?: File | null;
    chainDescription?: string;
    gallery?: File[];
  };
  onDataSubmit?: (
    data: {
      logo: File | null;
      chainDescription: string;
      gallery: File[];
    },
    isValid: boolean
  ) => void;
}

export default function BrandingMedia({
  initialData,
  onDataSubmit,
}: BrandingMediaProps) {
  const [logo, setLogo] = useState<File | null>(initialData?.logo || null);
  const [chainDescription, setChainDescription] = useState(
    initialData?.chainDescription || ""
  );
  const [gallery, setGallery] = useState<File[]>(initialData?.gallery || []);

  // Notify parent when data changes
  useEffect(() => {
    if (onDataSubmit) {
      const isValid = logo !== null && chainDescription.length >= 10;
      onDataSubmit({ logo, chainDescription, gallery }, isValid);
    }
  }, [logo, chainDescription, gallery]);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Branding & Media</h1>
          <p className="text-muted-foreground">
            Add visual elements to make your chain stand out.
          </p>
        </div>

        {/* Logo Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-2">Logo</h3>
          <p className="text-muted-foreground mb-6">
            This appears in wallets, explorers, and trading interfaces.
          </p>
          <div className="flex items-start gap-6">
            {/* Logo Upload Box */}
            <div
              className="w-40 h-40 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById("logo")?.click()}
            >
              {logo ? (
                <img
                  src={URL.createObjectURL(logo)}
                  alt="Logo preview"
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              <Input
                id="logo"
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => setLogo(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
            {/* Upload Instructions */}
            <div className="flex-1">
              <button
                onClick={() => document.getElementById("logo")?.click()}
                className="text-base font-medium underline hover:no-underline mb-2 block"
              >
                Upload from device
              </button>
              <p className="text-sm text-muted-foreground">
                1000×1000 pixels recommended. PNG or JPG file.
              </p>
              {logo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogo(null);
                  }}
                  className="mt-3"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Describe your chain Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Describe your chain</h3>
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
            />
          </div>
        </div>

        {/* Gallery Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-2">Gallery</h3>
          <p className="text-muted-foreground mb-6">
            This will help your chain stand out and build trust among others. We
            recommend adding at least three images or videos.
          </p>
          <div
            className="border-2 border-dashed border-border rounded-lg p-16 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById("gallery")?.click()}
          >
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-base text-foreground">
              Upload from your device.
            </p>
            <Input
              id="gallery"
              type="file"
              accept="image/png,image/jpeg,video/mp4"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setGallery([...gallery, ...files]);
              }}
              className="hidden"
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
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newGallery = gallery.filter((_, i) => i !== index);
                      setGallery(newGallery);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
