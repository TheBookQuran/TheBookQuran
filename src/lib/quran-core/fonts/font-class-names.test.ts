import { describe, it, expect } from 'vitest';
import { getFontClassName, getLineWidthClassName } from './font-class-names';
import { QuranFont, MushafLines } from './types';

describe('font-class-names', () => {
  const dummyFont = 'font' as unknown as QuranFont;
  const dummyLines = 'lines' as unknown as MushafLines;

  describe('getFontClassName', () => {
    it('should generate classname for standard font', () => {
      expect(getFontClassName(dummyFont, 3, dummyLines)).toBe('font-font-size-3');
    });

    it('should generate classname for fallback font', () => {
      expect(getFontClassName(dummyFont, 3, dummyLines, true)).toBe('fallback_font-font-size-3');
    });
  });

  describe('getLineWidthClassName', () => {
    it('should generate classname for standard line width', () => {
      expect(getLineWidthClassName(dummyFont, 3, dummyLines)).toBe('font-line-width-3');
    });

    it('should generate classname for fallback line width', () => {
      expect(getLineWidthClassName(dummyFont, 3, dummyLines, true)).toBe('fallback_font-line-width-3');
    });
  });
});
