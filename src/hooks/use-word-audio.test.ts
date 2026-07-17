import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useWordAudio } from "./use-word-audio";
import { getWordAudioUrl } from "@/lib/quran-core/chapter/chapter-utils";

vi.mock("@/lib/quran-core/chapter/chapter-utils", () => ({
  getWordAudioUrl: vi.fn().mockReturnValue("https://example.com/word-audio.mp3"),
}));

describe("useWordAudio hook", () => {
  let mockPlay: any;
  let mockPause: any;

  beforeEach(() => {
    mockPlay = vi.fn().mockResolvedValue(undefined);
    mockPause = vi.fn();
    
    // Mock Audio using a regular function (not arrow function) so it can be instantiated as constructor
    const mockAudioConstructor = vi.fn().mockImplementation(function (this: any) {
      this.play = mockPlay;
      this.pause = mockPause;
      return this;
    });

    vi.stubGlobal("Audio", mockAudioConstructor);

    // Clean global state
    delete (window as any).wordByWordAudioPlayerEl;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should do nothing if wordLocation is null", () => {
    const { result } = renderHook(() => useWordAudio(null));
    result.current.playAudio();
    expect(window.Audio).not.toHaveBeenCalled();
  });

  it("should create new Audio and call play", () => {
    const { result } = renderHook(() => useWordAudio("1:1:1"));
    result.current.playAudio();

    expect(getWordAudioUrl).toHaveBeenCalledWith("1:1:1");
    expect(window.Audio).toHaveBeenCalledWith("https://example.com/word-audio.mp3");
    expect(mockPlay).toHaveBeenCalled();
    expect((window as any).wordByWordAudioPlayerEl).toBeDefined();
  });

  it("should stop previously playing word audio if it exists", () => {
    const { result: hook1 } = renderHook(() => useWordAudio("1:1:1"));
    hook1.current.playAudio();

    const firstAudioEl = (window as any).wordByWordAudioPlayerEl;
    expect(firstAudioEl).toBeDefined();

    const { result: hook2 } = renderHook(() => useWordAudio("1:1:2"));
    hook2.current.playAudio();

    // The first audio element should have been paused
    expect(mockPause).toHaveBeenCalled();
    // The second audio element is now the global player
    expect((window as any).wordByWordAudioPlayerEl).not.toBe(firstAudioEl);
  });
});
