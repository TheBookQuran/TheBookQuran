import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getChapterVerses,
  getPageVerses,
  getJuzVerses,
  getHizbVerses,
  getRubVerses,
  getRangeVerses,
} from "@/services/quran-api";
import { useSettingsStore } from "@/stores/settings";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { getMushafId, getDefaultWordFields } from "@/services/api-paths";

interface QuranQueryParams {
  translations?: string;
  mushaf?: number;
  wordFields?: string;
  page?: number;
  perPage?: number | string;
}

export type VerseFilterType = "chapter" | "page" | "juz" | "hizb" | "rub" | "range";

function useQuranQueryParams(): QuranQueryParams {
  const quranFont = useQuranReaderStore((state) => state.quranFont);
  const mushafLines = useQuranReaderStore((state) => state.mushafLines);
  const selectedTranslations = useSettingsStore((state) => state.selectedTranslations);

  return {
    translations: selectedTranslations.join(","),
    mushaf: getMushafId(quranFont, mushafLines),
    wordFields: getDefaultWordFields(quranFont),
  };
}

export function useVerses(
  filterType: VerseFilterType,
  id: string | number,
  locale: string,
  options?: { from?: string; to?: string; enabled?: boolean }
) {
  const queryParams = useQuranQueryParams();
  const isPageType = filterType === "page";

  const isEnabled = 
    options?.enabled !== false && 
    (filterType === "range" ? (!!options?.from && !!options?.to) : !!id);

  return useInfiniteQuery({
    queryKey: ["verses", filterType, id, locale, queryParams, options],
    queryFn: ({ pageParam = 1 }) => {
      const fetchParams = {
        ...queryParams,
        perPage: isPageType ? "all" : 30,
        page: pageParam,
      };

      switch (filterType) {
        case "chapter":
          return getChapterVerses(id, locale, fetchParams);
        case "page":
          return getPageVerses(id, locale, fetchParams);
        case "juz":
          return getJuzVerses(id, locale, fetchParams);
        case "hizb":
          return getHizbVerses(id, locale, fetchParams);
        case "rub":
          return getRubVerses(id, locale, fetchParams);
        case "range":
          return getRangeVerses(locale, { ...fetchParams, ...options });
        default:
          throw new Error(`Unsupported filter type: ${filterType}`);
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.pagination.nextPage ?? undefined,
    enabled: isEnabled,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

