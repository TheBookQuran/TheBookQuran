import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fetcher } from './fetcher';

describe('fetcher', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalWindow) {
      global.window = originalWindow;
    } else {
      // @ts-ignore
      delete global.window;
    }
  });

  it('should throw OFFLINE error when window.navigator.onLine is false', async () => {
    // Simulate client-side window with offline navigator
    vi.stubGlobal('window', {
      navigator: {
        onLine: false,
      },
    });

    await expect(fetcher('https://api.example.com')).rejects.toThrow('OFFLINE');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should call fetch and camelize keys of the returned JSON on success', async () => {
    const mockResponseData = {
      user_id: 1,
      user_name: 'John Doe',
      nested_data: {
        some_value: 'test',
      },
    };

    const mockResponse = {
      ok: true,
      json: async () => mockResponseData,
    };

    vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

    const result = await fetcher<any>('https://api.example.com/user');

    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/user', {
      next: { revalidate: 3600 },
    });
    expect(result).toEqual({
      userId: 1,
      userName: 'John Doe',
      nestedData: {
        someValue: 'test',
      },
    });
  });

  it('should merge custom RequestInit parameters correctly', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({}),
    };
    vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

    await fetcher('https://api.example.com/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 },
    });

    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 }, // custom overrides default 3600
    });
  });

  it('should throw the response object if response.ok is false', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
    };

    vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

    await expect(fetcher('https://api.example.com/not-found')).rejects.toEqual(mockResponse);
  });
});
