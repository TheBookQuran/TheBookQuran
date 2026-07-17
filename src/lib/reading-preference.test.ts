import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getReadingPreference } from './reading-preference';
import { ReadingPreference } from '@/types/settings';

// Mock next/headers cookies
const mockGet = vi.fn();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: mockGet,
  }),
}));

describe('reading-preference', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return Reading if cookie value is "reading"', async () => {
    mockGet.mockReturnValue({ value: 'reading' });
    const result = await getReadingPreference();
    expect(result).toBe(ReadingPreference.Reading);
    expect(mockGet).toHaveBeenCalledWith('reading-pref');
  });

  it('should return ReadingTranslation if cookie value is "readingTranslation"', async () => {
    mockGet.mockReturnValue({ value: 'readingTranslation' });
    const result = await getReadingPreference();
    expect(result).toBe(ReadingPreference.ReadingTranslation);
    expect(mockGet).toHaveBeenCalledWith('reading-pref');
  });

  it('should return Translation (default) if cookie value is "translation"', async () => {
    mockGet.mockReturnValue({ value: 'translation' });
    const result = await getReadingPreference();
    expect(result).toBe(ReadingPreference.Translation);
    expect(mockGet).toHaveBeenCalledWith('reading-pref');
  });

  it('should return Translation (default) if cookie is missing or has unknown value', async () => {
    mockGet.mockReturnValue(undefined);
    expect(await getReadingPreference()).toBe(ReadingPreference.Translation);

    mockGet.mockReturnValue({ value: 'invalid_value' });
    expect(await getReadingPreference()).toBe(ReadingPreference.Translation);
  });
});
