import { notFound } from "next/navigation";
import {
  getJuzVerses,
  getHizbVerses,
  getRubVerses,
  getPageVerses,
  getChapterVerses,
  getRangeVerses,
} from "@/services/quran-api";
import { getDefaultVersesParams } from "@/services/api-paths";
import { getReadingPreference } from "@/lib/reading-preference";
import arChapters from "../../../data/chapters/ar.json";
import enChapters from "../../../data/chapters/en.json";

export type DivisionType = "juz" | "hizb" | "rub" | "page";

const DIVISION_LIMITS = {
  juz: 30,
  hizb: 60,
  rub: 240,
  page: 604,
};

export async function getInitialDivisionData(
  type: DivisionType,
  id: string,
  locale: string
) {
  const idNum = parseInt(id, 10);
  const maxLimit = DIVISION_LIMITS[type];

  if (isNaN(idNum) || idNum < 1 || idNum > maxLimit) {
    notFound();
  }

  // Fetch initial verses (default translation and font for fast server rendering)
  // For 'page' we load all verses on the page, others use default params
  const defaultParams = getDefaultVersesParams(
    type === "page" ? { perPage: "all" } : undefined
  );

  let initialVerses: any[] = [];
  try {
    let response;
    switch (type) {
      case "juz":
        response = await getJuzVerses(idNum, locale, defaultParams);
        break;
      case "hizb":
        response = await getHizbVerses(idNum, locale, defaultParams);
        break;
      case "rub":
        response = await getRubVerses(idNum, locale, defaultParams);
        break;
      case "page":
        response = await getPageVerses(idNum, locale, defaultParams);
        break;
    }
    initialVerses = response?.verses || [];
  } catch (error) {
    console.error(`Failed to load initial verses for ${type} on server:`, error);
  }

  const readingPref = await getReadingPreference(locale);

  return {
    idNum,
    initialVerses,
    readingPref,
  };
}

export async function getInitialChapterData(chapterId: string, locale: string) {
  const chapters = locale === "ar" ? arChapters : enChapters;
  const chapter = (chapters as Record<string, any>)[chapterId];

  if (!chapter) {
    notFound();
  }

  const chapterIdNum = parseInt(chapterId, 10);
  const chapterWithId = {
    ...chapter,
    id: chapterIdNum,
    bismillahPre: chapterIdNum !== 1 && chapterIdNum !== 9,
  };

  const defaultParams = getDefaultVersesParams();

  let initialVerses: any[] = [];
  try {
    const response = await getChapterVerses(chapterIdNum, locale, defaultParams);
    initialVerses = response.verses || [];
  } catch (error) {
    console.error("Failed to load initial verses on server:", error);
  }

  const readingPref = await getReadingPreference(locale);

  return {
    chapter: chapterWithId,
    chapterIdNum,
    initialVerses,
    readingPref,
  };
}

export async function getInitialRangeData(
  chapterId: string,
  verseRange: string,
  locale: string
) {
  const chapters = locale === "ar" ? arChapters : enChapters;
  const chapter = (chapters as Record<string, any>)[chapterId];

  if (!chapter) {
    notFound();
  }

  const chapterIdNum = parseInt(chapterId, 10);
  const chapterWithId = {
    ...chapter,
    id: chapterIdNum,
    bismillahPre: chapterIdNum !== 1 && chapterIdNum !== 9,
  };

  const [startStr, endStr] = verseRange.split("-");
  const start = parseInt(startStr, 10);
  const end = endStr ? parseInt(endStr, 10) : start;

  if (
    isNaN(start) ||
    isNaN(end) ||
    start > end ||
    start < 1 ||
    end > chapter.versesCount
  ) {
    notFound();
  }

  const fromKey = `${chapterId}:${start}`;
  const toKey = `${chapterId}:${end}`;

  const defaultParams = {
    ...getDefaultVersesParams(),
    from: fromKey,
    to: toKey,
  };

  let initialVerses: any[] = [];
  try {
    const response = await getRangeVerses(locale, defaultParams);
    initialVerses = response.verses || [];
  } catch (error) {
    console.error("Failed to load range verses on server:", error);
  }

  const readingPref = await getReadingPreference(locale);

  return {
    chapter: chapterWithId,
    chapterIdNum,
    start,
    end,
    initialVerses,
    readingPref,
  };
}
