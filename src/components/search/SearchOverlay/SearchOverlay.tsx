"use client";

import React, { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useUIStore } from "@/stores/ui";
import { useSearchInfinite } from "@/hooks/use-search-infinite";
import { Modal, ModalContent } from "@/components/ui/Modal/Modal";
import { useDebounce } from "@/hooks/use-debounce";
import { sortByVerseKey } from "@/lib/quran-core/verse/verse-utils";
import SearchResult from "../SearchResult";
import styles from "./SearchOverlay.module.css";

export const SearchOverlay: React.FC = () => {
  const locale = useLocale();
  const t = useTranslations("home");
  const commonT = useTranslations("common");

  const isSearchDrawerOpen = useUIStore((state) => state.isSearchDrawerOpen);
  const setSearchDrawerOpen = useUIStore((state) => state.setSearchDrawerOpen);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);

  // Reset search input when overlay closes
  useEffect(() => {
    if (!isSearchDrawerOpen) {
      setSearchQuery("");
    }
  }, [isSearchDrawerOpen]);

  // Fetch search results
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useSearchInfinite(debouncedQuery, locale);

  const searchResults = data?.pages.flatMap((page: any) => page?.result?.verses || []) || [];
  const sortedSearchResults = React.useMemo(() => {
    return [...searchResults].sort((a: any, b: any) => sortByVerseKey(a.verseKey, b.verseKey));
  }, [searchResults]);

  const totalRecords = data?.pages[0]?.result?.pagination?.totalRecords || 0;

  // Sentinel ref for IntersectionObserver inside modal scroll container
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
      root: null, // Relative to viewport / scroll container
      rootMargin: "100px",
      threshold: 0,
    });
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [handleIntersect]);

  const handleResultClick = () => {
    setSearchDrawerOpen(false);
  };

  return (
    <Modal open={isSearchDrawerOpen} onOpenChange={setSearchDrawerOpen}>
      <ModalContent
        className={styles.modalContent}
        title={commonT("search")}
      >
        <div className={styles.searchBox}>
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
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.resultsArea}>
          {isLoading && (
            <div className={styles.loadingState}>
              <span className={styles.spinner} />
              <p>{commonT("loading")}</p>
            </div>
          )}

          {!isLoading && debouncedQuery && searchResults.length === 0 && (
            <div className={styles.emptyState}>
              <p>
                {locale === "en"
                  ? "No results found. Try searching for different keywords."
                  : "لم يتم العثور على نتائج. حاول البحث بكلمات أخرى."}
              </p>
            </div>
          )}

          {!isLoading && sortedSearchResults.length > 0 && (
            <>
              <div className={styles.resultsList}>
                {sortedSearchResults.map((verse: any) => (
                  <div key={verse.verseKey} className={styles.resultItem}>
                    <SearchResult
                      verseKey={verse.verseKey}
                      arabicText={verse.words?.map((w: any) => w.highlight ? `<mark>${w.text}</mark>` : w.text).join(" ")}
                      translationText={verse.translations?.[0]?.text}
                      onClick={handleResultClick}
                    />
                  </div>
                ))}
              </div>
              <div ref={sentinelRef} style={{ height: 1 }} />
              {isFetchingNextPage && (
                <div className={styles.loadingState} style={{ padding: "1rem 0" }}>
                  <span className={styles.spinner} />
                </div>
              )}
            </>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};

export default SearchOverlay;
