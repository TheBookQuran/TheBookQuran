import { useInfiniteQuery } from "@tanstack/react-query";
import { getNewSearchResults } from "@/services/quran-api";

const PAGE_SIZE = 20;

export function useSearchInfinite(query: string, locale = "en") {
  return useInfiniteQuery({
    queryKey: ["qdc-search-infinite", query, locale],
    queryFn: ({ pageParam = 1 }) =>
      getNewSearchResults({
        query,
        page: pageParam as number,
        size: PAGE_SIZE,
        filterLanguages: locale === "ar" ? undefined : locale,
      }),
    getNextPageParam: (lastPage: any) => {
      const pagination = lastPage?.result?.pagination;
      if (!pagination) return undefined;
      const { currentPage, totalPages } = pagination;
      if (currentPage < totalPages) return currentPage + 1;
      return undefined;
    },
    initialPageParam: 1,
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
