"use client";

import React from "react";
import { useVerseTrackerStore } from "@/stores/verse-tracker";
import styles from "./ReadingProgressBar.module.css";

export const ReadingProgressBar: React.FC = () => {
  const progress = useVerseTrackerStore((state) => state.progress);

  // Hide when progress is 0 (haven't started reading) or 100 (finished)
  if (progress <= 0 || progress >= 100) return null;

  return (
    <div className={styles.progressBar} aria-hidden="true">
      <div className={styles.progressFill} style={{ width: `${progress}%` }} />
    </div>
  );
};

export default ReadingProgressBar;
