import { describe, it, expect } from 'vitest';
import { isCenterAlignedPage } from './page-utils';
import { QuranFont } from '../fonts/types';

describe('page-utils', () => {
  describe('isCenterAlignedPage', () => {
    const dummyFont = 'font' as unknown as QuranFont;

    it('should return true for pages 1 and 2 regardless of line number', () => {
      expect(isCenterAlignedPage(1, 5, dummyFont)).toBe(true);
      expect(isCenterAlignedPage(2, 10, dummyFont)).toBe(true);
    });

    it('should return true for specific lines on center-aligned pages', () => {
      // Page 255 Line 2 is center aligned
      expect(isCenterAlignedPage(255, 2, dummyFont)).toBe(true);
      // Page 604 Lines 4, 9, 14, 15 are center aligned
      expect(isCenterAlignedPage(604, 4, dummyFont)).toBe(true);
      expect(isCenterAlignedPage(604, 14, dummyFont)).toBe(true);
    });

    it('should return false for pages/lines that are not center aligned', () => {
      expect(isCenterAlignedPage(3, 5, dummyFont)).toBe(false);
      expect(isCenterAlignedPage(255, 3, dummyFont)).toBe(false);
      expect(isCenterAlignedPage(604, 1, dummyFont)).toBe(false);
    });
  });
});
