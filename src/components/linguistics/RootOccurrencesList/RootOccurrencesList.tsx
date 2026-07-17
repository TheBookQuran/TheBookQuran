"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useChapters } from "@/hooks/use-chapters";
import { useRootOccurrences } from "@/hooks/use-linguistics";
import styles from "./RootOccurrencesList.module.css";

interface RootOccurrencesListProps {
  rootId: string;
}

export const RootOccurrencesList: React.FC<RootOccurrencesListProps> = ({ rootId }) => {
  const locale = useLocale();
  const t = useTranslations("common");
  const { data: occurrences, isLoading: isOccurrencesLoading } = useRootOccurrences(rootId);
  const { data: chapters, isLoading: isChaptersLoading } = useChapters(locale);
  const [searchQuery, setSearchQuery] = useState("");

  const isArabic = locale === "ar";

  if (isOccurrencesLoading || isChaptersLoading) {
    return <div className={styles.loading}>{t("loading")}</div>;
  }

  if (!occurrences || occurrences.length === 0) {
    return (
      <div className={styles.empty}>
        {isArabic ? "لا توجد مواضع لهذا الجذر." : "No occurrences found for this root."}
      </div>
    );
  }

  // Map each occurrence to include chapter metadata
  const mappedOccurrences = occurrences.map((occ) => {
    const chapter = chapters?.find((c) => c.id === occ.chapterNumber);
    return {
      ...occ,
      chapterName: chapter
        ? isArabic
          ? chapter.nameArabic
          : chapter.transliteratedName
        : `Surah ${occ.chapterNumber}`,
    };
  });

  // Filter occurrences based on search query (by Surah name or chapter number)
  const filteredOccurrences = mappedOccurrences.filter((occ) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    return (
      occ.chapterName.toLowerCase().includes(query) ||
      String(occ.chapterNumber) === query ||
      String(occ.verseNumber) === query
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <svg
          className={styles.searchIcon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={
            isArabic
              ? "ابحث باسم السورة أو رقمها..."
              : "Search by Surah name or number..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.grid}>
        {filteredOccurrences.map((occ, idx) => (
          <Link
            key={`${occ.chapterNumber}-${occ.verseNumber}-${occ.wordPosition}-${idx}`}
            href={`/${locale}/${occ.chapterNumber}/${occ.verseNumber}`}
            className={styles.card}
          >
            <div className={styles.cardInfo}>
              <h3 className={styles.chapterTitle}>
                {occ.chapterName}
              </h3>
              <span className={styles.verseLabel}>
                {isArabic
                  ? `الآية ${occ.verseNumber} (الكلمة ${occ.wordPosition})`
                  : `Verse ${occ.verseNumber} (Word ${occ.wordPosition})`}
              </span>
            </div>
            <div className={styles.arrowIcon}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RootOccurrencesList;
