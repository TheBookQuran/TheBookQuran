import { create } from "zustand";

export enum SettingsView {
  Body = "body",
  Translation = "translation",
  Reciter = "reciter",
  Tafsir = "tafsir",
  RepeatSettings = "repeatSettings",
}

interface UIState {
  isNavigationDrawerOpen: boolean;
  isSearchDrawerOpen: boolean;
  isSettingsDrawerOpen: boolean;
  settingsView: SettingsView;
  selectedWordLocation: string | null;
  selectedWordText: string | null;
  selectedWordAudioUrl: string | null;

  // Actions
  setNavigationDrawerOpen: (open: boolean) => void;
  setSearchDrawerOpen: (open: boolean) => void;
  toggleSearchDrawer: () => void;
  setSettingsDrawerOpen: (open: boolean) => void;
  setSettingsView: (view: SettingsView) => void;
  setSelectedWordLocation: (
    location: string | null,
    text?: string | null,
    audioUrl?: string | null
  ) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isNavigationDrawerOpen: false,
  isSearchDrawerOpen: false,
  isSettingsDrawerOpen: false,
  settingsView: SettingsView.Body,
  selectedWordLocation: null,
  selectedWordText: null,
  selectedWordAudioUrl: null,

  setNavigationDrawerOpen: (isNavigationDrawerOpen) => set({ isNavigationDrawerOpen }),
  setSearchDrawerOpen: (isSearchDrawerOpen) => set({ isSearchDrawerOpen }),
  toggleSearchDrawer: () => set((state) => ({ isSearchDrawerOpen: !state.isSearchDrawerOpen })),
  setSettingsDrawerOpen: (isSettingsDrawerOpen) =>
    set((state) => ({
      isSettingsDrawerOpen,
      // Reset to main settings body when closing the settings drawer
      settingsView: isSettingsDrawerOpen ? state.settingsView : SettingsView.Body,
    })),
  setSettingsView: (settingsView) => set({ settingsView }),
  setSelectedWordLocation: (selectedWordLocation, selectedWordText = null, selectedWordAudioUrl = null) =>
    set({
      selectedWordLocation,
      selectedWordText,
      selectedWordAudioUrl,
    }),
}));
