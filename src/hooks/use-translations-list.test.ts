import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTranslationsList } from "./use-translations-list";
import { getAvailableTranslations } from "@/services/quran-api";
import { createQueryWrapper } from "./test-utils";

vi.mock("@/services/quran-api", () => ({
  getAvailableTranslations: vi.fn(),
}));

describe("use-translations-list hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch available translations", async () => {
    const mockTranslations = {
      translations: [{ id: 1, name: "Translation 1" }],
    };
    vi.mocked(getAvailableTranslations).mockResolvedValue(mockTranslations);

    const { result } = renderHook(() => useTranslationsList("en"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTranslations);
    expect(getAvailableTranslations).toHaveBeenCalledWith("en");
  });
});
