import { describe, it, expect } from 'vitest';
import { htmlToPlainText, truncateAtWord } from './textUtils';

describe('textUtils', () => {
  describe('htmlToPlainText', () => {
    it('should strip HTML tags', () => {
      expect(htmlToPlainText('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
    });

    it('should normalize multiple spaces and newlines', () => {
      expect(htmlToPlainText('Hello \n\n   World')).toBe('Hello World');
    });

    it('should decode common HTML entities', () => {
      expect(htmlToPlainText('Hello &amp; World &lt; &gt; &quot; &#39;')).toBe('Hello & World < > " \'');
    });

    it('should handle &nbsp; as space', () => {
      expect(htmlToPlainText('Hello&nbsp;World')).toBe('Hello World');
    });

    it('should return empty string for empty inputs', () => {
      expect(htmlToPlainText('')).toBe('');
      // @ts-ignore
      expect(htmlToPlainText(null)).toBe('');
    });
  });

  describe('truncateAtWord', () => {
    it('should not truncate if text is shorter than maxChars', () => {
      const text = 'Hello World';
      expect(truncateAtWord(text, 20)).toBe(text);
    });

    it('should truncate at word boundary if within 75% range', () => {
      const text = 'This is a long sentence that should be truncated';
      // maxChars is 25. 'This is a long sentence ' is 24 chars (including trailing space).
      // 'This is a long sentence' is 23 chars. 23 > 25 * 0.75 (18.75).
      expect(truncateAtWord(text, 25)).toBe('This is a long sentence...');
    });

    it('should force truncate if last space is not within 75% range', () => {
      const text = 'Supercalifragilisticexpialidocious text';
      // maxChars is 15. The first space is at index 34.
      // 15 * 0.75 = 11.25. The last space in the first 15 chars is -1.
      expect(truncateAtWord(text, 15)).toBe('Supercalifragil...');
    });

    it('should append ellipsis', () => {
      const text = 'Hello my friend';
      expect(truncateAtWord(text, 10)).toBe('Hello my...');
    });
  });
});
