import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * @fileoverview Canopy User Media Upload API
 *
 * This endpoint handles user profile media uploads (avatar and banner).
 * It uploads files to AWS S3 in user-specific folders and returns public URLs.
 *
 * Supported file types:
 * - Avatar: PNG, WebP, JPEG, GIF (max 2MB, recommended 400×400px)
 * - Banner: PNG, WebP, JPEG, GIF (max 5MB, recommended 1400×400px)
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
const CDN_URL =
  process.env.S3_CDN_URL || `https://${BUCKET_NAME}.s3.amazonaws.com`;

// File type validations
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/webp",
  "image/jpeg",
  "image/gif",
  "image/jpg",
];

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_BANNER_SIZE = 5 * 1024 * 1024; // 5MB

// Media type categories
type MediaType = "avatar" | "banner";

interface UploadResult {
  url: string;
  key: string;
  type: MediaType;
  originalName: string;
}

/**
 * Validates file type
 */
function validateFileType(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type);
}

/**
 * Validates file size based on media type
 */
function validateFileSize(file: File, type: MediaType): boolean {
  const maxSize = type === "avatar" ? MAX_AVATAR_SIZE : MAX_BANNER_SIZE;
  return file.size <= maxSize;
}

/**
 * Generates the S3 key (file path) for user media
 */
function generateS3Key(
  userId: string,
  type: MediaType,
  extension: string
): string {
  const folder = type === "avatar" ? "user_avatar" : "user_banner";
  return `${folder}/${userId}.${extension}`;
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
    CacheControl: "public, max-age=31536000, immutable",
  });

  await s3Client.send(command);

  // Return the public URL
  return `${CDN_URL}/${key}`;
}

/**
 * POST handler for user media uploads
 *
 * Expected FormData fields:
 * - userId: string (required) - User ID
 * - type: "avatar" | "banner" (required)
 * - file: File (required) - Image file to upload
 *
 * Returns:
 * {
 *   success: boolean,
 *   url: string,
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
    const userId = formData.get("userId") as string;
    const type = formData.get("type") as MediaType;
    const file = formData.get("file") as File;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 }
      );
    }

    if (!type || !["avatar", "banner"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid type is required (avatar or banner)",
        },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "File is required",
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateFileType(file)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Expected PNG, WebP, JPEG, or GIF",
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (!validateFileSize(file, type)) {
      const maxSizeMB = type === "avatar" ? 2 : 5;
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds ${maxSizeMB}MB limit for ${type}`,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get file extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "png";

    // Generate S3 key
    const s3Key = generateS3Key(userId, type, extension);

    // Upload to S3
    const publicUrl = await uploadToS3(buffer, s3Key, file.type);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully uploaded ${type}`,
        url: publicUrl,
        type,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error uploading to S3:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload file",
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
    endpoint: "/api/canopy-user-media",
    method: "POST",
    description: "Upload user profile media (avatar and banner) to AWS S3",
    requiredFields: {
      userId: "string - User ID",
      type: "string - One of: avatar, banner",
      file: "File - Image file to upload",
    },
    fileRequirements: {
      avatar: "PNG, WebP, JPEG, GIF - Max 2MB, recommended 400×400px",
      banner: "PNG, WebP, JPEG, GIF - Max 5MB, recommended 1400×400px",
    },
    example: {
      userId: "user-uuid-here",
      type: "avatar",
      file: "<File object>",
    },
    response: {
      success: true,
      message: "Successfully uploaded avatar",
      url: "https://cdn.example.com/user_avatar/user-uuid.png",
      type: "avatar",
    },
  });
}
