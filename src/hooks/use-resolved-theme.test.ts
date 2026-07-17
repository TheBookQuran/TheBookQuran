import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useResolvedTheme } from "./use-resolved-theme";
import { useThemeStore } from "@/stores/theme";

describe("useResolvedTheme hook", () => {
  it("should return the resolved theme from useThemeStore", () => {
    useThemeStore.setState({ resolvedTheme: "dark" });
    const { result, rerender } = renderHook(() => useResolvedTheme());
    expect(result.current).toBe("dark");

    useThemeStore.setState({ resolvedTheme: "light" });
    rerender();
    expect(result.current).toBe("light");
  });
});
