"use client";

import React from "react";
import { QuranFont } from "@/lib/quran-core/fonts/types";
import { isQCFFont, getFontFaceNameForPage } from "@/lib/quran-core/fonts/font-face-helper";
import { useAudioPlayerStore } from "@/stores/audio-player";
import { getWordAudioUrl } from "@/lib/quran-core/chapter/chapter-utils";
import { Word } from "@/types/quran";
import clsx from "clsx";
import styles from "./VerseText.module.css";

interface QuranWordProps {
  word: Word;
  highlightVerseOnPlay?: boolean;
  font: QuranFont;
  quranTextFontScale: number;
  isWordByWordTranslation: boolean;
  isWordByWordTransliteration: boolean;
  playAudioOnClick: boolean;
  isSelected: boolean;
  isFontLoaded: boolean;
  onWordClick: (word: Word) => void;
}

export const QuranWord: React.FC<QuranWordProps> = ({
  word,
  highlightVerseOnPlay,
  font,
  quranTextFontScale,
  isWordByWordTranslation,
  isWordByWordTransliteration,
  playAudioOnClick,
  isSelected,
  isFontLoaded,
  onWordClick,
}) => {
  // Subscribe to audio player store to compute highlight status in-place
  const highlighted = useAudioPlayerStore((state) => {
    const wordLocation = `${word.verseKey}:${word.position}`;
    const isWordPlaying = state.currentWordLocation === wordLocation;
    if (isWordPlaying) return true;

    // Highlight all words of the verse if verse is playing and word-by-word tracking is not active
    if (
      highlightVerseOnPlay &&
      state.isPlaying &&
      state.currentVerseKey === word.verseKey &&
      !state.currentWordLocation
    ) {
      return true;
    }
    return false;
  });

  const isQCF = isQCFFont(font);
  const isWord = word.charTypeName === "word";

  // Determine font class name for QCF fonts
  const fontFaceName = isQCF ? getFontFaceNameForPage(font, word.pageNumber || 1) : "";

  const fontClass = isQCF && isFontLoaded ? fontFaceName : font;
  const sizeClass = isFontLoaded
    ? `${font}-font-size-${quranTextFontScale}`
    : `fallback_qpc_uthmani_hafs-font-size-${quranTextFontScale}`;

  // Resolve what Arabic text/glyph to display
  // If font is not loaded yet, use the standard Unicode Uthmani text to prevent weird symbol rendering
  const arabicText = isFontLoaded
    ? word.codeV2
    : (word.qpcUthmaniHafs || word.textUthmani || word.text);

  // Play audio recitation for this word on click
  const playWordAudio = () => {
    if (word.location) {
      const fullUrl = getWordAudioUrl(word.location);
      
      // Stop previously playing word audio if it exists
      if ((window as any).wordByWordAudioPlayerEl) {
        (window as any).wordByWordAudioPlayerEl.pause();
        (window as any).wordByWordAudioPlayerEl = null;
      }
      
      const audio = new Audio(fullUrl);
      (window as any).wordByWordAudioPlayerEl = audio;
      audio.play().catch((err) => console.error("Error playing word audio:", err));
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playAudioOnClick) {
      playWordAudio();
    }
    if (isWord) {
      onWordClick(word);
    }
  };

  const wordElement = (
    <span
      className={clsx(
        styles.word,
        !isFontLoaded && styles.fallbackText,
        isFontLoaded && fontClass,
        sizeClass,
        (highlighted || isSelected) && styles.highlighted
      )}
      style={isQCF ? { fontFamily: isFontLoaded ? fontClass : "var(--font-family-kitab)" } : undefined}
      translate="no"
    >
      {arabicText}
    </span>
  );

  if (isWord) {
    return (
      <div
        className={styles.wordContainer}
        onClick={handleClick}
      >
        {wordElement}
        
        {/* CSS Tooltip content */}
        <div className={styles.tooltipCard}>
          <span className={styles.tooltipTranslation}>
            {word.translation?.text || "No translation"}
          </span>
        </div>

        {/* Inline Word-by-Word Translation/Transliteration display */}
        {isWordByWordTransliteration && word.transliteration?.text && (
          <span className={styles.inlineText}>{word.transliteration.text}</span>
        )}
        {isWordByWordTranslation && word.translation?.text && (
          <span className={styles.inlineText}>{word.translation.text}</span>
        )}
      </div>
    );
  }

  // For non-word symbols like end indicators or pause marks, just render inline
  return (
    <div className={styles.wordContainer} onClick={handleClick}>
      {wordElement}
    </div>
  );
};

export default React.memo(QuranWord, (prev, next) => {
  return (
    prev.highlightVerseOnPlay === next.highlightVerseOnPlay &&
    prev.isSelected === next.isSelected &&
    prev.font === next.font &&
    prev.quranTextFontScale === next.quranTextFontScale &&
    prev.isWordByWordTranslation === next.isWordByWordTranslation &&
    prev.isWordByWordTransliteration === next.isWordByWordTransliteration &&
    prev.playAudioOnClick === next.playAudioOnClick &&
    prev.word.id === next.word.id &&
    prev.isFontLoaded === next.isFontLoaded
  );
});
