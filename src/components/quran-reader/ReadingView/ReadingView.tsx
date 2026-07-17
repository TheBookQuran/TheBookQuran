"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { useAudioPlayerStore } from "@/stores/audio-player";
import { useSettingsStore } from "@/stores/settings";
import { Verse } from "@/types/quran";
import { getFontClassName, getLineWidthClassName } from "@/lib/quran-core";
import PageContainer from "./PageContainer";
import PageSkeleton from "./PageSkeleton";
import clsx from "clsx";
import { getVerseAndChapterNumbersFromKey, getVerseNumberRangeFromKey, getVersePositionWithinAMushafPage } from "@/lib/quran-core/verse/verse-utils";
import styles from "./ReadingView.module.css";

interface ReadingViewProps {
  pagesCount: number;
  pagesVersesRange: Record<string, { from: string; to: string }>;
  initialVerses: Verse[];
  locale: string;
  highlightedWordLocation?: string | null;
  startingVerse?: number;
  chapterId?: string | number;
}

const getPageNumberByPageIndex = (
  pageIndex: number,
  pagesVersesRange: Record<string, any>
): number => {
  const keys = Object.keys(pagesVersesRange);
  if (keys.length === 0) return 1;
  const startPage = parseInt(keys[0], 10);
  return startPage + pageIndex;
};

const getPageIndexByPageNumber = (
  pageNumber: number,
  pagesVersesRange: Record<string, any>
): number => {
  const keys = Object.keys(pagesVersesRange);
  if (keys.length === 0) return 0;
  const startPage = parseInt(keys[0], 10);
  return pageNumber - startPage;
};

export const ReadingView: React.FC<ReadingViewProps> = ({
  pagesCount,
  pagesVersesRange,
  initialVerses,
  locale,
  startingVerse,
  chapterId,
}) => {
  const font = useQuranReaderStore((state) => state.quranFont);
  const quranTextFontScale = useQuranReaderStore((state) => state.quranTextFontScale);
  const mushafLines = useQuranReaderStore((state) => state.mushafLines);

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  // Font and line-width CSS classes (same for all pages)
  const fontClassName = getFontClassName(font, quranTextFontScale, mushafLines);
  const lineWidthClassName = getLineWidthClassName(font, quranTextFontScale, mushafLines);

  // Sync scroll position when currentVerseKey changes (audio navigation) without triggering re-renders
  useEffect(() => {
    const handleAudioUpdate = (state: any) => {
      const { isPlaying, currentVerseKey } = state;
      if (isPlaying && currentVerseKey && Object.keys(pagesVersesRange).length > 0) {
        let targetPageNumber = -1;

        const [chapterIdStr, verseIdStr] = getVerseAndChapterNumbersFromKey(currentVerseKey);
        const chapterId = parseInt(chapterIdStr, 10);
        const verseId = parseInt(verseIdStr, 10);

        for (const [pageStr, range] of Object.entries(pagesVersesRange)) {
          const fromRange = getVerseNumberRangeFromKey(range.from);
          const fromChapter = fromRange.surah;
          const fromVerse = fromRange.from;
          const toRange = getVerseNumberRangeFromKey(range.to);
          const toChapter = toRange.surah;
          const toVerse = toRange.from;
          const pageNum = parseInt(pageStr, 10);

          // Check if currentVerseKey is within range [from, to]
          const isAfterStart = chapterId > fromChapter || (chapterId === fromChapter && verseId >= fromVerse);
          const isBeforeEnd = chapterId < toChapter || (chapterId === toChapter && verseId <= toVerse);

          if (isAfterStart && isBeforeEnd) {
            targetPageNumber = pageNum;
            break;
          }
        }

        if (targetPageNumber !== -1 && virtuosoRef.current) {
          const targetIndex = getPageIndexByPageNumber(targetPageNumber, pagesVersesRange);
          if (targetIndex >= 0 && targetIndex < pagesCount) {
            virtuosoRef.current.scrollToIndex({
              index: targetIndex,
              align: "start",
              offset: -22,
            });
          }
        }
      }
    };

    // Run initial sync on mount
    handleAudioUpdate(useAudioPlayerStore.getState());

    // Subscribe to future updates
    return useAudioPlayerStore.subscribe(handleAudioUpdate);
  }, [pagesVersesRange, pagesCount]);

  // Scroll to starting verse on initial navigation (from search, bookmark, etc.)
  useEffect(() => {
    if (!startingVerse || !chapterId || Object.keys(pagesVersesRange).length === 0) return;

    const chapterIdNum = Number(chapterId);
    const targetVerseKey = `${chapterIdNum}:${startingVerse}`;
    let targetPageNumber = -1;

    for (const [pageStr, range] of Object.entries(pagesVersesRange)) {
      const fromRange = getVerseNumberRangeFromKey(range.from);
      const fromChapter = fromRange.surah;
      const fromVerse = fromRange.from;
      const toRange = getVerseNumberRangeFromKey(range.to);
      const toChapter = toRange.surah;
      const toVerse = toRange.from;
      const pageNum = parseInt(pageStr, 10);

      const isAfterStart = chapterIdNum > fromChapter || (chapterIdNum === fromChapter && startingVerse >= fromVerse);
      const isBeforeEnd = chapterIdNum < toChapter || (chapterIdNum === toChapter && startingVerse <= toVerse);

      if (isAfterStart && isBeforeEnd) {
        targetPageNumber = pageNum;
        break;
      }
    }

    if (targetPageNumber !== -1 && virtuosoRef.current) {
      const targetIndex = getPageIndexByPageNumber(targetPageNumber, pagesVersesRange);
      if (targetIndex >= 0 && targetIndex < pagesCount) {
        const align = getVersePositionWithinAMushafPage(
          targetVerseKey,
          pagesVersesRange[targetPageNumber]
        );
        virtuosoRef.current.scrollToIndex({
          index: targetIndex,
          align,
          offset: -22,
        });
      }
    }
  }, [startingVerse, chapterId, pagesVersesRange, pagesCount]);

  // Keyboard navigation for page-by-page scrolling in Mushaf view
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input element
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      // ArrowDown / ArrowLeft: Next Page
      // ArrowUp / ArrowRight: Previous Page
      const isNext = event.key === "ArrowDown" || event.key === "ArrowLeft";
      const isPrev = event.key === "ArrowUp" || event.key === "ArrowRight";

      if (!isNext && !isPrev) return;

      // Prevent default scrolling behaviour of arrow keys to avoid double scrolling
      event.preventDefault();

      // Find the currently visible page by querying the DOM
      const pages = document.querySelectorAll(".quran-page");
      let visiblePageIndex = -1;
      
      for (let i = 0; i < pages.length; i++) {
        const rect = pages[i].getBoundingClientRect();
        // A page is considered the "current" visible page if its top is above the middle of the screen
        // or its bottom is below the top of the screen (with a little threshold)
        if (rect.bottom > 100) {
          visiblePageIndex = parseInt(pages[i].getAttribute("data-page-index") || "0", 10);
          break;
        }
      }

      if (visiblePageIndex === -1) return;

      const newIndex = isNext ? visiblePageIndex + 1 : visiblePageIndex - 1;
      
      if (newIndex >= 0 && newIndex < pagesCount && virtuosoRef.current) {
        virtuosoRef.current.scrollToIndex({
          index: newIndex,
          align: "start",
          offset: -22,
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pagesCount]);

  const itemContentRenderer = useCallback((pageIndex: number) => {
    const pageNumber = getPageNumberByPageIndex(pageIndex, pagesVersesRange);
    const pageLookupRecord = pagesVersesRange[pageNumber];
    
    return (
      <PageContainer
        key={pageNumber}
        pageIndex={pageIndex}
        pageNumber={pageNumber}
        locale={locale}
        fontClassName={fontClassName}
        lineWidthClassName={lineWidthClassName}
        initialVerses={initialVerses}
        pageLookupRecord={pageLookupRecord}
      />
    );
  }, [pagesVersesRange, locale, fontClassName, lineWidthClassName, initialVerses]);

  const isWordByWordTranslation = useSettingsStore((state) => state.isWordByWordTranslation);
  const isWordByWordTransliteration = useSettingsStore((state) => state.isWordByWordTransliteration);

  if (pagesCount === 0 || Object.keys(pagesVersesRange).length === 0) {
    const isWordByWordLayout = isWordByWordTranslation || isWordByWordTransliteration;
    return (
      <div className={clsx(styles.container, lineWidthClassName)}>
        <PageSkeleton 
          mushafLines={mushafLines} 
          font={font} 
          quranTextFontScale={quranTextFontScale}
          isWordByWordLayout={isWordByWordLayout}
        />
      </div>
    );
  }

  return (
    <div className={clsx(styles.container, lineWidthClassName)}>
      <Virtuoso
        ref={virtuosoRef}
        useWindowScroll
        increaseViewportBy={1200}
        className={styles.virtuosoScroller}
        initialItemCount={1} // needed for SSR
        totalCount={pagesCount}
        itemContent={itemContentRenderer}
      />
    </div>
  );
};

export default ReadingView;
