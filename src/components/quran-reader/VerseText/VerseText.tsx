"use client";

import React from "react";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { useSettingsStore } from "@/stores/settings";
import { useUIStore } from "@/stores/ui";
import { useQcfFont } from "@/hooks/use-qcf-font";
import { useIsFontLoaded } from "@/hooks/use-is-font-loaded";
import { Word, Verse } from "@/types/quran";
import QuranWord from "./QuranWord";
import styles from "./VerseText.module.css";

interface VerseTextProps {
  words: Word[];
}

export const VerseText: React.FC<VerseTextProps> = ({ words }) => {
  const font = useQuranReaderStore((state) => state.quranFont);
  const quranTextFontScale = useQuranReaderStore((state) => state.quranTextFontScale);

  const isWordByWordTranslation = useSettingsStore((state) => state.isWordByWordTranslation);
  const isWordByWordTransliteration = useSettingsStore((state) => state.isWordByWordTransliteration);
  const playAudioOnClick = useSettingsStore((state) => state.playAudioOnClick);
  const selectedWordLocation = useUIStore((state) => state.selectedWordLocation);
  const setSelectedWordLocation = useUIStore((state) => state.setSelectedWordLocation);

  const firstWord = words[0];
  const pageNumber = firstWord?.pageNumber || 1;
  const isFontLoaded = useIsFontLoaded(pageNumber, font);

  const handleWordClick = React.useCallback((word: Word) => {
    if (word.location) {
      const displayWordText = word.qpcUthmaniHafs || word.textUthmani || word.text || "";
      setSelectedWordLocation(word.location, displayWordText, word.audioUrl);
    }
  }, [setSelectedWordLocation]);

  // Map the word pages to call the useQcfFont hook
  const uniquePages = React.useMemo(() => {
    const pages = Array.from(new Set(words.map((w) => w.pageNumber).filter(Boolean))) as number[];
    return pages.map((pageNumber) => ({ pageNumber } as Verse));
  }, [words]);

  // Dynamically load font files for the unique pages in this list of words
  useQcfFont(font, uniquePages);

  return (
    <div className={styles.verseTextContainer}>
      <div className={styles.verseText} translate="no">
        {words.map((word, idx) => {
          const isSelected = word.location === selectedWordLocation;

          return (
            <QuranWord
              key={word.id || `${word.verseKey}-${word.position}-${idx}`}
              word={word}
              font={font}
              quranTextFontScale={quranTextFontScale}
              isWordByWordTranslation={isWordByWordTranslation}
              isWordByWordTransliteration={isWordByWordTransliteration}
              playAudioOnClick={playAudioOnClick}
              isSelected={isSelected}
              isFontLoaded={isFontLoaded}
              onWordClick={handleWordClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default VerseText;

//