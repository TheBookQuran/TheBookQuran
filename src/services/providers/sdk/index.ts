import { QuranDataProvider } from "../types";
import { quranClient } from "./client";
import { SearchMode } from "@quranjs/api";
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
import {
  parseVerseOptions,
  buildVersesResponse,
  mapSdkVerseToLocalVerse,
} from "./mappers";
import { camelizeKeys, decamelizeKeys } from "../../../lib/case-utils";
import { QuranFont, MushafLines } from "../../../lib/quran-core/fonts/types";

export class SdkProvider implements QuranDataProvider {
  async getChapters(locale: string): Promise<ChaptersResponse> {
    const chapters = await quranClient.chapters.findAll({ language: locale as any });
    return {
      chapters: chapters.map((c) => ({
        id: c.id,
        versesCount: c.versesCount,
        bismillahPre: c.bismillahPre,
        revelationOrder: c.revelationOrder,
        revelationPlace: c.revelationPlace,
        pages: c.pages,
        nameSimple: c.nameSimple,
        nameComplex: c.nameComplex,
        transliteratedName: c.transliteratedName,
        nameArabic: c.nameArabic,
        translatedName: c.translatedName.name,
      })),
    };
  }

  async getChapter(
    chapterIdOrSlug: string | number,
    language: string
  ): Promise<ChapterResponse> {
    if (!chapterIdOrSlug || chapterIdOrSlug === "null" || chapterIdOrSlug === "undefined") {
      return { chapter: null } as any;
    }
    const c = await quranClient.chapters.findById(chapterIdOrSlug as any, { language: language as any });
    return {
      chapter: {
        id: c.id,
        versesCount: c.versesCount,
        bismillahPre: c.bismillahPre,
        revelationOrder: c.revelationOrder,
        revelationPlace: c.revelationPlace,
        pages: c.pages,
        nameSimple: c.nameSimple,
        nameComplex: c.nameComplex,
        transliteratedName: c.transliteratedName,
        nameArabic: c.nameArabic,
        translatedName: c.translatedName.name,
      },
    };
  }

  async getChapterInfo(
    chapterId: string | number,
    language: string,
    options?: { resourceId?: string | number; includeResources?: boolean }
  ): Promise<any> {
    if (!chapterId || chapterId === "null" || chapterId === "undefined") {
      return { chapterInfo: null };
    }
    const res = await quranClient.chapters.findInfoById(chapterId as any, {
      language: language as any,
      resourceId: options?.resourceId
    });
    return {
      chapterInfo: res
    };
  }

  async getChapterMetadata(
    chapterId: string | number,
    language: string
  ): Promise<any> {
    if (!chapterId || chapterId === "null" || chapterId === "undefined") {
      return null;
    }
    const res = await quranClient.chapters.findInfoById(chapterId as any, {
      language: language as any
    });
    return res;
  }

  async getChapterVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    if (!id || id === "null" || id === "undefined") {
      return { verses: [], pagination: { perPage: 10, currentPage: 1, nextPage: null, totalPages: 1, totalRecords: 0 } };
    }
    const opts = parseVerseOptions(locale, params);
    const verses = await quranClient.verses.findByChapter(id as any, opts);
    return buildVersesResponse(verses, opts);
  }

  async getRangeVerses(
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    const from = params?.from;
    const to = params?.to;
    if (!from || !to || from === "null" || to === "null") {
      return { verses: [], pagination: { perPage: 10, currentPage: 1, nextPage: null, totalPages: 1, totalRecords: 0 } };
    }
    const opts = parseVerseOptions(locale, params);
    const verses = await quranClient.verses.findByRange(from, to, opts);
    return buildVersesResponse(verses, opts);
  }

  async getPageVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    if (!id || id === "null" || id === "undefined" || isNaN(Number(id)) || Number(id) <= 0) {
      return { verses: [], pagination: { perPage: 10, currentPage: 1, nextPage: null, totalPages: 1, totalRecords: 0 } };
    }
    const opts = parseVerseOptions(locale, params);
    const verses = await quranClient.verses.findByPage(Number(id) as any, opts);
    return {
      verses: verses.map(mapSdkVerseToLocalVerse),
      pagination: {
        perPage: opts.perPage || 10,
        currentPage: opts.page || 1,
        nextPage: null,
        totalPages: 1,
        totalRecords: verses.length,
      },
    };
  }

  async getJuzVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    if (!id || id === "null" || id === "undefined" || isNaN(Number(id)) || Number(id) <= 0) {
      return { verses: [], pagination: { perPage: 10, currentPage: 1, nextPage: null, totalPages: 1, totalRecords: 0 } };
    }
    const opts = parseVerseOptions(locale, params);
    const verses = await quranClient.verses.findByJuz(Number(id) as any, opts);
    return buildVersesResponse(verses, opts);
  }

  async getHizbVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    if (!id || id === "null" || id === "undefined" || isNaN(Number(id)) || Number(id) <= 0) {
      return { verses: [], pagination: { perPage: 10, currentPage: 1, nextPage: null, totalPages: 1, totalRecords: 0 } };
    }
    const opts = parseVerseOptions(locale, params);
    const verses = await quranClient.verses.findByHizb(Number(id) as any, opts);
    return buildVersesResponse(verses, opts);
  }

  async getRubVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    if (!id || id === "null" || id === "undefined" || isNaN(Number(id)) || Number(id) <= 0) {
      return { verses: [], pagination: { perPage: 10, currentPage: 1, nextPage: null, totalPages: 1, totalRecords: 0 } };
    }
    const opts = parseVerseOptions(locale, params);
    const verses = await quranClient.verses.findByRub(Number(id) as any, opts);
    return buildVersesResponse(verses, opts);
  }

  async getVerseByKey(
    verseKey: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    if (!verseKey || verseKey === "null" || verseKey === "undefined") {
      return { verses: [], pagination: { perPage: 1, currentPage: 1, nextPage: null, totalPages: 1, totalRecords: 0 } };
    }
    const opts = parseVerseOptions("en", params);
    const verse = await quranClient.verses.findByKey(verseKey as any, opts);
    return {
      verses: [mapSdkVerseToLocalVerse(verse)],
      pagination: {
        perPage: 1,
        currentPage: 1,
        nextPage: null,
        totalPages: 1,
        totalRecords: 1,
      },
    };
  }

  async getAvailableTranslations(language: string): Promise<TranslationsResponse> {
    const translations = await quranClient.resources.findAllTranslations({ language: language as any });
    return {
      translations: translations.map((t) => ({
        id: t.id!,
        name: t.name || "",
        authorName: t.authorName || "",
        languageName: t.languageName || "",
        slug: t.slug || "",
      })),
    };
  }

  async getAvailableReciters(
    locale: string,
    fields?: string[]
  ): Promise<RecitersResponse> {
    const reciters = await quranClient.resources.findAllChapterReciters({ language: locale as any });
    return {
      reciters: reciters.map((r) => ({
        id: r.id,
        name: r.name,
        recitationStyle: (r as any).style?.name || "",
        relativePath: r.relativePath || "",
        profilePicture: undefined,
        coverImage: undefined,
        bio: undefined,
        translatedName: r.arabicName ? {
          name: r.arabicName,
          languageName: "arabic"
        } : undefined
      })),
    };
  }

  async getReciterData(
    reciterId: string | number,
    locale: string
  ): Promise<ReciterResponse> {
    const reciters = await quranClient.resources.findAllChapterReciters({ language: locale as any });
    const reciter = reciters.find((r) => String(r.id) === String(reciterId));
    if (!reciter) {
      throw new Error("Reciter not found");
    }
    return {
      reciter: {
        id: reciter.id,
        name: reciter.name,
        recitationStyle: (reciter as any).style?.name || "",
        relativePath: reciter.relativePath || "",
        translatedName: reciter.arabicName ? {
          name: reciter.arabicName,
          languageName: "arabic"
        } : undefined
      },
    };
  }

  async getChapterAudioData(
    reciterId: number,
    chapter: number,
    segments = false
  ): Promise<any> {
    if (!reciterId || !chapter || isNaN(Number(chapter)) || Number(chapter) <= 0) {
      return null;
    }
    const res = await quranClient.raw.content.v4.chapterReciterAudioFiles({
      path: { reciter_id: reciterId },
      query: { chapter, segments }
    }) as any;

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
    if (!reciterId || !verseKey || verseKey === "null" || verseKey === "undefined") {
      return null;
    }
    const res = await quranClient.audio.findVerseRecitationsByKey(verseKey as any, String(reciterId), {
      fields: { segments: true }
    });
    return res.audioFiles?.[0] || null;
  }

  async getTafsirs(language: string): Promise<any> {
    const tafsirs = await quranClient.resources.findAllTafsirs({ language: language as any });
    return {
      tafsirs: tafsirs.map((t) => ({
        id: t.id,
        name: t.name,
        authorName: t.authorName,
        languageName: t.languageName,
        slug: t.slug,
      })),
    };
  }

  async getTafsirContent(
    tafsirId: string | number,
    verseKey: string,
    quranFont: QuranFont,
    mushafLines: MushafLines,
    locale: string
  ): Promise<any> {
    if (!tafsirId || !verseKey || verseKey === "null" || verseKey === "undefined") {
      return { tafsir: null };
    }
    const verse = await quranClient.verses.findByKey(verseKey as any, {
      tafsirs: [Number(tafsirId)],
      language: locale as any,
    });

    const tafsir = verse.tafsirs?.[0];
    return {
      tafsir: tafsir ? {
        id: tafsir.id,
        resourceId: tafsir.resourceId,
        text: tafsir.text,
        resourceName: tafsir.resourceName,
        languageName: tafsir.languageName,
      } : null
    };
  }

  async getPagesLookup(params: any): Promise<PagesLookUpResponse> {
    if (!params || (
      !params.chapterNumber && 
      !params.juzNumber && 
      !params.hizbNumber && 
      !params.rubElHizbNumber && 
      !params.pageNumber &&
      (!params.from || !params.to)
    )) {
      return { pages: {}, lookupRange: {} } as any;
    }
    
    const snakeParams = decamelizeKeys(params);
    const res = await quranClient.raw.content.v4.getPagesLookup({
      query: snakeParams
    }) as any;

    return camelizeKeys(res) as PagesLookUpResponse;
  }

  async getNewSearchResults(params: SearchRequestParams): Promise<NewSearchResponse> {
    // Fall back to QDC public endpoint for search due to client search scope limits on credentials
    try {
      const searchParams = new URLSearchParams();
      searchParams.append("query", params.query);
      if (params.page) searchParams.append("page", String(params.page));
      if (params.size) searchParams.append("size", String(params.size));
      
      const response = await fetch(`https://api.qurancdn.com/api/qdc/search?${searchParams.toString()}`);
      if (!response.ok) throw new Error("Search request failed");
      const json = await response.json();
      const camelized = camelizeKeys(json);
      
      if (camelized?.pagination && camelized?.result) {
        camelized.result.pagination = camelized.pagination;
      }
      return camelized as NewSearchResponse;
    } catch (error) {
      console.error("Search failed, falling back:", error);
      return { result: { verses: [] } };
    }
  }
}
