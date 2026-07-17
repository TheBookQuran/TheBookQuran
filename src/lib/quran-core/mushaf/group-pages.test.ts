import { describe, it, expect } from 'vitest';
import { groupPagesByVerses } from './group-pages';
import { Verse } from '../../../types/quran';

describe('group-pages', () => {
  describe('groupPagesByVerses', () => {
    it('should return empty object if no verses are passed', () => {
      expect(groupPagesByVerses([])).toEqual({});
    });

    it('should group verses by pageNumber', () => {
      const mockVerses = [
        { id: 1, text: 'verse1', pageNumber: 1 } as unknown as Verse,
        { id: 2, text: 'verse2', pageNumber: 1 } as unknown as Verse,
        { id: 3, text: 'verse3', pageNumber: 2 } as unknown as Verse,
      ];

      const expected = {
        1: [
          { id: 1, text: 'verse1', pageNumber: 1 },
          { id: 2, text: 'verse2', pageNumber: 1 },
        ],
        2: [
          { id: 3, text: 'verse3', pageNumber: 2 },
        ],
      };

      expect(groupPagesByVerses(mockVerses)).toEqual(expected);
    });
  });
});
