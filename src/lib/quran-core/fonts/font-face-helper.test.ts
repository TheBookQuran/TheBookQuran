import { describe, it, expect } from 'vitest';
import {
  isQCFFont,
  getPagesByVerses,
  quranFontToVersion,
  getQCFFontFaceSource,
  getFontFaceNameForPage,
} from './font-face-helper';
import { QuranFont, QCFFontVersion, ThemeTypeVariant } from './types';

describe('font-face-helper', () => {
  describe('isQCFFont', () => {
    it('should return true for MadaniV2', () => {
      expect(isQCFFont(QuranFont.MadaniV2)).toBe(true);
    });

    it('should return false for other fonts', () => {
      expect(isQCFFont('some_other_font' as unknown as QuranFont)).toBe(false);
    });
  });

  describe('getPagesByVerses', () => {
    it('should return empty list for empty verses', () => {
      expect(getPagesByVerses([])).toEqual([]);
      // @ts-ignore
      expect(getPagesByVerses(null)).toEqual([]);
    });

    it('should return correct page range', () => {
      const verses = [
        { pageNumber: 5 },
        { pageNumber: 5 },
        { pageNumber: 6 },
        { pageNumber: 8 },
      ];
      expect(getPagesByVerses(verses)).toEqual([5, 6, 7, 8]);
    });
  });

  describe('quranFontToVersion', () => {
    it('should map font to V2', () => {
      expect(quranFontToVersion(QuranFont.MadaniV2)).toBe(QCFFontVersion.V2);
    });
  });

  describe('getQCFFontFaceSource', () => {
    it('should build correct FontFace source descriptor', () => {
      const source = getQCFFontFaceSource(QuranFont.MadaniV2, 5, 'light' as unknown as ThemeTypeVariant);
      expect(source).toBe("local(QCF2005), url('/fonts/quran/hafs/v2/woff2/p5.woff2') format('woff2')");
    });
  });

  describe('getFontFaceNameForPage', () => {
    it('should build correct font face name', () => {
      expect(getFontFaceNameForPage(QuranFont.MadaniV2, 5)).toBe('p5-v2');
    });
  });
});
