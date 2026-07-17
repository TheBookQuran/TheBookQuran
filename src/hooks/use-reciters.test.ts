import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useReciters } from "./use-reciters";
import { getAvailableReciters } from "@/services/quran-api";
import { createQueryWrapper } from "./test-utils";

vi.mock("@/services/quran-api", () => ({
  getAvailableReciters: vi.fn(),
}));

describe("use-reciters hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch available reciters", async () => {
    const mockReciters = {
      reciters: [{ id: 1, name: "Reciter 1" }],
    };
    vi.mocked(getAvailableReciters).mockResolvedValue(mockReciters);

    const { result } = renderHook(() => useReciters("en"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockReciters);
    expect(getAvailableReciters).toHaveBeenCalledWith("en");
  });
});
