import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Turn off retries for testing to make them fast
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
