"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Rocket, Link as LinkIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export function ChainSuccessBanner() {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [chainName, setChainName] = useState("");

  useEffect(() => {
    const success = searchParams.get("success");
    const name = searchParams.get("name");

    if (success === "true" && name) {
      setIsVisible(true);
      setChainName(name);

      // Auto-hide after 15 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 15000);

      // Clean up URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("name");
      window.history.replaceState({}, "", url.toString());

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleShare = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Copied to clipboard", {
        position: "bottom-right",
        duration: 3000,
        style: {
          background: "hsl(var(--muted))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
      });
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="rounded-xl border text-card-foreground shadow bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/50 mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-4 p-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20">
          <Rocket className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Congratulations! Your chain is now live
          </h3>
          <p className="text-sm text-muted-foreground">
            {chainName} has been successfully launched. Share it with your
            community to start building momentum and attract holders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8"
            onClick={handleShare}
          >
            <LinkIcon className="w-4 h-4" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8"
            onClick={() => setIsVisible(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
