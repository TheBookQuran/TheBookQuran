"use client";

import { useMemo } from "react";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { getFontFaceNameForPage, isQCFFont } from "@/lib/quran-core/fonts/font-face-helper";
import { QuranFont } from "@/lib/quran-core/fonts/types";

/**
 * A hook that detects whether a font of a specific page
 * has been loaded or not.
 *
 * @param {number} pageNumber
 * @param {QuranFont} quranFont
 * @returns {boolean}
 */
export function useIsFontLoaded(pageNumber: number, quranFont: QuranFont): boolean {
  const loadedFonts = useQuranReaderStore((state) => state.loadedFonts);

  const isFontLoaded = useMemo(() => {
    if (!isQCFFont(quranFont)) {
      return true;
    }
    return loadedFonts.includes(getFontFaceNameForPage(quranFont, pageNumber));
  }, [loadedFonts, pageNumber, quranFont]);

  return isFontLoaded;
}

export default useIsFontLoaded;
