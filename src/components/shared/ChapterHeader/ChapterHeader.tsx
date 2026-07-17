"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Chapter } from "@/types/quran";
import { useAudioPlayerStore } from "@/stores/audio-player";
import { useUIStore } from "@/stores/ui";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { ReadingPreference } from "@/types/settings";
import { getSurahCalligraphyCode } from "@/lib/quran-core/chapter/chapter-utils";
import { getChapterNumberFromKey } from "@/lib/quran-core/verse/verse-utils";
import clsx from "clsx";
import styles from "./ChapterHeader.module.css";

interface ChapterHeaderProps {
  chapter: Chapter;
  initialReadingPreference?: ReadingPreference;
}

export const ChapterHeader: React.FC<ChapterHeaderProps> = ({ chapter, initialReadingPreference }) => {
  const t = useTranslations("common");
  const readerT = useTranslations("quranReader");
  const locale = useLocale();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const storeReadingPreference = useQuranReaderStore((state) => state.readingPreference);
  const readingPreference = mounted
    ? storeReadingPreference
    : (initialReadingPreference || storeReadingPreference);

  const setReadingPreference = useQuranReaderStore((state) => state.setReadingPreference);

  const currentVerseKey = useAudioPlayerStore((state) => state.currentVerseKey);
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const setCurrentVerseKey = useAudioPlayerStore((state) => state.setCurrentVerseKey);
  const setIsPlaying = useAudioPlayerStore((state) => state.setIsPlaying);
  const setSettingsDrawerOpen = useUIStore((state) => state.setSettingsDrawerOpen);
  const isSettingsDrawerOpen = useUIStore((state) => state.isSettingsDrawerOpen);

  const paddedId = getSurahCalligraphyCode(chapter.id);
  const isArabic = locale === "ar";
  const isChapterPlaying = isPlaying && currentVerseKey && getChapterNumberFromKey(currentVerseKey) === chapter.id;

  const handlePlayClick = () => {
    if (isChapterPlaying) {
      setIsPlaying(false);
    } else {
      // Start from the first verse of the Surah
      setCurrentVerseKey(`${chapter.id}:1`);
      setIsPlaying(true);
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerMain}>
        {/* Dynamic Surah Calligraphy Title */}
        <div className={styles.icon} translate="no">
          {paddedId}
        </div>

        <div className={styles.info}>
          <div className={styles.details}>
            <h2 className={styles.title}>
              {chapter.id}. {isArabic ? chapter.translatedName : chapter.transliteratedName}
            </h2>
            {!isArabic && (
              <p className={styles.subtitle}>
                {chapter.translatedName}
              </p>
            )}
          </div>

          <div className={styles.meta}>
            <span>
              {chapter.revelationPlace === "makkah" ? t("meccan") : t("medinan")}
            </span>
            <div className={styles.separator} />
            <span>
              {chapter.versesCount} {t("verses")}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          onClick={handlePlayClick}
          className={styles.playButton}
          title={isChapterPlaying ? (isArabic ? "إيقاف مؤقت" : "Pause") : (isArabic ? "تشغيل" : "Play")}
        >
          {isChapterPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"></rect>
              <rect x="14" y="4" width="4" height="16" rx="1"></rect>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </button>

        {/* Reading Mode Selector */}
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
          title={t("settings")}
          aria-label={t("settings")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChapterHeader;
