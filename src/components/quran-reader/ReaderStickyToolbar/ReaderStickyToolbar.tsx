"use client";

import React, { useEffect, useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useVerseTrackerStore } from "@/stores/verse-tracker";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { useUIStore } from "@/stores/ui";
import { useAudioPlayerStore } from "@/stores/audio-player";
import { ReadingPreference } from "@/types/settings";
import { useChapters } from "@/hooks/use-chapters";
import { getChapterNumberFromKey } from "@/lib/quran-core/verse/verse-utils";
import { SurahSelectorDropdown } from "@/components/shared/SurahSelectorDropdown/SurahSelectorDropdown";
import ReadingProgressBar from "@/components/shared/ReadingProgressBar";
import clsx from "clsx";
import styles from "./ReaderStickyToolbar.module.css";

interface ReaderStickyToolbarProps {
  initialReadingPreference?: ReadingPreference;
}

export const ReaderStickyToolbar: React.FC<ReaderStickyToolbarProps> = ({ initialReadingPreference }) => {
  const locale = useLocale();
  const commonT = useTranslations("common");
  const readerT = useTranslations("quranReader");

  const [isSticky, setIsSticky] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeVerseKey = useVerseTrackerStore((state) => state.activeVerseKey);
  const activeJuz = useVerseTrackerStore((state) => state.activeJuz);
  const activeHizb = useVerseTrackerStore((state) => state.activeHizb);
  const activePage = useVerseTrackerStore((state) => state.activePage);
  
  const storeReadingPreference = useQuranReaderStore((state) => state.readingPreference);
  const readingPreference = mounted
    ? storeReadingPreference
    : (initialReadingPreference || storeReadingPreference);

  const setReadingPreference = useQuranReaderStore((state) => state.setReadingPreference);
  const setSettingsDrawerOpen = useUIStore((state) => state.setSettingsDrawerOpen);
  const isSettingsDrawerOpen = useUIStore((state) => state.isSettingsDrawerOpen);

  const currentVerseKey = useAudioPlayerStore((state) => state.currentVerseKey);
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const setCurrentVerseKey = useAudioPlayerStore((state) => state.setCurrentVerseKey);
  const setIsPlaying = useAudioPlayerStore((state) => state.setIsPlaying);

  const chapterId = activeVerseKey ? getChapterNumberFromKey(activeVerseKey) : null;
  const { data: chapters } = useChapters(locale);
  const chapter = chapterId ? chapters?.find((c) => c.id === chapterId) : null;
  const chapterName = chapter ? (locale === "ar" ? chapter.translatedName : chapter.transliteratedName) : "";

  const isChapterPlaying = isPlaying && chapterId !== null && currentVerseKey !== null && getChapterNumberFromKey(currentVerseKey) === chapterId;

  const handlePlayClick = () => {
    if (chapterId === null) return;
    if (isChapterPlaying) {
      setIsPlaying(false);
    } else {
      // Start from the active verse currently on screen
      setCurrentVerseKey(activeVerseKey || `${chapterId}:1`);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // If scroll is past 50px, we assume the navbar is hidden and the toolbar sticks at top: 0
      setIsSticky(window.scrollY >= 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Only render if we have some data to show
  if (!activeVerseKey) return null;

  return (
    <div 
      ref={toolbarRef}
      className={clsx(styles.toolbarContainer, { [styles.isSticky]: isSticky })}
    >
      <ReadingProgressBar />
      <div className={styles.toolbarContent}>
        
        {/* Left Section: Chapter and Verse Info */}
        <div className={styles.infoSection}>
          {chapterName && chapterId && (
            <SurahSelectorDropdown
              currentChapterId={chapterId}
              chapterName={chapterName}
            />
          )}
          {chapterName && (
            <span className={clsx(styles.divider, {
              [styles.hideOnMobileReading]: readingPreference === ReadingPreference.Reading
            })}>
              |
            </span>
          )}
          <div className={clsx(styles.metaData, {
            [styles.hideOnMobileReading]: readingPreference === ReadingPreference.Reading
          })}>
             {activePage && <span>{commonT("page")} {activePage}</span>}
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className={styles.actionsSection}>
          {/* Play Chapter Button */}
          {readingPreference !== ReadingPreference.Translation && (
            <button
              onClick={handlePlayClick}
              className={styles.playButton}
              title={isChapterPlaying ? (locale === "ar" ? "إيقاف مؤقت" : "Pause") : (locale === "ar" ? "تشغيل" : "Play")}
            >
              {isChapterPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                  <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>
          )}

          {/* Reading Mode Selector (compact) */}
          <div className={styles.modeSelector}>
            {[
              { id: ReadingPreference.Translation, name: readerT("translation") },
              { id: ReadingPreference.Reading, name: readerT("reading") },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setReadingPreference(item.id)}
                className={clsx(styles.modeButton, {
                  [styles.activeMode]: readingPreference === item.id,
                })}
              >
                {item.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSettingsDrawerOpen(!isSettingsDrawerOpen)}
            className={styles.settingsButton}
            title={commonT("settings")}
            aria-label={commonT("settings")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReaderStickyToolbar;
