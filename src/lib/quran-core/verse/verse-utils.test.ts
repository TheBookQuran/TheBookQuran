import { describe, it, expect } from 'vitest';
import {
  getChapterNumberFromKey,
  getVerseNumberFromKey,
  getVerseNumberRangeFromKey,
  getVerseAndChapterNumbersFromKey,
  getWordDataByLocation,
  getFirstWordOfSurah,
  formatChapterId,
  getVerseUrl,
  sortVersesObjectByVerseKeys,
  makeVerseKey,
  makeWordLocation,
  isFirstVerseOfSurah,
  isLastVerseOfSurah,
  getChapterFirstAndLastVerseKey,
  getFirstAndLastVerseKeys,
  isVerseKeyWithinRanges,
  getVersePositionWithinAMushafPage,
  getDistanceBetweenVerses,
} from './verse-utils';
import { ScrollAlign } from '../../../types/quran';

const mockChaptersData = {
  1: { versesCount: 7 },
  2: { versesCount: 286 },
  3: { versesCount: 200 },
};

describe('verse-utils', () => {
  describe('getChapterNumberFromKey', () => {
    it('should extract chapter number from verse key', () => {
      expect(getChapterNumberFromKey('2:255')).toBe(2);
      expect(getChapterNumberFromKey('114:6')).toBe(114);
    });
  });

  describe('getVerseNumberFromKey', () => {
    it('should extract verse number from verse key', () => {
      expect(getVerseNumberFromKey('2:255')).toBe(255);
      expect(getVerseNumberFromKey('114:6')).toBe(6);
    });
  });

  describe('getVerseNumberRangeFromKey', () => {
    it('should parse simple verse key', () => {
      expect(getVerseNumberRangeFromKey('2:255')).toEqual({ surah: 2, from: 255, to: 255 });
    });

    it('should parse range verse key', () => {
      expect(getVerseNumberRangeFromKey('2:3-5')).toEqual({ surah: 2, from: 3, to: 5 });
    });
  });

  describe('getVerseAndChapterNumbersFromKey', () => {
    it('should return array of chapter and verse strings', () => {
      expect(getVerseAndChapterNumbersFromKey('2:255')).toEqual(['2', '255']);
    });
  });

  describe('getWordDataByLocation', () => {
    it('should extract chapter, verse, and word positions', () => {
      expect(getWordDataByLocation('2:255:4')).toEqual(['2', '255', '4']);
    });
  });

  describe('getFirstWordOfSurah', () => {
    it('should identify first word of first verse', () => {
      expect(getFirstWordOfSurah('1:1:1')).toEqual({ chapterId: '1', isFirstWordOfSurah: true });
    });

    it('should return false for other words/verses', () => {
      expect(getFirstWordOfSurah('1:1:2')).toEqual({ chapterId: '1', isFirstWordOfSurah: false });
      expect(getFirstWordOfSurah('1:2:1')).toEqual({ chapterId: '1', isFirstWordOfSurah: false });
      expect(getFirstWordOfSurah('2:1:1')).toEqual({ chapterId: '2', isFirstWordOfSurah: true }); // first word of Surah 2
    });
  });

  describe('formatChapterId', () => {
    it('should format single digit IDs', () => {
      expect(formatChapterId(1)).toBe('01');
      expect(formatChapterId('9')).toBe('09');
    });

    it('should format multi-digit IDs using slice', () => {
      expect(formatChapterId(12)).toBe('12');
      expect(formatChapterId(114)).toBe('14'); // Because of slice(-2)
    });
  });

  describe('getVerseUrl', () => {
    it('should construct correct URL paths', () => {
      expect(getVerseUrl('2:255')).toBe('/2/255');
    });
  });

  describe('sortVersesObjectByVerseKeys', () => {
    it('should sort object keys in ascending order of verse keys', () => {
      const input = {
        '2:10': { val: 'ten' },
        '1:2': { val: 'two' },
        '2:2': { val: 'two-two' },
      };
      const expectedKeys = ['1:2', '2:2', '2:10'];
      const result = sortVersesObjectByVerseKeys(input);
      expect(Object.keys(result)).toEqual(expectedKeys);
      expect(result['1:2']).toEqual({ val: 'two' });
    });
  });

  describe('makeVerseKey', () => {
    it('should construct key for single verse', () => {
      expect(makeVerseKey(2, 255)).toBe('2:255');
    });

    it('should construct key for range if rangeTo is different', () => {
      expect(makeVerseKey(2, 3, 5)).toBe('2:3-5');
    });

    it('should construct single key if rangeTo is same', () => {
      expect(makeVerseKey(2, 3, 3)).toBe('2:3');
    });
  });

  describe('makeWordLocation', () => {
    it('should build location string', () => {
      expect(makeWordLocation('2:255', 4)).toBe('2:255:4');
    });
  });

  describe('isFirstVerseOfSurah', () => {
    it('should check if verse is 1', () => {
      expect(isFirstVerseOfSurah(1)).toBe(true);
      expect(isFirstVerseOfSurah(2)).toBe(false);
    });
  });

  describe('isLastVerseOfSurah', () => {
    it('should return true if verse is equal to verses count', () => {
      expect(isLastVerseOfSurah(mockChaptersData, '1', 7)).toBe(true);
    });

    it('should return false if verse is not equal to verses count', () => {
      expect(isLastVerseOfSurah(mockChaptersData, '1', 6)).toBe(false);
    });

    it('should return false if chapter data is missing', () => {
      expect(isLastVerseOfSurah(null, '1', 7)).toBe(false);
    });
  });

  describe('getChapterFirstAndLastVerseKey', () => {
    it('should return first and last verse keys of a chapter', () => {
      expect(getChapterFirstAndLastVerseKey(mockChaptersData, '1')).toEqual(['1:1', '1:7']);
    });

    it('should return empty values if data is missing', () => {
      expect(getChapterFirstAndLastVerseKey(null, '1')).toEqual(['', '']);
    });
  });

  describe('getFirstAndLastVerseKeys', () => {
    it('should return first and last keys from a record', () => {
      const input = {
        '2:10': {},
        '1:2': {},
        '2:2': {},
      };
      expect(getFirstAndLastVerseKeys(input)).toEqual(['1:2', '2:10']);
    });
  });

  describe('isVerseKeyWithinRanges', () => {
    it('should return true if key is within range', () => {
      expect(isVerseKeyWithinRanges('1:3', '1:2-1:5')).toBe(true);
      expect(isVerseKeyWithinRanges('1:3', ['1:2-1:2', '1:3-1:5'])).toBe(true);
    });

    it('should return false if key is outside range', () => {
      expect(isVerseKeyWithinRanges('1:1', '1:2-1:5')).toBe(false);
      expect(isVerseKeyWithinRanges('2:1', '1:2-1:5')).toBe(false);
    });
  });

  describe('getVersePositionWithinAMushafPage', () => {
    const range = { from: '2:1', to: '2:10' };

    it('should return Start if position is in first 33%', () => {
      // verse 1 of 10 -> (1/10)*100 = 10% <= 33.3%
      expect(getVersePositionWithinAMushafPage('2:1', range)).toBe(ScrollAlign.Start);
      // verse 3 of 10 -> (3/10)*100 = 30% <= 33.3%
      expect(getVersePositionWithinAMushafPage('2:3', range)).toBe(ScrollAlign.Start);
    });

    it('should return Center if position is between 33% and 66%', () => {
      // verse 5 of 10 -> (5/10)*100 = 50%
      expect(getVersePositionWithinAMushafPage('2:5', range)).toBe(ScrollAlign.Center);
    });

    it('should return End if position is above 66%', () => {
      // verse 8 of 10 -> (8/10)*100 = 80%
      expect(getVersePositionWithinAMushafPage('2:8', range)).toBe(ScrollAlign.End);
    });
  });

  describe('getDistanceBetweenVerses', () => {
    it('should calculate distance within same chapter', () => {
      expect(getDistanceBetweenVerses(mockChaptersData, '1:2', '1:5')).toBe(3);
      expect(getDistanceBetweenVerses(mockChaptersData, '1:5', '1:2')).toBe(3);
    });

    it('should calculate distance across adjacent chapters', () => {
      // Chapter 1 has 7 verses.
      // From 1:6 to 2:2.
      // Distance is (7 - 6) + 2 = 3.
      expect(getDistanceBetweenVerses(mockChaptersData, '1:6', '2:2')).toBe(3);
    });

    it('should calculate distance across multiple chapters', () => {
      // Chapter 1 has 7 verses.
      // Chapter 2 has 286 verses.
      // From 1:6 to 3:2.
      // Distance is (7 - 6) + 286 + 2 = 289.
      expect(getDistanceBetweenVerses(mockChaptersData, '1:6', '3:2')).toBe(289);
    });
  });
});
