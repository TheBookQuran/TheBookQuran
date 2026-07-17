import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  useWordToRootMapping,
  useRootsData,
  useWordRoot,
  useRootData,
  useAllOccurrences,
  useRootOccurrences,
  useEnrichedLexicon,
} from "./use-linguistics";
import { createQueryWrapper } from "./test-utils";

const mockMapping = { "2:255:4": "123" };
const mockRoots = { "123": { id: "123", value: "كتب" } };
const mockOccurrences = { "123": [{ chapterNumber: 2, verseNumber: 255, wordPosition: 4 }] };
const mockEnriched = { rootId: "123", definition: "to write" };

describe("use-linguistics hooks", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("word_to_root.json")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMapping) });
        }
        if (url.includes("roots.json")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRoots) });
        }
        if (url.includes("occurrences.json")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockOccurrences) });
        }
        if (url.includes("enriched/123.json")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockEnriched) });
        }
        return Promise.resolve({ ok: false, status: 404 });
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch word to root mapping successfully", async () => {
    const { result } = renderHook(() => useWordToRootMapping(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockMapping);
  });

  it("should fetch roots data successfully", async () => {
    const { result } = renderHook(() => useRootsData(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Since normalizeRoot is applied, it will camelizeKeys and normalize.
    // Our mock simple object should be normalized.
    expect(result.current.data?.["123"]).toBeDefined();
  });

  it("should get word root details for a word location", async () => {
    const { result } = renderHook(() => useWordRoot("2:255:4"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it("should get root details directly by rootId", async () => {
    const { result } = renderHook(() => useRootData("123"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("123");
  });

  it("should fetch root occurrences list", async () => {
    const { result } = renderHook(() => useRootOccurrences("123"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ chapterNumber: 2, verseNumber: 255, wordPosition: 4 }]);
  });

  it("should fetch enriched AI lexicon details", async () => {
    const { result } = renderHook(() => useEnrichedLexicon("123"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ rootId: "123", definition: "to write" });
  });
});
