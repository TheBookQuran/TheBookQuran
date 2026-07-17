"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import * as Popover from "@radix-ui/react-popover";
import { useChapters } from "@/hooks/use-chapters";
import { getSurahCalligraphyCode } from "@/lib/quran-core/chapter/chapter-utils";
import styles from "./SurahSelectorDropdown.module.css";
import clsx from "clsx";

interface SurahSelectorDropdownProps {
  currentChapterId: number;
  chapterName: string;
}

export const SurahSelectorDropdown: React.FC<SurahSelectorDropdownProps> = ({
  currentChapterId,
  chapterName,
}) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("home");
  const commonT = useTranslations("common");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const { data: chapters, isLoading } = useChapters(locale);

  const handleSelectChapter = (chapterId: number) => {
    setIsOpen(false);
    startTransition(() => {
      // Re-route to the selected chapter.
      // E.g., if pathname is "/ar/2", we want to navigate to "/ar/chapterId"
      // Let's form the path properly.
      const segments = pathname.split("/");
      // Segments could be ["", "ar", "2"] or ["", "2"] depending on if it has a locale segment
      // The current project uses next-intl routing. Let's look at how SurahCard links:
      // it links to: `/${chapter.id}` which Next-intl's Link wraps or routes.
      // Since we are using router.push, let's make it /${locale}/${chapterId} or /${chapterId}
      // Let's build the localized url path.
      router.push(`/${locale}/${chapterId}`);
    });
  };

  const filteredChapters = chapters?.filter((chapter) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    if (!isNaN(Number(query))) {
      return chapter.id === Number(query);
    }

    return (
      chapter.transliteratedName.toLowerCase().includes(query) ||
      chapter.translatedName.toLowerCase().includes(query) ||
      (chapter.nameArabic && chapter.nameArabic.toLowerCase().includes(query)) ||
      chapter.slug?.toLowerCase().includes(query)
    );
  }) || [];

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          className={styles.triggerButton}
          aria-label={commonT("surah")}
          title={locale === "ar" ? "اختر سورة أخرى" : "Select another Surah"}
        >
          <span className={styles.chapterNameText}>{currentChapterId}. {chapterName}</span>
          <svg
            className={clsx(styles.chevronIcon, { [styles.chevronOpen]: isOpen })}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={styles.popoverContent}
          sideOffset={8}
          align="start"
        >
          <div className={styles.container}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <svg
                className={styles.searchIcon}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            <div className={styles.chaptersList}>
              {isLoading ? (
                <div className={styles.loadingState}>{commonT("loading")}</div>
              ) : filteredChapters.length > 0 ? (
                filteredChapters.map((chapter) => {
                  const paddedId = getSurahCalligraphyCode(chapter.id);
                  const isActive = chapter.id === currentChapterId;

                  return (
                    <button
                      key={chapter.id}
                      onClick={() => handleSelectChapter(chapter.id)}
                      className={clsx(styles.chapterItem, {
                        [styles.activeItem]: isActive,
                      })}
                    >
                      <div className={styles.itemLeft}>
                        <span className={styles.chapterNumber}>{chapter.id}</span>
                        <div className={styles.chapterInfo}>
                          <span className={styles.transliteratedName}>
                            {locale === "ar" ? chapter.translatedName : chapter.transliteratedName}
                          </span>
                          <span className={styles.versesCount}>
                            {chapter.versesCount} {commonT("verses")}
                          </span>
                        </div>
                      </div>
                      <div className={styles.itemRight}>
                        <span className={styles.arabicCalligraphy} translate="no">
                          {paddedId}
                        </span>
                        {isActive && (
                          <svg
                            className={styles.checkIcon}
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className={styles.noResults}>
                  {locale === "ar" ? "لا توجد نتائج مطابقة" : "No matching results"}
                </div>
              )}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default SurahSelectorDropdown;
