import { QuranDataProvider } from "../types";
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
import { CharType } from "../../../types/quran";

export class MockProvider implements QuranDataProvider {
  async getChapters(locale: string): Promise<ChaptersResponse> {
    return {
      chapters: [
        {
          id: 1,
          versesCount: 7,
          bismillahPre: false,
          revelationOrder: 5,
          revelationPlace: "meccan",
          pages: [1, 1],
          nameSimple: "Al-Fatihah",
          nameComplex: "Al-Fātiḥah",
          transliteratedName: "Al-Fatihah",
          nameArabic: "الفاتحة",
          translatedName: "The Opening",
        },
      ],
    };
  }

  async getChapter(
    chapterIdOrSlug: string | number,
    language: string
  ): Promise<ChapterResponse> {
    return {
      chapter: {
        id: 1,
        versesCount: 7,
        bismillahPre: false,
        revelationOrder: 5,
        revelationPlace: "meccan",
        pages: [1, 1],
        nameSimple: "Al-Fatihah",
        nameComplex: "Al-Fātiḥah",
        transliteratedName: "Al-Fatihah",
        nameArabic: "الفاتحة",
        translatedName: "The Opening",
      },
    };
  }

  async getChapterInfo(
    chapterId: string | number,
    language: string,
    options?: { resourceId?: string | number; includeResources?: boolean }
  ): Promise<any> {
    return {
      chapterInfo: {
        id: 1,
        chapterId: 1,
        languageName: "english",
        shortText: "Mock short text info",
        source: "Mock source",
        text: "<p>Mock detailed info text for chapter 1</p>",
      },
    };
  }

  async getChapterMetadata(
    chapterId: string | number,
    language: string
  ): Promise<any> {
    return {
      id: 1,
      chapterId: 1,
      languageName: "english",
      shortText: "Mock short text info",
      source: "Mock source",
      text: "<p>Mock detailed info text for chapter 1</p>",
    };
  }

  async getChapterVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    return {
      verses: [
        {
          id: 1,
          verseNumber: 1,
          chapterId: 1,
          pageNumber: 1,
          juzNumber: 1,
          hizbNumber: 1,
          rubNumber: 1,
          rubElHizbNumber: 1,
          verseKey: "1:1",
          verseIndex: 1,
          words: [
            {
              id: 1,
              position: 1,
              charTypeName: CharType.Word,
              codeV1: "ﭑ",
              codeV2: "ﱁ",
              pageNumber: 1,
              lineNumber: 1,
              text: "بِسْمِ",
              textUthmani: "بِسْمِ",
              qpcUthmaniHafs: "بِسْمِ",
              location: "1:1:1",
              verseKey: "1:1",
            },
          ],
          textUthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
          textUthmaniSimple: "بسم الله الرحمن الرحيم",
          v1Page: 1,
          v2Page: 1,
          codeV1: "ﭑ",
          codeV2: "ﱁ",
        },
      ],
      pagination: {
        perPage: 10,
        currentPage: 1,
        nextPage: null,
        totalPages: 1,
        totalRecords: 1,
      },
    };
  }

  async getRangeVerses(
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    return this.getChapterVerses(1, locale, params);
  }

  async getPageVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    return this.getChapterVerses(1, locale, params);
  }

  async getJuzVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    return this.getChapterVerses(1, locale, params);
  }

  async getHizbVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    return this.getChapterVerses(1, locale, params);
  }

  async getRubVerses(
    id: string | number,
    locale: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    return this.getChapterVerses(1, locale, params);
  }

  async getVerseByKey(
    verseKey: string,
    params?: Record<string, any>
  ): Promise<VersesResponse> {
    return this.getChapterVerses(1, "en", params);
  }

  async getAvailableTranslations(language: string): Promise<TranslationsResponse> {
    return {
      translations: [
        {
          id: 85,
          name: "Sample Translation",
          authorName: "Sample Author",
          languageName: "english",
          slug: "sample-slug",
        },
      ],
    };
  }

  async getAvailableReciters(
    locale: string,
    fields?: string[]
  ): Promise<RecitersResponse> {
    return {
      reciters: [
        {
          id: 1,
          name: "Sample Reciter",
          recitationStyle: "Murattal",
          relativePath: "sample",
        },
      ],
    };
  }

  async getReciterData(
    reciterId: string | number,
    locale: string
  ): Promise<ReciterResponse> {
    return {
      reciter: {
        id: 1,
        name: "Sample Reciter",
        recitationStyle: "Murattal",
        relativePath: "sample",
      },
    };
  }

  async getChapterAudioData(
    reciterId: number,
    chapter: number,
    segments = false
  ): Promise<any> {
    return {
      id: 1,
      chapterId: 1,
      fileSize: 1000,
      format: "mp3",
      audioUrl: "https://audio.example.com/mock.mp3",
      duration: 120,
      verseTimings: [
        {
          verseKey: "1:1",
          timestampFrom: 0,
          timestampTo: 5000,
          duration: 5,
        },
      ],
      reciterId,
    };
  }

  async getVerseTimestamps(reciterId: number, verseKey: string): Promise<any> {
    return {
      verseKey,
      timestampFrom: 0,
      timestampTo: 5000,
      duration: 5,
    };
  }

  async getTafsirs(language: string): Promise<any> {
    return {
      tafsirs: [
        {
          id: 1,
          name: "Sample Tafsir",
          authorName: "Sample Author",
          languageName: "english",
          slug: "sample-tafsir",
        },
      ],
    };
  }

  async getTafsirContent(
    tafsirId: string | number,
    verseKey: string,
    quranFont: QuranFont,
    mushafLines: MushafLines,
    locale: string
  ): Promise<any> {
    return {
      tafsir: {
        id: 1,
        resourceId: 1,
        text: "This is a mock tafsir content.",
        resourceName: "Mock Tafsir",
        languageName: "english",
      },
    };
  }

  async getPagesLookup(params: any): Promise<PagesLookUpResponse> {
    return {
      lookupRange: {
        from: "1:1",
        to: "1:7",
      },
      pages: {
        "1": {
          from: "1:1",
          to: "1:7",
        },
      },
    };
  }

  async getNewSearchResults(params: SearchRequestParams): Promise<NewSearchResponse> {
    return {
      result: {
        verses: [
          {
            verseKey: "1:1",
            text: "Mock search result match",
          } as any,
        ],
        pagination: {
          totalRecords: 1,
          currentPage: 1,
          totalPages: 1,
        },
      },
    };
  }
}
