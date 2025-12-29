import { ApiClient } from "./client";

const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, "");

const getLocalBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "/api";
  }

  if (process.env.NEXTAUTH_URL) {
    return `${normalizeBaseUrl(process.env.NEXTAUTH_URL)}/api`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }

  return "http://localhost:3000/api";
};

export const localApiClient = new ApiClient({ baseURL: getLocalBaseUrl() });
