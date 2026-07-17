import { describe, it, expect } from 'vitest';
import { sortWordLocation } from './word-utils';

describe('word-utils', () => {
  describe('sortWordLocation', () => {
    it('should sort word locations by chapter first', () => {
      const input = ['2:1:1', '1:1:1'];
      const expected = ['1:1:1', '2:1:1'];
      expect(sortWordLocation(input)).toEqual(expected);
    });

    it('should sort word locations by verse second', () => {
      const input = ['1:10:1', '1:2:1'];
      const expected = ['1:2:1', '1:10:1'];
      expect(sortWordLocation(input)).toEqual(expected);
    });

    it('should sort word locations by word position third', () => {
      const input = ['1:1:10', '1:1:2'];
      const expected = ['1:1:2', '1:1:10'];
      expect(sortWordLocation(input)).toEqual(expected);
    });

    it('should handle complex mixed list', () => {
      const input = ['2:1:2', '1:2:1', '1:1:2', '1:1:1'];
      const expected = ['1:1:1', '1:1:2', '1:2:1', '2:1:2'];
      expect(sortWordLocation(input)).toEqual(expected);
    });
  });
});
