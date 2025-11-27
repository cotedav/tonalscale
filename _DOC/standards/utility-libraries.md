# Utility library usage (Lodash, VueUse, Luxon)

These guidelines keep helper imports predictable and bundle size-friendly.

## Shared principles

- Prefer native browser/TypeScript APIs first; only reach for utilities when they simplify non-trivial logic.
- Use module-scoped imports (e.g., `lodash/chunk`, `@vueuse/core`) instead of namespace imports to keep tree shaking effective.
- Keep utilities free of product/business context so they can be reused across views, stores, and composables.
- Co-locate usage examples inside `src/utils/` or `src/composables/` to encourage consistent patterns.

## Lodash

- Import individual helpers from their direct paths: `import chunk from 'lodash/chunk';`.
- Avoid `import _ from 'lodash'` or deep-chaining patterns that prevent shaking unused code.
- Use Lodash for well-tested collection transforms, debouncing, or memoization when native code would be verbose.

## VueUse

- Import composables from `@vueuse/core`; most functions are already tree-shakeable with Vite.
- Prefer composables over manual event/interval wiring for readability and cleanup (e.g., `useIntervalFn`, `useBreakpoints`).
- Keep composables small and documented so they can be safely shared across features.

## Luxon

- Import only the needed exports (commonly `DateTime`).
- Normalize inputs to ISO strings or `Date` objects and prefer UTC for logging/telemetry.
- Set locales explicitly when rendering user-facing strings to avoid implicit browser defaults.
