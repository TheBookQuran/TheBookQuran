## Scope

These guidelines apply unless a task explicitly requires deviating from them. In case of conflict, follow direct user instructions while preserving the overall architecture whenever possible.

---

# Engineering Guidelines for AI Agents

This document defines the architectural principles, performance conventions, and project-specific decisions that govern contributions to this codebase. Treat it as an engineering handbook — every section reflects deliberate design choices.

---

## Change Policy

When modifying this codebase, follow these principles:

- **Prefer extending over replacing.** Work within the existing architecture. Do not introduce new patterns when the current ones can be extended to cover your use case.
- **Make the smallest correct change.** Avoid touching files or abstractions that are unrelated to the task at hand.
- **Avoid unnecessary refactoring.** Structural changes must be justified by a concrete problem, not by stylistic preference.
- **Explain before introducing.** If a change requires a new architectural pattern, document the rationale and get approval before proceeding.
- **Preserve existing documentation.** Keep all comments, docstrings, and inline documentation that are unrelated to your change.

---

## Architecture Principles

### Navigation

- **Decouple navigation from feature state.** Navigation context (target verse, page, highlight) belongs to a dedicated navigation layer, not to the audio player or any other feature store.
- **Model navigation as intent.** Navigation describes *where* the user wants to arrive. Each presentation mode (Mushaf, Translation, etc.) decides *how* to reach and display that destination.
- **Resolve the destination before rendering.** Compute the target page, verse, or index first, then initialize the UI at that location. Never render a default state and then correct it.
- **No timing-based synchronization.** `setTimeout`, arbitrary delays, and retry loops must not coordinate rendering or scrolling. Synchronization is driven by data readiness and lifecycle events.
- **Reusable entry points for every feature.** Search, bookmarks, deep links, notifications, and history all use the same navigation pipeline. Do not implement feature-specific navigation logic.
- **Presentation components do not interpret URLs.** URL parsing and intent resolution belong to the routing/composition layer. UI components receive explicit props or commands.

### State Management

- **Separate domain state from visual state.** Temporary UI effects (highlights, focus, scroll targets, animations) do not belong in business/domain stores unless they represent genuine domain concepts.
- **Single source of truth.** Every piece of domain data lives in exactly one store. If a component needs a value from Store A while also using Store B, subscribe to both stores with individual selectors. Never copy values between stores.

### Architecture-First Problem Solving

When a performance issue appears, first verify that the navigation and data flow are correct. Micro-optimizations must not compensate for architectural problems.

---

## React & Zustand Performance

This project targets 60 fps during audio playback, scrolling, and interaction. The patterns below exist to prevent unnecessary re-renders across deep component trees.

### Store Subscriptions

**Always use selectors — never destructure stores.**

```typescript
// ✗ Causes a full re-render on any store property change
const { isPlaying, currentVerseKey } = useAudioPlayerStore();

// ✓ Component re-renders only when the selected value changes
const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
const currentVerseKey = useAudioPlayerStore((state) => state.currentVerseKey);
```

This applies to every store in the project.

**Push high-frequency subscriptions to leaf components.** State that changes multiple times per second (`elapsed`, `currentWordLocation`, `currentVerseKey` during playback) must not be subscribed to in parent/orchestrator components (`QuranReader`, `ReadingView`, `TranslationView`). These sit at the top of deep render trees — subscribing them to fast-changing state forces the entire subtree to re-render.

**Avoid prop-drilling store values.** If a store value needs to reach a deeply nested component, the nested component subscribes directly rather than receiving the value through 3+ layers of props.

### Side Effects Without Re-renders

When reacting to store changes for side effects (scrolling, logging, analytics) that do not affect rendered output, use `store.subscribe()` inside a `useEffect` instead of a selector:

```typescript
// ✗ Re-renders the component just to trigger a side effect
const currentVerseKey = useAudioPlayerStore((state) => state.currentVerseKey);
useEffect(() => { scrollToVerse(currentVerseKey); }, [currentVerseKey]);

// ✓ Triggers the side effect without re-rendering
useEffect(() => {
  return useAudioPlayerStore.subscribe((state) => {
    if (state.isPlaying && state.currentVerseKey) {
      scrollToVerse(state.currentVerseKey);
    }
  });
}, []);
```

### Memoization

- **Components rendered in loops** (`.map()` over verses, words, lines) must be wrapped in `React.memo` with an appropriate comparator.
- **Callbacks passed to memoized children** must be wrapped in `useCallback` with stable dependencies. An unstable function reference defeats `React.memo`.

```typescript
const handleWordClick = React.useCallback((word: Word) => {
  setSelectedWordLocation(word.location, word.text, word.audioUrl);
}, [setSelectedWordLocation]);
```

### React Best Practices

- **Cleanup DOM listeners.** Every event listener attached inside a `useEffect` must be removed in the cleanup return function.

  ```typescript
  useEffect(() => {
    const handleScroll = () => { /* ... */ };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  ```

- **Abort network requests on dependency changes.** Custom data-fetching side effects that trigger on reactive prop/state changes must pass an `AbortSignal` to `fetch`.

  ```typescript
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/reciter/${reciterId}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => setData(data));
    return () => controller.abort();
  }, [reciterId]);
  ```

- **Guard ref access.** Refs may be `null` during hydration, SSR, or before mount. Always check before calling imperative methods.

  ```typescript
  if (audioRef.current) {
    audioRef.current.play();
  }
  ```

- **Defer non-urgent heavy renders.** Use `startTransition` or `useDeferredValue` for updates that require heavy rendering (filtering long lists, parsing settings, text scaling) to keep user interaction responsive.

- **Do not duplicate derived state.** Calculate derived values during render or memoize them. Do not copy values from state/props into local state unless staging user input.

- **Keep render functions fast.** Heavy array transformations (filtering, sorting, mapping) belong in `useMemo` or store selectors, not inline in JSX.

---

## Profiling & Measurement

Do not apply complex optimization patterns preemptively. Before optimizing:

1. Profile in the browser using **React DevTools Profiler** or the **Performance timeline**.
2. Identify the actual bottleneck.
3. Apply the narrowest fix that addresses it.

After modifying any component that touches stores or renders inside loops, run `npm run build` to verify TypeScript correctness. If store subscription patterns changed, verify with the Profiler that only the intended components re-render.

---

## Project Decisions

### Server-Side Cookie Policy

To preserve static prerendering (SSG/ISR), do not read minor user settings (reciter, translations, font scale, word-by-word display) from cookies in Server Components. Calling `cookies()` opts the route out of static rendering.

**Permitted exceptions:** Server-side cookie reading is required for **Theme** and **Reading Preference** (Reading vs. Translation mode). These prevent layout shifts and flashes on page load.

**Golden Rule (القاعدة الذهبية):** Do not sacrifice a core user experience for a performance gain the user cannot perceive. UX takes priority.

**Hydration strategy:**
- Minor preferences resolve client-side from Zustand persisted stores on mount.
- Permitted server-side preferences (e.g., Reading Mode) are passed to client components as `initialReadingPreference` and resolved using a hydration-safe `mounted` state check.

---

## Shared Utilities & Preferred Helpers

Use the project's shared helpers and hooks instead of writing inline equivalents. Duplication causes drift, inconsistency, and bloat.

| Task | Preferred API | Location |
|------|---------------|----------|
| Parse verse key `"2:255"` | `getChapterNumberFromKey`, `getVerseNumberFromKey`, `getVerseAndChapterNumbersFromKey` | `@/lib/quran-core/verse/verse-utils` |
| Build verse URL | `getVerseUrl(verseKey)` | `@/lib/quran-core/verse/verse-utils` |
| Format surah calligraphy code | `getSurahCalligraphyCode(id)` | `@/lib/quran-core/chapter/chapter-utils` |
| Check bismillah pre | `hasBismillahPre(chapterId)` | `@/lib/quran-core/chapter/chapter-utils` |
| Get word audio URL | `getWordAudioUrl(location)` | `@/lib/quran-core/chapter/chapter-utils` |
| Debounce a value | `useDebounce(value, delay)` | `@/hooks/use-debounce` |
| Toggle locale | `useToggleLocale()` | `@/hooks/use-toggle-locale` |
| Decode HTML entities | `decodeHtmlEntities(text)` | `@/lib/textUtils` |
| Sort verse keys | `sortByVerseKey` | `@/lib/quran-core/verse/verse-utils` |
| Buckwalter → Arabic (scripts) | `buckwalterToArabic` | `./lib/buckwalter.mjs` |

---

## Reference: Store Properties

The following table documents the current update frequency of store properties. Use it to decide which components may safely subscribe to a given property.

| Store | High-frequency (changes often) | Low-frequency (changes rarely) |
|-------|-------------------------------|-------------------------------|
| `useAudioPlayerStore` | `elapsed`, `currentWordLocation`, `currentVerseKey`, `isPlaying` | `playbackRate`, `volume`, `repeatSettings` |
| `useSettingsStore` | — | `selectedReciter`, `selectedTranslations`, `wordByWordDisplay` |
| `useVerseTrackerStore` | `activeVerseKey`, `progress` | `activeJuz`, `activeHizb`, `activePage` |
| `useQuranReaderStore` | `loadedFonts` (during font loading) | `quranFont`, `mushafLines`, `readingPreference`, font scales |
| `useUIStore` | `selectedWordLocation` | `isSettingsDrawerOpen`, `isSearchDrawerOpen` |
| `useThemeStore` | — | `theme`, `resolvedTheme` |

Only leaf components should subscribe to high-frequency properties.

### Current Implementation Examples

These examples document how the architecture is applied today. They are reference points, not permanent fixtures.

- `QuranWord` subscribes to `currentWordLocation` internally to determine its own highlight state.
- `PageLine` subscribes to `currentVerseKey` internally to determine its own active-line background.
- `AudioProgressBar` subscribes to `elapsed` internally to animate the progress bar.
- `ReadingView` uses `useAudioPlayerStore.subscribe()` inside `useEffect` for auto-scroll (zero re-renders).
- **Reciter ID** lives only in `useSettingsStore.selectedReciter`; the audio player reads it from there.
- **Resolved theme** lives only in `useThemeStore.resolvedTheme`; consumers read via the `useResolvedTheme()` hook.
- Memoized loop components: `QuranWord` (custom comparator), `PageLine`, `TranslationVerse`.

---

## Verification Checklist

Before submitting any code change, verify:

- [ ] Zustand stores are accessed via selectors, never destructured
- [ ] High-frequency state is subscribed only in leaf components
- [ ] Side-effect-only reactions use `store.subscribe()`
- [ ] Components rendered in loops are wrapped in `React.memo`
- [ ] Callbacks passed to memoized children use `useCallback`
- [ ] No store values are drilled through 3+ component layers
- [ ] `npm run build` passes cleanly
- [ ] DOM/window listeners in `useEffect` return a cleanup function
- [ ] Network requests on reactive dependencies use `AbortController`
- [ ] Ref access (`.current`) is guarded with null checks
- [ ] Heavy non-urgent renders use `startTransition` or `useDeferredValue`
- [ ] No duplicated derived state
- [ ] Expensive computations are memoized or in selectors
- [ ] Project shared utilities are used instead of inline equivalents
- [ ] No data is duplicated across stores
- [ ] Server-side cookie reading is limited to critical layout attributes
