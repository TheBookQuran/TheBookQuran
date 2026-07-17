"use client";

import { useQuery } from "@tanstack/react-query";
import { camelizeKeys } from "@/lib/case-utils";
import type { Verse } from "@/types/quran";
import type { RootOccurrence } from "@/types/linguistics";

async function fetchVersesByChapters(
  chapters: number[],
  locale: string
): Promise<Map<string, Verse>> {
  const searchParams: Record<string, string> = {
    words: "true",
    word_fields:
      "verse_key,verse_id,page_number,line_number,location,text_uthmani,text_imlaei_simple,code_v2,qpc_uthmani_hafs",
    per_page: "all",
    fields:
      "text_uthmani,text_uthmani_simple,chapter_id,hizb_number,text_imlaei_simple,has_related_verses",
    word_translation_language: locale,
  };

  if (locale !== "ar") {
    searchParams.translations = "85";
    searchParams.translation_fields = "resource_name,language_id";
  }

  const params = new URLSearchParams(searchParams);

  const verseMap = new Map<string, Verse>();

  await Promise.all(
    chapters.map(async (chapterId) => {
      try {
        const response = await fetch(
          `https://api.qurancdn.com/api/qdc/verses/by_chapter/${chapterId}?${params}`
        );
        if (!response.ok) return;
        const data = await response.json();
        const camelized = camelizeKeys(data) as { verses: Verse[] };
        for (const verse of camelized.verses || []) {
          verseMap.set(verse.verseKey, verse);
        }
      } catch {
        // Silently fail for individual chapter
      }
    })
  );

  return verseMap;
}

export function useRootOccurrenceVerses(
  rootId: string | null,
  occurrences: RootOccurrence[] | undefined,
  locale: string,
) {
  const chapterIds = Array.from(
    new Set(occurrences?.map((o) => o.chapterNumber) || [])
  );

  return useQuery({
    queryKey: ["root-occurrence-verses", rootId, locale],
    queryFn: () => fetchVersesByChapters(chapterIds, locale),
    enabled: !!rootId && chapterIds.length > 0,
    staleTime: 1000 * 60 * 30,
  });
}
