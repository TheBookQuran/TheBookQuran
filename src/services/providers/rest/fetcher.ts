import { camelizeKeys } from "../../../lib/case-utils";

const OFFLINE_ERROR = "OFFLINE";

export async function fetcher<T>(
  input: string,
  init: RequestInit = {}
): Promise<T> {
  if (typeof window !== "undefined" && !window.navigator.onLine) {
    throw new Error(OFFLINE_ERROR);
  }
  const response = await fetch(input, {
    ...init,
    next: { revalidate: 3600, ...init.next } // Cache for 1 hour by default in Next.js
  });
  if (!response.ok) {
    throw response;
  }
  const json = await response.json();
  return camelizeKeys(json) as T;
}
