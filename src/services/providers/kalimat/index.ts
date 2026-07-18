import type { QuranDataProvider } from "../types";
import type {
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
import type { QuranFont, MushafLines } from "../../../lib/quran-core/fonts/types";
import type { KalimatSearchResponse } from "./types";
import { mapKalimatToNewSearchResponse } from "./mapper";

const KALIMAT_BASE = "https://api.kalimat.dev/api/v2/quick-search";

export class KalimatSearchProvider implements QuranDataProvider {
  private mainProvider: QuranDataProvider;
  private apiKey: string;

  constructor(mainProvider: QuranDataProvider, apiKey: string) {
    this.mainProvider = mainProvider;
    this.apiKey = apiKey;
  }

  async getNewSearchResults(
    params: SearchRequestParams,
  ): Promise<NewSearchResponse> {
    try {
      const page = params.page || 1;
      const size = params.size || 20;

      const searchParams = new URLSearchParams({
        query: params.query,
        versesResultsNumber: String(size),
        navigationalResultsNumber: "1",
        start: String((page - 1) * size),
        getText: "true",
        userLang: params.filterLanguages || "en",
      });

      const response = await fetch(`${KALIMAT_BASE}?${searchParams.toString()}`, {
        headers: { "X-Api-Key": this.apiKey },
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(
          `Kalimat API returned ${response.status}: ${body.slice(0, 200)}`,
        );
      }

      const json: KalimatSearchResponse = await response.json();
      return mapKalimatToNewSearchResponse(json, params);
    } catch (error) {
      console.warn(
        "Kalimat search failed, falling back to QDC:",
        error instanceof Error ? error.message : error,
      );
      return this.mainProvider.getNewSearchResults(params);
    }
  }

  getChapters(locale: string): Promise<ChaptersResponse> {
    return this.mainProvider.getChapters(locale);
  }

  getChapter(
    chapterIdOrSlug: string | number,
    language: string,
  ): Promise<ChapterResponse> {
    return this.mainProvider.getChapter(chapterIdOrSlug, language);
  }

  getChapterInfo(
    chapterId: string | number,
    language: string,
    options?: { resourceId?: string | number; includeResources?: boolean },
  ): Promise<any> {
    return this.mainProvider.getChapterInfo(chapterId, language, options);
  }

  getChapterMetadata(chapterId: string | number, language: string): Promise<any> {
    return this.mainProvider.getChapterMetadata(chapterId, language);
  }

  getChapterVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>,
  ): Promise<VersesResponse> {
    return this.mainProvider.getChapterVerses(id, locale, params);
  }

  getRangeVerses(
    locale: string,
    params?: Record<string, any>,
  ): Promise<VersesResponse> {
    return this.mainProvider.getRangeVerses(locale, params);
  }

  getPageVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>,
  ): Promise<VersesResponse> {
    return this.mainProvider.getPageVerses(id, locale, params);
  }

  getJuzVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>,
  ): Promise<VersesResponse> {
    return this.mainProvider.getJuzVerses(id, locale, params);
  }

  getHizbVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>,
  ): Promise<VersesResponse> {
    return this.mainProvider.getHizbVerses(id, locale, params);
  }

  getRubVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>,
  ): Promise<VersesResponse> {
    return this.mainProvider.getRubVerses(id, locale, params);
  }

  getVerseByKey(
    verseKey: string,
    params?: Record<string, any>,
  ): Promise<VersesResponse> {
    return this.mainProvider.getVerseByKey(verseKey, params);
  }

  getAvailableTranslations(language: string): Promise<TranslationsResponse> {
    return this.mainProvider.getAvailableTranslations(language);
  }

  getAvailableReciters(
    locale: string,
    fields?: string[],
  ): Promise<RecitersResponse> {
    return this.mainProvider.getAvailableReciters(locale, fields);
  }

  getReciterData(
    reciterId: string | number,
    locale: string,
  ): Promise<ReciterResponse> {
    return this.mainProvider.getReciterData(reciterId, locale);
  }

  getChapterAudioData(
    reciterId: number,
    chapter: number,
    segments?: boolean,
  ): Promise<any> {
    return this.mainProvider.getChapterAudioData(reciterId, chapter, segments);
  }

  getVerseTimestamps(reciterId: number, verseKey: string): Promise<any> {
    return this.mainProvider.getVerseTimestamps(reciterId, verseKey);
  }

  getTafsirs(language: string): Promise<any> {
    return this.mainProvider.getTafsirs(language);
  }

  getTafsirContent(
    tafsirId: string | number,
    verseKey: string,
    quranFont: QuranFont,
    mushafLines: MushafLines,
    locale: string,
  ): Promise<any> {
    return this.mainProvider.getTafsirContent(
      tafsirId,
      verseKey,
      quranFont,
      mushafLines,
      locale,
    );
  }

  getPagesLookup(params: any): Promise<PagesLookUpResponse> {
    return this.mainProvider.getPagesLookup(params);
  }
}
