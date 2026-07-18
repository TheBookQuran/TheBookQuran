# TheBookQuran — Quran · القرآن الكريم

Quran is an open-source knowledge platform, designed to help readers engage more deeply with the Quran by combining the Mushaf, translations, recitation, and linguistic resources into a single knowledge platform. Built with Next.js, React, and Zustand.

**Live:** [TheBookQuran.vercel.app](https://thebookquran.vercel.app)

> **Status:** First Public Release (MVP)

This is the first public release of Quran, focused on delivering the core reading and language exploration experience. Future releases will expand the platform with additional study tools, learning features, and mobile applications.

## Features

- **Mushaf Reading View** — pixel-accurate page layouts that match the physical Mushaf.
- **Translation View** — multi-language translations with word-by-word display.
- **Audio Recitation** — synchronized playback with word-level highlighting across 100+ reciters.
- **Linguistic Root Analysis** — explore word roots using classical dictionaries (Maqayis al-Lugha, Lane's Lexicon).
- **Full-Text Search** — search across the entire Quran.
- **Bookmarks & Journal** — save notes, bookmarks, and reading history.
- **Offline Support** — installable PWA with service worker caching.
- **Internationalization** — Arabic and English interfaces with full RTL support.
- **Theming** — light, dark, and system-preference themes.
- **Keyboard & Accessibility** — WCAG AA contrast, full text resizing, semantic HTML.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | [React 19](https://react.dev), [Radix UI](https://radix-ui.com) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| State | [Zustand 5](https://zustand.docs.pmnd.rs) |
| Data Fetching | [TanStack React Query 5](https://tanstack.com/query) |
| i18n | [next-intl](https://next-intl.dev) |
| Virtualization | [react-virtuoso](https://virtuoso.dev) |
| PWA | [Serwist](https://serwist.pages.dev) |
| Testing | [Vitest](https://vitest.dev), [Playwright](https://playwright.dev), [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) 9+

### Install & Run

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
pnpm build
pnpm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:ui` | Run unit tests with the Vitest UI |
| `pnpm test:coverage` | Run unit tests with coverage |
| `pnpm test:e2e` | Run end-to-end tests (Playwright) |
| `pnpm test:e2e:ui` | Run Playwright tests with the UI |
| `pnpm test:lighthouse` | Run Lighthouse CI audits |

## Contributing

Contributions are welcome. Before making changes, please read [AGENTS.md](AGENTS.md) for the project's architecture principles and coding conventions.

## Project

Quran is an independent, non-profit project built to provide free access to the Quran and its linguistic resources. The project is developed openly and aims to welcome future community contributions in development, translation, content improvement, and data review.

## Linguistic Data

The linguistic features are built upon classical sources such as Lane's Lexicon and Maqayis al-Lughah. Quran includes a custom data-processing pipeline that extracts, structures, and enriches these resources for an interactive reading experience.

## Acknowledgements

This project gratefully acknowledges the open resources that made it possible, including:

- Quran Foundation (Quran text, recitations, translations, and APIs)
- King Fahd Glorious Quran Printing Complex (Mushaf fonts and data)
- Quranic Arabic Corpus (Linguistic annotations, roots, and morphology)
- Kalimat Search API (Quranic search engine and semantic search)