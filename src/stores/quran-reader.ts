import { create } from "zustand";
import { persist } from "zustand/middleware";
import { QuranFont, MushafLines } from "../lib/quran-core/fonts/types";
import { ReadingPreference } from "../types/settings";

// Bump this version when changing default state to force localStorage reset
const STORE_VERSION = 3;

interface QuranReaderState {
  quranFont: QuranFont;
  mushafLines: MushafLines;
  translationFontScale: number;
  quranTextFontScale: number;
  readingPreference: ReadingPreference;
  loadedFonts: string[];

  setQuranFont: (quranFont: QuranFont) => void;
  setMushafLines: (mushafLines: MushafLines) => void;
  setTranslationFontScale: (scale: number) => void;
  setQuranTextFontScale: (scale: number) => void;
  setReadingPreference: (pref: ReadingPreference) => void;
  addLoadedFont: (fontFace: string) => void;
}

export const useQuranReaderStore = create<QuranReaderState>()(
  persist(
    (set) => ({
      // Persistent states
      quranFont: QuranFont.MadaniV2,
      mushafLines: MushafLines.SixteenLines,
      translationFontScale: 3,
      quranTextFontScale: 3,
      readingPreference: ReadingPreference.Translation,

      // Transient state
      loadedFonts: [],

      // Actions
      setQuranFont: (quranFont) => set({ quranFont }),
      setMushafLines: (mushafLines) => set({ mushafLines }),
      setTranslationFontScale: (translationFontScale) => set({ translationFontScale }),
      setQuranTextFontScale: (quranTextFontScale) => set({ quranTextFontScale }),
      setReadingPreference: (readingPreference) => {
        if (typeof window !== "undefined") {
          document.cookie = `reading-pref=${readingPreference};path=/;max-age=31536000;SameSite=Lax`;
        }
        set({ readingPreference });
      },
      addLoadedFont: (fontFace) =>
        set((state) => ({
          loadedFonts: state.loadedFonts.includes(fontFace)
            ? state.loadedFonts
            : [...state.loadedFonts, fontFace],
        })),
    }),
    {
      name: "quran-reader-store",
      version: STORE_VERSION,
      // Exclude transient loadedFonts from local storage persistence
      partialize: (state) => ({
        quranFont: state.quranFont,
        mushafLines: state.mushafLines,
        translationFontScale: state.translationFontScale,
        quranTextFontScale: state.quranTextFontScale,
        readingPreference: state.readingPreference,
      }),
    }
  )
);
