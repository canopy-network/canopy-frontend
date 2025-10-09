/**
 * @fileoverview Media Upload API Client
 *
 * This module provides functions to upload media files to AWS S3 via the canopy-media endpoint.
 * Used primarily in the create-chain-wizard for uploading branding, media, and whitepaper files.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

export type FileCategory = "branding" | "media" | "papers";

export interface UploadResult {
  url: string;
  key: string;
  category: FileCategory;
  originalName: string;
}

export interface UploadResponse {
  success: boolean;
  message?: string;
  urls?: UploadResult[];
  error?: string;
  details?: string | string[];
}

/**
 * Upload files to AWS S3 via the canopy-media endpoint
 *
 * @param ticker - Chain ticker symbol (e.g., "ATOM", "OSMO")
 * @param category - File category: "branding", "media", or "papers"
 * @param files - Array of files to upload
 * @returns Promise with upload results containing public URLs
 *
 * @example
 * ```typescript
 * const result = await uploadMedia("ATOM", "branding", [logoFile]);
 * if (result.success) {
 *   console.log("Logo URL:", result.urls[0].url);
 * }
 * ```
 */
export async function uploadMedia(
  ticker: string,
  category: FileCategory,
  files: File[]
): Promise<UploadResponse> {
  try {
    if (!ticker) {
      throw new Error("Ticker is required");
    }

    if (!category || !["branding", "media", "papers"].includes(category)) {
      throw new Error(
        "Valid category is required (branding, media, or papers)"
      );
    }

    if (!files || files.length === 0) {
      throw new Error("At least one file is required");
    }

    // Create FormData
    const formData = new FormData();
    formData.append("ticker", ticker.toUpperCase());
    formData.append("category", category);

    // Append files with indexed keys
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    // Send request
    const response = await fetch("/api/canopy-media", {
      method: "POST",
      body: formData,
    });

    const data: UploadResponse = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || `Upload failed with status ${response.status}`
      );
    }

    return data;
  } catch (error: any) {
    console.error("Error uploading media:", error);
    return {
      success: false,
      error: error.message || "Failed to upload files",
    };
  }
}

/**
 * Upload a single file to AWS S3
 *
 * @param ticker - Chain ticker symbol
 * @param category - File category
 * @param file - Single file to upload
 * @returns Promise with upload result containing public URL
 *
 * @example
 * ```typescript
 * const result = await uploadSingleFile("ATOM", "branding", logoFile);
 * if (result.success && result.urls) {
 *   console.log("File URL:", result.urls[0].url);
 * }
 * ```
 */
export async function uploadSingleFile(
  ticker: string,
  category: FileCategory,
  file: File
): Promise<UploadResponse> {
  return uploadMedia(ticker, category, [file]);
}

/**
 * Upload logo (branding) file
 *
 * @param ticker - Chain ticker symbol
 * @param logoFile - Logo image file
 * @returns Promise with upload result
 */
export async function uploadLogo(
  ticker: string,
  logoFile: File
): Promise<UploadResponse> {
  return uploadSingleFile(ticker, "branding", logoFile);
}

/**
 * Upload multiple media/gallery files
 *
 * @param ticker - Chain ticker symbol
 * @param mediaFiles - Array of media files
 * @returns Promise with upload results
 */
export async function uploadGallery(
  ticker: string,
  mediaFiles: File[]
): Promise<UploadResponse> {
  return uploadMedia(ticker, "media", mediaFiles);
}

/**
 * Upload whitepaper (PDF) file
 *
 * @param ticker - Chain ticker symbol
 * @param pdfFile - Whitepaper PDF file
 * @returns Promise with upload result
 */
export async function uploadWhitepaper(
  ticker: string,
  pdfFile: File
): Promise<UploadResponse> {
  return uploadSingleFile(ticker, "papers", pdfFile);
}
