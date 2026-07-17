import { QuranFont, MushafLines } from "./types";

/**
 * Dynamically generate the className of the combination between the font
 * name + size that will match the output of
 * generate-font-scales function inside utility styles.
 *
 * @param {QuranFont} quranFont
 * @param {number} fontScale
 * @param {MushafLines} mushafLines
 * @param {boolean} isFallbackFont
 * @returns {string}
 */
export const getFontClassName = (
  quranFont: QuranFont,
  fontScale: number,
  mushafLines: MushafLines,
  isFallbackFont = false
): string => {
  return isFallbackFont
    ? `fallback_${quranFont}-font-size-${fontScale}`
    : `${quranFont}-font-size-${fontScale}`;
};

/**
 * Dynamically generate the className of the combination between the font
 * name + size that will match the output of
 * generate-font-scales function inside utility styles.
 *
 * @param {QuranFont} quranFont
 * @param {number} fontScale
 * @param {MushafLines} mushafLines
 * @param {boolean} isFallbackFont
 * @returns {string}
 */
export const getLineWidthClassName = (
  quranFont: QuranFont,
  fontScale: number,
  mushafLines: MushafLines,
  isFallbackFont = false
): string => {
  return isFallbackFont
    ? `fallback_${quranFont}-line-width-${fontScale}`
    : `${quranFont}-line-width-${fontScale}`;
};

