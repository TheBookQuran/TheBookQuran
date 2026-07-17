import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSearch } from "./use-search";
import { getNewSearchResults } from "@/services/quran-api";
import { createQueryWrapper } from "./test-utils";

vi.mock("@/services/quran-api", () => ({
  getNewSearchResults: vi.fn(),
}));

describe("use-search hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch search results successfully when query is not empty", async () => {
    const mockResults = {
      results: [{ text: "matched text", verseKey: "1:1" }],
      pagination: { totalRecords: 1 },
    };
    vi.mocked(getNewSearchResults).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useSearch("test query", 1, "en"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResults);
    expect(getNewSearchResults).toHaveBeenCalledWith({
      query: "test query",
      page: 1,
      size: 10,
      filterLanguages: "en",
    });
  });

  it("should set filterLanguages to undefined when locale is ar", async () => {
    vi.mocked(getNewSearchResults).mockResolvedValue({});

    const { result } = renderHook(() => useSearch("test query", 2, "ar"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getNewSearchResults).toHaveBeenCalledWith({
      query: "test query",
      page: 2,
      size: 10,
      filterLanguages: undefined,
    });
  });

  it("should not run query when query is empty or whitespace", () => {
    const { result } = renderHook(() => useSearch("   ", 1, "en"), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isEnabled).toBe(false);
    expect(getNewSearchResults).not.toHaveBeenCalled();
  });
});
