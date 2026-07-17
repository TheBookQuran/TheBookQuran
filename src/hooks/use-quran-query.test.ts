import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useVerses } from "./use-quran-query";
import { getChapterVerses, getPageVerses } from "@/services/quran-api";
import { useSettingsStore } from "@/stores/settings";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { createQueryWrapper } from "./test-utils";
import { QuranFont, MushafLines } from "../lib/quran-core/fonts/types";

vi.mock("@/services/quran-api", () => ({
  getChapterVerses: vi.fn(),
  getPageVerses: vi.fn(),
}));

describe("useVerses hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQuranReaderStore.setState({
      quranFont: QuranFont.MadaniV2,
      mushafLines: MushafLines.SixteenLines,
    });
    useSettingsStore.setState({
      selectedTranslations: [85],
    });
  });

  it("should fetch chapter verses using getChapterVerses successfully", async () => {
    const mockVersesResponse = {
      verses: [{ id: 1, verseKey: "1:1" }],
      pagination: { nextPage: 2 },
    };
    vi.mocked(getChapterVerses).mockResolvedValue(mockVersesResponse);

    const { result } = renderHook(() => useVerses("chapter", 1, "en"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pages[0]).toEqual(mockVersesResponse);
    expect(getChapterVerses).toHaveBeenCalledWith(1, "en", {
      translations: "85",
      mushaf: 1,
      wordFields: "verse_key,verse_id,page_number,line_number,location,text_uthmani,text_imlaei_simple,code_v2,qpc_uthmani_hafs",
      page: 1,
      perPage: 30,
    });
  });

  it("should handle page verses differently with perPage set to 'all'", async () => {
    const mockVersesResponse = {
      verses: [{ id: 1, verseKey: "1:1" }],
      pagination: { nextPage: null },
    };
    vi.mocked(getPageVerses).mockResolvedValue(mockVersesResponse);

    const { result } = renderHook(() => useVerses("page", 1, "en"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getPageVerses).toHaveBeenCalledWith(1, "en", {
      translations: "85",
      mushaf: 1,
      wordFields: "verse_key,verse_id,page_number,line_number,location,text_uthmani,text_imlaei_simple,code_v2,qpc_uthmani_hafs",
      page: 1,
      perPage: "all",
    });
  });

  it("should not execute when enabled option is false", () => {
    const { result } = renderHook(() => useVerses("chapter", 1, "en", { enabled: false }), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isEnabled).toBe(false);
    expect(getChapterVerses).not.toHaveBeenCalled();
  });
});
