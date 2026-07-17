import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePagesLookup } from "./use-pages-lookup";
import { getPagesLookup } from "@/services/quran-api";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { createQueryWrapper } from "./test-utils";
import { QuranFont, MushafLines } from "../lib/quran-core/fonts/types";

vi.mock("@/services/quran-api", () => ({
  getPagesLookup: vi.fn(),
}));

describe("usePagesLookup hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQuranReaderStore.setState({
      quranFont: QuranFont.MadaniV2,
      mushafLines: MushafLines.SixteenLines,
    });
  });

  it("should fetch pages lookup for chapter filter successfully", async () => {
    const mockLookupResponse = {
      pages: [1, 2],
    };
    vi.mocked(getPagesLookup).mockResolvedValue(mockLookupResponse);

    const { result } = renderHook(() => usePagesLookup("chapter", "1"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockLookupResponse);
    // MadaniV2 => Mushaf.QCFV2 (which is 1)
    expect(getPagesLookup).toHaveBeenCalledWith({
      mushaf: 1,
      chapterNumber: 1,
    });
  });

  it("should support other filter types", async () => {
    vi.mocked(getPagesLookup).mockResolvedValue({});

    const { result: hookJuz } = renderHook(() => usePagesLookup("juz", 2), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(hookJuz.current.isSuccess).toBe(true));
    expect(getPagesLookup).toHaveBeenCalledWith({ mushaf: 1, juzNumber: 2 });

    const { result: hookHizb } = renderHook(() => usePagesLookup("hizb", 3), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(hookHizb.current.isSuccess).toBe(true));
    expect(getPagesLookup).toHaveBeenCalledWith({ mushaf: 1, hizbNumber: 3 });

    const { result: hookPage } = renderHook(() => usePagesLookup("page", 45), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(hookPage.current.isSuccess).toBe(true));
    expect(getPagesLookup).toHaveBeenCalledWith({ mushaf: 1, pageNumber: 45 });
  });

  it("should disable query if id is not provided for non-range", () => {
    const { result } = renderHook(() => usePagesLookup("chapter", ""), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isEnabled).toBe(false);
  });
});
