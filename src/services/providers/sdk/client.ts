import { createServerClient } from "@quranjs/api/server";

export const quranClient = createServerClient({
  clientId: process.env.QURAN_CLIENT_ID!,
  clientSecret: process.env.QURAN_CLIENT_SECRET!,
  services: {
    tokenHost: process.env.QURAN_ENDPOINT,
    oauth2BaseUrl: process.env.QURAN_ENDPOINT,
  },
});
