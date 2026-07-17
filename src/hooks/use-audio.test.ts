import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAudioData, useVerseTimings } from "./use-audio";
import { getChapterAudioData } from "@/services/quran-api";
import { createQueryWrapper } from "./test-utils";

vi.mock("@/services/quran-api", () => ({
  getChapterAudioData: vi.fn(),
}));

describe("use-audio hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch audio data successfully", async () => {
    const mockAudioData = {
      audioUrl: "https://example.com/audio.mp3",
      verseTimings: [{ verseKey: "1:1", timestamp: 100 }],
    };
    vi.mocked(getChapterAudioData).mockResolvedValue(mockAudioData);

    const { result } = renderHook(() => useAudioData(1, 1), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockAudioData);
    expect(getChapterAudioData).toHaveBeenCalledWith(1, 1, true);
  });

  it("should select verse timings correctly", async () => {
    const mockAudioData = {
      audioUrl: "https://example.com/audio.mp3",
      verseTimings: [{ verseKey: "1:1", timestamp: 100 }],
    };
    vi.mocked(getChapterAudioData).mockResolvedValue(mockAudioData);

    const { result } = renderHook(() => useVerseTimings(1, 1), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([{ verseKey: "1:1", timestamp: 100 }]);
  });

  it("should not fetch if reciterId or chapterId is falsy", () => {
    const { result } = renderHook(() => useAudioData(0, 1), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isEnabled).toBe(false);
    expect(getChapterAudioData).not.toHaveBeenCalled();
  });
});
