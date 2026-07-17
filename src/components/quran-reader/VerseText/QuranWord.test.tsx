import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuranWord } from "./QuranWord";
import { QuranFont } from "@/lib/quran-core/fonts/types";
import { useAudioPlayerStore } from "@/stores/audio-player";
import { Word } from "@/types/quran";

vi.mock("@/lib/quran-core/chapter/chapter-utils", () => ({
  getWordAudioUrl: vi.fn().mockReturnValue("https://example.com/audio.mp3"),
}));

describe("QuranWord Component", () => {
  let mockPlay: any;
  let mockPause: any;
  const mockWord: Word = {
    id: 1,
    location: "1:1:1",
    verseKey: "1:1",
    position: 1,
    charTypeName: "word",
    codeV2: "code_v2_fatihah",
    qpcUthmaniHafs: "بِسْمِ",
    textUthmani: "بِسْمِ",
    text: "بِسْمِ",
    translation: { text: "In the name of" },
    transliteration: { text: "Bismi" },
  };

  beforeEach(() => {
    mockPlay = vi.fn().mockResolvedValue(undefined);
    mockPause = vi.fn();
    
    const mockAudioConstructor = vi.fn().mockImplementation(function (this: any) {
      this.play = mockPlay;
      this.pause = mockPause;
      return this;
    });
    vi.stubGlobal("Audio", mockAudioConstructor);

    useAudioPlayerStore.setState({
      currentWordLocation: null,
      isPlaying: false,
      currentVerseKey: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render fallback text when font is not loaded", () => {
    render(
      <QuranWord
        word={mockWord}
        font={QuranFont.MadaniV2}
        quranTextFontScale={3}
        isWordByWordTranslation={false}
        isWordByWordTransliteration={false}
        playAudioOnClick={false}
        isSelected={false}
        isFontLoaded={false}
        onWordClick={vi.fn()}
      />
    );

    expect(screen.getByText("بِسْمِ")).toBeInTheDocument();
    expect(screen.queryByText("code_v2_fatihah")).not.toBeInTheDocument();
  });

  it("should render codeV2 when font is loaded", () => {
    render(
      <QuranWord
        word={mockWord}
        font={QuranFont.MadaniV2}
        quranTextFontScale={3}
        isWordByWordTranslation={false}
        isWordByWordTransliteration={false}
        playAudioOnClick={false}
        isSelected={false}
        isFontLoaded={true}
        onWordClick={vi.fn()}
      />
    );

    expect(screen.getByText("code_v2_fatihah")).toBeInTheDocument();
  });

  it("should call onWordClick on click", async () => {
    const user = userEvent.setup();
    const handleWordClick = vi.fn();

    render(
      <QuranWord
        word={mockWord}
        font={QuranFont.MadaniV2}
        quranTextFontScale={3}
        isWordByWordTranslation={false}
        isWordByWordTransliteration={false}
        playAudioOnClick={false}
        isSelected={false}
        isFontLoaded={true}
        onWordClick={handleWordClick}
      />
    );

    const wordEl = screen.getByText("code_v2_fatihah");
    await user.click(wordEl);

    expect(handleWordClick).toHaveBeenCalledWith(mockWord);
  });

  it("should play word audio if playAudioOnClick is true", async () => {
    const user = userEvent.setup();

    render(
      <QuranWord
        word={mockWord}
        font={QuranFont.MadaniV2}
        quranTextFontScale={3}
        isWordByWordTranslation={false}
        isWordByWordTransliteration={false}
        playAudioOnClick={true}
        isSelected={false}
        isFontLoaded={true}
        onWordClick={vi.fn()}
      />
    );

    const wordEl = screen.getByText("code_v2_fatihah");
    await user.click(wordEl);

    expect(window.Audio).toHaveBeenCalledWith("https://example.com/audio.mp3");
    expect(mockPlay).toHaveBeenCalled();
  });

  it("should show inline translation and transliteration if enabled", () => {
    render(
      <QuranWord
        word={mockWord}
        font={QuranFont.MadaniV2}
        quranTextFontScale={3}
        isWordByWordTranslation={true}
        isWordByWordTransliteration={true}
        playAudioOnClick={false}
        isSelected={false}
        isFontLoaded={true}
        onWordClick={vi.fn()}
      />
    );

    // "In the name of" should be rendered twice (once in tooltip, once in inline translation)
    expect(screen.getAllByText("In the name of").length).toBe(2);
    expect(screen.getByText("Bismi")).toBeInTheDocument();
  });

  it("should get highlight class if currentWordLocation matches in store", () => {
    useAudioPlayerStore.setState({ currentWordLocation: "1:1:1" });

    const { container } = render(
      <QuranWord
        word={mockWord}
        font={QuranFont.MadaniV2}
        quranTextFontScale={3}
        isWordByWordTranslation={false}
        isWordByWordTransliteration={false}
        playAudioOnClick={false}
        isSelected={false}
        isFontLoaded={true}
        onWordClick={vi.fn()}
      />
    );

    const wordSpan = container.querySelector("span");
    expect(wordSpan?.className).toContain("highlighted");
  });
});
