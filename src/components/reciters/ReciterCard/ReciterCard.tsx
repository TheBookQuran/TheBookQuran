"use client";

import React from "react";
import styles from "./ReciterCard.module.css";

interface Reciter {
  id: number;
  name: string;
  recitationStyle: string;
  relativePath: string;
  profilePicture?: string;
  coverImage?: string;
  bio?: string;
  translatedName?: {
    name: string;
    languageName: string;
  };
}

interface ReciterCardProps {
  reciter: Reciter;
  isSelected: boolean;
  onSelect: (id: number) => void;
  locale: string;
}

export const ReciterCard: React.FC<ReciterCardProps> = ({
  reciter,
  isSelected,
  onSelect,
  locale,
}) => {
  const isArabic = locale === "ar";
  const displayName = isArabic && reciter.translatedName?.name
    ? reciter.translatedName.name
    : reciter.name;

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Use the profile picture from Quran CDN or fallback to initials
  const profilePicUrl = reciter.profilePicture
    ? reciter.profilePicture.startsWith("http")
      ? reciter.profilePicture
      : `https://quran.com/images/${reciter.profilePicture}`
    : undefined;

  return (
    <div className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}>
      <div className={styles.avatarContainer}>
        {profilePicUrl ? (
          <img
            src={profilePicUrl}
            alt={displayName}
            className={styles.avatar}
            loading="lazy"
            onError={(e) => {
              // Hide image if it fails to load and show fallback initials
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.parentElement?.querySelector(
                `.${styles.avatarFallback}`
              );
              if (fallback) {
                (fallback as HTMLElement).style.display = "flex";
              }
            }}
          />
        ) : null}
        <div
          className={styles.avatarFallback}
          style={{ display: profilePicUrl ? "none" : "flex" }}
        >
          {initials}
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{displayName}</h3>
        <span className={styles.styleBadge}>{reciter.recitationStyle}</span>
      </div>
      <button
        onClick={() => onSelect(reciter.id)}
        className={`${styles.selectButton} ${isSelected ? styles.selectButtonActive : ""}`}
      >
        {isSelected
          ? isArabic
            ? "مختار"
            : "Selected"
          : isArabic
            ? "اختر"
            : "Select"}
      </button>
    </div>
  );
};

export default ReciterCard;
