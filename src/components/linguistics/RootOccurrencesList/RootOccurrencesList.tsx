"use client";

import React, { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useChapters } from "@/hooks/use-chapters";
import { useRootOccurrences } from "@/hooks/use-linguistics";
import { useRootOccurrenceVerses } from "@/hooks/use-root-occurrence-verses";
import SearchResult from "@/components/search/SearchResult";
import styles from "./RootOccurrencesList.module.css";

interface RootOccurrencesListProps {
  rootId: string;
}

export const RootOccurrencesList: React.FC<RootOccurrencesListProps> = ({ rootId }) => {
  const locale = useLocale();
  const t = useTranslations("common");
  const { data: occurrences, isLoading: isOccurrencesLoading } = useRootOccurrences(rootId);
  const { data: chapters, isLoading: isChaptersLoading } = useChapters(locale);
  const { data: verseMap, isLoading: versesLoading } = useRootOccurrenceVerses(
    rootId,
    occurrences,
    locale,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const isArabic = locale === "ar";

  const augmentedOccurrences = useMemo(() => {
    if (!occurrences || !verseMap || !chapters) return [];

    return occurrences.map((occ) => {
      const verseKey = `${occ.chapterNumber}:${occ.verseNumber}`;
      const verse = verseMap.get(verseKey);
      const chapter = chapters.find((c) => c.id === occ.chapterNumber);

      const arabicText = verse?.words
        ?.map((w: any) => w.qpcUthmaniHafs || w.textUthmani || w.text || "")
        .filter(Boolean)
        .join(" ");

      const translationText = verse?.translations?.[0]?.text;

      return {
        ...occ,
        verseKey,
        chapterName: chapter
          ? isArabic
            ? chapter.nameArabic
            : chapter.transliteratedName
          : `Surah ${occ.chapterNumber}`,
        arabicText,
        translationText,
      };
    });
  }, [occurrences, verseMap, chapters, isArabic]);

  const filteredOccurrences = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return augmentedOccurrences;

    return augmentedOccurrences.filter(
      (occ) =>
        occ.chapterName.toLowerCase().includes(query) ||
        String(occ.chapterNumber) === query ||
        String(occ.verseNumber) === query,
    );
  }, [augmentedOccurrences, searchQuery]);

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

      {versesLoading && (
        <div className={styles.loading}>{t("loading")}</div>
      )}

      {!versesLoading && filteredOccurrences.length === 0 && (
        <div className={styles.empty}>
          {isArabic ? "لا توجد نتائج تطابق البحث." : "No results match your search."}
        </div>
      )}

      {!versesLoading && filteredOccurrences.length > 0 && (
        <div className={styles.list}>
          {filteredOccurrences.map((occ, idx) => (
            <SearchResult
              key={`${occ.chapterNumber}-${occ.verseNumber}-${occ.wordPosition}-${idx}`}
              verseKey={occ.verseKey}
              arabicText={occ.arabicText}
              translationText={occ.translationText}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RootOccurrencesList;
