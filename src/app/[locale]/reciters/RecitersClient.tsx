"use client";

import React from "react";

interface RecitersClientProps {
  locale: string;
}

export const RecitersClient: React.FC<RecitersClientProps> = () => {
  return null;
};

export default RecitersClient;

/* ميزات قادمة لاحقاً: الكود الأصلي لـ RecitersClient
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useReciters } from "@/hooks/use-reciters";
import { useSettingsStore } from "@/stores/settings";
import { useAudioPlayerStore } from "@/stores/audio-player";
import ReciterCard from "@/components/reciters/ReciterCard/ReciterCard";
import styles from "./reciters.module.css";

export const RecitersClientOriginal: React.FC<RecitersClientProps> = ({ locale }) => {
  const t = useTranslations("common");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: response, isLoading, error } = useReciters(locale);

  const selectedReciter = useSettingsStore((state) => state.selectedReciter);
  const setSelectedReciter = useSettingsStore((state) => state.setSelectedReciter);

  const handleSelect = (id: number) => {
    setSelectedReciter(id);
  };

  if (isLoading) {
    return <div className={styles.emptyState}>{t("loading")}</div>;
  }

  if (error || !response?.reciters) {
    return <div className={styles.emptyState}>Failed to load reciters list.</div>;
  }

  const filteredReciters = response.reciters.filter((reciter) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    return (
      reciter.name.toLowerCase().includes(query) ||
      (reciter.translatedName?.name &&
        reciter.translatedName.name.toLowerCase().includes(query)) ||
      reciter.recitationStyle.toLowerCase().includes(query)
    );
  });

  const isArabic = locale === "ar";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("reciters")}</h1>
        <p className={styles.subtitle}>
          {isArabic
            ? "اختر قارئك المفضل للاستماع للقرآن الكريم"
            : "Choose your preferred reciter to listen to the Holy Quran"}
        </p>
      </header>

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
              ? "ابحث باسم القارئ أو الرواية..."
              : "Search by reciter name or style..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredReciters.length > 0 ? (
        <div className={styles.grid}>
          {filteredReciters.map((reciter) => (
            <ReciterCard
              key={reciter.id}
              reciter={reciter}
              isSelected={selectedReciter === reciter.id}
              onSelect={handleSelect}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          {isArabic ? "لم يتم العثور على نتائج" : "No reciters found matching"}{" "}
          "{searchQuery}"
        </div>
      )}
    </div>
  );
};
*/
