import React from "react";
import DivisionHeader from "@/components/shared/DivisionHeader";
import ChapterHeader from "@/components/shared/ChapterHeader";
import Bismillah from "@/components/shared/Bismillah";
import QuranReader from "@/components/quran-reader/QuranReader";
import { ReadingPreference } from "@/types/settings";
import { Verse } from "@/types/quran";

interface QuranReadingContainerProps {
  type: "juz" | "hizb" | "rub" | "page" | "chapter";
  id: number;
  locale: string;
  initialVerses: Verse[];
  readingPref: ReadingPreference;
  // Optional fields for chapter / range
  chapter?: any; // chapter object
  verseRange?: string;
  startVerse?: number;
  startingVerse?: number;
  children?: React.ReactNode;
}

export default function QuranReadingContainer({
  type,
  id,
  locale,
  initialVerses,
  readingPref,
  chapter,
  verseRange,
  startVerse,
  startingVerse,
  children,
}: QuranReadingContainerProps) {
  const isChapter = type === "chapter";
  const bismillahPre = isChapter && chapter?.bismillahPre;
  // Show Bismillah only if beginning recitation from verse 1 of a chapter that has Bismillah pre
  const showBismillah = bismillahPre && (!startVerse || startVerse === 1);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {children}
      {isChapter ? (
        <ChapterHeader chapter={chapter} initialReadingPreference={readingPref} />
      ) : (
        <DivisionHeader type={type as "juz" | "hizb" | "rub" | "page"} id={id} />
      )}

      {showBismillah && <Bismillah />}

      <QuranReader
        initialVerses={initialVerses}
        locale={locale}
        initialReadingPreference={readingPref}
        juzId={type === "juz" ? id : undefined}
        hizbId={type === "hizb" ? id : undefined}
        rubId={type === "rub" ? id : undefined}
        pageId={type === "page" ? id : undefined}
        chapterId={isChapter ? id : undefined}
        verseRange={verseRange}
        startingVerse={startingVerse}
      />
    </div>
  );
}
