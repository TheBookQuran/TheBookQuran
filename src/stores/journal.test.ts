import { describe, it, expect, beforeEach, vi } from "vitest";
import { useJournalStore } from "./journal";

const initialState = useJournalStore.getState();

describe("journal store", () => {
  beforeEach(() => {
    useJournalStore.setState(initialState, true);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Notes", () => {
    it("should add a note", () => {
      const date = new Date("2026-07-11T12:00:00Z");
      vi.setSystemTime(date);

      useJournalStore.getState().addNote({
        title: "Test Note",
        content: "This is a test note",
        reference: "1:1",
      });

      const state = useJournalStore.getState();
      expect(state.notes.length).toBe(1);
      expect(state.notes[0].title).toBe("Test Note");
      expect(state.notes[0].content).toBe("This is a test note");
      expect(state.notes[0].reference).toBe("1:1");
      expect(state.notes[0].id).toBeDefined();
      expect(state.notes[0].createdAt).toBe(date.toISOString());
    });

    it("should update a note", () => {
      useJournalStore.getState().addNote({
        title: "Old Title",
        content: "Old Content",
        reference: "1:1",
      });

      const noteId = useJournalStore.getState().notes[0].id;
      useJournalStore.getState().updateNote(noteId, { title: "New Title" });

      const state = useJournalStore.getState();
      expect(state.notes[0].title).toBe("New Title");
      expect(state.notes[0].content).toBe("Old Content"); // Shouldn't change
    });

    it("should delete a note", () => {
      useJournalStore.getState().addNote({
        title: "Note to delete",
        content: "Content",
        reference: "1:1",
      });

      expect(useJournalStore.getState().notes.length).toBe(1);
      const noteId = useJournalStore.getState().notes[0].id;

      useJournalStore.getState().deleteNote(noteId);
      expect(useJournalStore.getState().notes.length).toBe(0);
    });
  });

  describe("Bookmarks", () => {
    it("should add a bookmark", () => {
      const date = new Date("2026-07-11T12:00:00Z");
      vi.setSystemTime(date);

      useJournalStore.getState().addBookmark({
        type: "surah",
        label: "Al-Fatihah",
        key: "1",
      });

      const state = useJournalStore.getState();
      expect(state.bookmarks.length).toBe(1);
      expect(state.bookmarks[0].label).toBe("Al-Fatihah");
      expect(state.bookmarks[0].createdAt).toBe(date.toISOString());
    });

    it("should prevent duplicate bookmarks", () => {
      useJournalStore.getState().addBookmark({
        type: "surah",
        label: "Al-Fatihah",
        key: "1",
      });

      useJournalStore.getState().addBookmark({
        type: "surah",
        label: "Al-Fatihah Duplicate Attempt",
        key: "1",
      });

      expect(useJournalStore.getState().bookmarks.length).toBe(1);
      expect(useJournalStore.getState().bookmarks[0].label).toBe("Al-Fatihah");
    });

    it("should remove a bookmark", () => {
      useJournalStore.getState().addBookmark({
        type: "juz",
        label: "Juz 1",
        key: "1",
      });

      expect(useJournalStore.getState().bookmarks.length).toBe(1);
      useJournalStore.getState().removeBookmark("1", "juz");
      expect(useJournalStore.getState().bookmarks.length).toBe(0);
    });

    it("should check if bookmarked", () => {
      useJournalStore.getState().addBookmark({
        type: "verse",
        label: "2:255",
        key: "2:255",
      });

      expect(useJournalStore.getState().isBookmarked("2:255", "verse")).toBe(true);
      expect(useJournalStore.getState().isBookmarked("2:255", "surah")).toBe(false);
      expect(useJournalStore.getState().isBookmarked("1:1", "verse")).toBe(false);
    });
  });

  describe("History", () => {
    it("should add history item and limit to 50", () => {
      for (let i = 1; i <= 55; i++) {
        useJournalStore.getState().addHistoryItem({
          type: "page",
          label: `Page ${i}`,
          key: `${i}`,
        });
      }

      const state = useJournalStore.getState();
      expect(state.history.length).toBe(50);
      // The newest should be at the top
      expect(state.history[0].label).toBe("Page 55");
      expect(state.history[49].label).toBe("Page 6");
    });

    it("should deduplicate and move to top if existing item is added", () => {
      useJournalStore.getState().addHistoryItem({ type: "surah", label: "Surah 1", key: "1" });
      useJournalStore.getState().addHistoryItem({ type: "surah", label: "Surah 2", key: "2" });
      useJournalStore.getState().addHistoryItem({ type: "surah", label: "Surah 1", key: "1" }); // Revisit Surah 1

      const state = useJournalStore.getState();
      expect(state.history.length).toBe(2);
      expect(state.history[0].key).toBe("1"); // Surah 1 moved to top
      expect(state.history[1].key).toBe("2");
    });

    it("should clear history", () => {
      useJournalStore.getState().addHistoryItem({ type: "juz", label: "Juz 1", key: "1" });
      expect(useJournalStore.getState().history.length).toBe(1);

      useJournalStore.getState().clearHistory();
      expect(useJournalStore.getState().history.length).toBe(0);
    });
  });
});
