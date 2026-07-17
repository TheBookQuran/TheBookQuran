"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useChapters } from "@/hooks/use-chapters";
import juzMappings from "../../../../data/juz-to-chapter-mappings.json";
import styles from "./JuzList.module.css";

const typedJuzMappings = juzMappings as Record<string, string[]>;

export const JuzList: React.FC = () => {
  const locale = useLocale();
  const t = useTranslations("common");
  const { data: chapters } = useChapters(locale);

  // Generate an array from 1 to 30
  const juzKeys = Array.from({ length: 30 }, (_, i) => String(i + 1));

  return (
    <div className={styles.grid}>
      {juzKeys.map((juzId) => {
        const chapterIds = typedJuzMappings[juzId] || [];
        
        // Find corresponding chapter objects from hook data
        const chaptersInJuz = chapterIds
          .map((idStr) => chapters?.find((c) => c.id === parseInt(idStr, 10)))
          .filter(Boolean);

        const chapterNames = chaptersInJuz
          .map((chapter) => (locale === "ar" ? chapter?.nameArabic : chapter?.transliteratedName))
          .join(" - ");

        return (
          <Link
            key={juzId}
            href={`/${locale}/juz/${juzId}`}
            className={styles.row}
          >
            <div className={styles.leftSection}>
              <span className={styles.titleText}>
                {locale === "ar" ? `الجزء ${juzId}` : `Juz ${juzId}`}
              </span>
              <span className={styles.subtitleText} title={chapterNames}>
                {chapterNames || (locale === "ar" ? "جاري التحميل..." : "Loading...")}
              </span>
            </div>
            
            <div className={styles.dots} />
            
            <div className={styles.rightSection}>
              <span className={styles.metaText}>
                {chapterIds.length} {locale === "ar" ? "سور" : "Surahs"}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default JuzList;
