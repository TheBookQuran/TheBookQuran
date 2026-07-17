import { getVerseAndChapterNumbersFromKey } from "@/lib/quran-core/verse/verse-utils";

export interface NavigationCommand {
  type: "chapter" | "juz" | "hizb" | "rub" | "page" | "verse";
  chapterId?: number;
  divisionId?: number;
  startingVerse?: number;
}

export const getChapterWithStartingVerseUrl = (verseKey: string): string => {
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  return `/${chapterId}?startingVerse=${verseNumber}`;
};

export const getSurahNavigationUrl = (chapterId: string | number): string =>
  `/${chapterId}`;

export const getJuzNavigationUrl = (juzNumber: string | number): string =>
  `/juz/${juzNumber}`;

export const getHizbNavigationUrl = (hizbNumber: string | number): string =>
  `/hizb/${hizbNumber}`;

export const getRubNavigationUrl = (rubNumber: string | number): string =>
  `/rub/${rubNumber}`;

export const getPageNavigationUrl = (pageNumber: string | number): string =>
  `/page/${pageNumber}`;

export const getSurahRangeNavigationUrl = (key: string): string => {
  const { surah, from, to } = getVerseNumberRangeFromKey(key);
  return `/${surah}/${from}-${to}`;
};

function getVerseNumberRangeFromKey(verseKey: string): { surah: number; from: number; to: number } {
  const splits = verseKey.split(":");
  const surahNumber = splits[0];
  const verseNumber = splits[1];
  const [from, to] = verseNumber.split("-");
  return { surah: Number(surahNumber), from: Number(from), to: to ? Number(to) : Number(from) };
}

export type NavResultType = "ayah" | "surah" | "juz" | "page" | "hizb" | "rub" | "range";

export const resolveQuranNavigationUrl = (
  type: NavResultType,
  key: string | number
): string => {
  const stringKey = String(key);
  switch (type) {
    case "ayah":
      return getChapterWithStartingVerseUrl(stringKey);
    case "surah":
      return getSurahNavigationUrl(stringKey);
    case "juz":
      return getJuzNavigationUrl(stringKey);
    case "page":
      return getPageNavigationUrl(stringKey);
    case "hizb":
      return getHizbNavigationUrl(stringKey);
    case "rub":
      return getRubNavigationUrl(stringKey);
    case "range":
      return getSurahRangeNavigationUrl(stringKey);
    default:
      return getSurahNavigationUrl(stringKey);
  }
};
