import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Set a high stale time (24 hours) since Quranic content is static/immutable
        staleTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: true,
        retry: 1,
      },
    },
  });
}
