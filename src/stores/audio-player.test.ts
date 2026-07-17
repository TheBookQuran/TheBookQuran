import { describe, it, expect, beforeEach } from "vitest";
import { useAudioPlayerStore } from "./audio-player";
import { RepeatSettings } from "../lib/quran-core/audio/types";
import { AudioRepeatManager } from "../lib/quran-core/audio/repeat-manager";

// Store initial state for resetting
const initialState = useAudioPlayerStore.getState();

describe("audio-player store", () => {
  beforeEach(() => {
    useAudioPlayerStore.setState(initialState, true); // true means replace entire state
  });

  it("should have correct initial state", () => {
    const state = useAudioPlayerStore.getState();
    expect(state.playbackRate).toBe(1);
    expect(state.volume).toBe(1);
    expect(state.repeatSettings).toBeNull();
    expect(state.isPlaying).toBe(false);
    expect(state.currentVerseKey).toBeNull();
    expect(state.elapsed).toBe(0);
    expect(state.duration).toBe(0);
    expect(state.repeatManager).toBeNull();
    expect(state.currentWordLocation).toBeNull();
  });

  it("should set playback rate", () => {
    useAudioPlayerStore.getState().setPlaybackRate(1.5);
    expect(useAudioPlayerStore.getState().playbackRate).toBe(1.5);
  });

  it("should set volume", () => {
    useAudioPlayerStore.getState().setVolume(0.5);
    expect(useAudioPlayerStore.getState().volume).toBe(0.5);
  });

  it("should set isPlaying status", () => {
    useAudioPlayerStore.getState().setIsPlaying(true);
    expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
  });

  it("should set current verse key", () => {
    useAudioPlayerStore.getState().setCurrentVerseKey("1:1");
    expect(useAudioPlayerStore.getState().currentVerseKey).toBe("1:1");
  });

  it("should set elapsed and duration", () => {
    useAudioPlayerStore.getState().setElapsed(10);
    useAudioPlayerStore.getState().setDuration(100);
    expect(useAudioPlayerStore.getState().elapsed).toBe(10);
    expect(useAudioPlayerStore.getState().duration).toBe(100);
  });

  it("should set current word location", () => {
    useAudioPlayerStore.getState().setCurrentWordLocation("1:1:1");
    expect(useAudioPlayerStore.getState().currentWordLocation).toBe("1:1:1");
  });

  it("should set repeat settings and instantiate repeat manager", () => {
    const settings: RepeatSettings = {
      type: "verse",
      repeatCount: 3,
      delayMultiplier: 0,
      range: { startVerseKey: "1:1", endVerseKey: "1:2" }
    };
    useAudioPlayerStore.getState().setRepeatSettings(settings);
    const state = useAudioPlayerStore.getState();
    expect(state.repeatSettings).toEqual(settings);
    expect(state.repeatManager).toBeInstanceOf(AudioRepeatManager);
  });

  it("should clear repeat manager when repeat settings is null", () => {
    const settings: RepeatSettings = {
      type: "verse",
      repeatCount: 3,
      delayMultiplier: 0,
      range: { startVerseKey: "1:1", endVerseKey: "1:2" }
    };
    useAudioPlayerStore.getState().setRepeatSettings(settings);
    useAudioPlayerStore.getState().setRepeatSettings(null);
    const state = useAudioPlayerStore.getState();
    expect(state.repeatSettings).toBeNull();
    expect(state.repeatManager).toBeNull();
  });

  it("should initialize repeat manager directly", () => {
    const settings: RepeatSettings = {
      type: "verse",
      repeatCount: 2,
      delayMultiplier: 0,
      range: { startVerseKey: "2:1", endVerseKey: "2:5" }
    };
    useAudioPlayerStore.getState().initializeRepeatManager(settings);
    const state = useAudioPlayerStore.getState();
    expect(state.repeatSettings).toEqual(settings);
    expect(state.repeatManager).toBeInstanceOf(AudioRepeatManager);
  });

  it("should clear repeat manager directly", () => {
    const settings: RepeatSettings = {
      type: "verse",
      repeatCount: 2,
      delayMultiplier: 0,
      range: { startVerseKey: "2:1", endVerseKey: "2:5" }
    };
    useAudioPlayerStore.getState().initializeRepeatManager(settings);
    useAudioPlayerStore.getState().clearRepeatManager();
    const state = useAudioPlayerStore.getState();
    expect(state.repeatSettings).toBeNull();
    expect(state.repeatManager).toBeNull();
  });
});
