import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "./settings";
import { WordByWordDisplay } from "../types/settings";

const initialState = useSettingsStore.getState();

describe("settings store", () => {
  beforeEach(() => {
    useSettingsStore.setState(initialState, true);
  });

  it("should have correct initial state", () => {
    const state = useSettingsStore.getState();
    expect(state.selectedTranslations).toEqual([85]);
    expect(state.selectedReciter).toBe(6);
    expect(state.wordByWordDisplay).toBe(WordByWordDisplay.TOOLTIP);
    expect(state.isWordByWordTranslation).toBe(false);
    expect(state.isWordByWordTransliteration).toBe(false);
    expect(state.selectedLexicon).toBeNull();
    expect(state.playAudioOnClick).toBe(false);
    expect(state.locale).toBe("en");
    expect(state.wordByWordLocale).toBe("en");
  });

  it("should set selected translations", () => {
    useSettingsStore.getState().setSelectedTranslations([1, 2]);
    expect(useSettingsStore.getState().selectedTranslations).toEqual([1, 2]);
  });

  it("should set selected reciter", () => {
    useSettingsStore.getState().setSelectedReciter(10);
    expect(useSettingsStore.getState().selectedReciter).toBe(10);
  });

  it("should set word by word display", () => {
    useSettingsStore.getState().setWordByWordDisplay(WordByWordDisplay.INLINE);
    expect(useSettingsStore.getState().wordByWordDisplay).toBe(WordByWordDisplay.INLINE);
  });

  it("should set word by word translation", () => {
    useSettingsStore.getState().setIsWordByWordTranslation(true);
    expect(useSettingsStore.getState().isWordByWordTranslation).toBe(true);
  });

  it("should set word by word transliteration", () => {
    useSettingsStore.getState().setIsWordByWordTransliteration(true);
    expect(useSettingsStore.getState().isWordByWordTransliteration).toBe(true);
  });

  it("should set selected lexicon", () => {
    useSettingsStore.getState().setSelectedLexicon("lanes");
    expect(useSettingsStore.getState().selectedLexicon).toBe("lanes");
  });

  it("should set play audio on click", () => {
    useSettingsStore.getState().setPlayAudioOnClick(true);
    expect(useSettingsStore.getState().playAudioOnClick).toBe(true);
  });

  it("should set locale", () => {
    useSettingsStore.getState().setLocale("ar");
    expect(useSettingsStore.getState().locale).toBe("ar");
  });
});
