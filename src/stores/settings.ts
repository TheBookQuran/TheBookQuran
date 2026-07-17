import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WordByWordDisplay } from "../types/settings";

interface SettingsState {
  selectedTranslations: number[];
  selectedReciter: number;
  wordByWordDisplay: WordByWordDisplay;
  isWordByWordTranslation: boolean;
  isWordByWordTransliteration: boolean;
  selectedLexicon: "lanes" | "maqayis" | null;
  playAudioOnClick: boolean;
  locale: string;
  wordByWordLocale: string;
  setSelectedTranslations: (translations: number[]) => void;
  setSelectedReciter: (reciterId: number) => void;
  setWordByWordDisplay: (display: WordByWordDisplay) => void;
  setIsWordByWordTranslation: (value: boolean) => void;
  setIsWordByWordTransliteration: (value: boolean) => void;
  setSelectedLexicon: (value: "lanes" | "maqayis" | null) => void;
  setPlayAudioOnClick: (value: boolean) => void;
  setLocale: (locale: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      selectedTranslations: [85], // Abdul Haleem by default
      selectedReciter: 6,          // Mahmoud Khalil Al-Husary by default
      wordByWordDisplay: WordByWordDisplay.TOOLTIP,
      isWordByWordTranslation: false,
      isWordByWordTransliteration: false,
      selectedLexicon: null,
      playAudioOnClick: false,
      locale: "en",
      wordByWordLocale: "en",
      setSelectedTranslations: (selectedTranslations) => set({ selectedTranslations }),
      setSelectedReciter: (selectedReciter) => set({ selectedReciter }),
      setWordByWordDisplay: (wordByWordDisplay) => set({ wordByWordDisplay }),
      setIsWordByWordTranslation: (isWordByWordTranslation) => set({ isWordByWordTranslation }),
      setIsWordByWordTransliteration: (isWordByWordTransliteration) => set({ isWordByWordTransliteration }),
      setSelectedLexicon: (selectedLexicon) => set({ selectedLexicon }),
      setPlayAudioOnClick: (playAudioOnClick) => set({ playAudioOnClick }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "quran-settings-store",
    }
  )
);
