import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIsFontLoaded } from "./use-is-font-loaded";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { QuranFont } from "@/lib/quran-core/fonts/types";

describe("useIsFontLoaded hook", () => {
  it("should return true if font is not QCF", () => {
    // UthmaniHafsV1 is NOT QCF
    const { result } = renderHook(() => useIsFontLoaded(1, QuranFont.UthmaniHafsV1));
    expect(result.current).toBe(true);
  });

  it("should return true if page font is loaded for QCF font", () => {
    // MadaniV2 IS QCF
    const font = QuranFont.MadaniV2;
    
    // If not loaded yet
    useQuranReaderStore.setState({ loadedFonts: [] });
    const { result, rerender } = renderHook(() => useIsFontLoaded(1, font));
    expect(result.current).toBe(false);

    // If loaded
    useQuranReaderStore.setState({ loadedFonts: ["p1-v2"] });
    rerender();
    expect(result.current).toBe(true);
  });
});
