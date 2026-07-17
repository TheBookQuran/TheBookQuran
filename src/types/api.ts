import { Chapter, Verse } from "./quran";

export interface BaseResponse {
  status?: number;
  error?: string;
}

export interface Pagination {
  perPage: number;
  currentPage: number;
  nextPage: number | null;
  totalRecords: number;
  totalPages: number;
}

export interface LookupRecord {
  from: string;
  to: string;
}

export interface LookupRange {
  from: string;
  to: string;
}

export interface PagesLookUpResponse extends BaseResponse {
  lookupRange: LookupRange;
  pages: Record<string, LookupRecord>;
  totalPage?: number;
}

export interface VersesResponse extends BaseResponse {
  pagination: Pagination;
  verses: Verse[];
  pagesLookup?: PagesLookUpResponse;
}

export interface ChaptersResponse extends BaseResponse {
  chapters: Chapter[];
}

export interface ChapterResponse extends BaseResponse {
  chapter: Chapter;
}

export interface AudioData {
  id: number;
  chapterId: number;
  fileSize: number;
  format: string;
  audioUrl: string;
  duration: number;
}

export interface AudioDataResponse extends BaseResponse {
  audioFiles: AudioData[];
}

export interface VerseTiming {
  verseKey: string;
  timestampFrom: number;
  timestampTo: number;
  duration: number;
  segments?: number[][];
}
