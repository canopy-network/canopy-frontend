import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

/**
 * @fileoverview Canopy Media Upload API
 *
 * This endpoint handles media uploads from the create-chain-wizard (Step 4: Branding & Media).
 * It uploads files to AWS S3 and returns public URLs for the uploaded resources.
 *
 * Supported file types:
 * - Branding: SVG, PNG, WebP, JPEG, GIF (max 1200×1200px, 3MB)
 * - Media: SVG, PNG, WebP, JPEG, GIF (max 3MB)
 * - Papers: PDF (max 3MB)
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

// Initialize S3 client
const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "";

console.log("[KEYS]", process.env.S3_ACCESS_KEY, process.env.S3_SECRET_KEY);
console.log(`[BUCKET_NAME] ${BUCKET_NAME}`);
const CDN_URL =
  process.env.S3_CDN_URL || `https://${BUCKET_NAME}.s3.amazonaws.com`;

// File type validations
const ALLOWED_IMAGE_TYPES = [
  "image/svg+xml",
  "image/png",
  "image/webp",
  "image/jpeg",
  "image/gif",
];
const ALLOWED_PAPER_TYPES = ["application/pdf"];
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_IMAGE_DIMENSION = 1200; // pixels

// File type categories
type FileCategory = "branding" | "media" | "papers";

interface UploadResult {
  url: string;
  key: string;
  category: FileCategory;
  originalName: string;
}

/**
 * Validates file type based on category
 */
function validateFileType(file: File, category: FileCategory): boolean {
  if (category === "papers") {
    return ALLOWED_PAPER_TYPES.includes(file.type);
  }
  return ALLOWED_IMAGE_TYPES.includes(file.type);
}

/**
 * Validates file size
 */
function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

/**
 * Generates a unique filename with the ticker prefix
 */
function generateFileName(
  ticker: string,
  originalName: string,
  category: FileCategory,
  index?: number
): string {
  const extension = originalName.split(".").pop()?.toLowerCase() || "png";
  const upperTicker = ticker.toUpperCase();

  // For media files, add index suffix (e.g., ATOM_1.png, ATOM_2.png)
  if (category === "media" && index !== undefined) {
    return `${upperTicker}_${index}.${extension}`;
  }

  // For branding and papers, use just the ticker
  return `${upperTicker}.${extension}`;
}

/**
 * Uploads a file to S3
 */
async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    // Set cache control for better performance
    CacheControl: "public, max-age=31536000, immutable",
  });

  await s3Client.send(command);

  // Return the public URL
  return `${CDN_URL}/${key}`;
}

/**
 * POST handler for media uploads
 *
 * Expected FormData fields:
 * - ticker: string (required) - Chain ticker symbol (e.g., "ATOM", "OSMO")
 * - category: "branding" | "media" | "papers" (required)
 * - files: File[] (required) - One or more files to upload
 *
 * Returns:
 * {
 *   success: boolean,
 *   urls: UploadResult[],
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check for required environment variables
    if (
      !BUCKET_NAME ||
      !process.env.S3_ACCESS_KEY ||
      !process.env.S3_SECRET_KEY
    ) {
      console.error("Missing AWS configuration environment variables");
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error: AWS credentials not configured",
        },
        { status: 500 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const ticker = formData.get("ticker") as string;
    const category = formData.get("category") as FileCategory;

    // Validate required fields
    if (!ticker) {
      return NextResponse.json(
        {
          success: false,
          error: "Ticker is required",
        },
        { status: 400 }
      );
    }

    if (!category || !["branding", "media", "papers"].includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid category is required (branding, media, or papers)",
        },
        { status: 400 }
      );
    }

    // Get all files from the form data
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file") && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one file is required",
        },
        { status: 400 }
      );
    }

    // Validate all files before uploading
    const validationErrors: string[] = [];
    files.forEach((file, index) => {
      if (!validateFileType(file, category)) {
        validationErrors.push(
          `File ${index + 1} (${file.name}): Invalid file type. ` +
            `Expected ${
              category === "papers" ? "PDF" : "SVG, PNG, WebP, JPEG, or GIF"
            }`
        );
      }
      if (!validateFileSize(file)) {
        validationErrors.push(
          `File ${index + 1} (${file.name}): File size exceeds ${
            MAX_FILE_SIZE / 1024 / 1024
          }MB limit`
        );
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "File validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // Upload files to S3
    const uploadResults: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Generate S3 key (path)
      const fileName = generateFileName(ticker, file.name, category, i + 1);
      const s3Key = `${category}/${fileName}`;

      // Upload to S3
      const publicUrl = await uploadToS3(buffer, s3Key, file.type);

      uploadResults.push({
        url: publicUrl,
        key: s3Key,
        category,
        originalName: file.name,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully uploaded ${uploadResults.length} file(s)`,
        urls: uploadResults,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error uploading to S3:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload files",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/canopy-media",
    method: "POST",
    description:
      "Upload media files to AWS S3 for blockchain branding and media",
    requiredFields: {
      ticker: "string - Chain ticker symbol (e.g., ATOM, OSMO)",
      category: "string - One of: branding, media, papers",
      files:
        "File[] - One or more files to upload (use file0, file1, file2... as keys)",
    },
    fileRequirements: {
      branding: "SVG, PNG, WebP, JPEG, GIF - Max 1200×1200px, 3MB",
      media: "SVG, PNG, WebP, JPEG, GIF - Max 3MB, numbered sequentially",
      papers: "PDF - Max 3MB",
    },
    example: {
      ticker: "ATOM",
      category: "branding",
      file0: "<File object>",
    },
    response: {
      success: true,
      message: "Successfully uploaded N file(s)",
      urls: [
        {
          url: "https://cdn.example.com/branding/ATOM.png",
          key: "branding/ATOM.png",
          category: "branding",
          originalName: "logo.png",
        },
      ],
    },
  });
}
