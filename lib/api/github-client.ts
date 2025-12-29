import { createApiClient } from "./client";

export const githubApiClient = createApiClient({
  baseURL: "https://api.github.com",
});

export const githubOAuthClient = createApiClient({
  baseURL: "https://github.com",
});
