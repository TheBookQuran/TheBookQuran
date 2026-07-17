import { useQuery } from "@tanstack/react-query";
import { getPagesLookup } from "@/services/quran-api";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { getMushafId } from "@/services/api-paths";
import { PagesLookUpResponse } from "@/types/api";

export function usePagesLookup(
  filterType: string,
  id: string | number,
  options?: { from?: string; to?: string }
) {
  const quranFont = useQuranReaderStore((state) => state.quranFont);
  const mushafLines = useQuranReaderStore((state) => state.mushafLines);

  const mushafId = getMushafId(quranFont, mushafLines);

  const params: Record<string, any> = {
    mushaf: mushafId,
  };

  const idNum = typeof id === "string" ? parseInt(id, 10) : id;

  if (filterType === "chapter") {
    params.chapterNumber = idNum;
  } else if (filterType === "juz") {
    params.juzNumber = idNum;
  } else if (filterType === "hizb") {
    params.hizbNumber = idNum;
  } else if (filterType === "rub") {
    params.rubElHizbNumber = idNum;
  } else if (filterType === "page") {
    params.pageNumber = idNum;
  } else if (filterType === "range" && options?.from && options?.to) {
    params.from = options.from;
    params.to = options.to;
  }

  const isEnabled = 
    filterType === "range" 
      ? (!!options?.from && !!options?.to) 
      : !!id;

  return useQuery<PagesLookUpResponse>({
    queryKey: ["pagesLookup", filterType, id, quranFont, mushafLines, options],
    queryFn: () => getPagesLookup(params),
    enabled: isEnabled,
    staleTime: Infinity, // pages lookup is static metadata, won't change
  });
}

export default usePagesLookup;
