# Tonal Scale

A Vite-powered Vue 3 + TypeScript scaffold configured for building the Tonal Scale progressive web app. The project includes Vuetify, Pinia, Vue Router, Vee-Validate, Vue I18n, VueUse, Lodash, and Luxon out of the box.

## Table of Contents

1. [Getting started](#getting-started)
1. [Scripts](#scripts)
1. [Linting](#linting)
1. [Formatting](#formatting)
1. [Testing](#testing)
1. [Continuous integration](#continuous-integration)
1. [Tech stack](#tech-stack)
1. [Progressive web app (PWA) setup](#progressive-web-app-pwa-setup)
1. [Form validation](#form-validation-with-vee-validate--yup)
1. [Localization](#localization-with-vue-i18n)
1. [State management](#state-management-with-pinia)
1. [Environment variables](#environment-variables)
1. [Module resolution and aliases](#module-resolution-and-aliases)
1. [Documentation](#documentation)

---

## Getting started

```bash
npm install
npm run watch
```

## Scripts

- `npm run watch` – start the local development server
- `npm run build` – produce a production build
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint and Stylelint checks across scripts and styles
- `npm run lint:fix` – apply autofixes for both ESLint and Stylelint
- `npm run type-check` – run `vue-tsc` with `--noEmit` to verify component and script typings
- `npm run test` – execute Vitest unit tests once
- `npm run test:watch` – run Vitest in watch mode for rapid feedback
- `npm run test:coverage` – generate coverage reports using v8 provider
- `npm run test:ci` – run Vitest once using a dot reporter for compact CI output
- `npm run cypress:install` – download/verify the Cypress binary locally if it is missing
- `npm run cypress:open` – install the binary if needed, then launch Cypress in interactive mode after auto-starting the Vite dev server
- `npm run cypress:run` – ensure the Cypress binary exists, then run headlessly after auto-starting the Vite dev server
- `npm run format` – format source, config, and documentation files with Prettier
- `npm run format:check` – verify Prettier formatting without writing changes
- `npm run check` – sequentially run linting, type-checking, and CI-friendly unit tests
- `npm run ci` – run linting, type-checking, CI-friendly unit tests, and build production assets (mirrors the CI workflow)

## Linting

The project uses Airbnb-flavored ESLint with Vue 3 + TypeScript support and Prettier compatibility, plus Stylelint for SCSS and
Vue single-file components.

```bash
# Check code quality
npm run lint

# Automatically fix what can be resolved safely
npm run lint:fix
```

## Formatting

Prettier enforces consistent formatting across TypeScript, Vue SFCs, styles, JSON, and documentation. Ignore rules are defined in `.prettierignore` to skip build artifacts.

```bash
# Format all supported files in the repository
npm run format

# Check formatting without making changes
npm run format:check
```

Git commit hooks use Husky and lint-staged to auto-format staged changes. Hooks install automatically after `npm install` (via the `prepare` script). Temporarily bypass a hook run with:

```bash
HUSKY=0 git commit -m "your message"
```

Re-enable hooks by unsetting `HUSKY` or running `npm run prepare` to reinstall Husky if needed.

## Testing

Vitest is configured with a jsdom environment, Vue Test Utils, and Vuetify auto-imports for component rendering. Global setup in `src/tests/setup.ts` registers Vuetify plugins so Vue components can mount without additional boilerplate.

```bash
# Run the full unit test suite once
npm run test

# Start Vitest in watch mode
npm run test:watch

# Produce coverage artifacts in coverage/unit
npm run test:coverage
```

Import application modules using the `@/` alias inside tests (e.g., `@/views/HomeView.vue`).

### End-to-end testing with Cypress

Cypress is configured for both E2E and component testing using Vite + Vue bundling. Specs live under `cypress/e2e` and use
`data-cy` selectors for stability (see `cypress/e2e/smoke.cy.ts` for a shell check of the home view). Component tests mount
Vue files with Vuetify already registered via `cypress/support/component.ts`.

```bash
# Run headless E2E specs with an auto-started dev server on :5173
npm run cypress:run

# For interactive authoring with an auto-started dev server on :5173
npm run cypress:open
```

If you see an error about a missing Cypress binary, run `npm run cypress:install` (already invoked by the scripts above) to
download or repair the local cache before launching the test runner.

The Cypress TypeScript config (`tsconfig.cypress.json`) mirrors application path aliases so specs can import using `@/` when
needed.

## Continuous integration

GitHub Actions runs the core checks in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) on pushes to `main` and all pull requests. The workflow:

1. Caches npm dependencies via `actions/setup-node` with `cache: npm` for faster installs.
2. Installs dependencies with `npm ci`.
3. Executes `npm run lint`, `npm run type-check`, `npm run test:ci`, and `npm run build`.

### Local + CI alignment

- Use `npm run check` locally to mirror the CI quality gates without performing a production build.
- Use `npm run ci` locally if you want to replicate the full CI sequence including the production build.
- Cypress remains opt-in for CI to keep the stub lightweight; trigger `npm run cypress:run` locally when working on E2E specs.

## Tech stack

- Vite + Vue 3 + TypeScript
- Vuetify 3
- Pinia, Vue Router, Vue I18n
- Vee-Validate + Yup
- VueUse utilities, Lodash helpers, Luxon date handling
- PWA-ready Vite configuration

## Progressive web app (PWA) setup

- The Vite PWA plugin is enabled in [`vite.config.ts`](./vite.config.ts) with `autoUpdate` service worker
  registration. Static assets (favicons, robots.txt, placeholder icons) are bundled from `public/`.
- Web app manifest values (name, theme color, start URL, orientation, etc.) and icons live in the same
  config under `manifest`. Replace the placeholder SVG in [`public/pwa-icon.svg`](./public/pwa-icon.svg) with
  production-ready artwork. If marketplaces require PNGs, derive square and maskable variants from the SVG
  before submission.
- Service worker registration happens during app bootstrap via [`src/plugins/pwa.ts`](./src/plugins/pwa.ts)
  (invoked in `src/main.ts`). Update hooks such as `onNeedRefresh` currently log messages and should be wired
  to a user-facing toast/dialog when UX requirements arrive.
- Caching stays minimal by default (Workbox runtime caching is intentionally empty). Add explicit strategies
  in `vite.config.ts` once data-handling policies are defined; avoid caching sensitive endpoints.

## Form validation with Vee-Validate + Yup

- Global Vee-Validate settings live in `src/plugins/validation.ts` and run during app bootstrap (`src/main.ts`).
- Define schemas with Yup and wrap them with the shared helper:

  ```ts
  import { object, string } from 'yup';
  import { buildValidationSchema } from '@/utils/validation';

  const validationSchema = buildValidationSchema(
    object({
      fullName: string().required('This field is required.'),
      email: string().required('This field is required.').email('Enter a valid email.'),
    }),
  );
  ```

- Convert Vee-Validate error strings into Vuetify-friendly arrays with `toErrorMessages`:

  ```vue
  <v-text-field :error-messages="toErrorMessages(errorMessage)" />
  ```

- See `src/components/forms/ValidationSampleForm.vue` for a full example that wires the schema into `useForm`, uses data-cy
  selectors for testing, and surfaces translated copy through Vue I18n.

## Localization with Vue I18n

- Vue I18n is initialized in `src/plugins/i18n.ts` with the default locale set to English (`en`) and fallbacks enabled. Supported
  locales and TypeScript-safe keys live in `src/locales`, with sample dictionaries for English and French.
- Locale messages are organized by namespace (e.g., `home.localization`, `i18n.switcher`). A `localeLoaders` map in `src/locales/index.ts`
  enables lazy loading for future locales via dynamic imports while keeping the default bundle eager for `en`/`fr`.
- `useLocale` (`src/composables/useLocale.ts`) exposes `currentLocale`, `availableLocales`, and `switchLocale` helpers. Switching a locale
  loads messages on demand and persists the choice with `localStorage` using the `pp_locale` key.
- `LocaleSwitcher` (`src/components/i18n/LocaleSwitcher.vue`) demonstrates reading translated strings and updating the active locale in the
  Home view.
- To add a locale:
  1. Create a new locale file in `src/locales` and add it to the `messages` export.
  2. Register a dynamic import in `localeLoaders` so `switchLocale` can lazy-load it.
  3. Define translations for all existing keys (`en` and `fr` must be updated together).
  4. If testing with Vitest, mount components normally; the global test setup already installs the I18n plugin. For locale persistence logic,
     pass stubbed storage objects to `switchLocale` or `setLocale` in unit tests.

## State management with Pinia

- Pinia is registered globally from `src/plugins/pinia.ts` in `src/main.ts`, keeping the app entry light while enabling Vue Devtools integration.
- Stores live under `src/stores` and should follow the `useXStore` naming convention with descriptive, non-domain-specific namespaces (e.g., `useAppStore`).
- Prefer TypeScript-first options stores to make state, getters, and actions explicit. Use discriminated unions or literal types for constrained values when possible.
- Enable hot module replacement by wrapping stores with `acceptHMRUpdate` when using Vite:

  ```ts
  if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot));
  }
  ```

- When testing stores, activate an isolated Pinia instance per spec to avoid shared state:

  ```ts
  import { createPinia, setActivePinia } from 'pinia';

  beforeEach(() => {
    setActivePinia(createPinia());
  });
  ```

- Import stores via the `@/` alias (e.g., `@/stores/app`) so refactors remain path-stable.

## Environment variables

- Copy `.env.example` to `.env` (or `.env.local`) and set values for your environment. Only variables prefixed with `VITE_` are exposed to the client bundle.
- `VITE_APP_BASE_PATH` controls the deployed base path for assets and routing. If unset, the project defaults to `/`.
- `VITE_API_BASE_URL` illustrates how to document app-specific endpoints without committing secrets.

## Module resolution and aliases

- Path aliases are configured for both TypeScript and Vite. Import application code using the `@/` prefix (e.g., `@/router` or `@/styles/main.scss`) instead of long relative paths.

## Documentation

Additional reference documents live under `_DOC`, organized by focus area:

- Architecture: [Routing Foundation](./_DOC/architecture/routing-foundation.md) – routing structure and navigation guards.
- Guides: [AGENTS.md Playbook](./_DOC/guides/agents-md-playbook.md) – instruction design best practices for maintaining repo guardrails.
- Standards: [I18n Key Naming Standard](./_DOC/standards/i18n-key-naming-standard.md) – localization key conventions.

Consult these for deeper architectural or product context beyond this README.
