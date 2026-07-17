"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useSearchInfinite } from "@/hooks/use-search-infinite";
import { useDebounce } from "@/hooks/use-debounce";
import { sortByVerseKey } from "@/lib/quran-core/verse/verse-utils";
import SearchResult from "@/components/search/SearchResult";
import styles from "./page.module.css";

interface SearchClientProps {
  initialQuery?: string;
}

export const SearchClient: React.FC<SearchClientProps> = ({
  initialQuery = "",
}) => {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("home");
  const commonT = useTranslations("common");

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(searchQuery, 400);

  // Sync state with props when query param changes externally
  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  // Sync URL with current query
  useEffect(() => {
    if (debouncedQuery.trim()) {
      router.replace(`/${locale}/search?q=${encodeURIComponent(debouncedQuery)}`);
    } else {
      router.replace(`/${locale}/search`);
    }
  }, [debouncedQuery, locale, router]);

  // Infinite query
  const {
    data,
    isLoading,
    isFetchingNextPage,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useSearchInfinite(debouncedQuery, locale);

  // Flatten and sort all accumulated results
  const allResults = useMemo(() => {
    const flat = data?.pages.flatMap((page: any) => page?.result?.verses ?? []) ?? [];
    return [...flat].sort((a: any, b: any) => sortByVerseKey(a.verseKey, b.verseKey));
  }, [data]);

  const totalRecords = data?.pages[0]?.result?.pagination?.totalRecords ?? 0;

  // Sentinel ref for IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
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

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchHeader}>
        <div className={styles.searchBox}>
          <svg
            className={styles.searchIcon}
            width="22"
            height="22"
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
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className={styles.resultsArea}>
        {isLoading && (
          <div className={styles.loadingState}>
            <span className={styles.spinner} />
            <p>{commonT("loading")}</p>
          </div>
        )}

        {isError && (
          <div className={styles.errorState}>
            <p>
              {locale === "en"
                ? "An error occurred while fetching search results. Please try again."
                : "حدث خطأ أثناء جلب نتائج البحث. يرجى المحاولة مرة أخرى."}
            </p>
          </div>
        )}

        {!isLoading && !isError && debouncedQuery && allResults.length === 0 && (
          <div className={styles.emptyState}>
            <p>
              {locale === "en"
                ? "No results found. Try searching for different keywords."
                : "لم يتم العثور على نتائج. حاول البحث بكلمات أخرى."}
            </p>
          </div>
        )}

        {allResults.length > 0 && (
          <div className={styles.resultsContent}>
            <div className={styles.resultsCount}>
              {locale === "en"
                ? `Found ${totalRecords} results`
                : `تم العثور على ${totalRecords} نتيجة`}
            </div>

            <div className={styles.resultsList}>
              {allResults.map((verse: any) => (
                <SearchResult
                  key={verse.verseKey}
                  verseKey={verse.verseKey}
                  arabicText={verse.words?.map((w: any) =>
                    w.highlight ? `<mark>${w.text}</mark>` : w.text
                  ).join(" ")}
                  translationText={verse.translations?.[0]?.text}
                />
              ))}
            </div>

            {/* Sentinel element - triggers next page load when visible */}
            <div ref={sentinelRef} style={{ height: 1 }} />

            {isFetchingNextPage && (
              <div className={styles.loadingState}>
                <span className={styles.spinner} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchClient;
