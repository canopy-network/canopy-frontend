"use client";

import { useState } from "react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Copy, Check } from "lucide-react";
import { showSuccessToast } from "@/lib/utils/error-handler";
import { QRCodeSVG } from "qrcode.react";

interface ReceiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiveDialog({
  open,
  onOpenChange,
}: ReceiveDialogProps) {
  const { currentWallet } = useWalletStore();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (currentWallet) {
      navigator.clipboard.writeText(currentWallet.address);
      setCopied(true);
      showSuccessToast("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (!currentWallet) return;

    // Get the QR code SVG
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    // Convert SVG to canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      // Download as PNG
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `canopy-wallet-${currentWallet.address.slice(0, 8)}.png`;
          a.click();
          URL.revokeObjectURL(url);
          showSuccessToast("QR code downloaded");
        }
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (!currentWallet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Receive Tokens
          </DialogTitle>
          <DialogDescription>
            Share your wallet address to receive CNPY tokens
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="address" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          {/* Address Tab */}
          <TabsContent value="address" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-address">Your Wallet Address</Label>
              <div className="flex gap-2">
                <Input
                  id="wallet-address"
                  value={currentWallet.address}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyAddress}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This is your public wallet address. Anyone can send tokens to this address.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium">Wallet Name</p>
              <p className="text-sm text-muted-foreground">
                {currentWallet.wallet_name || "Unnamed Wallet"}
              </p>
            </div>

            <div className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg space-y-1">
              <p className="text-sm font-medium text-blue-500">Important</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Only send Canopy (CNPY) tokens to this address</li>
                <li>• Sending other tokens may result in permanent loss</li>
                <li>• Always verify the address before sharing</li>
              </ul>
            </div>
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qr" className="space-y-4 py-4">
            <div className="space-y-4">
              {/* QR Code Display */}
              <div className="flex justify-center p-6 bg-white rounded-lg">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={currentWallet.address}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Wallet Name */}
              <div className="text-center">
                <p className="text-sm font-medium">
                  {currentWallet.wallet_name || "Unnamed Wallet"}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  {currentWallet.address.slice(0, 10)}...{currentWallet.address.slice(-8)}
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleCopyAddress}
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Address
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadQR}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR
                </Button>
              </div>

              {/* Warning */}
              <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-yellow-500">Tip:</span> Scan this QR code with a Canopy-compatible wallet to automatically populate the recipient address.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
