import { describe, it, expect } from 'vitest';
import { getSurahCalligraphyCode, hasBismillahPre, getWordAudioUrl } from './chapter-utils';

describe('chapter-utils', () => {
  describe('getSurahCalligraphyCode', () => {
    it('should pad single digit IDs to 3 characters', () => {
      expect(getSurahCalligraphyCode(1)).toBe('001');
      expect(getSurahCalligraphyCode('9')).toBe('009');
    });

    it('should pad double digit IDs to 3 characters', () => {
      expect(getSurahCalligraphyCode(36)).toBe('036');
      expect(getSurahCalligraphyCode('99')).toBe('099');
    });

    it('should not pad triple digit IDs', () => {
      expect(getSurahCalligraphyCode(114)).toBe('114');
      expect(getSurahCalligraphyCode('114')).toBe('114');
    });
  });

  describe('hasBismillahPre', () => {
    it('should return false for Al-Fatiha (1)', () => {
      expect(hasBismillahPre(1)).toBe(false);
      expect(hasBismillahPre('1')).toBe(false);
    });

    it('should return false for At-Tawbah (9)', () => {
      expect(hasBismillahPre(9)).toBe(false);
      expect(hasBismillahPre('9')).toBe(false);
    });

    it('should return true for other chapters', () => {
      expect(hasBismillahPre(2)).toBe(true);
      expect(hasBismillahPre('36')).toBe(true);
      expect(hasBismillahPre(114)).toBe(true);
    });
  });

  describe('getWordAudioUrl', () => {
    it('should build the correct audio URL from location string', () => {
      expect(getWordAudioUrl('1:1:1')).toBe('https://audio.qurancdn.com/wbw/001_001_001.mp3');
      expect(getWordAudioUrl('2:255:4')).toBe('https://audio.qurancdn.com/wbw/002_255_004.mp3');
      expect(getWordAudioUrl('114:6:3')).toBe('https://audio.qurancdn.com/wbw/114_006_003.mp3');
    });
  });
});
