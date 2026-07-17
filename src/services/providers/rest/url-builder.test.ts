import { describe, it, expect } from 'vitest';
import {
  makeUrl,
  getVersesParams,
  makeVersesUrl,
  makeByRangeVersesUrl,
  makePageVersesUrl,
  makeJuzVersesUrl,
  makeHizbVersesUrl,
  makeRubVersesUrl,
  makeByVerseKeyUrl,
  makeTranslationsUrl,
  makeAvailableRecitersUrl,
  makeReciterUrl,
  makeChapterAudioDataUrl,
  makeAudioTimestampsUrl,
  makeTafsirsUrl,
  makeTafsirContentUrl,
  makePagesLookupUrl,
  makeChapterInfoUrl,
  makeChapterMetadataUrl,
  makeChapterUrl,
  makeNewSearchResultsUrl,
  makeVersesFilterUrl,
} from './url-builder';
import { QuranFont } from '../../../lib/quran-core/fonts/types';

describe('url-builder', () => {
  describe('makeUrl', () => {
    it('should build basic API URL without params', () => {
      expect(makeUrl('/chapters')).toBe('https://api.qurancdn.com/api/qdc/chapters');
    });

    it('should decamelize param keys and format search query', () => {
      const params = {
        userId: 1,
        userLocale: 'ar',
        filterList: ['a', 'b'],
      };
      const url = makeUrl('/test', params);
      expect(url).toBe('https://api.qurancdn.com/api/qdc/test?user_id=1&user_locale=ar&filter_list=a%2Cb');
    });

    it('should filter null and undefined params', () => {
      const params = {
        val1: 'test',
        val2: null,
        val3: undefined,
      };
      const url = makeUrl('/test', params);
      expect(url).toBe('https://api.qurancdn.com/api/qdc/test?val1=test');
    });
  });

  describe('getVersesParams', () => {
    it('should return default parameters with current locale as wordTranslationLanguage', () => {
      const params = getVersesParams('en');
      expect(params.wordTranslationLanguage).toBe('en');
      expect(params.words).toBe(true);
      expect(params.translationFields).toBe('resource_name,language_id');
    });

    it('should remove translation fields if includeTranslationFields is false', () => {
      const params = getVersesParams('en', {}, false);
      expect(params.translationFields).toBeUndefined();
    });

    it('should override defaults with custom parameters', () => {
      const params = getVersesParams('en', { perPage: 20, words: false });
      expect(params.perPage).toBe(20);
      expect(params.words).toBe(false);
    });
  });

  describe('URL Generators', () => {
    const locale = 'en';

    it('makeVersesUrl should build verses by chapter URL', () => {
      expect(makeVersesUrl(1, locale)).toContain('/verses/by_chapter/1');
    });

    it('makeByRangeVersesUrl should build verses by range URL', () => {
      expect(makeByRangeVersesUrl(locale, { range: '1-10' })).toContain('/verses/by_range');
    });

    it('makePageVersesUrl should build verses by page URL', () => {
      expect(makePageVersesUrl(604, locale)).toContain('/verses/by_page/604');
    });

    it('makeJuzVersesUrl should build verses by juz URL', () => {
      expect(makeJuzVersesUrl(1, locale)).toContain('/verses/by_juz/1');
    });

    it('makeHizbVersesUrl should build verses by hizb URL', () => {
      expect(makeHizbVersesUrl(1, locale)).toContain('/verses/by_hizb/1');
    });

    it('makeRubVersesUrl should build verses by rub URL', () => {
      expect(makeRubVersesUrl(1, locale)).toContain('/verses/by_rub_el_hizb/1');
    });

    it('makeByVerseKeyUrl should build verses by key URL', () => {
      expect(makeByVerseKeyUrl('2:255')).toBe('https://api.qurancdn.com/api/qdc/verses/by_key/2:255');
    });

    it('makeTranslationsUrl should build translations list URL', () => {
      expect(makeTranslationsUrl('en')).toBe('https://api.qurancdn.com/api/qdc/resources/translations?language=en');
    });

    it('makeAvailableRecitersUrl should build reciters list URL', () => {
      expect(makeAvailableRecitersUrl('en')).toBe('https://api.qurancdn.com/api/qdc/audio/reciters?locale=en');
    });

    it('makeReciterUrl should build single reciter profile URL', () => {
      expect(makeReciterUrl(1, 'en')).toBe('https://api.qurancdn.com/api/qdc/audio/reciters/1?locale=en&fields=profile_picture%2Ccover_image%2Cbio');
    });

    it('makeChapterAudioDataUrl should build chapter audio URL', () => {
      expect(makeChapterAudioDataUrl(1, 36, true)).toBe('https://api.qurancdn.com/api/qdc/audio/reciters/1/audio_files?chapter=36&segments=true');
    });

    it('makeAudioTimestampsUrl should build audio timestamp URL', () => {
      expect(makeAudioTimestampsUrl(1, '2:255')).toBe('https://api.qurancdn.com/api/qdc/audio/reciters/1/timestamp?verse_key=2%3A255');
    });

    it('makeTafsirsUrl should build tafsirs list URL', () => {
      expect(makeTafsirsUrl('en')).toBe('https://api.qurancdn.com/api/qdc/resources/tafsirs?language=en');
    });

    it('makeTafsirContentUrl should build tafsir content URL', () => {
      const url = makeTafsirContentUrl(16, '2:255', { lang: 'en', quranFont: QuranFont.MadaniV2 });
      expect(url).toContain('/tafsirs/16/by_ayah/2:255');
      expect(url).toContain('locale=en');
      expect(url).toContain('words=true');
      expect(url).toContain('word_fields=verse_key%2Cverse_id%2Cpage_number%2Cline_number%2Clocation%2Ctext_uthmani%2Ctext_imlaei_simple%2Ccode_v2%2Cqpc_uthmani_hafs');
    });

    it('makePagesLookupUrl should build page lookup URL', () => {
      expect(makePagesLookupUrl({ page: 1 })).toBe('https://api.qurancdn.com/api/qdc/pages/lookup?page=1');
    });

    it('makeChapterInfoUrl should build chapter info URL', () => {
      expect(makeChapterInfoUrl(1, 'en')).toBe('https://api.qurancdn.com/api/qdc/chapters/1/info?language=en');
    });

    it('makeChapterMetadataUrl should build chapter metadata URL', () => {
      expect(makeChapterMetadataUrl(1, 'en')).toBe('https://api.qurancdn.com/api/qdc/chapters/1/metadata?language=en');
    });

    it('makeChapterUrl should build chapter URL', () => {
      expect(makeChapterUrl(1, 'en')).toBe('https://api.qurancdn.com/api/qdc/chapters/1?language=en');
    });

    it('makeNewSearchResultsUrl should build search URL', () => {
      expect(makeNewSearchResultsUrl({ query: 'test' })).toBe('https://api.qurancdn.com/api/qdc/search?query=test');
    });

    it('makeVersesFilterUrl should build filter URL', () => {
      expect(makeVersesFilterUrl({ page: 2 })).toBe('https://api.qurancdn.com/api/qdc/verses/filter?page=2');
    });
  });
});
