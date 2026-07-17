"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { getChapterWithStartingVerseUrl } from "@/lib/navigation/quran-navigation";
import { getChapterNumberFromKey, getVerseNumberFromKey } from "@/lib/quran-core/verse/verse-utils";
import { getSurahCalligraphyCode } from "@/lib/quran-core/chapter/chapter-utils";
import { useChapters } from "@/hooks/use-chapters";
import styles from "./SearchResult.module.css";

interface SearchResultProps {
  verseKey: string;
  arabicText?: string;
  translationText?: string;
  onClick?: () => void;
}

export const SearchResult: React.FC<SearchResultProps> = ({
  verseKey,
  arabicText,
  translationText,
  onClick,
}) => {
  const locale = useLocale();
  // Link to the surah page with startingVerse to scroll to target verse in context
  const verseLink = `/${locale}${getChapterWithStartingVerseUrl(verseKey)}`;

  const chapterId = getChapterNumberFromKey(verseKey);
  const verseNumber = getVerseNumberFromKey(verseKey);
  const { data: chapters } = useChapters(locale);
  const chapter = chapters?.find((c) => c.id === chapterId);
  const paddedId = getSurahCalligraphyCode(chapterId);

  return (
    <Link href={verseLink} onClick={onClick} className={styles.resultCard}>
      {arabicText ? (
        <div className={styles.arabicContainer} translate="no">
          <p className={styles.arabicText}>
            <span dangerouslySetInnerHTML={{ __html: arabicText }} />
            {chapter ? (
              <span className={styles.verseKeyBadge} dir="auto">
                <span className={styles.surahCalligraphy} translate="no">
                  {paddedId}
                </span>
                <span className={styles.verseNum}>
                  {` : ${verseNumber}`}
                </span>
              </span>
            ) : (
              <span className={styles.verseKeyBadge} dir="auto">
                <span className={styles.verseNum}>
                  {verseKey}
                </span>
              </span>
            )}
          </p>
        </div>
      ) : (
        <div className={styles.header}>
          {chapter ? (
            <span className={styles.verseKeyBadge} dir="auto">
              <span className={styles.surahCalligraphy} translate="no">
                {paddedId}
              </span>
              <span className={styles.verseNum}>
                {` : ${verseNumber}`}
              </span>
            </span>
          ) : (
            <span className={styles.verseKeyBadge} dir="auto">
              <span className={styles.verseNum}>
                {verseKey}
              </span>
            </span>
          )}
        </div>
      )}


      {translationText && (
        <div className={styles.translationContainer} dir="auto">
          <p
            className={styles.translationText}
            dangerouslySetInnerHTML={{ __html: translationText }}
          />
        </div>
      )}
    </Link>
  );
};

export default SearchResult;

