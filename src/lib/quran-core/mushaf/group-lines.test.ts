import { describe, it, expect } from 'vitest';
import { groupLinesByVerses } from './group-lines';
import { Verse, Word } from '../../../types/quran';

describe('group-lines', () => {
  describe('groupLinesByVerses', () => {
    it('should return empty object if no verses are passed', () => {
      expect(groupLinesByVerses([])).toEqual({});
    });

    it('should flatten words and group them by page and line number', () => {
      const mockVerses = [
        {
          id: 1,
          hizbNumber: 1,
          words: [
            { id: 101, text: 'word1', pageNumber: 1, lineNumber: 1 } as unknown as Word,
            { id: 102, text: 'word2', pageNumber: 1, lineNumber: 1 } as unknown as Word,
          ],
        },
        {
          id: 2,
          hizbNumber: 1,
          words: [
            { id: 201, text: 'word3', pageNumber: 1, lineNumber: 2 } as unknown as Word,
          ],
        },
      ] as unknown as Verse[];

      const expected = {
        'Page1-Line1': [
          { id: 101, text: 'word1', pageNumber: 1, lineNumber: 1, hizbNumber: 1 },
          { id: 102, text: 'word2', pageNumber: 1, lineNumber: 1, hizbNumber: 1 },
        ],
        'Page1-Line2': [
          { id: 201, text: 'word3', pageNumber: 1, lineNumber: 2, hizbNumber: 1 },
        ],
      };

      expect(groupLinesByVerses(mockVerses)).toEqual(expected);
    });

    it('should ignore verses without words', () => {
      const mockVerses = [
        { id: 1, hizbNumber: 1, words: [] },
        { id: 2, hizbNumber: 1 }, // no words property
      ] as unknown as Verse[];

      expect(groupLinesByVerses(mockVerses)).toEqual({});
    });
  });
});
