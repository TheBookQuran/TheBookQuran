import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./use-debounce";

describe("useDebounce hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 500));
    expect(result.current).toBe("hello");
  });

  it("should delay updating the value", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: "hello" },
    });

    expect(result.current).toBe("hello");

    // Change the value
    rerender({ value: "world" });
    expect(result.current).toBe("hello"); // Should not update yet

    // Fast-forward 200ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("hello");

    // Fast-forward remaining 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("world");
  });

  it("should clean up previous timeout on value change", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: "first" },
    });

    rerender({ value: "second" });
    act(() => {
      vi.advanceTimersByTime(300); // 300ms passed, not yet 500
    });
    expect(result.current).toBe("first");

    // Rerender again with a new value before the first timer finishes
    rerender({ value: "third" });
    
    act(() => {
      vi.advanceTimersByTime(300); // Another 300ms passed. The "second" value should be skipped
    });
    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(200); // Total 500ms from the last change ("third")
    });
    expect(result.current).toBe("third");
  });
});
