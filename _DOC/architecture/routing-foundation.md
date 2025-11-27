# Routing foundation

This scaffold ships with Vue Router configured for history mode and lazy-loaded views so new routes can be added without refactoring the shell.

## How routing is structured

- The router is created in `src/router/index.ts` via the `createAppRouter` factory. The default export is used in `src/main.ts`.
- Routes live in a `routes` array that nests child routes under a layout shell view (`AppShellView`). Add more child routes there to share the shell.
- History mode uses `createWebHistory(import.meta.env.BASE_URL)` to stay compatible with the PWA and Vite base settings.
- A catch-all `not-found` route points to `src/views/system/NotFoundView.vue` so undefined paths render a safe fallback.

## Adding routes

1. Open `src/router/index.ts` and append a new entry to the `routes` array (usually as a child of the root `/` route).
2. Use lazy-loaded components: `component: () => import('@/views/MyFeature/MyFeatureView.vue')`.
3. Keep view directories in kebab-case and components in PascalCase.
4. If a route needs its own layout, add another parent record with its own `children` instead of deeply nesting.

## Navigation guards

Guards are registered in `src/router/navigationGuards.ts` and currently log navigation in dev mode. To extend:

- Add checks to the `beforeEach` guard (e.g., auth, feature flags) and call `next()` when navigation should continue.
- Use the `afterEach` guard for analytics, page titles, or loading indicators.
- Keep guard logic lean; delegate complex checks to services or composables to avoid bloating the router file.
