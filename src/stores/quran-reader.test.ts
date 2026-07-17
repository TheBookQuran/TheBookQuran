import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useQuranReaderStore } from "./quran-reader";
import { QuranFont, MushafLines } from "../lib/quran-core/fonts/types";
import { ReadingPreference } from "../types/settings";

const initialState = useQuranReaderStore.getState();

describe("quran-reader store", () => {
  beforeEach(() => {
    useQuranReaderStore.setState(initialState, true);
    // Clear cookies before each test
    Object.defineProperty(window.document, "cookie", {
      writable: true,
      value: "",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should have correct initial state", () => {
    const state = useQuranReaderStore.getState();
    expect(state.quranFont).toBe(QuranFont.MadaniV2);
    expect(state.mushafLines).toBe(MushafLines.SixteenLines);
    expect(state.translationFontScale).toBe(3);
    expect(state.quranTextFontScale).toBe(3);
    expect(state.readingPreference).toBe(ReadingPreference.Translation);
    expect(state.loadedFonts).toEqual([]);
  });

  it("should set quran font", () => {
    useQuranReaderStore.getState().setQuranFont(QuranFont.IndoPak);
    expect(useQuranReaderStore.getState().quranFont).toBe(QuranFont.IndoPak);
  });

  it("should set mushaf lines", () => {
    useQuranReaderStore.getState().setMushafLines(MushafLines.FifteenLines);
    expect(useQuranReaderStore.getState().mushafLines).toBe(MushafLines.FifteenLines);
  });

  it("should set translation font scale", () => {
    useQuranReaderStore.getState().setTranslationFontScale(5);
    expect(useQuranReaderStore.getState().translationFontScale).toBe(5);
  });

  it("should set quran text font scale", () => {
    useQuranReaderStore.getState().setQuranTextFontScale(5);
    expect(useQuranReaderStore.getState().quranTextFontScale).toBe(5);
  });

  it("should set reading preference and update cookie", () => {
    useQuranReaderStore.getState().setReadingPreference(ReadingPreference.Reading);
    expect(useQuranReaderStore.getState().readingPreference).toBe(ReadingPreference.Reading);
    expect(window.document.cookie).toContain("reading-pref=reading");
  });

  it("should add loaded font without duplicates", () => {
    useQuranReaderStore.getState().addLoadedFont("font-1");
    expect(useQuranReaderStore.getState().loadedFonts).toEqual(["font-1"]);

    useQuranReaderStore.getState().addLoadedFont("font-2");
    expect(useQuranReaderStore.getState().loadedFonts).toEqual(["font-1", "font-2"]);

    // Try adding duplicate
    useQuranReaderStore.getState().addLoadedFont("font-1");
    expect(useQuranReaderStore.getState().loadedFonts).toEqual(["font-1", "font-2"]);
  });
});
