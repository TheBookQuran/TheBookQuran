import { QuranFont, MushafLines } from "../../../lib/quran-core/fonts/types";
import { getMushafId, getDefaultWordFields, ITEMS_PER_PAGE } from "../../api-paths";
import { decamelizeKeys } from "../../../lib/case-utils";

export const API_HOST = "https://api.qurancdn.com/api/qdc";

export function makeUrl(path: string, parameters?: Record<string, any>): string {
  const baseUrl = `${API_HOST}${path}`;
  if (!parameters) return baseUrl;

  const decamelized = decamelizeKeys(parameters);
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(decamelized)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(","));
      } else {
        searchParams.append(key, String(value));
      }
    }
  }

  const query = searchParams.toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
}

// Default parameters used by verses APIs
export const DEFAULT_VERSES_PARAMS = {
  words: true,
  translationFields: "resource_name,language_id",
  perPage: ITEMS_PER_PAGE,
  fields: "text_uthmani,text_uthmani_simple,chapter_id,hizb_number,text_imlaei_simple,has_related_verses",
};

export function getVersesParams(
  currentLocale: string,
  params?: Record<string, any>,
  includeTranslationFields = true
): Record<string, any> {
  const defaultParams: Record<string, any> = {
    ...DEFAULT_VERSES_PARAMS,
    wordTranslationLanguage: currentLocale,
  };

  if (!includeTranslationFields) {
    delete defaultParams.translationFields;
    delete defaultParams.translations;
  }

  return {
    ...defaultParams,
    ...params,
  };
}

export const makeVersesUrl = (
  id: string | number,
  currentLocale: string,
  params?: Record<string, any>
) => makeUrl(`/verses/by_chapter/${id}`, getVersesParams(currentLocale, params));

export const makeByRangeVersesUrl = (currentLocale: string, params?: Record<string, any>) =>
  makeUrl(`/verses/by_range`, getVersesParams(currentLocale, params));

export const makePageVersesUrl = (
  id: string | number,
  currentLocale: string,
  params?: Record<string, any>,
  includeTranslationFields = true
) =>
  makeUrl(
    `/verses/by_page/${id}`,
    getVersesParams(currentLocale, params, includeTranslationFields)
  );

export const makeJuzVersesUrl = (
  id: string | number,
  currentLocale: string,
  params?: Record<string, any>
) => makeUrl(`/verses/by_juz/${id}`, getVersesParams(currentLocale, params));

export const makeHizbVersesUrl = (
  id: string | number,
  currentLocale: string,
  params?: Record<string, any>
) => makeUrl(`/verses/by_hizb/${id}`, getVersesParams(currentLocale, params));

export const makeRubVersesUrl = (
  id: string | number,
  currentLocale: string,
  params?: Record<string, any>
) => makeUrl(`/verses/by_rub_el_hizb/${id}`, getVersesParams(currentLocale, params));

export const makeByVerseKeyUrl = (verseKey: string, params?: Record<string, any>) =>
  makeUrl(`/verses/by_key/${verseKey}`, params);

export const makeTranslationsUrl = (language: string) =>
  makeUrl("/resources/translations", { language });

export const makeAvailableRecitersUrl = (locale: string, fields?: string[]) =>
  makeUrl("/audio/reciters", { locale, fields });

export const makeReciterUrl = (reciterId: string | number, locale: string) =>
  makeUrl(`/audio/reciters/${reciterId}`, {
    locale,
    fields: ["profile_picture", "cover_image", "bio"],
  });

export const makeChapterAudioDataUrl = (
  reciterId: number,
  chapter: number,
  segments: boolean
) => makeUrl(`/audio/reciters/${reciterId}/audio_files`, { chapter, segments });

export const makeAudioTimestampsUrl = (reciterId: number, verseKey: string) =>
  makeUrl(`/audio/reciters/${reciterId}/timestamp`, { verseKey });

export const makeTafsirsUrl = (language: string) =>
  makeUrl("/resources/tafsirs", { language });

export const makeTafsirContentUrl = (
  tafsirId: number | string,
  verseKey: string,
  options: { lang: string; quranFont: QuranFont; mushafLines?: MushafLines }
) => {
  const params = {
    locale: options.lang,
    words: true,
    wordFields: getDefaultWordFields(options.quranFont),
    mushaf: getMushafId(options.quranFont, options.mushafLines),
  };
  return makeUrl(`/tafsirs/${tafsirId}/by_ayah/${verseKey}`, params);
};

export const makePagesLookupUrl = (params: any) =>
  makeUrl("/pages/lookup", params);

export const makeChapterInfoUrl = (
  chapterId: string | number,
  language: string,
  options?: { resourceId?: string | number; includeResources?: boolean }
) =>
  makeUrl(`/chapters/${chapterId}/info`, {
    language,
    ...(options?.resourceId && { resource_id: options.resourceId }),
    ...(options?.includeResources && { include_resources: true }),
  });

export const makeChapterMetadataUrl = (chapterId: string | number, language: string) =>
  makeUrl(`/chapters/${chapterId}/metadata`, { language });

export const makeChapterUrl = (chapterIdOrSlug: string | number, language: string) =>
  makeUrl(`/chapters/${chapterIdOrSlug}`, { language });

export const makeNewSearchResultsUrl = (params: any) =>
  makeUrl("/search", params);

export const makeVersesFilterUrl = (params?: Record<string, any>) =>
  makeUrl("/verses/filter", params);
