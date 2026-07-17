import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface JournalNote {
  id: string;
  title: string;
  content: string;
  reference: string; // e.g. "2:183" or free text reference
  createdAt: string;
}

export interface JournalBookmark {
  id: string;
  type: "surah" | "juz" | "hizb" | "page" | "verse";
  label: string;
  key: string; // the routing key, e.g. "1" or "2:183"
  createdAt: string;
}

export interface JournalHistoryItem {
  id: string;
  type: "surah" | "juz" | "hizb" | "page" | "verse";
  label: string;
  key: string;
  readAt: string;
}

interface JournalState {
  notes: JournalNote[];
  bookmarks: JournalBookmark[];
  history: JournalHistoryItem[];
  
  // Note actions
  addNote: (note: Omit<JournalNote, "id" | "createdAt">) => void;
  updateNote: (id: string, note: Partial<Omit<JournalNote, "id" | "createdAt">>) => void;
  deleteNote: (id: string) => void;
  
  // Bookmark actions
  addBookmark: (bookmark: Omit<JournalBookmark, "id" | "createdAt">) => void;
  removeBookmark: (key: string, type: JournalBookmark["type"]) => void;
  isBookmarked: (key: string, type: JournalBookmark["type"]) => boolean;
  
  // History actions
  addHistoryItem: (item: Omit<JournalHistoryItem, "id" | "readAt">) => void;
  clearHistory: () => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      notes: [],
      bookmarks: [],
      history: [],
      
      addNote: (note) => {
        const newNote: JournalNote = {
          ...note,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          notes: [newNote, ...state.notes],
        }));
      },
      
      updateNote: (id, updatedFields) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updatedFields } : note
          ),
        }));
      },
      
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },
      
      addBookmark: (bookmark) => {
        // Prevent duplicates
        const exists = get().bookmarks.some(
          (b) => b.key === bookmark.key && b.type === bookmark.type
        );
        if (exists) return;
        
        const newBookmark: JournalBookmark = {
          ...bookmark,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          bookmarks: [newBookmark, ...state.bookmarks],
        }));
      },
      
      removeBookmark: (key, type) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter(
            (b) => !(b.key === key && b.type === type)
          ),
        }));
      },
      
      isBookmarked: (key, type) => {
        return get().bookmarks.some((b) => b.key === key && b.type === type);
      },
      
      addHistoryItem: (item) => {
        // Remove existing to place at top
        const filtered = get().history.filter(
          (h) => !(h.key === item.key && h.type === item.type)
        );
        
        const newHistoryItem: JournalHistoryItem = {
          ...item,
          id: Math.random().toString(36).substring(2, 9),
          readAt: new Date().toISOString(),
        };
        
        set(() => ({
          history: [newHistoryItem, ...filtered].slice(0, 50), // Limit to 50 items
        }));
      },
      
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "quran-journal-store",
    }
  )
);
