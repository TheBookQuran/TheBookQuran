import { QuranFont, QCFFontVersion, ThemeTypeVariant } from "./types";

const QCFFontCodes = [QuranFont.MadaniV2];

export const isQCFFont = (font: QuranFont) => QCFFontCodes.includes(font);

/**
 * Get the page numbers of a group of verses by getting
 * the page number of the first verse, the page number of the last verse
 * and generating the range between both of them.
 *
 * @param {Array<{ pageNumber: number }>} verses
 * @returns {number[]}
 */
export const getPagesByVerses = (verses: { pageNumber: number }[]): number[] => {
  if (!verses || verses.length === 0) return [];
  const firstPage = verses[0].pageNumber;
  const lastPage = verses[verses.length - 1].pageNumber;

  const pages: number[] = [];
  for (let i = firstPage; i <= lastPage; i++) {
    pages.push(i);
  }
  return pages;
};

/**
 * Convert Quran font name to version
 * code_v2 -> v2
 *
 * @param {QuranFont} quranFont
 * @returns {QCFFontVersion}
 */
export const quranFontToVersion = (quranFont: QuranFont): QCFFontVersion =>
  QCFFontVersion.V2;

const getFontPath = (
  quranFont: QuranFont,
  pageNumber: number,
  version: QCFFontVersion,
  theme: ThemeTypeVariant
) => {
  const path = version as string;
  const woff2 = `/fonts/quran/hafs/${path}/woff2/p${pageNumber}.woff2`;
  return { woff2 };
};

/**
 * A function that will return the value of the src of QCF's font V2.
 * This will be used when we create a new instance of FontFace inside useQcfFont
 * hook.
 *
 * @param {QuranFont} quranFont
 * @param {number} pageNumber
 * @param {ThemeTypeVariant} theme
 * @returns {string}
 */
export const getQCFFontFaceSource = (
  quranFont: QuranFont,
  pageNumber: number,
  theme: ThemeTypeVariant
): string => {
  const pageName = String(pageNumber).padStart(3, "0");

  const prefixesMap = {
    [QuranFont.MadaniV2]: "QCF2",
  };

  const { woff2 } = getFontPath(quranFont, pageNumber, QCFFontVersion.V2, theme);
  return `local(${prefixesMap[quranFont]}${pageName}), url('${woff2}') format('woff2')`;
};

/**
 * A function that will return the value of the font-face of QCF's font V2.
 * This will be used when we create a new instance of FontFace inside useQcfFont
 * hook.
 *
 * @param {QuranFont} quranFont
 * @param {number} pageNumber
 * @returns {string}
 */
export const getFontFaceNameForPage = (quranFont: QuranFont, pageNumber: number): string =>
  `p${pageNumber}-${quranFontToVersion(quranFont)}`;

