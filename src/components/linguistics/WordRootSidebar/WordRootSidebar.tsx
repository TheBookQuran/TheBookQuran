"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useUIStore } from "@/stores/ui";
import { useSettingsStore } from "@/stores/settings";
import { useWordRoot } from "@/hooks/use-linguistics";
import { useWordAudio } from "@/hooks/use-word-audio";
import styles from "./WordRootSidebar.module.css";
import clsx from "clsx";
import * as Popover from "@radix-ui/react-popover";
import { ExpandableDefinition } from "@/components/linguistics/ExpandableDefinition/ExpandableDefinition";

export const WordRootSidebar: React.FC = () => {
  const locale = useLocale();
  const selectedWordLocation = useUIStore((state) => state.selectedWordLocation);
  const setSelectedWordLocation = useUIStore((state) => state.setSelectedWordLocation);
  const selectedWordText = useUIStore((state) => state.selectedWordText);

  const selectedLexiconSetting = useSettingsStore((state) => state.selectedLexicon);
  const setSelectedLexicon = useSettingsStore((state) => state.setSelectedLexicon);
  const selectedLexiconActive = selectedLexiconSetting || (locale === "ar" ? "maqayis" : "lanes");

  const sidebarRef = useRef<HTMLDivElement>(null);

  const { playAudio: playWordAudio } = useWordAudio(selectedWordLocation);

  const { data: root, isLoading, error } = useWordRoot(selectedWordLocation || "");

  const isArabic = locale === "ar";
  const isOpen = !!selectedWordLocation;

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedWordLocation(null);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setSelectedWordLocation]);

  // Prevent scroll propagation when scrolling inside sidebar
  const handleSidebarWheel = (e: React.WheelEvent) => {
    const el = sidebarRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const isScrollingUp = e.deltaY < 0;

    if (isScrollingUp && scrollTop === 0) {
      e.preventDefault();
    } else if (!isScrollingUp && scrollTop + clientHeight >= scrollHeight) {
      e.preventDefault();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for screens < 1400px (handles clicks outside) */}
      <div
        className={styles.backdrop}
        onClick={() => setSelectedWordLocation(null)}
        aria-hidden="true"
      />

      <div
        ref={sidebarRef}
        className={clsx(styles.sidebar, { [styles.open]: isOpen })}
        onWheel={handleSidebarWheel}
        dir={isArabic ? "rtl" : "ltr"}
      >
        {(isLoading || error || !root) && (
          <button
            className={styles.closeButton}
            onClick={() => setSelectedWordLocation(null)}
            aria-label={isArabic ? "إغلاق" : "Close"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}

        {/* Sidebar Content */}
        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>
                {isArabic ? "جاري تحميل بيانات الجذر..." : "Loading root details..."}
              </p>

              {/* Skeleton UI blocks */}
              <div className={styles.skeletonBlock}>
                <div className={styles.skeletonLineShort} />
                <div className={styles.skeletonCard} />
              </div>
              <div className={styles.skeletonBlock}>
                <div className={styles.skeletonLineShort} />
                <div className={styles.skeletonCard} />
              </div>
            </div>
          ) : error || !root ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <p className={styles.emptyText}>
                {isArabic
                  ? "لا تتوفر بيانات الجذر اللغوي لهذا اللفظ."
                  : "Root details are not available for this word."}
              </p>
            </div>
          ) : (
            <div className={styles.detailsContainer}>
              <div className={styles.rootCard}>
                <button
                  className={styles.closeButtonCard}
                  onClick={() => setSelectedWordLocation(null)}
                  aria-label={isArabic ? "إغلاق" : "Close"}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                {/* Word Section with Audio Play Button */}
                <div className={styles.wordHeader}>
                  <span className={styles.wordDisplay} translate="no">
                    {selectedWordText}
                  </span>
                  <button
                    className={styles.audioPlayButton}
                    onClick={playWordAudio}
                    aria-label={isArabic ? "استمع للفظ" : "Listen to word"}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                  </button>
                </div>

                {/* Root Section Below Word */}
                <div className={styles.rootSection}>
                  <span className={styles.rootLabel}>
                    {isArabic ? "الجذر اللغوي: " : "Linguistic Root: "}
                  </span>
                  <span className={styles.rootDisplay} translate="no">
                    {root.arabicText}
                  </span>
                </div>

                <Link
                  href={`/${locale}/roots/${root.id}`}
                  className={styles.badgeLink}
                  onClick={() => setSelectedWordLocation(null)}
                >
                  {root.occurrencesCount} {isArabic ? "مواضع في القرآن ←" : "occurrences →"}
                </Link>
              </div>

              <div className={styles.sectionsList}>
                <div className={styles.section}>
                  {/* Lexicon Selector Trigger Button */}
                  <div className={styles.lexiconHeader}>
                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <button className={styles.lexiconSelectorButton}>
                          <span>
                            {selectedLexiconActive === "lanes"
                              ? (isArabic ? "معجم لين (Lane's Lexicon)" : "Lane's Lexicon")
                              : (isArabic ? "معجم مقاييس اللغة (ابن فارس)" : "Maqayis al-Lugha (Ibn Faris)")}
                          </span>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={styles.chevronIcon}
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content className={styles.lexiconPopover} sideOffset={6} align="start">
                          <Popover.Close asChild>
                            <button
                              className={clsx(styles.lexiconItem, {
                                [styles.activeItem]: selectedLexiconActive === "lanes",
                              })}
                              onClick={() => setSelectedLexicon("lanes")}
                            >
                              {isArabic ? "معجم لين (Lane's Lexicon)" : "Lane's Lexicon"}
                            </button>
                          </Popover.Close>
                          <Popover.Close asChild>
                            <button
                              className={clsx(styles.lexiconItem, {
                                [styles.activeItem]: selectedLexiconActive === "maqayis",
                              })}
                              onClick={() => setSelectedLexicon("maqayis")}
                            >
                              {isArabic ? "معجم مقاييس اللغة (ابن فارس)" : "Maqayis al-Lugha (Ibn Faris)"}
                            </button>
                          </Popover.Close>
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  </div>

                  {/* Lexicon Content Definitions */}
                  {selectedLexiconActive === "lanes" && root.lanesMeaning && (
                    <ExpandableDefinition
                      html={root.lanesMeaning}
                      dir="ltr"
                      variant="sidebar"
                      source="lanes"
                      rootId={root.id}
                      arabicRootText={root.arabicText}
                    />
                  )}

                  {selectedLexiconActive === "maqayis" && root.maqayisMeaning && (
                    <ExpandableDefinition
                      html={root.maqayisMeaning}
                      dir="rtl"
                      variant="sidebar"
                      source="maqayis"
                      rootId={root.id}
                      arabicRootText={root.arabicText}
                    />
                  )}

                  {((selectedLexiconActive === "lanes" && !root.lanesMeaning) ||
                    (selectedLexiconActive === "maqayis" && !root.maqayisMeaning)) && (
                      <div className={styles.emptyState}>
                        <p className={styles.emptyText}>
                          {isArabic
                            ? "هذا المعجم لا يحتوي على تفاصيل لهذا الجذر."
                            : "This lexicon does not contain details for this root."}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WordRootSidebar;
