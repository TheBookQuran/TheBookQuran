import { VersesResponse } from "../../types";

export function mapTranslationIds(translations?: any): number[] | undefined {
  if (!translations) return undefined;
  
  const ids = Array.isArray(translations)
    ? translations
    : String(translations).split(",").map(id => parseInt(id.trim(), 10));
    
  return ids.map(id => {
    if (id === 131) return 85; // fallback to Abdul Haleem
    return id;
  });
}

export function mapSdkVerseToLocalVerse(v: any): any {
  return {
    id: v.id,
    verseNumber: v.verseNumber,
    chapterId: v.chapterId || (v.verseKey ? Number(v.verseKey.split(":")[0]) : undefined),
    pageNumber: v.pageNumber,
    juzNumber: v.juzNumber,
    hizbNumber: v.hizbNumber,
    rubNumber: v.rubElHizbNumber || v.rubNumber || 1,
    rubElHizbNumber: v.rubElHizbNumber || v.rubNumber,
    verseKey: v.verseKey,
    verseIndex: v.id,
    words: v.words?.map((w: any) => ({
      id: w.id,
      position: w.position,
      audioUrl: w.audioUrl,
      charTypeName: w.charTypeName,
      codeV1: w.codeV1,
      codeV2: w.codeV2,
      pageNumber: w.pageNumber,
      lineNumber: w.lineNumber,
      text: w.text,
      textUthmani: w.textUthmani,
      textIndopak: w.textIndopak,
      qpcUthmaniHafs: w.textUthmani,
      location: w.location,
      verseKey: w.verseKey,
      translation: w.translation ? {
        text: w.translation.text,
        resourceName: w.translation.resourceName
      } : undefined,
      transliteration: w.transliteration ? {
        text: w.transliteration.text,
        languageName: w.transliteration.languageName
      } : undefined
    })) || [],
    textUthmani: v.textUthmani,
    textUthmaniSimple: v.textUthmaniSimple,
    textUthmaniTajweed: v.textUthmaniTajweed,
    textImlaei: v.textImlaei,
    textImlaeiSimple: v.textImlaeiSimple,
    textIndopak: v.textIndopak,
    sajdahNumber: v.sajdahNumber,
    sajdahType: v.sajdahType,
    v1Page: v.v1Page,
    v2Page: v.v2Page,
    codeV1: v.codeV1,
    codeV2: v.codeV2,
    translations: v.translations?.map((t: any) => ({
      id: t.id || t.resourceId,
      resourceId: t.resourceId,
      text: t.text,
      languageName: t.languageName,
      resourceName: t.resourceName
    }))
  };
}

export function parseVerseOptions(locale: string, params?: Record<string, any>) {
  const translations = mapTranslationIds(params?.translations);
  
  const fields = {
    chapterId: true,
    textUthmani: true,
    textUthmaniSimple: true,
    textImlaei: true,
    textImlaeiSimple: true,
    textIndopak: true,
    textUthmaniTajweed: true,
    codeV1: true,
    codeV2: true,
    v1Page: true,
    v2Page: true
  };

  const wordFields = {
    location: true,
    verseKey: true,
    textUthmani: true,
    textImlaei: true,
    textIndopak: true,
    codeV1: true,
    codeV2: true,
    v1Page: true,
    v2Page: true
  };

  return {
    language: locale as any,
    words: params?.words ?? true,
    translations,
    perPage: params?.perPage,
    page: params?.page,
    reciter: params?.reciter,
    fields,
    wordFields,
  };
}

export function buildVersesResponse(rawVerses: any[], opts: Record<string, any>): VersesResponse {
  const limit = typeof opts.perPage === "number"
    ? opts.perPage
    : (opts.perPage && !isNaN(Number(opts.perPage)) ? Number(opts.perPage) : 30);
  const currentPage = opts.page || 1;
  const nextPage = rawVerses.length === limit ? currentPage + 1 : null;

  return {
    verses: rawVerses.map(mapSdkVerseToLocalVerse),
    pagination: {
      perPage: limit,
      currentPage,
      nextPage,
      totalPages: 1,
      totalRecords: rawVerses.length,
    },
  };
}
