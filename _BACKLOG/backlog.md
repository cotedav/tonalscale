# Backlog Index

This backlog tracks foundational user stories for the new SaaS platform scaffold.

## Epics

| Status      | Epic          | Description                                                                                  |
| ----------- | ------------- | -------------------------------------------------------------------------------------------- |
| In Progress | [E1](./E1.md) | SaaS platform foundation epic establishing the PWA scaffold, tooling, and core integrations. |
| Pending     | [E2](./E2.md) | Observability, analytics, and resilience epic for production-ready instrumentation.          |
| Pending     | [E3](./E3.md) | Tonal scale builder migration to Vue 3 with Tailwind CSS and Headless UI.                    |
| Completed   | [E4](./E4.md) | Multi-role tonal system for independent surface and primary gradients.                       |
| Pending     | [E5](./E5.md) | Dynamic tonal color roles for built-in and user-created palette roles.                       |

## Features

| Status      | Feature             | Epic          | Description                                                 |
| ----------- | ------------------- | ------------- | ----------------------------------------------------------- |
| Completed   | [E1-F1](./E1-F1.md) | [E1](./E1.md) | Project scaffold and configuration baselines.               |
| Completed   | [E1-F2](./E1-F2.md) | [E1](./E1.md) | Code quality and workflow automation foundations.           |
| Completed   | [E1-F3](./E1-F3.md) | [E1](./E1.md) | Testing foundations for units and end-to-end coverage.      |
| Completed   | [E1-F4](./E1-F4.md) | [E1](./E1.md) | State, routing, and form foundations.                       |
| Completed   | [E1-F5](./E1-F5.md) | [E1](./E1.md) | Localization and PWA experience readiness.                  |
| Completed   | [E1-F6](./E1-F6.md) | [E1](./E1.md) | Shared utility library guidance.                            |
| Pending     | [E2-F1](./E2-F1.md) | [E2](./E2.md) | Analytics and performance tracing with Statsig.             |
| Pending     | [E2-F2](./E2-F2.md) | [E2](./E2.md) | Resilience and offline experience foundations.              |
| Pending     | [E2-F3](./E2-F3.md) | [E2](./E2.md) | Authentication and feature-flag guardrails with Statsig.    |
| Pending     | [E2-F4](./E2-F4.md) | [E2](./E2.md) | Delivery health instrumentation.                            |
| Pending     | [E2-F5](./E2-F5.md) | [E2](./E2.md) | Sentry monitoring for errors, releases, and performance.    |
| Completed   | [E3-F1](./E3-F1.md) | [E3](./E3.md) | Tailwind/Headless UI foundation for the tonal builder page. |
| Pending     | [E3-F2](./E3-F2.md) | [E3](./E3.md) | Color input and blending control surfaces.                  |
| Pending     | [E3-F3](./E3-F3.md) | [E3](./E3.md) | Tonal generation and color math engine.                     |
| Pending     | [E3-F4](./E3-F4.md) | [E3](./E3.md) | Scale visualization and interaction patterns.               |
| In Progress | [E3-F5](./E3-F5.md) | [E3](./E3.md) | Accessibility helpers, clipboard, and sharing utilities.    |
| Pending     | [E3-F6](./E3-F6.md) | [E3](./E3.md) | Theming, responsiveness, and UX polish.                     |
| Completed   | [E4-F1](./E4-F1.md) | [E4](./E4.md) | Role-aware tonal configuration and generation.              |
| Completed   | [E4-F2](./E4-F2.md) | [E4](./E4.md) | Surface and primary editing tabs.                           |
| Completed   | [E4-F3](./E4-F3.md) | [E4](./E4.md) | Combined Material role preview.                             |
| Completed   | [E4-F4](./E4-F4.md) | [E4](./E4.md) | Multi-role URL and import/export persistence.               |
| Completed   | [E5-F1](./E5-F1.md) | [E5](./E5.md) | Dynamic role domain model and store architecture.           |
| Completed   | [E5-F2](./E5-F2.md) | [E5](./E5.md) | Role management experience.                                 |
| Completed   | [E5-F3](./E5-F3.md) | [E5](./E5.md) | Dynamic role persistence and sharing.                       |
| Done        | [E5-F4](./E5-F4.md) | [E5](./E5.md) | Dynamic role preview and export integration.                |
| Pending     | [E5-F5](./E5-F5.md) | [E5](./E5.md) | Role toolbar ergonomics and default Material roles.         |
| Completed   | [E5-F6](./E5-F6.md) | [E5](./E5.md) | Surface role tone assignment and customization.             |
| In Progress | [E5-F7](./E5-F7.md) | [E5](./E5.md) | Palette workflow, persistence, and preview fidelity.        |

## Stories

| Status    | Story                       | Feature             | Epic          | Description                                                                               |
| --------- | --------------------------- | ------------------- | ------------- | ----------------------------------------------------------------------------------------- |
| Completed | [E1-F1-S1](./E1-F1-S1.md)   | [E1-F1](./E1-F1.md) | [E1](./E1.md) | Initialize Vite + Vue 3 + TypeScript PWA scaffold with Vuetify.                           |
| Completed | [E1-F1-S2](./E1-F1-S2.md)   | [E1-F1](./E1-F1.md) | [E1](./E1.md) | Configure Vite/TypeScript project settings, path aliases, env handling.                   |
| Completed | [E1-F2-S1](./E1-F2-S1.md)   | [E1-F2](./E1-F2.md) | [E1](./E1.md) | ESLint + Stylelint + Prettier compatibility setup.                                        |
| Completed | [E1-F2-S2](./E1-F2-S2.md)   | [E1-F2](./E1-F2.md) | [E1](./E1.md) | Prettier standards and workflow automation.                                               |
| Completed | [E1-F2-S3](./E1-F2-S3.md)   | [E1-F2](./E1-F2.md) | [E1](./E1.md) | npm scripts and CI-friendly workflows.                                                    |
| Completed | [E1-F3-S1](./E1-F3-S1.md)   | [E1-F3](./E1-F3.md) | [E1](./E1.md) | Vitest unit testing foundation.                                                           |
| Completed | [E1-F3-S2](./E1-F3-S2.md)   | [E1-F3](./E1-F3.md) | [E1](./E1.md) | Cypress end-to-end testing boilerplate.                                                   |
| Completed | [E1-F4-S1](./E1-F4-S1.md)   | [E1-F4](./E1-F4.md) | [E1](./E1.md) | Pinia state management scaffold.                                                          |
| Completed | [E1-F4-S2](./E1-F4-S2.md)   | [E1-F4](./E1-F4.md) | [E1](./E1.md) | Vue Router routing foundation.                                                            |
| Completed | [E1-F4-S3](./E1-F4-S3.md)   | [E1-F4](./E1-F4.md) | [E1](./E1.md) | Vee-Validate integration and form utilities.                                              |
| Completed | [E1-F5-S1](./E1-F5-S1.md)   | [E1-F5](./E1-F5.md) | [E1](./E1.md) | Configure Vue I18n for localization.                                                      |
| Completed | [E1-F5-S2](./E1-F5-S2.md)   | [E1-F5](./E1-F5.md) | [E1](./E1.md) | PWA essentials: manifest and service worker registration.                                 |
| Completed | [E1-F6-S1](./E1-F6-S1.md)   | [E1-F6](./E1-F6.md) | [E1](./E1.md) | Shared utility libraries with guidance.                                                   |
| Pending   | [E2-F1-S1](./E2-F1-S1.md)   | [E2-F1](./E2-F1.md) | [E2](./E2.md) | Statsig-powered navigation analytics and performance tracing hooks.                       |
| Pending   | [E2-F2-S1](./E2-F2-S1.md)   | [E2-F2](./E2-F2.md) | [E2](./E2.md) | Runtime caching strategy for resilient offline support.                                   |
| Pending   | [E2-F2-S2](./E2-F2-S2.md)   | [E2-F2](./E2-F2.md) | [E2](./E2.md) | User-facing PWA update/offline notifications.                                             |
| Pending   | [E2-F3-S1](./E2-F3-S1.md)   | [E2-F3](./E2-F3.md) | [E2](./E2.md) | MSAL authentication foundation for Azure AD readiness.                                    |
| Pending   | [E2-F3-S2](./E2-F3-S2.md)   | [E2-F3](./E2-F3.md) | [E2](./E2.md) | Authentication and feature-flag guardrails with Statsig gating and testing                |
| Pending   | [E2-F4-S1](./E2-F4-S1.md)   | [E2-F4](./E2-F4.md) | [E2](./E2.md) | CI health instrumentation for bundle size budgets and PWA quality.                        |
| Pending   | [E2-F5-S1](./E2-F5-S1.md)   | [E2-F5](./E2-F5.md) | [E2](./E2.md) | Sentry integration for error, release, and performance monitoring.                        |
| Completed | [E3-F1-S1](./E3-F1-S1.md)   | [E3-F1](./E3-F1.md) | [E3](./E3.md) | Configure Tailwind CSS and Headless UI while removing Vuetify usage.                      |
| Completed | [E3-F1-S2](./E3-F1-S2.md)   | [E3-F1](./E3-F1.md) | [E3](./E3.md) | Move the Vuetify index demo to a dedicated scaffolding-demo route.                        |
| Completed | [E3-F1-S3](./E3-F1-S3.md)   | [E3-F1](./E3-F1.md) | [E3](./E3.md) | Rewrite the scaffolding demo with Tailwind/Headless UI and repair tests.                  |
| Completed | [E3-F1-S4](./E3-F1-S4.md)   | [E3-F1](./E3-F1.md) | [E3](./E3.md) | Build the tonal builder home page shell and layout scaffolding.                           |
| Completed | [E3-F2-S1](./E3-F2-S1.md)   | [E3-F2](./E3-F2.md) | [E3](./E3.md) | Base and blend color pickers with synchronized inputs.                                    |
| Completed | [E3-F2-S2](./E3-F2-S2.md)   | [E3-F2](./E3-F2.md) | [E3](./E3.md) | Blend mode, strength, and saturation controls wired to reactive state.                    |
| Completed | [E3-F3-S1](./E3-F3-S1.md)   | [E3-F3](./E3-F3.md) | [E3](./E3.md) | Port LAB-based tonal generation, easing, and blending utilities to TypeScript with tests. |
| Completed | [E3-F3-S2](./E3-F3-S2.md)   | [E3-F3](./E3-F3.md) | [E3](./E3.md) | Expose reusable composables/services for tonal scale state and derivations.               |
| Completed | [E3-F4-S1](./E3-F4-S1.md)   | [E3-F4](./E3-F4.md) | [E3](./E3.md) | Baseline tonal scale generation without blend color.                                      |
| Completed | [E3-F4-S2](./E3-F4-S2.md)   | [E3-F4](./E3-F4.md) | [E3](./E3.md) | Render full, extended key, and key tonal strips with contextual metadata.                 |
| Completed | [E3-F4-S3](./E3-F4-S3.md)   | [E3-F4](./E3-F4.md) | [E3](./E3.md) | Hover interactions, contrast helper dots, and linked previews.                            |
| Completed | [E3-F4-S4](./E3-F4-S4.md)   | [E3-F4](./E3-F4.md) | [E3](./E3.md) | Optional blend distribution visualization with Plotly overlay controls.                   |
| Completed | [E3-F5-S1](./E3-F5-S1.md)   | [E3-F5](./E3-F5.md) | [E3](./E3.md) | WCAG-aware color cards and contrast calculations.                                         |
| Completed | [E3-F5-S2](./E3-F5-S2.md)   | [E3-F5](./E3-F5.md) | [E3](./E3.md) | Context menu shortcuts and clipboard exports for colors and SVG.                          |
| Completed | [E3-F5-S3](./E3-F5-S3.md)   | [E3-F5](./E3-F5.md) | [E3](./E3.md) | Import/Export modal and URL synchronization for sharable configurations.                  |
| Completed | [E3-F6-S1](./E3-F6-S1.md)   | [E3-F6](./E3-F6.md) | [E3](./E3.md) | Light/dark theme toggle with persisted preference and animated iconography.               |
| Completed | [E4-F1-S1](./E4-F1-S1.md)   | [E4-F1](./E4-F1.md) | [E4](./E4.md) | Model independent surface and primary tonal configurations.                               |
| Completed | [E4-F1-S2](./E4-F1-S2.md)   | [E4-F1](./E4-F1.md) | [E4](./E4.md) | Generate and retain independent tonal scales for each role.                               |
| Completed | [E4-F2-S1](./E4-F2-S1.md)   | [E4-F2](./E4-F2.md) | [E4](./E4.md) | Add accessible surface and primary toolbar tabs.                                          |
| Completed | [E4-F2-S2](./E4-F2-S2.md)   | [E4-F2](./E4-F2.md) | [E4](./E4.md) | Bind the tonal workspace to the active color role.                                        |
| Completed | [E4-F3-S1](./E4-F3-S1.md)   | [E4-F3](./E4-F3.md) | [E4](./E4.md) | Map the primary gradient to Material primary roles.                                       |
| Completed | [E4-F3-S2](./E4-F3-S2.md)   | [E4-F3](./E4-F3.md) | [E4](./E4.md) | Apply surface and primary roles together in the app preview.                              |
| Completed | [E4-F4-S1](./E4-F4-S1.md)   | [E4-F4](./E4-F4.md) | [E4](./E4.md) | Define a versioned multi-role persistence schema.                                         |
| Completed | [E4-F4-S2](./E4-F4-S2.md)   | [E4-F4](./E4-F4.md) | [E4](./E4.md) | Synchronize both color roles with shareable URLs.                                         |
| Completed | [E4-F4-S3](./E4-F4-S3.md)   | [E4-F4](./E4-F4.md) | [E4](./E4.md) | Import and export complete multi-role configurations.                                     |
| Completed | [E5-F1-S1](./E5-F1-S1.md)   | [E5-F1](./E5-F1.md) | [E5](./E5.md) | Introduce a dynamic color role registry.                                                  |
| Completed | [E5-F1-S2](./E5-F1-S2.md)   | [E5-F1](./E5-F1.md) | [E5](./E5.md) | Store per-role surface preview settings generically.                                      |
| Completed | [E5-F1-S3](./E5-F1-S3.md)   | [E5-F1](./E5-F1.md) | [E5](./E5.md) | Generalize role-aware tonal selectors and refresh logic.                                  |
| Completed | [E5-F2-S1](./E5-F2-S1.md)   | [E5-F2](./E5-F2.md) | [E5](./E5.md) | Render role tabs from dynamic role order.                                                 |
| Completed | [E5-F2-S2](./E5-F2-S2.md)   | [E5-F2](./E5-F2.md) | [E5](./E5.md) | Add and duplicate color roles.                                                            |
| Completed | [E5-F2-S3](./E5-F2-S3.md)   | [E5-F2](./E5-F2.md) | [E5](./E5.md) | Rename, reorder, and delete custom roles.                                                 |
| Completed | [E5-F3-S1](./E5-F3-S1.md)   | [E5-F3](./E5-F3.md) | [E5](./E5.md) | Define a versioned dynamic role persistence schema.                                       |
| Completed | [E5-F3-S2](./E5-F3-S2.md)   | [E5-F3](./E5-F3.md) | [E5](./E5.md) | Migrate existing multi-role payloads to the dynamic schema.                               |
| Completed | [E5-F3-S3](./E5-F3-S3.md)   | [E5-F3](./E5-F3.md) | [E5](./E5.md) | Share dynamic roles through URL, import, and export flows.                                |
| Done      | [E5-F4-S1](./E5-F4-S1.md)   | [E5-F4](./E5-F4.md) | [E5](./E5.md) | Generalize Material surface role mapping to any palette role.                             |
| Done      | [E5-F4-S2](./E5-F4-S2.md)   | [E5-F4](./E5-F4.md) | [E5](./E5.md) | Showcase additional roles in the app preview.                                             |
| Done      | [E5-F4-S3](./E5-F4-S3.md)   | [E5-F4](./E5-F4.md) | [E5](./E5.md) | Export dynamic role surface cards and tone mappings.                                      |
| Completed | [E5-F5-S1](./E5-F5-S1.md)   | [E5-F5](./E5-F5.md) | [E5](./E5.md) | Place add role action in the tab toolbar.                                                 |
| Completed | [E5-F5-S2](./E5-F5-S2.md)   | [E5-F5](./E5-F5.md) | [E5](./E5.md) | Reorder color roles by dragging tabs.                                                     |
| Completed | [E5-F5-S3](./E5-F5-S3.md)   | [E5-F5](./E5-F5.md) | [E5](./E5.md) | Rename roles inline from the selected tab.                                                |
| Completed | [E5-F5-S4](./E5-F5-S4.md)   | [E5-F5](./E5-F5.md) | [E5](./E5.md) | Start new and duplicated roles in inline edit mode.                                       |
| Completed | [E5-F5-S5](./E5-F5-S5.md)   | [E5-F5](./E5-F5.md) | [E5](./E5.md) | Add default Secondary, Tertiary, and Error roles.                                         |
| Completed | [E5-F5-S6](./E5-F5-S6.md)   | [E5-F5](./E5-F5.md) | [E5](./E5.md) | Showcase secondary, tertiary, and error Material roles in the preview.                    |
| Completed | [E5-F5-S7](./E5-F5-S7.md)   | [E5-F5](./E5-F5.md) | [E5](./E5.md) | Reset the app to its initial state.                                                       |
| Completed | [E5-F5-S8](./E5-F5-S8.md)   | [E5-F5](./E5-F5.md) | [E5](./E5.md) | Export one role or all roles from a menu.                                                 |
| Completed | [E5-F5-S9](./E5-F5-S9.md)   | [E5-F5](./E5-F5.md) | [E5](./E5.md) | Polish color control labels for production readiness.                                     |
| Completed | [E5-F5-S10](./E5-F5-S10.md) | [E5-F5](./E5-F5.md) | [E5](./E5.md) | Fix the import dialog title translation.                                                  |
| Completed | [E5-F5-S11](./E5-F5-S11.md) | [E5-F5](./E5-F5.md) | [E5](./E5.md) | Replace browser alerts with an accessible dialog.                                         |
| Completed | [E5-F6-S1](./E5-F6-S1.md)   | [E5-F6](./E5-F6.md) | [E5](./E5.md) | Exclude the base-adjacent tone from key strips and assignments.                           |
| Completed | [E5-F6-S2](./E5-F6-S2.md)   | [E5-F6](./E5-F6.md) | [E5](./E5.md) | Rework automatic surface-card assignment across light and dark modes.                     |
| Completed | [E5-F6-S3](./E5-F6-S3.md)   | [E5-F6](./E5-F6.md) | [E5](./E5.md) | Split surface tone and contrast settings by theme mode for every role.                    |
| Completed | [E5-F6-S4](./E5-F6-S4.md)   | [E5-F6](./E5-F6.md) | [E5](./E5.md) | Customize selected surface card tones with the mouse wheel.                               |
| Completed | [E5-F7-S1](./E5-F7-S1.md)   | [E5-F7](./E5-F7.md) | [E5](./E5.md) | Store share state locally instead of in base64 URLs.                                      |
| Completed | [E5-F7-S2](./E5-F7-S2.md)   | [E5-F7](./E5-F7.md) | [E5](./E5.md) | Export customized surface role values in SVG.                                            |
| Completed | [E5-F7-S3](./E5-F7-S3.md)   | [E5-F7](./E5-F7.md) | [E5](./E5.md) | Swap two color role configurations.                                                       |
| Completed | [E5-F7-S4](./E5-F7-S4.md)   | [E5-F7](./E5-F7.md) | [E5](./E5.md) | Apply one role configuration to another role.                                             |
| Completed | [E5-F7-S5](./E5-F7-S5.md)   | [E5-F7](./E5-F7.md) | [E5](./E5.md) | Map every preview element to the correct Material role.                                   |
