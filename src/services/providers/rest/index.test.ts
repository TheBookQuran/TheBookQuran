import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RestProvider } from './index';
import { fetcher } from './fetcher';
import { QuranFont } from '../../../lib/quran-core/fonts/types';

vi.mock('./fetcher', () => ({
  fetcher: vi.fn(),
}));

describe('RestProvider', () => {
  let provider: RestProvider;

  beforeEach(() => {
    provider = new RestProvider();
    vi.clearAllMocks();
  });

  it('getChapters should fetch from chapters path', async () => {
    vi.mocked(fetcher).mockResolvedValue({ chapters: [] });
    await provider.getChapters('ar');
    expect(fetcher).toHaveBeenCalledWith(
      'https://api.qurancdn.com/api/qdc/chapters/?language=ar'
    );
  });

  it('getChapter should fetch single chapter path', async () => {
    vi.mocked(fetcher).mockResolvedValue({ chapter: {} });
    await provider.getChapter(1, 'ar');
    expect(fetcher).toHaveBeenCalledWith(
      'https://api.qurancdn.com/api/qdc/chapters/1?language=ar'
    );
  });

  it('getChapterInfo should fetch chapter info path with options', async () => {
    vi.mocked(fetcher).mockResolvedValue({ info: {} });
    await provider.getChapterInfo(1, 'en', { resourceId: 2, includeResources: true });
    expect(fetcher).toHaveBeenCalledWith(
      'https://api.qurancdn.com/api/qdc/chapters/1/info?language=en&resource_id=2&include_resources=true'
    );
  });

  it('getChapterVerses should fetch chapter verses with parameters', async () => {
    vi.mocked(fetcher).mockResolvedValue({ verses: [] });
    await provider.getChapterVerses(1, 'en', { perPage: 10 });
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('/verses/by_chapter/1')
    );
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('word_translation_language=en')
    );
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('per_page=10')
    );
  });

  it('getChapterAudioData should fetch reciter audio files and map them', async () => {
    const mockAudioResponse = {
      audioFiles: [
        {
          id: 100,
          chapterId: 36,
          fileSize: 5000,
          format: 'mp3',
          audioUrl: 'audio-url',
          timestamps: [1, 2, 3],
        },
      ],
    };
    vi.mocked(fetcher).mockResolvedValue(mockAudioResponse);

    const result = await provider.getChapterAudioData(4, 36, true);

    expect(fetcher).toHaveBeenCalledWith(
      'https://api.qurancdn.com/api/qdc/audio/reciters/4/audio_files?chapter=36&segments=true'
    );
    expect(result).toEqual({
      id: 100,
      chapterId: 36,
      fileSize: 5000,
      format: 'mp3',
      audioUrl: 'audio-url',
      duration: 0,
      verseTimings: [1, 2, 3],
      reciterId: 4,
    });
  });

  it('getChapterAudioData should throw an error if no audio files are returned', async () => {
    vi.mocked(fetcher).mockResolvedValue({ audioFiles: [] });
    await expect(provider.getChapterAudioData(4, 36)).rejects.toThrow('No audio file found');
  });

  it('getTafsirContent should fetch tafsir content by ayah', async () => {
    vi.mocked(fetcher).mockResolvedValue({ tafsir: {} });
    await provider.getTafsirContent(16, '2:255', QuranFont.MadaniV2, '15-lines' as any, 'en');
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('/tafsirs/16/by_ayah/2:255')
    );
  });

  it('getNewSearchResults should fetch and map pagination', async () => {
    const mockSearchResponse = {
      pagination: { currentPage: 1 },
      result: { query: 'test' },
    };
    vi.mocked(fetcher).mockResolvedValue(mockSearchResponse);

    const result = await provider.getNewSearchResults({ query: 'test' });
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('/search?query=test')
    );
    expect(result.result.pagination).toEqual({ currentPage: 1 });
  });
});
