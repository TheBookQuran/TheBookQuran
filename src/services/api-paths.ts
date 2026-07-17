import { QuranFont, MushafLines } from "../lib/quran-core/fonts/types";

export const API_HOST = "https://api.qurancdn.com/api/qdc";
export const ITEMS_PER_PAGE = 10;

export enum Mushaf {
  QCFV2 = 1,
}

export const QuranFontMushaf: Record<QuranFont, Mushaf> = {
  [QuranFont.MadaniV2]: Mushaf.QCFV2,
};

export function getMushafId(quranFont: QuranFont = QuranFont.MadaniV2, mushafLines?: MushafLines): number {
  const mushaf = QuranFontMushaf[quranFont];
  return mushaf || Mushaf.QCFV2;
}

export function getDefaultWordFields(quranFont: QuranFont = QuranFont.MadaniV2): string {
  return `verse_key,verse_id,page_number,line_number,location,text_uthmani,text_imlaei_simple,${quranFont},qpc_uthmani_hafs`;
}

export const DEFAULT_TRANSLATION_ID = 85;

export function getDefaultVersesParams(options?: { perPage?: number | string }) {
  return {
    translations: String(DEFAULT_TRANSLATION_ID),
    mushaf: getMushafId(QuranFont.MadaniV2),
    wordFields: getDefaultWordFields(QuranFont.MadaniV2),
    perPage: options?.perPage ?? 30,
  };
}
