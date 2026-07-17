import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RepeatSettings } from "../lib/quran-core/audio/types";
import { AudioRepeatManager } from "../lib/quran-core/audio/repeat-manager";

interface AudioPlayerState {
  // Persisted state
  playbackRate: number;
  volume: number;
  repeatSettings: RepeatSettings | null;

  // Transient state
  isPlaying: boolean;
  currentVerseKey: string | null;
  elapsed: number;
  duration: number;
  repeatManager: AudioRepeatManager | null;
  currentWordLocation: string | null;
  navigatedVerseKey: string | null;

  // Actions
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  setRepeatSettings: (settings: RepeatSettings | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentVerseKey: (verseKey: string | null) => void;
  setElapsed: (elapsed: number) => void;
  setDuration: (duration: number) => void;
  setCurrentWordLocation: (wordLocation: string | null) => void;
  setNavigatedVerseKey: (verseKey: string | null) => void;
  initializeRepeatManager: (settings: RepeatSettings) => void;
  clearRepeatManager: () => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>()(
  persist(
    (set) => ({
      // Default persistent values
      playbackRate: 1,
      volume: 1,
      repeatSettings: null,

      // Default transient values
      isPlaying: false,
      currentVerseKey: null,
      elapsed: 0,
      duration: 0,
      repeatManager: null,
      currentWordLocation: null,
      navigatedVerseKey: null,

      // Actions
      setPlaybackRate: (playbackRate) => set({ playbackRate }),
      setVolume: (volume) => set({ volume }),
      setRepeatSettings: (repeatSettings) => {
        set({ repeatSettings });
        if (repeatSettings) {
          set({ repeatManager: new AudioRepeatManager(repeatSettings) });
        } else {
          set({ repeatManager: null });
        }
      },
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentVerseKey: (currentVerseKey) => set({ currentVerseKey }),
      setElapsed: (elapsed) => set({ elapsed }),
      setDuration: (duration) => set({ duration }),
      setCurrentWordLocation: (currentWordLocation) => set({ currentWordLocation }),
      setNavigatedVerseKey: (navigatedVerseKey) => set({ navigatedVerseKey }),
      initializeRepeatManager: (settings) =>
        set({
          repeatSettings: settings,
          repeatManager: new AudioRepeatManager(settings),
        }),
      clearRepeatManager: () => set({ repeatSettings: null, repeatManager: null }),
    }),
    {
      name: "quran-audio-player-store",
      // Only persist configuration preferences, not transient playback states
      partialize: (state) => ({
        playbackRate: state.playbackRate,
        volume: state.volume,
        repeatSettings: state.repeatSettings,
      }),
      onRehydrateStorage: () => (state) => {
        // If repeatSettings were hydrated, re-instantiate the class repeat manager
        if (state && state.repeatSettings) {
          state.repeatManager = new AudioRepeatManager(state.repeatSettings);
        }
      },
    }
  )
);
