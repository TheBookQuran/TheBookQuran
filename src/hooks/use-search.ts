import { useQuery } from "@tanstack/react-query";
import { getNewSearchResults } from "@/services/quran-api";

export function useSearch(query: string, page = 1, locale = "en") {
  return useQuery({
    queryKey: ["qdc-search", query, page, locale],
    queryFn: () =>
      getNewSearchResults({
        query,
        page,
        size: 10,
        filterLanguages: locale === "ar" ? undefined : locale,
      }),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
