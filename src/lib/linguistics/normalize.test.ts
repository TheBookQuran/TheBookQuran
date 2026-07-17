import { describe, it, expect } from 'vitest';
import { normalizeRoot } from './normalize';

describe('normalizeRoot', () => {
  it('should return null when raw is falsy', () => {
    expect(normalizeRoot(null)).toBeNull();
    expect(normalizeRoot(undefined)).toBeNull();
  });

  it('should map camelCase keys correctly', () => {
    const raw = {
      id: 'root-1',
      arabicText: 'كتب',
      occurrencesCount: 15,
      lanesMeaning: 'to write',
      maqayisMeaning: 'origin of writing',
      transliteration: 'k-t-b',
    };
    const expected = {
      id: 'root-1',
      arabicText: 'كتب',
      occurrencesCount: 15,
      lanesMeaning: 'to write',
      maqayisMeaning: 'origin of writing',
      transliteration: 'k-t-b',
    };
    expect(normalizeRoot(raw)).toEqual(expected);
  });

  it('should fallback to snake_case keys correctly', () => {
    const raw = {
      id: 'root-1',
      arabic_text: 'كتب',
      occurrences_count: '15',
      lanes_meaning: 'to write',
      maqayis_meaning: 'origin of writing',
      transliteration: 'k-t-b',
    };
    const expected = {
      id: 'root-1',
      arabicText: 'كتب',
      occurrencesCount: 15,
      lanesMeaning: 'to write',
      maqayisMeaning: 'origin of writing',
      transliteration: 'k-t-b',
    };
    expect(normalizeRoot(raw)).toEqual(expected);
  });

  it('should fallback to alternative meaning keys (lexicalMeaning / lexical_meaning)', () => {
    const raw1 = {
      id: 'root-1',
      lexicalMeaning: 'lex-meaning',
    };
    expect(normalizeRoot(raw1)?.lanesMeaning).toBe('lex-meaning');

    const raw2 = {
      id: 'root-1',
      lexical_meaning: 'lex-meaning-snake',
    };
    expect(normalizeRoot(raw2)?.lanesMeaning).toBe('lex-meaning-snake');
  });

  it('should handle missing or invalid occurrencesCount safely', () => {
    const raw = {
      id: 'root-1',
    };
    const expected = {
      id: 'root-1',
      arabicText: undefined,
      occurrencesCount: 0,
      lanesMeaning: undefined,
      maqayisMeaning: undefined,
      transliteration: undefined,
    };
    expect(normalizeRoot(raw)).toEqual(expected);
  });
});
