import { useQuery } from "@tanstack/react-query";
import { Chapter } from "@/types/quran";

export function useChapters(locale: string) {
  return useQuery<Chapter[]>({
    queryKey: ["chapters", locale],
    queryFn: async () => {
      const data = await import(`../../data/chapters/${locale}.json`);
      const chaptersObj = data.default as Record<string, any>;
      const chaptersList: Chapter[] = Object.entries(chaptersObj).map(([idStr, value]) => {
        const id = parseInt(idStr, 10);
        return {
          id,
          versesCount: value.versesCount,
          bismillahPre: value.bismillahPre ?? (id !== 1 && id !== 9),
          revelationOrder: value.revelationOrder ?? id,
          revelationPlace: value.revelationPlace,
          pages: value.pages ?? [],
          nameComplex: value.transliteratedName,
          nameSimple: value.transliteratedName,
          transliteratedName: value.transliteratedName,
          nameArabic: value.nameArabic || (locale === "ar" ? value.transliteratedName : ""),
          translatedName: value.translatedName,
          slug: value.slug,
        };
      });
      return chaptersList.sort((a, b) => a.id - b.id);
    },
    staleTime: Infinity,
  });
}
