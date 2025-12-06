# AGENTS.md

## Purpose & scope

- This file is the root instructionset for AI coding agents working in this repository. Subdirectories may add tighter rules with their own `AGENTS.md` files (nearest file wins).
- Follow these rules for all changes unless a closer `AGENTS.md` overrides them.

## Project overview

- Vue 3 + TypeScript single-page PWA scaffold built with Vite, Tailwind CSS, and Headless UI. Supporting libraries include Pinia, Vue Router, Vue I18n, Vee-Validate (+Yup), VueUse, Lodash, and Luxon.
- Testing stack: Vitest + Vue Test Utils (jsdom) for unit tests; Cypress for E2E/component tests. Linting via ESLint (Airbnb + Prettier) and Stylelint (SCSS + Vue SFCs).
- PWA support uses `vite-plugin-pwa` with auto-update service worker and manifest placeholders. Main app shell lives in `src/App.vue`; routing in `src/router`; global styling in `src/styles`.
- Business north star: Segic Plan Member Portal should become a holistic, multilingual, wellness-aware companion for plan members and a communication/automation engine for clients (insurers, brokers, unions). Keep code flexible for health, claims, marketplace, and guidance features.

## Repository layout

- `src/` – App source (router, plugins, styles, utilities, views). Use `@/` path alias for imports.
- `public/` – Static assets (PWA icons/manifests).
- `cypress/` – Cypress configs, fixtures, support, and specs.
- `_BACKLOG/` – User stories and acceptance criteria. Read referenced files before implementing a story; update statuses in `_BACKLOG/backlog.md` only when delivering backlog work. Follow the backlog naming/INVEST rules in `_DOC/standards/backlog-naming-and-invest.md` when authoring new items.
- `_DOC/` – Architecture (`architecture/`), standards (`standards/`), and agent guide (`guides/`) references. Use these when designing features.

## Development commands (npm)

- Install: `npm install`
- Local dev server: `npm run watch`
- Build/preview: `npm run build`, `npm run preview`
- Watch build: `npm run watch`
- Lint: `npm run lint` (ESLint + Stylelint); autofix with `npm run lint:fix`
- Formatting: `npm run format`, check with `npm run format:check`
- Unit tests: `npm run test`, watch with `npm run test:watch`, coverage with `npm run test:coverage`
- Cypress: `npm run cypress:open` (interactive) or `npm run cypress:run` (headless); `npm run cypress:install` if the binary is missing
- If instructions ever block running required commands (lint/format/tests), follow `_DOC/guides/execution-constraints.md` to document the constraint and mitigation.

## Definition of done

- Add or update unit tests as appropriate; existing tests stay green (run targeted Vitest suites relevant to the change).
- Lint and format are clean for touched code (`npm run lint`, `npm run format:check`).
- No missing i18n keys at runtime; add translations instead of hard-coding strings.
- Update documentation (including this file) when project scope or conventions shift.
- Before concluding any task, run the full CI parity command `npm run ci` (or document constraints per `_DOC/guides/execution-constraints.md` if it cannot be executed) so failures surface before handoff.

## Code style & architecture conventions

- Components: single-file components in **PascalCase**; keep each SFC focused on one concern.
- Naming: prefix base components with `Base` (e.g., `BaseButton`), singletons with `The` (e.g., `TheHeader`). Component directories use **kebab-case** to avoid import-casing issues (e.g., `components/app-shell`).
- Imports & aliases: use `@/` paths; avoid deeply relative imports. Do not wrap imports in try/catch.
- State/routing: register Pinia and Vue Router in the app bootstrap (`src/main.ts`); place stores and routes in their respective directories; keep sample stores/routes minimal and non-domain-specific unless requirements dictate.
- UI patterns: use Tailwind CSS utilities and Headless UI components. Use custom accessible tooltips (instead of native `title`) for localization/theming consistency. Favor descriptive variable names; reserve single letters for simple loop indices only.
- Testing: prefer data-cy selectors in Cypress; use Vue Test Utils with jsdom for units. Keep example tests lightweight.
- Filesystem hygiene: avoid introducing new top-level folders without alignment to the existing structure; keep generated artifacts out of source control.
- Commit messages: follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).

## Localization rules

- No hard-coded user-facing strings in components; translate through Vue I18n dictionaries.
- Follow `_DOC/standards/i18n-key-naming-standard.md`: `namespace.section.purpose_optional`, dot-separated, snake_case tokens, ≤3 levels deep, ICU syntax for variables/plurals, update all locales together, reuse keys only when meaning is identical.

## Security & privacy

- Do not commit secrets or credentials. Environment variables belong in `.env` files (already gitignored); use `.env.example` as the template.
- Avoid logging or exposing sensitive/PII data. Keep PWA caching strategies conservative unless explicitly required.

## Restricted / risky areas

- Build/config: `vite.config.ts`, lint configs, test runners, and CI stubs should only change when necessary and with careful review.
- Generated assets: avoid editing compiled outputs or Cypress/Vitest snapshots without intent.
- Shared UI shell (`src/App.vue`) and entry bootstrap (`src/main.ts`): maintain compatibility with Pinia, Router, I18n.

## Collaboration & PR guidelines

- Keep changes small and well-scoped; align with backlog acceptance criteria when working on a story.
- Update README or relevant docs when commands, environment variables, or workflows change.
- Seek human review before altering authentication, PWA caching behavior, or data-handling patterns tied to client/member experiences.

## Maintenance

- Refresh this `AGENTS.md` when conventions evolve or new tooling is added. Prefer scoped `AGENTS.md` overrides for temporary or directory-specific rules.
- When a task requires changing any `AGENTS.md`, align the update with `_DOC/guides/agents-md-playbook.md` to stay consistent with the official guidance for agent instructions.
