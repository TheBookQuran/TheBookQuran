import { describe, it, expect, beforeEach } from "vitest";
import { useVerseTrackerStore } from "./verse-tracker";

const initialState = useVerseTrackerStore.getState();

describe("verse-tracker store", () => {
  beforeEach(() => {
    useVerseTrackerStore.setState(initialState, true);
  });

  it("should have correct initial state", () => {
    const state = useVerseTrackerStore.getState();
    expect(state.activeVerseKey).toBeNull();
    expect(state.activeJuz).toBeNull();
    expect(state.activeHizb).toBeNull();
    expect(state.activePage).toBeNull();
    expect(state.progress).toBe(0);
  });

  it("should set active data partially", () => {
    useVerseTrackerStore.getState().setActiveData({
      verseKey: "1:1",
      progress: 50,
    });
    
    let state = useVerseTrackerStore.getState();
    expect(state.activeVerseKey).toBe("1:1");
    expect(state.progress).toBe(50);
    expect(state.activeJuz).toBeNull(); // Should remain unchanged
    expect(state.activeHizb).toBeNull();
    expect(state.activePage).toBeNull();

    useVerseTrackerStore.getState().setActiveData({
      juz: 1,
      page: 1,
    });
    
    state = useVerseTrackerStore.getState();
    expect(state.activeJuz).toBe(1);
    expect(state.activePage).toBe(1);
    expect(state.activeVerseKey).toBe("1:1"); // Should remain unchanged
    expect(state.progress).toBe(50); // Should remain unchanged
  });

  it("should handle setting values to null or 0", () => {
    useVerseTrackerStore.getState().setActiveData({
      verseKey: "2:255",
      juz: 3,
      hizb: 5,
      page: 42,
      progress: 100,
    });

    useVerseTrackerStore.getState().setActiveData({
      verseKey: null,
      juz: null,
      hizb: null,
      page: null,
      progress: 0,
    });

    const state = useVerseTrackerStore.getState();
    expect(state.activeVerseKey).toBeNull();
    expect(state.activeJuz).toBeNull();
    expect(state.activeHizb).toBeNull();
    expect(state.activePage).toBeNull();
    expect(state.progress).toBe(0);
  });
});
