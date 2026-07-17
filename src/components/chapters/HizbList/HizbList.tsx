"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useChapters } from "@/hooks/use-chapters";
import hizbMappings from "../../../../data/hizb-to-chapter-mappings.json";
import styles from "./HizbList.module.css";

const typedHizbMappings = hizbMappings as Record<string, string[]>;

export const HizbList: React.FC = () => {
  const locale = useLocale();
  const t = useTranslations("common");
  const { data: chapters } = useChapters(locale);

  // Generate an array from 1 to 60
  const hizbKeys = Array.from({ length: 60 }, (_, i) => String(i + 1));

  return (
    <div className={styles.grid}>
      {hizbKeys.map((hizbId) => {
        const chapterIds = typedHizbMappings[hizbId] || [];
        
        // Find corresponding chapter objects from hook data
        const chaptersInHizb = chapterIds
          .map((idStr) => chapters?.find((c) => c.id === parseInt(idStr, 10)))
          .filter(Boolean);

        const chapterNames = chaptersInHizb
          .map((chapter) => (locale === "ar" ? chapter?.nameArabic : chapter?.transliteratedName))
          .join(" - ");

        return (
          <Link
            key={hizbId}
            href={`/${locale}/hizb/${hizbId}`}
            className={styles.row}
          >
            <div className={styles.leftSection}>
              <span className={styles.titleText}>
                {locale === "ar" ? `الحزب ${hizbId}` : `Hizb ${hizbId}`}
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

export default HizbList;
