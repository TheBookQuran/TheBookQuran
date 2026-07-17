"use server";

import { getProvider } from "./providers/factory";
import { QuranFont, MushafLines } from "../lib/quran-core/fonts/types";
import {
  ChaptersResponse,
  ChapterResponse,
  VersesResponse,
  TranslationsResponse,
  RecitersResponse,
  ReciterResponse,
  PagesLookUpResponse,
  NewSearchResponse,
  SearchRequestParams,
} from "./types";

export async function getChapters(locale: string): Promise<ChaptersResponse> {
  return getProvider().getChapters(locale);
}

export async function getChapter(
  chapterIdOrSlug: string | number,
  language: string
): Promise<ChapterResponse> {
  return getProvider().getChapter(chapterIdOrSlug, language);
}

export async function getChapterInfo(
  chapterId: string | number,
  language: string,
  options?: { resourceId?: string | number; includeResources?: boolean }
): Promise<any> {
  return getProvider().getChapterInfo(chapterId, language, options);
}

export async function getChapterMetadata(
  chapterId: string | number,
  language: string
): Promise<any> {
  return getProvider().getChapterMetadata(chapterId, language);
}

export async function getChapterVerses(
  id: string | number,
  locale: string,
  params?: Record<string, any>
): Promise<VersesResponse> {
  return getProvider().getChapterVerses(id, locale, params);
}

export async function getRangeVerses(
  locale: string,
  params?: Record<string, any>
): Promise<VersesResponse> {
  return getProvider().getRangeVerses(locale, params);
}

export async function getPageVerses(
  id: string | number,
  locale: string,
  params?: Record<string, any>
): Promise<VersesResponse> {
  return getProvider().getPageVerses(id, locale, params);
}

export async function getJuzVerses(
  id: string | number,
  locale: string,
  params?: Record<string, any>
): Promise<VersesResponse> {
  return getProvider().getJuzVerses(id, locale, params);
}

export async function getHizbVerses(
  id: string | number,
  locale: string,
  params?: Record<string, any>
): Promise<VersesResponse> {
  return getProvider().getHizbVerses(id, locale, params);
}

export async function getRubVerses(
  id: string | number,
  locale: string,
  params?: Record<string, any>
): Promise<VersesResponse> {
  return getProvider().getRubVerses(id, locale, params);
}

export async function getVerseByKey(
  verseKey: string,
  params?: Record<string, any>
): Promise<VersesResponse> {
  return getProvider().getVerseByKey(verseKey, params);
}

export async function getAvailableTranslations(
  language: string
): Promise<TranslationsResponse> {
  return getProvider().getAvailableTranslations(language);
}

export async function getAvailableReciters(
  locale: string,
  fields?: string[]
): Promise<RecitersResponse> {
  return getProvider().getAvailableReciters(locale, fields);
}

export async function getReciterData(
  reciterId: string | number,
  locale: string
): Promise<ReciterResponse> {
  return getProvider().getReciterData(reciterId, locale);
}

export async function getChapterAudioData(
  reciterId: number,
  chapter: number,
  segments = false
): Promise<any> {
  return getProvider().getChapterAudioData(reciterId, chapter, segments);
}

export async function getVerseTimestamps(
  reciterId: number,
  verseKey: string
): Promise<any> {
  return getProvider().getVerseTimestamps(reciterId, verseKey);
}

export async function getTafsirs(language: string): Promise<any> {
  return getProvider().getTafsirs(language);
}

export async function getTafsirContent(
  tafsirId: string | number,
  verseKey: string,
  quranFont: QuranFont,
  mushafLines: MushafLines,
  locale: string
): Promise<any> {
  return getProvider().getTafsirContent(
    tafsirId,
    verseKey,
    quranFont,
    mushafLines,
    locale
  );
}

export async function getPagesLookup(params: any): Promise<PagesLookUpResponse> {
  return getProvider().getPagesLookup(params);
}

export async function getNewSearchResults(
  params: SearchRequestParams
): Promise<NewSearchResponse> {
  return getProvider().getNewSearchResults(params);
}
