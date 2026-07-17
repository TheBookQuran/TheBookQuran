"use client";

import { useEffect, useRef } from "react";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { QuranFont } from "@/lib/quran-core/fonts/types";
import {
  getFontFaceNameForPage,
  getPagesByVerses,
  getQCFFontFaceSource,
  isQCFFont,
} from "@/lib/quran-core/fonts/font-face-helper";
import { Verse } from "@/types/quran";

export function useQcfFont(quranFont: QuranFont, verses: Verse[]) {
  const currentlyFetchingFonts = useRef<string[]>([]);
  const isFontQCF = isQCFFont(quranFont);
  const loadedFonts = useQuranReaderStore((state) => state.loadedFonts);
  const addLoadedFont = useQuranReaderStore((state) => state.addLoadedFont);
  const theme = useResolvedTheme();

  useEffect(() => {
    if (isFontQCF && verses.length > 0) {
      // Loop through unique page numbers of the current verses
      getPagesByVerses(verses).forEach((pageNumber) => {
        const fontFaceName = getFontFaceNameForPage(quranFont, pageNumber);

        // Load fonts only if they have not been loaded or are not in progress
        if (
          !currentlyFetchingFonts.current.includes(fontFaceName) &&
          !loadedFonts.includes(fontFaceName)
        ) {
          currentlyFetchingFonts.current.push(fontFaceName);

          const fontSource = getQCFFontFaceSource(
            quranFont,
            pageNumber,
            theme === "dark" ? "dark" : theme === "sepia" ? "sepia" : "light"
          );

          try {
            const fontFace = new FontFace(fontFaceName, fontSource);
            fontFace.display = "block";
            document.fonts.add(fontFace);

            // Load the font-face programmatically
            fontFace
              .load()
              .then(() => {
                addLoadedFont(fontFaceName);
              })
              .catch((err) => {
                console.error(`Failed to load font face ${fontFaceName}`, err);
              })
              .finally(() => {
                // Remove from fetching tracking list
                currentlyFetchingFonts.current = currentlyFetchingFonts.current.filter(
                  (name) => name !== fontFaceName
                );
              });
          } catch (e) {
            console.error(`FontFace instantiation error:`, e);
            // Cleanup on error
            currentlyFetchingFonts.current = currentlyFetchingFonts.current.filter(
              (name) => name !== fontFaceName
            );
          }
        }
      });
    }
  }, [quranFont, verses, loadedFonts, isFontQCF, addLoadedFont, theme]);
}

export default useQcfFont;
