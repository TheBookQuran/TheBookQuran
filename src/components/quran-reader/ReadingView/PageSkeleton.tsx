"use client";

import React from "react";
import { MushafLines } from "@/lib/quran-core/fonts/types";
import styles from "./PageSkeleton.module.css";
import clsx from "clsx";

import { QuranFont } from "@/lib/quran-core/fonts/types";
import readingViewStyles from "./ReadingView.module.css";

interface PageSkeletonProps {
  mushafLines: MushafLines;
  font: QuranFont;
  quranTextFontScale: number;
  isWordByWordLayout?: boolean;
}

const getMushafLinesNumber = (mushafLines: MushafLines): number => {
  return mushafLines === MushafLines.FifteenLines ? 15 : 16;
};

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ 
  mushafLines, 
  font, 
  quranTextFontScale,
  isWordByWordLayout = false
}) => {
  const lineCount = getMushafLinesNumber(mushafLines);
  const linesArray = Array.from({ length: lineCount });
  const fontClassName = `${font}-font-size-${quranTextFontScale}`;

  return (
    <div className={styles.pageSkeleton} aria-hidden="true">
      <div className={clsx(styles.linesContainer, fontClassName)}>
        {linesArray.map((_, index) => {
          return (
            <div
              key={index}
              className={clsx(
                styles.lineSkeleton, 
                {
                  [readingViewStyles.fixedWidth]: !isWordByWordLayout,
                }
              )}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PageSkeleton;
