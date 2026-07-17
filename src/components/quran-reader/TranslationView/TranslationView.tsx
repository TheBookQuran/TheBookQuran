"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useAudioPlayerStore } from "@/stores/audio-player";
import { Verse } from "@/types/quran";
import TranslationVerse from "./TranslationVerse";
import styles from "./TranslationView.module.css";

interface TranslationViewProps {
  verses: Verse[];
  startingVerse?: number;
  chapterId?: string | number;
}

export const TranslationView: React.FC<TranslationViewProps> = ({
  verses,
  startingVerse,
  chapterId,
}) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  // Sync scroll position when currentVerseKey changes (audio navigation) without triggering re-renders
  useEffect(() => {
    return useAudioPlayerStore.subscribe((state) => {
      if (state.isPlaying && state.currentVerseKey && virtuosoRef.current) {
        const targetIndex = verses.findIndex((v) => v.verseKey === state.currentVerseKey);
        
        if (targetIndex !== -1) {
          virtuosoRef.current.scrollToIndex({
            index: targetIndex,
            align: "start",
            offset: -100, // Account for sticky header offset
          });
        }
      }
    });
  }, [verses]);

  // Scroll to starting verse on initial navigation (from search, bookmark, etc.)
  useEffect(() => {
    if (!startingVerse || !chapterId || verses.length === 0) return;

    const targetVerseKey = `${Number(chapterId)}:${startingVerse}`;
    const targetIndex = verses.findIndex((v) => v.verseKey === targetVerseKey);

    if (targetIndex !== -1 && virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
        index: targetIndex,
        align: "start",
        offset: -100,
      });
    }
  }, [startingVerse, chapterId, verses]);

  const itemContentRenderer = useCallback((index: number, verse: Verse) => {
    if (!verse) return null;
    return (
      <TranslationVerse
        key={verse.id}
        verse={verse}
      />
    );
  }, []);

  return (
    <div className={styles.container}>
      <Virtuoso
        ref={virtuosoRef}
        useWindowScroll
        increaseViewportBy={1200}
        initialItemCount={Math.min(15, verses.length)}
        data={verses}
        itemContent={itemContentRenderer}
      />
    </div>
  );
};

export default TranslationView;
