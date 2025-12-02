"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Query Provider
 *
 * Provides React Query (TanStack Query) context to the application.
 * Creates a QueryClient instance with default configuration.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Prevent automatic refetching on window focus in production
            refetchOnWindowFocus: process.env.NODE_ENV === "development",
            // Retry failed requests
            retry: 1,
            // Consider data stale after 5 minutes
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
