import { describe, it, expect } from 'vitest';
import {
  mapTranslationIds,
  mapSdkVerseToLocalVerse,
  parseVerseOptions,
  buildVersesResponse,
} from './mappers';

describe('mappers', () => {
  describe('mapTranslationIds', () => {
    it('should return undefined if translations is falsy', () => {
      expect(mapTranslationIds()).toBeUndefined();
      expect(mapTranslationIds(null)).toBeUndefined();
    });

    it('should split string IDs and parse to numbers', () => {
      expect(mapTranslationIds('131, 85, 20')).toEqual([85, 85, 20]);
    });

    it('should map arrays of IDs directly', () => {
      expect(mapTranslationIds([131, 20])).toEqual([85, 20]);
    });

    it('should fallback ID 131 to 85', () => {
      expect(mapTranslationIds(131)).toEqual([85]);
      expect(mapTranslationIds('131')).toEqual([85]);
    });
  });

  describe('mapSdkVerseToLocalVerse', () => {
    it('should map SDK verse object to local verse model', () => {
      const mockSdkVerse = {
        id: 1,
        verseNumber: 1,
        chapterId: 1,
        pageNumber: 1,
        juzNumber: 1,
        hizbNumber: 1,
        rubElHizbNumber: 1,
        verseKey: '1:1',
        textUthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        words: [
          {
            id: 101,
            position: 1,
            audioUrl: 'audio1',
            charTypeName: 'word',
            codeV1: 'code1',
            codeV2: 'code2',
            pageNumber: 1,
            lineNumber: 1,
            text: 'بِسْمِ',
            textUthmani: 'بِسْمِ',
            location: '1:1:1',
            verseKey: '1:1',
            translation: { text: 'In the name of', resourceName: 'Trans' },
            transliteration: { text: 'Bismi', languageName: 'English' },
          },
        ],
        translations: [
          { id: 85, text: 'In the name of Allah', resourceName: 'Haleem', languageName: 'English' },
        ],
      };

      const result = mapSdkVerseToLocalVerse(mockSdkVerse);

      expect(result.id).toBe(1);
      expect(result.rubNumber).toBe(1);
      expect(result.verseIndex).toBe(1);
      expect(result.words.length).toBe(1);
      expect(result.words[0].qpcUthmaniHafs).toBe('بِسْمِ');
      expect(result.translations[0].id).toBe(85);
    });

    it('should determine chapterId from verseKey if chapterId is missing', () => {
      const mockVerse = {
        id: 1,
        verseKey: '2:255',
      };
      const result = mapSdkVerseToLocalVerse(mockVerse);
      expect(result.chapterId).toBe(2);
    });

    it('should provide default values for rubNumber and rubElHizbNumber', () => {
      const mockVerse = {
        id: 1,
      };
      const result = mapSdkVerseToLocalVerse(mockVerse);
      expect(result.rubNumber).toBe(1);
      expect(result.rubElHizbNumber).toBeUndefined();
    });
  });

  describe('parseVerseOptions', () => {
    it('should parse options with defaults', () => {
      const parsed = parseVerseOptions('en');
      expect(parsed.language).toBe('en');
      expect(parsed.words).toBe(true);
      expect(parsed.translations).toBeUndefined();
    });

    it('should map custom params', () => {
      const parsed = parseVerseOptions('en', {
        translations: '131,85',
        words: false,
        perPage: 10,
        page: 2,
        reciter: 4,
      });
      expect(parsed.translations).toEqual([85, 85]);
      expect(parsed.words).toBe(false);
      expect(parsed.perPage).toBe(10);
      expect(parsed.page).toBe(2);
      expect(parsed.reciter).toBe(4);
    });
  });

  describe('buildVersesResponse', () => {
    it('should construct response with pagination metadata', () => {
      const rawVerses = [
        { id: 1, verseNumber: 1, verseKey: '1:1' },
        { id: 2, verseNumber: 2, verseKey: '1:2' },
      ];
      const opts = { perPage: 2, page: 1 };
      const response = buildVersesResponse(rawVerses, opts);

      expect(response.verses.length).toBe(2);
      expect(response.pagination.perPage).toBe(2);
      expect(response.pagination.currentPage).toBe(1);
      expect(response.pagination.nextPage).toBe(2); // rawVerses.length === perPage
      expect(response.pagination.totalRecords).toBe(2);
    });

    it('should set nextPage to null if rawVerses length is less than perPage limit', () => {
      const rawVerses = [
        { id: 1, verseNumber: 1, verseKey: '1:1' },
      ];
      const opts = { perPage: 5, page: 1 };
      const response = buildVersesResponse(rawVerses, opts);
      expect(response.pagination.nextPage).toBeNull();
    });
  });
});
