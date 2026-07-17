# TheBookQuran — Quran · القرآن الكريم

Quran is a knowledge platform designed to help users explore the Quran through its language, combining Mushaf reading, translations, audio, and linguistic tools such as roots and classical dictionaries. Built with Next.js, React, and Zustand.

**Live:** [TheBookQuran.vercel.app](https://thebookquran.vercel.app)

## Vision

Quran aims to make the Quran's original language more accessible by connecting readers with linguistic resources, classical dictionaries, translations, and study tools.

The project focuses on direct engagement with the Quranic text and language.

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

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & layouts
│   └── [locale]/         # Locale-scoped routes (en, ar)
│       ├── [chapterId]/  # Surah reader
│       ├── juz/          # Juz navigation
│       ├── hizb/         # Hizb navigation
│       ├── page/         # Page-based navigation
│       ├── search/       # Search page
│       ├── reciters/     # Reciters catalog
│       ├── roots/        # Linguistic root explorer
│       └── my-quran/     # Bookmarks & journal
├── components/           # React components by feature
│   ├── quran-reader/     # Mushaf & translation views
│   ├── audio-player/     # Audio playback & controls
│   ├── search/           # Search overlay
│   ├── linguistics/      # Root analysis UI
│   └── ui/               # Shared design-system primitives
├── stores/               # Zustand stores
├── hooks/                # Custom React hooks
├── lib/                  # Core utilities & business logic
│   ├── quran-core/       # Verse, chapter, and page utilities
│   ├── linguistics/      # Arabic text normalization
│   ├── navigation/       # Navigation intent resolution
│   └── server/           # Server-only utilities
├── i18n/                 # Internationalization config & messages
├── services/             # API service layer
├── styles/               # Global CSS
└── types/                # TypeScript type definitions

scripts/                  # Data-processing & generation scripts
data/                     # Static data (chapter info, morphology, mappings)
```

## Contributing

Contributions are welcome. Before making changes, please read [AGENTS.md](AGENTS.md) for the project's architecture principles and coding conventions.

## License

This project is open source. See the repository for license details.
