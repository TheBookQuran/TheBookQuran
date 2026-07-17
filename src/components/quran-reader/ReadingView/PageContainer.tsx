"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getPageVerses } from "@/services/quran-api";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { useSettingsStore } from "@/stores/settings";
import { useAudioPlayerStore } from "@/stores/audio-player";
import { useUIStore } from "@/stores/ui";
import { useQcfFont } from "@/hooks/use-qcf-font";
import { useIsFontLoaded } from "@/hooks/use-is-font-loaded";
import { getMushafId, getDefaultWordFields } from "@/services/api-paths";
import { Verse, Word } from "@/types/quran";
import { groupLinesByVerses } from "@/lib/quran-core/mushaf/group-lines";
import { isCenterAlignedPage, getLineWidthClassName } from "@/lib/quran-core";
import { getChapterNumberFromKey } from "@/lib/quran-core/verse/verse-utils";
import QuranWord from "../VerseText/QuranWord";
import PageSkeleton from "./PageSkeleton";
import clsx from "clsx";
import styles from "./ReadingView.module.css";

interface PageLineProps {
  lineKey: string;
  wordsInLine: Word[];
  pageNumber: number;
  font: any;
  quranTextFontScale: number;
  isWordByWordTranslation: boolean;
  isWordByWordTransliteration: boolean;
  playAudioOnClick: boolean;
  selectedWordLocation: string | null;
  isFontLoaded: boolean;
  handleWordClick: (word: Word) => void;
  isCenter: boolean;
}

// Memoized PageLine component to restrict line highlights to specific lines
const PageLine: React.FC<PageLineProps> = React.memo(({
  lineKey,
  wordsInLine,
  pageNumber,
  font,
  quranTextFontScale,
  isWordByWordTranslation,
  isWordByWordTransliteration,
  playAudioOnClick,
  selectedWordLocation,
  isFontLoaded,
  handleWordClick,
  isCenter,
}) => {
  // Only re-render when the line's active state changes during audio playback
  const isLinePlaying = useAudioPlayerStore((state) =>
    state.isPlaying && wordsInLine.some((word) => word.verseKey === state.currentVerseKey)
  );

  // Highlight line when navigating to a specific verse (search, bookmark, etc.)
  const isNavigatedLine = useAudioPlayerStore((state) =>
    !state.isPlaying && state.navigatedVerseKey !== null &&
    wordsInLine.some((word) => word.verseKey === state.navigatedVerseKey)
  );

  const isWordByWordLayout = isWordByWordTranslation || isWordByWordTransliteration;
  const isBigTextLayout = isWordByWordLayout || quranTextFontScale > 3;

  return (
    <div
      className={clsx(styles.line, {
        [styles.fixedWidth]: !isWordByWordLayout,
        [styles.mobileInline]: isBigTextLayout,
        [styles.activeLine]: isLinePlaying || isNavigatedLine,
      })}
      translate="no"
    >
      <div
        className={clsx(styles.verseText, {
          [styles.verseTextSpaceBetween]: !isCenter,
          [styles.verseTextCenterAlign]: isCenter,
          [styles.largeQuranTextLayout]: isBigTextLayout,
        })}
      >
        {wordsInLine.map((word, idx) => {
          const isSelected = word.location === selectedWordLocation;

          return (
            <QuranWord
              key={word.id || `${word.verseKey}-${word.position}-${idx}`}
              word={word}
              highlightVerseOnPlay={true}
              font={font}
              quranTextFontScale={quranTextFontScale}
              isWordByWordTranslation={isWordByWordTranslation}
              isWordByWordTransliteration={isWordByWordTransliteration}
              playAudioOnClick={playAudioOnClick}
              isSelected={isSelected}
              isFontLoaded={isFontLoaded}
              onWordClick={handleWordClick}
            />
          );
        })}
      </div>
    </div>
  );
});

PageLine.displayName = "PageLine";

interface PageContainerProps {
  pageIndex: number;
  pageNumber: number;
  locale: string;
  fontClassName: string;
  lineWidthClassName: string;
  initialVerses?: Verse[]; // fallback for SSR / page 1
  pageLookupRecord?: any;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  pageIndex,
  pageNumber,
  locale,
  fontClassName,
  lineWidthClassName,
  initialVerses,
  pageLookupRecord,
}) => {
  const font = useQuranReaderStore((state) => state.quranFont);
  const quranTextFontScale = useQuranReaderStore((state) => state.quranTextFontScale);
  const mushafLines = useQuranReaderStore((state) => state.mushafLines);
  const commonT = useTranslations("common");

  const isWordByWordTranslation = useSettingsStore((state) => state.isWordByWordTranslation);
  const isWordByWordTransliteration = useSettingsStore((state) => state.isWordByWordTransliteration);
  const playAudioOnClick = useSettingsStore((state) => state.playAudioOnClick);
  const selectedWordLocation = useUIStore((state) => state.selectedWordLocation);
  const setSelectedWordLocation = useUIStore((state) => state.setSelectedWordLocation);

  const pageRef = React.useRef<HTMLDivElement>(null);

  const handleWordClick = React.useCallback((word: Word) => {
    if (word.location) {
      const displayWordText = word.qpcUthmaniHafs || word.textUthmani || word.text || "";
      setSelectedWordLocation(word.location, displayWordText, word.audioUrl);
    }
  }, [setSelectedWordLocation]);



  // Parameters for getPageVerses
  const mushafId = getMushafId(font, mushafLines);
  const wordFields = getDefaultWordFields(font);

  // Filter initialVerses to only include verses for THIS page
  const pageInitialVerses = React.useMemo(() => {
    if (!initialVerses) return undefined;
    const filtered = initialVerses.filter((v) => v.pageNumber === pageNumber);

    // Ensure the filtered verses cover the entire page to prevent partial renders!
    if (pageLookupRecord && filtered.length > 0) {
      const firstVerseMatch = filtered[0].verseKey === pageLookupRecord.firstVerseKey || filtered[0].verseKey === pageLookupRecord.from;
      const lastVerseMatch = filtered[filtered.length - 1].verseKey === pageLookupRecord.lastVerseKey || filtered[filtered.length - 1].verseKey === pageLookupRecord.to;

      if (!firstVerseMatch || !lastVerseMatch) {
        return undefined; // Incomplete data for this page, force a fetch!
      }
    }

    return filtered.length > 0 ? filtered : undefined;
  }, [initialVerses, pageNumber, pageLookupRecord]);

  // SWR-like React Query fetcher for a single page
  const { data: verses, isLoading } = useQuery({
    queryKey: ["pageVerses", pageNumber, font, mushafLines, locale],
    queryFn: async () => {
      const response = await getPageVerses(pageNumber, locale, {
        mushaf: mushafId,
        wordFields,
        perPage: "all",
      });
      return response.verses || [];
    },
    // Use initialVerses if they belong to this pageNumber
    initialData: pageInitialVerses,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  React.useEffect(() => {
    if (pageRef.current && verses && verses.length > 0) {
      window.dispatchEvent(
        new CustomEvent("verse-node-mounted", {
          detail: { element: pageRef.current },
        })
      );
    }
  }, [verses]);

  // Preload QCF fonts for this page
  useQcfFont(font, verses || []);

  const isFontLoaded = useIsFontLoaded(pageNumber, font);

  const activeFontClassName = isFontLoaded
    ? fontClassName
    : `fallback_qpc_uthmani_hafs-font-size-${quranTextFontScale}`;

  const activeLineWidthClassName = getLineWidthClassName(
    isFontLoaded ? font : ("fallback_qpc_uthmani_hafs" as any),
    quranTextFontScale,
    mushafLines
  );

  if (isLoading || !verses || verses.length === 0) {
    const isWordByWordLayout = isWordByWordTranslation || isWordByWordTransliteration;
    return (
      <PageSkeleton
        mushafLines={mushafLines}
        font={font}
        quranTextFontScale={quranTextFontScale}
        isWordByWordLayout={isWordByWordLayout}
      />
    );
  }

  // Group words in this page by line number
  const lines = groupLinesByVerses(verses);

  return (
    <div
      ref={pageRef}
      data-page-index={pageIndex}
      data-verse-key={verses[0]?.verseKey}
      data-chapter-id={verses[0]?.verseKey ? getChapterNumberFromKey(verses[0].verseKey) : undefined}
      className={clsx(styles.page, activeLineWidthClassName, activeFontClassName, "quran-page")}
    >
      {Object.entries(lines).map(([lineKey, wordsInLine]) => {
        const lineMatch = lineKey.match(/Line(\d+)/);
        const lineNumber = lineMatch ? parseInt(lineMatch[1], 10) : 0;
        const isCenter = isCenterAlignedPage(pageNumber, lineNumber, font);

        return (
          <PageLine
            key={lineKey}
            lineKey={lineKey}
            wordsInLine={wordsInLine}
            pageNumber={pageNumber}
            font={font}
            quranTextFontScale={quranTextFontScale}
            isWordByWordTranslation={isWordByWordTranslation}
            isWordByWordTransliteration={isWordByWordTransliteration}
            playAudioOnClick={playAudioOnClick}
            selectedWordLocation={selectedWordLocation}
            isFontLoaded={isFontLoaded}
            handleWordClick={handleWordClick}
            isCenter={isCenter}
          />
        );
      })}

      <div className={styles.pageNumber}>
        {commonT("page")} {pageNumber}
      </div>
    </div>
  );
};

export default PageContainer;
