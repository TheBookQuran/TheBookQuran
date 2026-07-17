import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { VerseTracker } from "./VerseTracker";
import { useVerseTrackerStore } from "@/stores/verse-tracker";
import { Verse } from "@/types/quran";

describe("VerseTracker Component", () => {
  let observeMock: any;
  let disconnectMock: any;
  const mockVerses: Verse[] = [
    { id: 1, verseKey: "1:1", verseNumber: 1, juzNumber: 1, hizbNumber: 1, pageNumber: 1 } as any,
    { id: 2, verseKey: "1:2", verseNumber: 2, juzNumber: 1, hizbNumber: 1, pageNumber: 1 } as any,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useVerseTrackerStore.setState({
      activeVerseKey: null,
      activeJuz: null,
      activeHizb: null,
      activePage: null,
      progress: 0,
    });

    observeMock = vi.fn();
    disconnectMock = vi.fn();

    // Mock IntersectionObserver using standard function
    const mockIntersectionObserverConstructor = vi.fn().mockImplementation(function (this: any) {
      this.observe = observeMock;
      this.disconnect = disconnectMock;
      return this;
    });
    vi.stubGlobal("IntersectionObserver", mockIntersectionObserverConstructor);

    // Mock requestAnimationFrame / cancelAnimationFrame
    vi.stubGlobal("requestAnimationFrame", vi.fn((cb) => cb()));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize active data if no activeVerseKey exists in store", () => {
    render(<VerseTracker verses={mockVerses} />);

    const state = useVerseTrackerStore.getState();
    expect(state.activeVerseKey).toBe("1:1");
    expect(state.activeJuz).toBe(1);
    expect(state.activePage).toBe(1);
  });

  it("should not initialize active data if activeVerseKey already exists", () => {
    useVerseTrackerStore.setState({ activeVerseKey: "2:1" });

    render(<VerseTracker verses={mockVerses} />);

    const state = useVerseTrackerStore.getState();
    expect(state.activeVerseKey).toBe("2:1");
  });

  it("should listen to scroll and update progress when chapterId is not provided", () => {
    // Mock scroll properties
    Object.defineProperty(window, "scrollY", { value: 100, writable: true });
    Object.defineProperty(document.documentElement, "scrollHeight", { value: 1000, writable: true });
    Object.defineProperty(document.documentElement, "clientHeight", { value: 500, writable: true });

    render(<VerseTracker verses={mockVerses} />);

    const state = useVerseTrackerStore.getState();
    // scrolled = 100 / (1000 - 500) = 100 / 500 = 20%
    expect(state.progress).toBe(20);
  });
});
