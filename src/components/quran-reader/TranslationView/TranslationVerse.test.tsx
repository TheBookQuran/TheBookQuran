import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TranslationVerse } from "./TranslationVerse";
import { useQuranReaderStore } from "@/stores/quran-reader";
import { useAudioPlayerStore } from "@/stores/audio-player";
import { useJournalStore } from "@/stores/journal";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Verse } from "@/types/quran";

vi.mock("next-intl", () => ({
  useLocale: vi.fn().mockReturnValue("en"),
  useTranslations: vi.fn().mockReturnValue((key: string) => key),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("../VerseText", () => ({
  default: () => <div data-testid="verse-text-mock">Verse Text Mock</div>,
}));

describe("TranslationVerse Component", () => {
  let mockPush: any;
  let mockAlert: any;
  const mockVerse: Verse = {
    id: 1,
    verseKey: "1:1",
    verseNumber: 1,
    textUthmani: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
    translations: [
      { id: 85, resourceId: 85, text: "In the name of Allah", resourceName: "Abdul Haleem" },
    ],
    words: [],
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);

    mockAlert = vi.fn();
    vi.stubGlobal("alert", mockAlert);

    // Mock clipboard API with configurable: true so userEvent doesn't crash trying to stub it
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    useQuranReaderStore.setState({ translationFontScale: 3 });
    useAudioPlayerStore.setState({ isPlaying: false, currentVerseKey: null });
    useJournalStore.setState({ bookmarks: [], notes: [], history: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render verse key, mock text, and translations", () => {
    render(<TranslationVerse verse={mockVerse} />);

    expect(screen.getByText("1:1")).toBeInTheDocument();
    expect(screen.getByTestId("verse-text-mock")).toBeInTheDocument();
    expect(screen.getByText("In the name of Allah")).toBeInTheDocument();
    expect(screen.getByText("— Abdul Haleem")).toBeInTheDocument();
  });

  it("should trigger play audio when play button is clicked", async () => {
    const user = userEvent.setup();
    render(<TranslationVerse verse={mockVerse} />);

    const playBtn = screen.getByTitle("audio.play");
    await user.click(playBtn);

    expect(useAudioPlayerStore.getState().currentVerseKey).toBe("1:1");
    expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
  });

  it("should copy verse text to clipboard", async () => {
    const user = userEvent.setup();
    // Spy and mock writeText after userEvent has stubbed the clipboard
    const writeTextSpy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);

    render(<TranslationVerse verse={mockVerse} />);

    const copyBtn = screen.getByTitle("copy");
    await user.click(copyBtn);

    expect(writeTextSpy).toHaveBeenCalledWith(
      "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ (1:1)\n\nIn the name of Allah — Abdul Haleem"
    );
  });

  it("should toggle bookmark in journal store on click", async () => {
    const user = userEvent.setup();
    render(<TranslationVerse verse={mockVerse} />);

    const bookmarkBtn = screen.getByTitle("bookmark");
    await user.click(bookmarkBtn);

    // Should add to journal store
    const bookmarks = useJournalStore.getState().bookmarks;
    expect(bookmarks.length).toBe(1);
    expect(bookmarks[0].key).toBe("1:1");

    // Click again to remove
    await user.click(bookmarkBtn);
    expect(useJournalStore.getState().bookmarks.length).toBe(0);
  });

  /* ميزات قادمة لاحقاً: إضافة ملاحظات/تدوين
  it("should navigate to my-quran route with verse parameter when note button is clicked", async () => {
    const user = userEvent.setup();
    render(<TranslationVerse verse={mockVerse} />);

    const noteBtn = screen.getByTitle("notes");
    await user.click(noteBtn);

    expect(mockPush).toHaveBeenCalledWith("/en/my-quran?verse=1:1");
  });
  */
});
