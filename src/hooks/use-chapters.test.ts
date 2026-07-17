import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useChapters } from "./use-chapters";
import { createQueryWrapper } from "./test-utils";

describe("useChapters hook", () => {
  it("should load chapters list successfully using dynamic imports", async () => {
    const { result } = renderHook(() => useChapters("en"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.length).toBe(114);
    
    // Check first chapter Al-Fatihah
    const fatihah = result.current.data?.[0];
    expect(fatihah?.id).toBe(1);
    expect(fatihah?.versesCount).toBe(7);
    expect(fatihah?.slug).toBe("al-fatihah");
    expect(fatihah?.bismillahPre).toBe(false); // Fatihah doesn't have bismillahPre (it's part of the first verse)
  });
});
