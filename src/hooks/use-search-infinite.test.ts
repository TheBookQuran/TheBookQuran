import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSearchInfinite } from "./use-search-infinite";
import { getNewSearchResults } from "@/services/quran-api";
import { createQueryWrapper } from "./test-utils";

vi.mock("@/services/quran-api", () => ({
  getNewSearchResults: vi.fn(),
}));

describe("use-search-infinite hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch infinite search results successfully when query is not empty", async () => {
    const mockResults = {
      result: {
        verses: [{ text: "matched text", verseKey: "1:1" }],
        pagination: { currentPage: 1, totalPages: 2, totalRecords: 2 },
      },
    };
    vi.mocked(getNewSearchResults).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useSearchInfinite("test query", "en"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pages[0]).toEqual(mockResults);
    expect(getNewSearchResults).toHaveBeenCalledWith({
      query: "test query",
      page: 1,
      size: 50,
      filterLanguages: "en",
    });
  });

  it("should return the correct next page parameter", async () => {
    const mockResultsPage1 = {
      result: {
        verses: [{ text: "matched text 1", verseKey: "1:1" }],
        pagination: { currentPage: 1, totalPages: 2, totalRecords: 2 },
      },
    };
    vi.mocked(getNewSearchResults).mockResolvedValue(mockResultsPage1);

    const { result } = renderHook(() => useSearchInfinite("test query", "en"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Call fetchNextPage to load page 2
    result.current.fetchNextPage();

    await waitFor(() => {
      expect(getNewSearchResults).toHaveBeenCalledWith({
        query: "test query",
        page: 2,
        size: 50,
        filterLanguages: "en",
      });
    });
  });

  it("should continue fetching via fallback when pagination metadata is missing", async () => {
    // Mock returns results without pagination (totalRecords = 0, totalPages = 1)
    const mockResults = {
      result: {
        verses: [{ text: "matched", verseKey: "1:1" }],
        // no pagination — triggers fallback
      },
    };
    vi.mocked(getNewSearchResults).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useSearchInfinite("test query", "en"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Fallback: verses.length > 0 should allow fetching next page
    expect(result.current.hasNextPage).toBe(true);

    result.current.fetchNextPage();

    await waitFor(() => {
      expect(getNewSearchResults).toHaveBeenCalledWith({
        query: "test query",
        page: 2,
        size: 50,
        filterLanguages: "en",
      });
    });
  });

  it("should stop fetching when fallback returns no verses", async () => {
    vi.mocked(getNewSearchResults).mockResolvedValue({
      result: { verses: [] },
    });

    const { result } = renderHook(() => useSearchInfinite("test query", "en"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // No verses → fallback should return undefined → hasNextPage = false
    expect(result.current.hasNextPage).toBe(false);
  });

  it("should not run query when query is empty or whitespace", () => {
    const { result } = renderHook(() => useSearchInfinite("   ", "en"), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(getNewSearchResults).not.toHaveBeenCalled();
  });
});
