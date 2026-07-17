import { describe, it, expect } from 'vitest';
import { AudioRepeatManager } from './repeat-manager';
import { RepeatSettings } from './types';

describe('AudioRepeatManager', () => {
  const defaultSettings: RepeatSettings = {
    totalRangeCycle: 2,
    totalVerseCycle: 3,
    fromVerseNumber: 1,
    toVerseNumber: 3,
    delayMultiplier: 0.5,
  };

  it('should initialize with correct settings', () => {
    const manager = new AudioRepeatManager(defaultSettings);
    expect(manager.getCurrentVerseNumber()).toBe(1);
    expect(manager.getCurrentVerseCycle()).toBe(1);
    expect(manager.getCurrentRangeCycle()).toBe(1);
  });

  describe('onVerseEnded', () => {
    it('should repeat same verse if currentVerseCycle < totalVerseCycle', () => {
      const manager = new AudioRepeatManager(defaultSettings);
      
      // Cycle 1 ends (current becomes 2)
      const step1 = manager.onVerseEnded(10);
      expect(step1).toEqual({
        type: 'REPEAT_SAME',
        verseNumber: 1,
        delay: 5, // 10 * 0.5
      });
      expect(manager.getCurrentVerseCycle()).toBe(2);

      // Cycle 2 ends (current becomes 3)
      const step2 = manager.onVerseEnded(20);
      expect(step2).toEqual({
        type: 'REPEAT_SAME',
        verseNumber: 1,
        delay: 10, // 20 * 0.5
      });
      expect(manager.getCurrentVerseCycle()).toBe(3);
    });

    it('should play next verse when verse cycle completes', () => {
      const manager = new AudioRepeatManager(defaultSettings);
      
      // Cycle 1, 2 ends
      manager.onVerseEnded(10);
      manager.onVerseEnded(10);
      
      // Cycle 3 ends, should play next verse
      const step = manager.onVerseEnded(10);
      expect(step).toEqual({
        type: 'PLAY_NEXT',
        verseNumber: 2,
      });
      expect(manager.getCurrentVerseNumber()).toBe(2);
      expect(manager.getCurrentVerseCycle()).toBe(1);
    });

    it('should repeat range when range ends but totalRangeCycle not completed', () => {
      const manager = new AudioRepeatManager(defaultSettings);
      
      // Verse 1 (3 cycles)
      manager.onVerseEnded(10); manager.onVerseEnded(10); manager.onVerseEnded(10);
      // Verse 2 (3 cycles)
      manager.onVerseEnded(10); manager.onVerseEnded(10); manager.onVerseEnded(10);
      // Verse 3 (2 cycles done)
      manager.onVerseEnded(10); manager.onVerseEnded(10);
      
      // Verse 3 cycle 3 ends, should restart range
      const step = manager.onVerseEnded(10);
      expect(step).toEqual({
        type: 'PLAY_NEXT',
        verseNumber: 1,
      });
      expect(manager.getCurrentVerseNumber()).toBe(1);
      expect(manager.getCurrentRangeCycle()).toBe(2);
    });

    it('should finish when all cycles and ranges complete', () => {
      const manager = new AudioRepeatManager(defaultSettings);
      
      // Range Cycle 1
      // Verse 1 (3 cycles)
      manager.onVerseEnded(10); manager.onVerseEnded(10); manager.onVerseEnded(10);
      // Verse 2 (3 cycles)
      manager.onVerseEnded(10); manager.onVerseEnded(10); manager.onVerseEnded(10);
      // Verse 3 (3 cycles)
      manager.onVerseEnded(10); manager.onVerseEnded(10); manager.onVerseEnded(10);

      // Range Cycle 2
      // Verse 1 (3 cycles)
      manager.onVerseEnded(10); manager.onVerseEnded(10); manager.onVerseEnded(10);
      // Verse 2 (3 cycles)
      manager.onVerseEnded(10); manager.onVerseEnded(10); manager.onVerseEnded(10);
      // Verse 3 (2 cycles done)
      manager.onVerseEnded(10); manager.onVerseEnded(10);

      // Verse 3 cycle 3 ends -> FINISHED
      const step = manager.onVerseEnded(10);
      expect(step).toEqual({
        type: 'FINISHED',
      });
    });
  });

  describe('navigation', () => {
    it('should skip to next ayah if within range', () => {
      const manager = new AudioRepeatManager(defaultSettings);
      const step = manager.nextAyah();
      expect(step).toEqual({
        type: 'PLAY_NEXT',
        verseNumber: 2,
      });
      expect(manager.getCurrentVerseNumber()).toBe(2);
      expect(manager.getCurrentVerseCycle()).toBe(1);
    });

    it('should return finished when nextAyah is called on last ayah', () => {
      const manager = new AudioRepeatManager(defaultSettings);
      manager.nextAyah(); // to 2
      manager.nextAyah(); // to 3
      const step = manager.nextAyah(); // finished
      expect(step).toEqual({ type: 'FINISHED' });
    });

    it('should go back to previous ayah if within range', () => {
      const manager = new AudioRepeatManager(defaultSettings);
      manager.nextAyah(); // to 2
      const step = manager.previousAyah();
      expect(step).toEqual({
        type: 'PLAY_PREV',
        verseNumber: 1,
      });
      expect(manager.getCurrentVerseNumber()).toBe(1);
      expect(manager.getCurrentVerseCycle()).toBe(1);
    });

    it('should return finished when previousAyah is called on first ayah', () => {
      const manager = new AudioRepeatManager(defaultSettings);
      const step = manager.previousAyah();
      expect(step).toEqual({ type: 'FINISHED' });
    });

    it('should select ayah if within range', () => {
      const manager = new AudioRepeatManager(defaultSettings);
      const step = manager.selectAyah(3);
      expect(step).toEqual({
        type: 'PLAY_SELECTED',
        verseNumber: 3,
      });
      expect(manager.getCurrentVerseNumber()).toBe(3);
      expect(manager.getCurrentVerseCycle()).toBe(1);
    });

    it('should return finished when selectAyah is called with out of range ayah', () => {
      const manager = new AudioRepeatManager(defaultSettings);
      const step = manager.selectAyah(4);
      expect(step).toEqual({ type: 'FINISHED' });
    });
  });
});
