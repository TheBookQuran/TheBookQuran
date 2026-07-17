import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useThemeStore } from "./theme";
import { ThemeType, ResolvedTheme } from "@/types/theme";

const initialState = useThemeStore.getState();

describe("theme store", () => {
  beforeEach(() => {
    useThemeStore.setState(initialState, true);
    
    // Mock window.matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should have correct initial state", () => {
    const state = useThemeStore.getState();
    expect(state.theme).toBe("system");
    expect(state.resolvedTheme).toBe("light");
  });

  it("should set theme", () => {
    useThemeStore.getState().setTheme("dark");
    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("should set resolved theme", () => {
    useThemeStore.getState().setResolvedTheme("dark");
    expect(useThemeStore.getState().resolvedTheme).toBe("dark");
  });
});
