import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Chapter } from "@/types/quran";
import { getSurahCalligraphyCode } from "@/lib/quran-core/chapter/chapter-utils";
import styles from "./SurahCard.module.css";

interface SurahCardProps {
  chapter: Chapter;
  locale: string;
}

export const SurahCard: React.FC<SurahCardProps> = ({ chapter, locale }) => {
  const t = useTranslations("common");
  
  // Format the ID as a 3-character string (e.g., "001" for Al-Fatihah)
  const paddedId = getSurahCalligraphyCode(chapter.id);

  return (
    <Link href={`/${chapter.id}`} className={styles.row}>
      <div className={styles.leftSection}>
        <span className={styles.number}>{chapter.id}</span>
        {locale === "ar" ? (
          <span className={styles.calligraphy} translate="no">
            {paddedId}
          </span>
        ) : (
          <div className={styles.nameContainer}>
            <span className={styles.name}>
              {chapter.transliteratedName}
            </span>
            <span className={styles.sub}>
              {chapter.translatedName}
            </span>
          </div>
        )}
      </div>
      
      <span className={styles.dots}></span>
      
      <div className={styles.rightSection}>
        {locale !== "ar" && (
          <span className={styles.calligraphy} translate="no">
            {paddedId}
          </span>
        )}
        <div className={styles.metaContainer}>
          <span className={styles.meta}>
            {chapter.versesCount} {t("verses")}
          </span>
          {locale === "ar" && <span className={styles.separator}>•</span>}
          <span className={styles.revelation}>
            {chapter.revelationPlace === "makkah" ? t("meccan") : t("medinan")}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SurahCard;
