# Backlog Index

This backlog tracks foundational user stories for the new SaaS platform scaffold.

## Epics

| Status      | Epic          | Description                                                                                  |
| ----------- | ------------- | -------------------------------------------------------------------------------------------- |
| In Progress | [E1](./E1.md) | SaaS platform foundation epic establishing the PWA scaffold, tooling, and core integrations. |
| Pending     | [E2](./E2.md) | Observability, analytics, and resilience epic for production-ready instrumentation.          |
| Pending     | [E3](./E3.md) | Tonal scale builder migration to Vue 3 with Tailwind CSS and Headless UI.                    |

## Features

| Status    | Feature             | Epic          | Description                                                 |
| --------- | ------------------- | ------------- | ----------------------------------------------------------- |
| Completed | [E1-F1](./E1-F1.md) | [E1](./E1.md) | Project scaffold and configuration baselines.               |
| Completed | [E1-F2](./E1-F2.md) | [E1](./E1.md) | Code quality and workflow automation foundations.           |
| Completed | [E1-F3](./E1-F3.md) | [E1](./E1.md) | Testing foundations for units and end-to-end coverage.      |
| Completed | [E1-F4](./E1-F4.md) | [E1](./E1.md) | State, routing, and form foundations.                       |
| Completed | [E1-F5](./E1-F5.md) | [E1](./E1.md) | Localization and PWA experience readiness.                  |
| Completed | [E1-F6](./E1-F6.md) | [E1](./E1.md) | Shared utility library guidance.                            |
| Pending   | [E2-F1](./E2-F1.md) | [E2](./E2.md) | Analytics and performance tracing with Statsig.             |
| Pending   | [E2-F2](./E2-F2.md) | [E2](./E2.md) | Resilience and offline experience foundations.              |
| Pending   | [E2-F3](./E2-F3.md) | [E2](./E2.md) | Authentication and feature-flag guardrails with Statsig.    |
| Pending   | [E2-F4](./E2-F4.md) | [E2](./E2.md) | Delivery health instrumentation.                            |
| Pending   | [E2-F5](./E2-F5.md) | [E2](./E2.md) | Sentry monitoring for errors, releases, and performance.    |
| Completed | [E3-F1](./E3-F1.md) | [E3](./E3.md) | Tailwind/Headless UI foundation for the tonal builder page. |
| Pending   | [E3-F2](./E3-F2.md) | [E3](./E3.md) | Color input and blending control surfaces.                  |
| Pending   | [E3-F3](./E3-F3.md) | [E3](./E3.md) | Tonal generation and color math engine.                     |
| Pending   | [E3-F4](./E3-F4.md) | [E3](./E3.md) | Scale visualization and interaction patterns.               |
| Pending   | [E3-F5](./E3-F5.md) | [E3](./E3.md) | Accessibility helpers, clipboard, and sharing utilities.    |
| Pending   | [E3-F6](./E3-F6.md) | [E3](./E3.md) | Theming, responsiveness, and UX polish.                     |

## Stories

| Status    | Story                     | Feature             | Epic          | Description                                                                               |
| --------- | ------------------------- | ------------------- | ------------- | ----------------------------------------------------------------------------------------- |
| Completed | [E1-F1-S1](./E1-F1-S1.md) | [E1-F1](./E1-F1.md) | [E1](./E1.md) | Initialize Vite + Vue 3 + TypeScript PWA scaffold with Vuetify.                           |
| Completed | [E1-F1-S2](./E1-F1-S2.md) | [E1-F1](./E1-F1.md) | [E1](./E1.md) | Configure Vite/TypeScript project settings, path aliases, env handling.                   |
| Completed | [E1-F2-S1](./E1-F2-S1.md) | [E1-F2](./E1-F2.md) | [E1](./E1.md) | ESLint + Stylelint + Prettier compatibility setup.                                        |
| Completed | [E1-F2-S2](./E1-F2-S2.md) | [E1-F2](./E1-F2.md) | [E1](./E1.md) | Prettier standards and workflow automation.                                               |
| Completed | [E1-F2-S3](./E1-F2-S3.md) | [E1-F2](./E1-F2.md) | [E1](./E1.md) | npm scripts and CI-friendly workflows.                                                    |
| Completed | [E1-F3-S1](./E1-F3-S1.md) | [E1-F3](./E1-F3.md) | [E1](./E1.md) | Vitest unit testing foundation.                                                           |
| Completed | [E1-F3-S2](./E1-F3-S2.md) | [E1-F3](./E1-F3.md) | [E1](./E1.md) | Cypress end-to-end testing boilerplate.                                                   |
| Completed | [E1-F4-S1](./E1-F4-S1.md) | [E1-F4](./E1-F4.md) | [E1](./E1.md) | Pinia state management scaffold.                                                          |
| Completed | [E1-F4-S2](./E1-F4-S2.md) | [E1-F4](./E1-F4.md) | [E1](./E1.md) | Vue Router routing foundation.                                                            |
| Completed | [E1-F4-S3](./E1-F4-S3.md) | [E1-F4](./E1-F4.md) | [E1](./E1.md) | Vee-Validate integration and form utilities.                                              |
| Completed | [E1-F5-S1](./E1-F5-S1.md) | [E1-F5](./E1-F5.md) | [E1](./E1.md) | Configure Vue I18n for localization.                                                      |
| Completed | [E1-F5-S2](./E1-F5-S2.md) | [E1-F5](./E1-F5.md) | [E1](./E1.md) | PWA essentials: manifest and service worker registration.                                 |
| Completed | [E1-F6-S1](./E1-F6-S1.md) | [E1-F6](./E1-F6.md) | [E1](./E1.md) | Shared utility libraries with guidance.                                                   |
| Pending   | [E2-F1-S1](./E2-F1-S1.md) | [E2-F1](./E2-F1.md) | [E2](./E2.md) | Statsig-powered navigation analytics and performance tracing hooks.                       |
| Pending   | [E2-F2-S1](./E2-F2-S1.md) | [E2-F2](./E2-F2.md) | [E2](./E2.md) | Runtime caching strategy for resilient offline support.                                   |
| Pending   | [E2-F2-S2](./E2-F2-S2.md) | [E2-F2](./E2-F2.md) | [E2](./E2.md) | User-facing PWA update/offline notifications.                                             |
| Pending   | [E2-F3-S1](./E2-F3-S1.md) | [E2-F3](./E2-F3.md) | [E2](./E2.md) | MSAL authentication foundation for Azure AD readiness.                                    |
| Pending   | [E2-F3-S2](./E2-F3-S2.md) | [E2-F3](./E2-F3.md) | [E2](./E2.md) | Authentication and feature-flag guardrails with Statsig gating and testing                |
| Pending   | [E2-F4-S1](./E2-F4-S1.md) | [E2-F4](./E2-F4.md) | [E2](./E2.md) | CI health instrumentation for bundle size budgets and PWA quality.                        |
| Pending   | [E2-F5-S1](./E2-F5-S1.md) | [E2-F5](./E2-F5.md) | [E2](./E2.md) | Sentry integration for error, release, and performance monitoring.                        |
| Completed | [E3-F1-S1](./E3-F1-S1.md) | [E3-F1](./E3-F1.md) | [E3](./E3.md) | Configure Tailwind CSS and Headless UI while removing Vuetify usage.                      |
| Completed | [E3-F1-S2](./E3-F1-S2.md) | [E3-F1](./E3-F1.md) | [E3](./E3.md) | Move the Vuetify index demo to a dedicated scaffolding-demo route.                        |
| Completed | [E3-F1-S3](./E3-F1-S3.md) | [E3-F1](./E3-F1.md) | [E3](./E3.md) | Rewrite the scaffolding demo with Tailwind/Headless UI and repair tests.                  |
| Completed | [E3-F1-S4](./E3-F1-S4.md) | [E3-F1](./E3-F1.md) | [E3](./E3.md) | Build the tonal builder home page shell and layout scaffolding.                           |
| Completed | [E3-F2-S1](./E3-F2-S1.md) | [E3-F2](./E3-F2.md) | [E3](./E3.md) | Base and blend color pickers with synchronized inputs.                                    |
| Completed | [E3-F2-S2](./E3-F2-S2.md) | [E3-F2](./E3-F2.md) | [E3](./E3.md) | Blend mode, strength, and saturation controls wired to reactive state.                    |
| Completed | [E3-F3-S1](./E3-F3-S1.md) | [E3-F3](./E3-F3.md) | [E3](./E3.md) | Port LAB-based tonal generation, easing, and blending utilities to TypeScript with tests. |
| Completed | [E3-F3-S2](./E3-F3-S2.md) | [E3-F3](./E3-F3.md) | [E3](./E3.md) | Expose reusable composables/services for tonal scale state and derivations.               |
| Completed | [E3-F4-S1](./E3-F4-S1.md) | [E3-F4](./E3-F4.md) | [E3](./E3.md) | Baseline tonal scale generation without blend color.                                      |
| Completed | [E3-F4-S2](./E3-F4-S2.md) | [E3-F4](./E3-F4.md) | [E3](./E3.md) | Render full, extended key, and key tonal strips with contextual metadata.                 |
| Completed | [E3-F4-S3](./E3-F4-S3.md) | [E3-F4](./E3-F4.md) | [E3](./E3.md) | Hover interactions, contrast helper dots, and linked previews.                            |
| Completed | [E3-F4-S4](./E3-F4-S4.md) | [E3-F4](./E3-F4.md) | [E3](./E3.md) | Optional blend distribution visualization with Plotly overlay controls.                   |
| Pending   | [E3-F5-S1](./E3-F5-S1.md) | [E3-F5](./E3-F5.md) | [E3](./E3.md) | WCAG-aware color cards and contrast calculations.                                         |
| Pending   | [E3-F5-S2](./E3-F5-S2.md) | [E3-F5](./E3-F5.md) | [E3](./E3.md) | Context menu shortcuts and clipboard exports for colors and SVG.                          |
| Pending   | [E3-F5-S3](./E3-F5-S3.md) | [E3-F5](./E3-F5.md) | [E3](./E3.md) | Import/Export modal and URL synchronization for sharable configurations.                  |
| Pending   | [E3-F6-S1](./E3-F6-S1.md) | [E3-F6](./E3-F6.md) | [E3](./E3.md) | Light/dark theme toggle with persisted preference and animated iconography.               |
| Pending   | [E3-F6-S2](./E3-F6-S2.md) | [E3-F6](./E3-F6.md) | [E3](./E3.md) | Responsive layout, focus management, and toast/alert feedback patterns.                   |
