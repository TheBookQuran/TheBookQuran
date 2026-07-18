"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useChapters } from "@/hooks/use-chapters";
import { useSearchInfinite } from "@/hooks/use-search-infinite";
import { JuzList, HizbList, PageNavigator } from "@/components/chapters";
import SurahCard from "../SurahCard";
import SearchResult from "@/components/search/SearchResult";
import { useJournalStore } from "@/stores/journal";
import { getVerseUrl, sortByVerseKey } from "@/lib/quran-core/verse/verse-utils";
import { useDebounce } from "@/hooks/use-debounce";
import styles from "./SurahIndex.module.css";

interface SurahIndexProps {
  locale: string;
}

export const SurahIndex: React.FC<SurahIndexProps> = ({ locale }) => {
  const t = useTranslations("home");
  const commonT = useTranslations("common");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"surah" | "juz" | "hizb" | "page">("surah");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);

  const { data: chapters, isLoading: isLoadingChapters, error: chaptersError } = useChapters(locale);
  const {
    data: searchData,
    isLoading: isLoadingSearch,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useSearchInfinite(debouncedQuery, locale);

  const allResults = React.useMemo(() => {
    const flat = searchData?.pages.flatMap((page: any) => page?.result?.verses ?? []) ?? [];
    return [...flat].sort((a: any, b: any) => sortByVerseKey(a.verseKey, b.verseKey));
  }, [searchData]);

  const totalRecords = searchData?.pages[0]?.result?.pagination?.totalRecords ?? 0;

  // Sentinel ref for IntersectionObserver
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  const handleIntersect = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "200px",
      threshold: 0,
    });
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [handleIntersect]);

  const lastReadItem = useJournalStore((state) => state.history[0]);
  const continueReadingUrl = lastReadItem
    ? lastReadItem.type === "surah"
      ? `/${locale}/${lastReadItem.key}`
      : lastReadItem.type === "juz"
      ? `/${locale}/juz/${lastReadItem.key}`
      : lastReadItem.type === "hizb"
      ? `/${locale}/hizb/${lastReadItem.key}`
      : lastReadItem.type === "page"
      ? `/${locale}/page/${lastReadItem.key}`
      : lastReadItem.type === "verse"
      ? `/${locale}${getVerseUrl(lastReadItem.key)}`
      : `/${locale}/1`
    : `/${locale}/1`;

  const continueLabel = React.useMemo(() => {
    if (!lastReadItem) {
      const fatihah = chapters?.find((c) => c.id === 1);
      if (fatihah) {
        return locale === "ar" ? fatihah.nameArabic : fatihah.transliteratedName;
      }
      return locale === "ar" ? "الفاتحة" : "Al-Fatihah";
    }

    if (lastReadItem.type === "surah") {
      const chapterId = parseInt(lastReadItem.key, 10);
      const chapter = chapters?.find((c) => c.id === chapterId);
      if (chapter) {
        return locale === "ar" ? chapter.nameArabic : chapter.transliteratedName;
      }
    }
    return lastReadItem.label;
  }, [lastReadItem, chapters, locale]);

  if (isLoadingChapters) {
    return <div className={styles.emptyState}>{commonT("loading")}</div>;
  }

  if (chaptersError || !chapters) {
    return <div className={styles.emptyState}>Failed to load chapters.</div>;
  }

  // Filter surahs based on the search query
  const filteredChapters = chapters.filter((chapter) => {
    const query = debouncedQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      chapter.transliteratedName.toLowerCase().includes(query) ||
      chapter.nameArabic.includes(query) ||
      chapter.id.toString() === query
    );
  });

  return (
    <div className={styles.container}>
      {/* SEARCH BOX */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={locale === "ar" ? "ابحث عن سورة، آية..." : "Search Surah, Verse..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <svg
          className={styles.searchIcon}
          width="20"
          height="20"
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
      </div>

      <div className={styles.controlsHeader}>
        <div className={styles.viewSelector}>
          <select 
            value={activeTab} 
            onChange={(e) => {
              setActiveTab(e.target.value as any);
              e.target.blur();
            }}
            className={styles.viewSelect}
            aria-label={locale === "ar" ? "اختر طريقة العرض" : "Select view"}
          >
            <option value="surah">{commonT("surah")}</option>
            <option value="juz">{commonT("juz")}</option>
            <option value="hizb">{commonT("hizb")}</option>
            <option value="page">{commonT("page")}</option>
          </select>
          <svg className={styles.selectIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        <Link href={continueReadingUrl} className={styles.continueReading}>
          <span>
            {locale === "ar" ? "تابع القراءة" : "Continue Reading"}
            <span className={styles.continueLabel}> ({continueLabel})</span>
          </span>
          <svg className={styles.continueIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {locale === "ar" ? (
              <polyline points="15 18 9 12 15 6"></polyline>
            ) : (
              <polyline points="9 18 15 12 9 6"></polyline>
            )}
          </svg>
        </Link>
      </div>

      {activeTab === "surah" && (
        <>
          {/* SURAH LIST */}
          {(filteredChapters.length > 0 || !debouncedQuery) && (
            <div style={{ marginBottom: debouncedQuery ? '2.5rem' : '0' }}>
              {debouncedQuery && (
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                  {locale === "ar" ? "السور" : "Surahs"}
                </h3>
              )}
              <div className={styles.grid}>
                {filteredChapters.map((chapter) => (
                  <SurahCard key={chapter.id} chapter={chapter} locale={locale} />
                ))}
              </div>
            </div>
          )}

          {/* VERSES LIST (Only when searching) */}
          {debouncedQuery && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                {locale === "ar" ? "الآيات" : "Verses"}
              </h3>

              {isLoadingSearch ? (
                <div className={styles.emptyState}>{commonT("loading")}</div>
              ) : allResults.length > 0 ? (
                <div className={styles.resultsList}>
                  {allResults.map((verse: any) => (
                    <div key={verse.verseKey} className={styles.resultItem}>
                      <SearchResult
                        verseKey={verse.verseKey}
                        arabicText={verse.words?.map((w: any) => w.highlight ? `<mark>${w.text}</mark>` : w.text).join(" ")}
                        translationText={verse.translations?.[0]?.text}
                      />
                    </div>
                  ))}
                  <div ref={sentinelRef} style={{ height: 1 }} />
                  {isFetchingNextPage && (
                    <div className={styles.emptyState}>
                      {commonT("loading")}
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>
                    {locale === "ar"
                      ? `لم يتم العثور على آيات مطابقة لـ "${searchQuery}"`
                      : `No verses found matching "${searchQuery}"`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* EMPTY STATE IF BOTH ARE EMPTY */}
          {debouncedQuery && filteredChapters.length === 0 && !isLoadingSearch && allResults.length === 0 && (
            <div className={styles.emptyState} style={{ marginTop: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                {locale === "ar" ? "جرب البحث بكلمات أخرى" : "Try searching with different keywords"}
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === "juz" && <JuzList />}

      {activeTab === "hizb" && <HizbList />}

      {activeTab === "page" && <PageNavigator />}
    </div>
  );
};

export default SurahIndex;
