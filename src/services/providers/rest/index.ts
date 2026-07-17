import { QuranDataProvider } from "../types";
import { fetcher } from "./fetcher";
import {
  makeChapterUrl,
  makeChapterInfoUrl,
  makeChapterMetadataUrl,
  makeChapterAudioDataUrl,
  makeAudioTimestampsUrl,
  makeAvailableRecitersUrl,
  makeReciterUrl,
  makeTranslationsUrl,
  makeTafsirsUrl,
  makeTafsirContentUrl,
  makePagesLookupUrl,
  makeNewSearchResultsUrl,
  makeVersesUrl,
  makeByRangeVersesUrl,
  makePageVersesUrl,
  makeJuzVersesUrl,
  makeHizbVersesUrl,
  makeRubVersesUrl,
  makeByVerseKeyUrl,
} from "./url-builder";
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
} from "../../types";
import { QuranFont, MushafLines } from "../../../lib/quran-core/fonts/types";

export class RestProvider implements QuranDataProvider {
  getChapters(locale: string): Promise<ChaptersResponse> {
    return fetcher<ChaptersResponse>(makeChapterUrl("", locale));
  }

  getChapter(
    chapterIdOrSlug: string | number,
    language: string
  ): Promise<ChapterResponse> {
    return fetcher<ChapterResponse>(makeChapterUrl(chapterIdOrSlug, language));
  }

  getChapterInfo(
    chapterId: string | number,
    language: string,
    options?: { resourceId?: string | number; includeResources?: boolean }
  ): Promise<any> {
    return fetcher<any>(makeChapterInfoUrl(chapterId, language, options));
  }

  getChapterMetadata(
    chapterId: string | number,
    language: string
  ): Promise<any> {
    return fetcher<any>(makeChapterMetadataUrl(chapterId, language));
  }

  getChapterVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    return fetcher<VersesResponse>(makeVersesUrl(id, locale, params));
  }

  getRangeVerses(
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    return fetcher<VersesResponse>(makeByRangeVersesUrl(locale, params));
  }

  getPageVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    return fetcher<VersesResponse>(makePageVersesUrl(id, locale, params));
  }

  getJuzVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    return fetcher<VersesResponse>(makeJuzVersesUrl(id, locale, params));
  }

  getHizbVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    return fetcher<VersesResponse>(makeHizbVersesUrl(id, locale, params));
  }

  getRubVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    return fetcher<VersesResponse>(makeRubVersesUrl(id, locale, params));
  }

  getVerseByKey(
    verseKey: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    return fetcher<VersesResponse>(makeByVerseKeyUrl(verseKey, params));
  }

  getAvailableTranslations(language: string): Promise<TranslationsResponse> {
    return fetcher<TranslationsResponse>(makeTranslationsUrl(language));
  }

  getAvailableReciters(
    locale: string,
    fields?: string[]
  ): Promise<RecitersResponse> {
    return fetcher<RecitersResponse>(makeAvailableRecitersUrl(locale, fields));
  }

  getReciterData(
    reciterId: string | number,
    locale: string
  ): Promise<ReciterResponse> {
    return fetcher<ReciterResponse>(makeReciterUrl(reciterId, locale));
  }

  async getChapterAudioData(
    reciterId: number,
    chapter: number,
    segments = false
  ): Promise<any> {
    const res = await fetcher<any>(
      makeChapterAudioDataUrl(reciterId, chapter, segments)
    );
    const firstAudio = res.audioFiles?.[0];
    if (!firstAudio) {
      throw new Error("No audio file found");
    }
    return {
      id: firstAudio.id,
      chapterId: firstAudio.chapterId,
      fileSize: firstAudio.fileSize,
      format: firstAudio.format,
      audioUrl: firstAudio.audioUrl,
      duration: 0,
      verseTimings: firstAudio.verseTimings || firstAudio.verse_timings || firstAudio.timestamps || [],
      reciterId,
    };
  }

  async getVerseTimestamps(reciterId: number, verseKey: string): Promise<any> {
    const res = await fetcher<any>(makeAudioTimestampsUrl(reciterId, verseKey));
    return res.audioFiles?.[0] || null;
  }

  getTafsirs(language: string): Promise<any> {
    return fetcher<any>(makeTafsirsUrl(language));
  }

  getTafsirContent(
    tafsirId: string | number,
    verseKey: string,
    quranFont: QuranFont,
    mushafLines: MushafLines,
    locale: string
  ): Promise<any> {
    return fetcher<any>(
      makeTafsirContentUrl(tafsirId, verseKey, {
        lang: locale,
        quranFont,
        mushafLines,
      })
    );
  }

  getPagesLookup(params: any): Promise<PagesLookUpResponse> {
    return fetcher<PagesLookUpResponse>(makePagesLookupUrl(params));
  }

  async getNewSearchResults(params: SearchRequestParams): Promise<NewSearchResponse> {
    const res = await fetcher<any>(makeNewSearchResultsUrl(params));
    if (res?.pagination && res?.result) {
      res.result.pagination = res.pagination;
    }
    return res as NewSearchResponse;
  }
}
