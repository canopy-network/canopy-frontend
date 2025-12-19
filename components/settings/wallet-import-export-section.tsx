"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { walletApi } from "@/lib/api/wallet";
import { ApiClientError } from "@/lib/api/client";
import { useWalletStore } from "@/lib/stores/wallet-store";
import {
  ExportWalletResponse,
  ImportWalletRequest,
  ImportWalletResponse,
} from "@/types/wallet";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Download,
  FileText,
  Loader2,
  ShieldCheck,
  Upload,
} from "lucide-react";

type NormalizedImport = {
  request: ImportWalletRequest;
  warnings: string[];
};

function extractAddressMap(payload: any): Record<string, any> | null {
  if (!payload || typeof payload !== "object") return null;

  if (payload.addressMap && typeof payload.addressMap === "object") {
    return payload.addressMap;
  }

  if (payload.data?.addressMap && typeof payload.data.addressMap === "object") {
    return payload.data.addressMap;
  }

  return null;
}

function normalizeImportPayload(rawText: string): NormalizedImport {
  if (!rawText.trim()) {
    throw new Error("Add a keystore JSON file or paste its contents first.");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch (error) {
    throw new Error("The provided JSON could not be parsed. Please verify the format.");
  }

  const addressMap = extractAddressMap(parsed);
  if (!addressMap) {
    throw new Error("Missing addressMap in the import file.");
  }

  const normalized: ImportWalletRequest["addressMap"] = {};
  const warnings: string[] = [];

  Object.entries(addressMap).forEach(([address, value]) => {
    if (!value || typeof value !== "object") {
      warnings.push(`Skipping ${address}: invalid entry.`);
      return;
    }

    const entry = value as Record<string, any>;
    const publicKey = entry.publicKey;
    const salt = entry.salt;
    const encrypted = entry.encrypted;
    const keyAddress = entry.keyAddress || address;
    const keyNickname =
      entry.keyNickname ||
      entry.keyNickName ||
      entry.wallet_name ||
      entry.walletName;

    if (!publicKey || !salt || !encrypted || !keyAddress || !keyNickname) {
      warnings.push(`Skipping ${address}: missing required fields.`);
      return;
    }

    normalized[keyAddress] = {
      publicKey,
      salt,
      encrypted,
      keyAddress,
      keyNickname,
    };
  });

  if (Object.keys(normalized).length === 0) {
    throw new Error(
      warnings.length > 0
        ? "No valid wallets found. Please check the file contents."
        : "No wallets found in the provided file."
    );
  }

  return { request: { addressMap: normalized }, warnings };
}

function formatExportPayload(payload: ExportWalletResponse): string {
  return JSON.stringify({ addressMap: payload.addressMap }, null, 2);
}

function downloadJson(fileName: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function WalletImportExportSection() {
  const fetchWallets = useWalletStore((state) => state.fetchWallets);

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [exportJson, setExportJson] = useState<string>("");
  const [exportCount, setExportCount] = useState<number>(0);

  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<ImportWalletResponse | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [formatWarnings, setFormatWarnings] = useState<string[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [importTab, setImportTab] = useState<"upload" | "paste">("upload");

  const parsedWalletCount = useMemo(() => {
    try {
      const { request } = normalizeImportPayload(importText);
      return Object.keys(request.addressMap).length;
    } catch {
      return 0;
    }
  }, [importText]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await walletApi.exportWallets();
      const formatted = formatExportPayload(response);
      setExportJson(formatted);
      setExportCount(Object.keys(response.addressMap || {}).length);
      setExportDialogOpen(true);

      toast.success("Wallets exported successfully.");
    } catch (error) {
      const friendly =
        error instanceof ApiClientError && error.status === 401
          ? "You need to sign in to export wallets."
          : "Failed to export wallets. Please try again.";
      toast.error(friendly);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyExport = async () => {
    if (!exportJson) return;
    await navigator.clipboard.writeText(exportJson);
    toast.success("Export copied to clipboard.");
  };

  const handleDownloadExport = () => {
    if (!exportJson) return;
    const timestamp = new Date().toISOString().split("T")[0];
    downloadJson(`canopy-keystore-${timestamp}.json`, exportJson);
    toast.success("Keystore downloaded.");
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setImportError("File too large (max 2MB).");
      return;
    }

    try {
      const text = await file.text();
      setImportText(text);
      setSelectedFileName(file.name);
      setImportError(null);
      setImportResult(null);
      setFormatWarnings([]);
      setImportTab("paste");
    } catch (error) {
      setImportError("Could not read the selected file.");
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    setImportError(null);
    setFormatWarnings([]);
    setImportResult(null);

    try {
      const { request, warnings } = normalizeImportPayload(importText);
      if (warnings.length > 0) {
        setFormatWarnings(warnings);
      }

      const response = await walletApi.importWallet(request);
      setImportResult(response);

      const { successful, total } = response.summary;
      if (successful > 0) {
        toast.success(`Imported ${successful} of ${total} wallets.`);
        fetchWallets();
      }
      if (successful === 0) {
        toast.error("No wallets were imported. Please check the file and try again.");
      }
    } catch (error: any) {
      const message =
        error instanceof ApiClientError && error.status === 401
          ? "You need to sign in before importing wallets."
          : error?.message || "Failed to import wallets.";
      setImportError(message);
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  };

  const resetImportState = () => {
    setImportText("");
    setImportError(null);
    setImportResult(null);
    setFormatWarnings([]);
    setSelectedFileName(null);
    setImportTab("upload");
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Wallet backup
        </CardTitle>
        <CardDescription>
          Export encrypted wallets for backup and import them later to restore access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1 max-w-xl">
            <p className="text-sm text-muted-foreground">
              Export creates an encrypted keystore file. Import restores wallets from that file.
            </p>
            <p className="text-xs text-muted-foreground">
              Keep the file safe. Anyone with it and your password can access your funds.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button onClick={handleExport} disabled={isExporting} className="w-full sm:w-auto">
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export wallets
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="w-full sm:w-auto">
              <Upload className="h-4 w-4 mr-2" />
              Import wallets
            </Button>
          </div>
        </div>

        <Separator />

        <div className="rounded-lg border border-dashed border-muted-foreground/40 p-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">Security tip</p>
              <p>
                Store exports offline and never share them. For maximum safety, delete the file after a successful import.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Export dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export wallets
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {exportCount > 0
                ? `Exported ${exportCount} wallet${exportCount === 1 ? "" : "s"}.`
                : "No wallets found to export."}
            </p>

            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <FileText className="h-4 w-4" />
                keystore.json preview
              </div>
              <div className="h-48 max-h-64 overflow-auto rounded-md bg-background p-3 text-xs font-mono border">
                {exportJson ? (
                  <pre className="whitespace-pre-wrap break-all">{exportJson}</pre>
                ) : (
                  <p className="text-muted-foreground">Run an export to see the keystore here.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-wrap justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleCopyExport} disabled={!exportJson}>
                <Clipboard className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
              <Button onClick={handleDownloadExport} disabled={!exportJson}>
                <Download className="h-4 w-4 mr-2" />
                Download file
              </Button>
            </div>
            <Button variant="ghost" onClick={() => setExportDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import dialog */}
      <Dialog open={importDialogOpen} onOpenChange={(open) => {
        setImportDialogOpen(open);
        if (!open) resetImportState();
      }}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import wallets
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Tabs value={importTab} onValueChange={(value) => setImportTab(value as "upload" | "paste")}>
              <TabsList className="grid grid-cols-2 h-full w-full max-w-md mx-auto mb-4 rounded-lg bg-muted/50 p-1 gap-1 border border-border/70">
                <TabsTrigger
                  value="upload"
                  className="h-10 cursor-pointer rounded-md text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-colors"
                >
                  Upload file
                </TabsTrigger>
                <TabsTrigger
                  value="paste"
                  className="h-10 rounded-md cursor-pointer text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-colors"
                >
                  Paste JSON
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4 max-w-xl mx-auto w-full pt-1">
                <Label htmlFor="keystore-file">Keystore file (.json)</Label>
                <Input
                  id="keystore-file"
                  type="file"
                  accept="application/json"
                  onChange={handleFileChange}
                />
                {selectedFileName && (
                  <p className="text-xs text-muted-foreground">Selected: {selectedFileName}</p>
                )}
              </TabsContent>

              <TabsContent value="paste" className="space-y-4 max-w-xl mx-auto w-full pt-1">
                <Label htmlFor="keystore-json">Keystore JSON</Label>
                <Textarea
                  id="keystore-json"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='{"addressMap": { "0x...": { ... } }}'
                  className="min-h-[180px] max-h-64 overflow-auto font-mono text-xs resize-y"
                />
              </TabsContent>
            </Tabs>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>
                Detected wallets: {parsedWalletCount}
              </span>
            </div>

            {formatWarnings.length > 0 && (
              <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  {formatWarnings.length} entr{formatWarnings.length === 1 ? "y" : "ies"} were skipped:
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {formatWarnings.slice(0, 4).map((warning, idx) => (
                    <li key={idx} className="break-words">{warning}</li>
                  ))}
                  {formatWarnings.length > 4 && (
                    <li>+{formatWarnings.length - 4} more</li>
                  )}
                </ul>
              </div>
            )}

            {importError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {importError}
              </div>
            )}

            {importResult && (
              <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-2">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  Import summary
                </div>
                <p className="text-muted-foreground">
                  Successful: {importResult.summary.successful} / {importResult.summary.total}
                </p>
                <div className="max-h-36 overflow-auto rounded bg-background border p-2 font-mono text-xs">
                  {importResult.results.map((result, idx) => (
                    <div
                      key={`${result.address}-${idx}`}
                      className="flex items-center gap-2 py-1 border-b last:border-b-0 border-border/40"
                    >
                      {result.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="truncate max-w-[60%]">{result.address}</span>
                      {!result.success && result.error && (
                        <span className="text-destructive ml-auto text-right text-[11px] break-words">
                          {result.error}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-wrap justify-between gap-2">
            <Button variant="outline" onClick={resetImportState}>
              Reset
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={isImporting || !importText.trim()}>
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import wallets
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
