import { QuranFont, MushafLines } from "../lib/quran-core/fonts/types";

export enum ReadingPreference {
  Translation = "translation",
  Reading = "reading",
  ReadingTranslation = "readingTranslation",
}

export enum WordByWordDisplay {
  INLINE = "inline",
  TOOLTIP = "tooltip",
}

export interface UserPreferences {
  theme: "light" | "dark" | "sepia";
  quranFont: QuranFont;
  mushafLines: MushafLines;
  translationFontScale: number;
  quranTextFontScale: number;
  selectedTranslations: number[];
  selectedReciter: number;
  readingPreference: ReadingPreference;
  wordByWordDisplay: WordByWordDisplay;
  isWordByWordTranslation: boolean;
  isWordByWordTransliteration: boolean;
  locale: string;
}
