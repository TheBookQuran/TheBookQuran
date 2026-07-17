import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore, SettingsView } from "./ui";

const initialState = useUIStore.getState();

describe("ui store", () => {
  beforeEach(() => {
    useUIStore.setState(initialState, true);
  });

  it("should have correct initial state", () => {
    const state = useUIStore.getState();
    expect(state.isNavigationDrawerOpen).toBe(false);
    expect(state.isSearchDrawerOpen).toBe(false);
    expect(state.isSettingsDrawerOpen).toBe(false);
    expect(state.settingsView).toBe(SettingsView.Body);
    expect(state.selectedWordLocation).toBeNull();
    expect(state.selectedWordText).toBeNull();
    expect(state.selectedWordAudioUrl).toBeNull();
  });

  it("should set navigation drawer open", () => {
    useUIStore.getState().setNavigationDrawerOpen(true);
    expect(useUIStore.getState().isNavigationDrawerOpen).toBe(true);
  });

  it("should set search drawer open", () => {
    useUIStore.getState().setSearchDrawerOpen(true);
    expect(useUIStore.getState().isSearchDrawerOpen).toBe(true);
  });

  it("should toggle search drawer", () => {
    expect(useUIStore.getState().isSearchDrawerOpen).toBe(false);
    useUIStore.getState().toggleSearchDrawer();
    expect(useUIStore.getState().isSearchDrawerOpen).toBe(true);
    useUIStore.getState().toggleSearchDrawer();
    expect(useUIStore.getState().isSearchDrawerOpen).toBe(false);
  });

  it("should set settings drawer open and reset view when closing", () => {
    useUIStore.getState().setSettingsView(SettingsView.Translation);
    useUIStore.getState().setSettingsDrawerOpen(true);
    expect(useUIStore.getState().isSettingsDrawerOpen).toBe(true);
    expect(useUIStore.getState().settingsView).toBe(SettingsView.Translation); // shouldn't reset

    useUIStore.getState().setSettingsDrawerOpen(false);
    expect(useUIStore.getState().isSettingsDrawerOpen).toBe(false);
    expect(useUIStore.getState().settingsView).toBe(SettingsView.Body); // should reset to Body
  });

  it("should set settings view", () => {
    useUIStore.getState().setSettingsView(SettingsView.Reciter);
    expect(useUIStore.getState().settingsView).toBe(SettingsView.Reciter);
  });

  it("should set selected word location, text, and audioUrl", () => {
    useUIStore.getState().setSelectedWordLocation("1:1:1", "Word", "audio.mp3");
    expect(useUIStore.getState().selectedWordLocation).toBe("1:1:1");
    expect(useUIStore.getState().selectedWordText).toBe("Word");
    expect(useUIStore.getState().selectedWordAudioUrl).toBe("audio.mp3");

    // Optional params omitted
    useUIStore.getState().setSelectedWordLocation("2:2:2");
    expect(useUIStore.getState().selectedWordLocation).toBe("2:2:2");
    expect(useUIStore.getState().selectedWordText).toBeNull();
    expect(useUIStore.getState().selectedWordAudioUrl).toBeNull();
  });
});
