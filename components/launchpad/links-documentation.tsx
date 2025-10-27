"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, FileText, Twitter } from "lucide-react";

interface LinksDocumentationProps {
  initialData?: {
    website?: string;
    whitepaper?: string;
    whitepaperFile?: File | null;
    twitterUrl?: string;
    telegramUrl?: string;
  };
  onDataSubmit?: (
    data: {
      website: string;
      whitepaper: string;
      whitepaperFile: File | null;
      twitterUrl: string;
      telegramUrl: string;
    },
    isValid: boolean
  ) => void;
}

export default function LinksDocumentation({
  initialData,
  onDataSubmit,
}: LinksDocumentationProps) {
  const [website, setWebsite] = useState(initialData?.website || "");
  const [whitepaper, setWhitepaper] = useState(initialData?.whitepaper || "");
  const [whitepaperFile, setWhitepaperFile] = useState<File | null>(
    initialData?.whitepaperFile || null
  );
  const [twitterUrl, setTwitterUrl] = useState(initialData?.twitterUrl || "");
  const [telegramUrl, setTelegramUrl] = useState(
    initialData?.telegramUrl || ""
  );

  // Validate URLs
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Notify parent when data changes
  useEffect(() => {
    if (onDataSubmit) {
      const isValid = Boolean(website && isValidUrl(website));
      onDataSubmit(
        { website, whitepaper, whitepaperFile, twitterUrl, telegramUrl },
        isValid
      );
    }
  }, [website, whitepaper, whitepaperFile, twitterUrl, telegramUrl]);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Links & Documentation</h1>
          <p className="text-muted-foreground">
            Add your web presence and documentation links.
          </p>
        </div>

        {/* Form Fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website *
            </Label>
            <Input
              id="website"
              placeholder="https://mychain.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="whitepaper" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Whitepaper URL
            </Label>
            <Input
              id="whitepaper"
              placeholder="https://docs.mychain.com/whitepaper.pdf"
              value={whitepaper}
              onChange={(e) => setWhitepaper(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="whitepaperFile">
              Or Upload Whitepaper (PDF, ≤15MB)
            </Label>
            <Input
              id="whitepaperFile"
              type="file"
              accept=".pdf"
              onChange={(e) => setWhitepaperFile(e.target.files?.[0] || null)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="twitterUrl" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Twitter / X
            </Label>
            <Input
              id="twitterUrl"
              placeholder="https://x.com/mychain"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="telegramUrl">Telegram</Label>
            <Input
              id="telegramUrl"
              placeholder="https://t.me/mychain"
              value={telegramUrl}
              onChange={(e) => setTelegramUrl(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
