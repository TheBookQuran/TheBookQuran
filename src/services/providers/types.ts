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
} from "../types";
import { QuranFont, MushafLines } from "../../lib/quran-core/fonts/types";

export interface QuranDataProvider {
  getChapters(locale: string): Promise<ChaptersResponse>;
  getChapter(
    chapterIdOrSlug: string | number,
    language: string
  ): Promise<ChapterResponse>;
  getChapterInfo(
    chapterId: string | number,
    language: string,
    options?: { resourceId?: string | number; includeResources?: boolean }
  ): Promise<any>;
  getChapterMetadata(
    chapterId: string | number,
    language: string
  ): Promise<any>;
  getChapterVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse>;
  getRangeVerses(
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse>;
  getPageVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse>;
  getJuzVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse>;
  getHizbVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse>;
  getRubVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse>;
  getVerseByKey(
    verseKey: string,
    params?: Record<string, any>
  ): Promise<VersesResponse>;
  getAvailableTranslations(language: string): Promise<TranslationsResponse>;
  getAvailableReciters(
    locale: string,
    fields?: string[]
  ): Promise<RecitersResponse>;
  getReciterData(
    reciterId: string | number,
    locale: string
  ): Promise<ReciterResponse>;
  getChapterAudioData(
    reciterId: number,
    chapter: number,
    segments?: boolean
  ): Promise<any>;
  getVerseTimestamps(reciterId: number, verseKey: string): Promise<any>;
  getTafsirs(language: string): Promise<any>;
  getTafsirContent(
    tafsirId: string | number,
    verseKey: string,
    quranFont: QuranFont,
    mushafLines: MushafLines,
    locale: string
  ): Promise<any>;
  getPagesLookup(params: any): Promise<PagesLookUpResponse>;
  getNewSearchResults(params: SearchRequestParams): Promise<NewSearchResponse>;
}
