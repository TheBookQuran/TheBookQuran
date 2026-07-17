import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useQcfFont } from "./use-qcf-font";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { useThemeStore } from "@/stores/theme";
import { QuranFont } from "@/lib/quran-core/fonts/types";

describe("useQcfFont hook", () => {
  let mockLoad: any;
  let mockAdd: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoad = vi.fn().mockResolvedValue({});
    mockAdd = vi.fn();

    // Stub global FontFace class
    const mockFontFace = vi.fn().mockImplementation(function (this: any, name: string, source: string) {
      this.name = name;
      this.source = source;
      this.display = "auto";
      this.load = mockLoad;
      return this;
    });
    vi.stubGlobal("FontFace", mockFontFace);

    // Stub document.fonts
    Object.defineProperty(document, "fonts", {
      writable: true,
      value: {
        add: mockAdd,
      },
    });

    useQuranReaderStore.setState({ loadedFonts: [] });
    useThemeStore.setState({ resolvedTheme: "light" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should do nothing if font is not QCF", () => {
    const verses = [{ id: 1, pageNumber: 1 } as any];
    renderHook(() => useQcfFont(QuranFont.UthmaniHafsV1, verses));

    expect(window.FontFace).not.toHaveBeenCalled();
    expect(document.fonts.add).not.toHaveBeenCalled();
  });

  it("should load QCF font-face and update loadedFonts in store", async () => {
    const verses = [{ id: 1, pageNumber: 15 } as any];
    renderHook(() => useQcfFont(QuranFont.MadaniV2, verses));

    expect(window.FontFace).toHaveBeenCalledWith(
      "p15-v2",
      expect.stringContaining("woff2")
    );
    expect(document.fonts.add).toHaveBeenCalled();
    expect(mockLoad).toHaveBeenCalled();

    await waitFor(() => {
      expect(useQuranReaderStore.getState().loadedFonts).toContain("p15-v2");
    });
  });

  it("should not double load fonts if already loading or loaded", () => {
    const verses = [{ id: 1, pageNumber: 15 } as any];
    useQuranReaderStore.setState({ loadedFonts: ["p15-v2"] });

    renderHook(() => useQcfFont(QuranFont.MadaniV2, verses));

    expect(window.FontFace).not.toHaveBeenCalled();
  });
});
