"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { useJournalStore } from "@/stores/journal";
import { useAudioPlayerStore } from "@/stores/audio-player";
import { ReadingPreference } from "@/types/settings";
import { Verse } from "@/types/quran";
import { useVerses } from "@/hooks/use-quran-query";
import { useChapters } from "@/hooks/use-chapters";
import { usePagesLookup } from "@/hooks/use-pages-lookup";
import TranslationView from "./TranslationView";
import ReadingView from "./ReadingView";
import WordRootSidebar from "../linguistics/WordRootSidebar/WordRootSidebar";
import VerseTracker from "./VerseTracker";
import ReaderStickyToolbar from "./ReaderStickyToolbar/ReaderStickyToolbar";
import styles from "./QuranReader.module.css";

interface QuranReaderProps {
  initialVerses: Verse[];
  chapterId?: string | number;
  locale: string;
  verseRange?: string; // e.g. "1-5"
  juzId?: string | number;
  hizbId?: string | number;
  rubId?: string | number;
  pageId?: string | number;
  initialReadingPreference?: ReadingPreference;
  startingVerse?: number;
}

export const QuranReader: React.FC<QuranReaderProps> = ({
  initialVerses,
  chapterId,
  locale,
  verseRange,
  juzId,
  hizbId,
  rubId,
  pageId,
  initialReadingPreference,
  startingVerse,
}) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const storeReadingPreference = useQuranReaderStore((state) => state.readingPreference);
  const readingPreference = mounted
    ? storeReadingPreference
    : (initialReadingPreference || storeReadingPreference);

  const commonT = useTranslations("common");
  const addHistoryItem = useJournalStore((state) => state.addHistoryItem);
  const setNavigatedVerseKey = useAudioPlayerStore((state) => state.setNavigatedVerseKey);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  // Set navigated verse key when navigating to a specific starting verse
  useEffect(() => {
    if (startingVerse && chapterId) {
      setNavigatedVerseKey(`${chapterId}:${startingVerse}`);
    } else {
      setNavigatedVerseKey(null);
    }
  }, [startingVerse, chapterId, setNavigatedVerseKey]);

  // Add current view to reading history
  useEffect(() => {
    if (chapterId) {
      addHistoryItem({
        type: "surah",
        label: locale === "ar" ? `سورة ${chapterId}` : `Surah ${chapterId}`,
        key: String(chapterId),
      });
    } else if (juzId) {
      addHistoryItem({
        type: "juz",
        label: locale === "ar" ? `الجزء ${juzId}` : `Juz ${juzId}`,
        key: String(juzId),
      });
    } else if (hizbId) {
      addHistoryItem({
        type: "hizb",
        label: locale === "ar" ? `الحزب ${hizbId}` : `Hizb ${hizbId}`,
        key: String(hizbId),
      });
    } else if (pageId) {
      addHistoryItem({
        type: "page",
        label: locale === "ar" ? `الصفحة ${pageId}` : `Page ${pageId}`,
        key: String(pageId),
      });
    }
  }, [chapterId, juzId, hizbId, pageId, locale, addHistoryItem]);
  
  const { filterType, id, options } = React.useMemo(() => {
    if (verseRange) {
      const [startStr, endStr] = verseRange.split("-");
      const fromKey = startStr ? `${chapterId}:${startStr}` : "";
      const toKey = (endStr || startStr) ? `${chapterId}:${endStr || startStr}` : "";
      return { filterType: "range" as const, id: "", options: { from: fromKey, to: toKey } };
    }
    if (juzId) return { filterType: "juz" as const, id: juzId };
    if (hizbId) return { filterType: "hizb" as const, id: hizbId };
    if (rubId) return { filterType: "rub" as const, id: rubId };
    if (pageId) return { filterType: "page" as const, id: pageId };
    return { filterType: "chapter" as const, id: chapterId || "" };
  }, [chapterId, verseRange, juzId, hizbId, rubId, pageId]);

  const isReadingMode = readingPreference === ReadingPreference.Reading || pageId !== undefined;

  const queryResult = useVerses(filterType, id, locale, {
    ...options,
    enabled: !isReadingMode,
  });

  const pagesLookupResult = usePagesLookup(filterType, id || chapterId || "", options);
  const pagesCount = pagesLookupResult.data?.totalPage || 0;
  const pagesVersesRange = pagesLookupResult.data?.pages || {};

  const { data: chapters } = useChapters(locale);
  const chapter = chapterId ? chapters?.find((c) => c.id === Number(chapterId)) : null;
  const totalVerses = chapter?.versesCount || null;

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = queryResult;

  const verses = queryResult.data?.pages
    ? queryResult.data.pages.flatMap((page) => page.verses || [])
    : initialVerses;

  // Pre-fetch pages until the target starting verse is loaded
  // (Translation mode starts from the beginning of the surah, so we need to
  //  auto-advance through pages until the target verse is available for scroll)
  const targetKeyRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!startingVerse || !chapterId || isReadingMode) return;

    const targetVerseKey = `${Number(chapterId)}:${startingVerse}`;

    if (targetKeyRef.current !== targetVerseKey) {
      targetKeyRef.current = targetVerseKey;
    }

    const isTargetLoaded = verses.some((v) => v.verseKey === targetVerseKey);

    if (isTargetLoaded) {
      targetKeyRef.current = null;
    } else if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [startingVerse, chapterId, verses, hasNextPage, isFetchingNextPage, fetchNextPage, isReadingMode]);

  React.useEffect(() => {
    if (isReadingMode || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "2400px" } // Preload 3 pages in advance (~2400px)
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isReadingMode, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const readerContent =
    readingPreference === ReadingPreference.Reading || pageId !== undefined ? (
      <ReadingView
        pagesCount={pagesCount}
        pagesVersesRange={pagesVersesRange}
        initialVerses={initialVerses}
        locale={locale}
        startingVerse={startingVerse}
        chapterId={chapterId}
      />
    ) : (
      <TranslationView verses={verses} startingVerse={startingVerse} chapterId={chapterId} />
    );

  return (
    <div className={styles.wrapper}>
      <WordRootSidebar />
      <VerseTracker verses={verses} chapterId={chapterId} totalVerses={totalVerses} />
      
      <div className={styles.container}>
        <ReaderStickyToolbar initialReadingPreference={initialReadingPreference} />
        {readerContent}

        {/* Infinite Scroll Trigger */}
        {!isReadingMode && hasNextPage && (
          <div ref={loadMoreRef} className={styles.loadMore}>
            {isFetchingNextPage ? (
              <div className={styles.spinner} />
            ) : (
              <span className={styles.loadMoreText}>{commonT("loading")}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuranReader;
