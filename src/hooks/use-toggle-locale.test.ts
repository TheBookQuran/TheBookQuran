import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useToggleLocale } from "./use-toggle-locale";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

vi.mock("next-intl", () => ({
  useLocale: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

describe("useToggleLocale hook", () => {
  let mockPush: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);
  });

  it("should switch English to Arabic path", () => {
    vi.mocked(useLocale).mockReturnValue("en");
    vi.mocked(usePathname).mockReturnValue("/en/surah/1");

    const { result } = renderHook(() => useToggleLocale());
    result.current();

    expect(mockPush).toHaveBeenCalledWith("/ar/surah/1");
  });

  it("should switch Arabic to English path", () => {
    vi.mocked(useLocale).mockReturnValue("ar");
    vi.mocked(usePathname).mockReturnValue("/ar/juz/1");

    const { result } = renderHook(() => useToggleLocale());
    result.current();

    expect(mockPush).toHaveBeenCalledWith("/en/juz/1");
  });

  it("should switch language on root path or empty segment", () => {
    vi.mocked(useLocale).mockReturnValue("en");
    vi.mocked(usePathname).mockReturnValue("");

    const { result } = renderHook(() => useToggleLocale());
    result.current();

    expect(mockPush).toHaveBeenCalledWith("/ar");
  });
});
