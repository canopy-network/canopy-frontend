/**
 * @fileoverview Users API Client
 *
 * This file contains API functions for user profile management.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api";

/**
 * User profile update request
 */
export interface UpdateProfileRequest {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  website_url?: string;
  twitter_handle?: string;
  github_username?: string;
  telegram_handle?: string;
}

/**
 * User profile update response
 */
export interface UpdateProfileResponse {
  message: string;
  user: {
    id: string;
    email: string;
    wallet_address: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    bio: string | null;
    github_username: string | null;
    telegram_handle: string | null;
    twitter_handle: string | null;
    website_url: string | null;
    is_verified: boolean;
    email_verified_at: string | null;
    verification_tier: string;
    reputation_score: number;
    total_chains_created: number;
    total_cnpy_invested: number;
    created_at: string;
    updated_at: string;
    last_active_at: string | null;
  };
}

/**
 * Updates the authenticated user's profile information
 * @param data - Profile fields to update (all optional)
 * @returns Promise with the API response
 */
export async function updateProfile(
  data: UpdateProfileRequest
): Promise<ApiResponse<UpdateProfileResponse>> {
  return apiClient.put<UpdateProfileResponse>("/api/v1/users/profile", data);
}

/**
 * Upload user media (avatar or banner) response
 */
export interface UploadUserMediaResponse {
  success: boolean;
  message: string;
  url: string;
  type: "avatar" | "banner";
}

/**
 * Uploads a user profile image (avatar or banner) to S3
 * @param userId - User ID
 * @param file - Image file to upload
 * @param type - Type of media (avatar or banner)
 * @returns Promise with the upload response including the S3 URL
 */
export async function uploadUserMedia(
  userId: string,
  file: File,
  type: "avatar" | "banner"
): Promise<UploadUserMediaResponse> {
  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("type", type);
  formData.append("file", file);

  const response = await fetch("/api/canopy-user-media", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload image");
  }

  return response.json();
}
