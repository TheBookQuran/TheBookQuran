import { describe, it, expect } from 'vitest';
import {
  generateVerseKeysBetweenTwoVerseKeys,
  parseVerseRange,
  sortByVerseKey,
  sortVerseKeys,
  verseKeysToRanges,
  verseRangesToVerseKeys,
} from './verse-keys';

const mockChaptersData = {
  1: { versesCount: 7 },
  2: { versesCount: 286 },
  3: { versesCount: 200 },
};

describe('verse-keys', () => {
  describe('generateVerseKeysBetweenTwoVerseKeys', () => {
    it('should generate keys within the same chapter', () => {
      const keys = generateVerseKeysBetweenTwoVerseKeys(mockChaptersData, '1:2', '1:5');
      expect(keys).toEqual(['1:2', '1:3', '1:4', '1:5']);
    });

    it('should generate keys across different chapters', () => {
      const keys = generateVerseKeysBetweenTwoVerseKeys(mockChaptersData, '1:6', '2:2');
      // Chapter 1 has 7 verses, so from 1:6 to 2:2 means: 1:6, 1:7, 2:1, 2:2
      expect(keys).toEqual(['1:6', '1:7', '2:1', '2:2']);
    });

    it('should generate keys across multiple chapters intermediate', () => {
      // From 1:6 to 3:2
      // Ch 1: 1:6, 1:7
      // Ch 2: 2:1 -> 2:286 (we'll just check total length and first/last)
      const keys = generateVerseKeysBetweenTwoVerseKeys(mockChaptersData, '1:6', '3:2');
      expect(keys[0]).toBe('1:6');
      expect(keys[1]).toBe('1:7');
      expect(keys[2]).toBe('2:1');
      expect(keys[287]).toBe('2:286');
      expect(keys[288]).toBe('3:1');
      expect(keys[289]).toBe('3:2');
      expect(keys.length).toBe(290); // 2 + 286 + 2
    });
  });

  describe('parseVerseRange', () => {
    it('should parse range string into object format as strings', () => {
      const result = parseVerseRange('1:2-3:4');
      expect(result).toEqual([
        { chapter: '1', verse: '2', verseKey: '1:2' },
        { chapter: '3', verse: '4', verseKey: '3:4' },
      ]);
    });

    it('should parse range string into object format as numbers if requested', () => {
      const result = parseVerseRange('1:2-3:4', true);
      expect(result).toEqual([
        { chapter: 1, verse: 2, verseKey: '1:2' },
        { chapter: 3, verse: 4, verseKey: '3:4' },
      ]);
    });

    it('should return null for invalid range format', () => {
      expect(parseVerseRange('invalid-range')).toBeNull();
      expect(parseVerseRange('1:2-3')).toBeNull();
    });
  });

  describe('sortByVerseKey', () => {
    it('should sort keys in same chapter by verse number', () => {
      expect(sortByVerseKey('1:10', '1:2')).toBeGreaterThan(0); // 10 > 2
      expect(sortByVerseKey('1:2', '1:10')).toBeLessThan(0);
      expect(sortByVerseKey('1:5', '1:5')).toBe(0);
    });

    it('should sort keys by chapter number first', () => {
      expect(sortByVerseKey('2:1', '1:10')).toBeGreaterThan(0); // Ch 2 > Ch 1
      expect(sortByVerseKey('1:10', '2:1')).toBeLessThan(0);
    });
  });

  describe('sortVerseKeys', () => {
    it('should correctly sort list of verse keys', () => {
      const input = ['2:10', '1:2', '2:2', '1:10'];
      const expected = ['1:2', '1:10', '2:2', '2:10'];
      expect(sortVerseKeys(input)).toEqual(expected);
    });
  });

  describe('verseKeysToRanges', () => {
    it('should convert consecutive keys to ranges', () => {
      const input = ['1:1', '1:2', '1:3', '2:1', '2:2'];
      const expected = ['1:1-1:3', '2:1-2:2'];
      expect(verseKeysToRanges(input)).toEqual(expected);
    });

    it('should handle single key ranges', () => {
      const input = ['1:1', '1:3'];
      const expected = ['1:1-1:1', '1:3-1:3'];
      expect(verseKeysToRanges(input)).toEqual(expected);
    });

    it('should return empty array for empty inputs', () => {
      expect(verseKeysToRanges([])).toEqual([]);
    });
  });

  describe('verseRangesToVerseKeys', () => {
    it('should convert ranges back to verse keys', () => {
      const ranges = ['1:2-1:4', '2:1-2:2'];
      const expected = ['1:2', '1:3', '1:4', '2:1', '2:2'];
      expect(verseRangesToVerseKeys(mockChaptersData, ranges)).toEqual(expected);
    });

    it('should filter duplicates', () => {
      const ranges = ['1:2-1:4', '1:3-1:4'];
      const expected = ['1:2', '1:3', '1:4'];
      expect(verseRangesToVerseKeys(mockChaptersData, ranges)).toEqual(expected);
    });
  });
});
