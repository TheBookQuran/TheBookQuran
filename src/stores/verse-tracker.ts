import { create } from "zustand";

interface VerseTrackerState {
  activeVerseKey: string | null;
  activeJuz: number | null;
  activeHizb: number | null;
  activePage: number | null;
  progress: number;
  
  setActiveData: (data: Partial<{
    verseKey: string | null;
    juz: number | null;
    hizb: number | null;
    page: number | null;
    progress: number;
  }>) => void;
}

export const useVerseTrackerStore = create<VerseTrackerState>((set) => ({
  activeVerseKey: null,
  activeJuz: null,
  activeHizb: null,
  activePage: null,
  progress: 0,
  
  setActiveData: (data) => set((state) => ({
    activeVerseKey: data.verseKey !== undefined ? data.verseKey : state.activeVerseKey,
    activeJuz: data.juz !== undefined ? data.juz : state.activeJuz,
    activeHizb: data.hizb !== undefined ? data.hizb : state.activeHizb,
    activePage: data.page !== undefined ? data.page : state.activePage,
    progress: data.progress !== undefined ? data.progress : state.progress,
  })),
}));
