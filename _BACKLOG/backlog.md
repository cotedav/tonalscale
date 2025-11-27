# Backlog Index

This backlog tracks foundational user stories for the new SaaS platform scaffold.

## Epics

| Status      | Epic          | Description                                                                                  |
| ----------- | ------------- | -------------------------------------------------------------------------------------------- |
| In Progress | [E1](./E1.md) | SaaS platform foundation epic establishing the PWA scaffold, tooling, and core integrations. |
| Pending     | [E2](./E2.md) | Observability, analytics, and resilience epic for production-ready instrumentation.          |

## Features

| Status    | Feature             | Epic          | Description                                              |
| --------- | ------------------- | ------------- | -------------------------------------------------------- |
| Completed | [E1-F1](./E1-F1.md) | [E1](./E1.md) | Project scaffold and configuration baselines.            |
| Completed | [E1-F2](./E1-F2.md) | [E1](./E1.md) | Code quality and workflow automation foundations.        |
| Completed | [E1-F3](./E1-F3.md) | [E1](./E1.md) | Testing foundations for units and end-to-end coverage.   |
| Completed | [E1-F4](./E1-F4.md) | [E1](./E1.md) | State, routing, and form foundations.                    |
| Completed | [E1-F5](./E1-F5.md) | [E1](./E1.md) | Localization and PWA experience readiness.               |
| Completed | [E1-F6](./E1-F6.md) | [E1](./E1.md) | Shared utility library guidance.                         |
| Pending   | [E2-F1](./E2-F1.md) | [E2](./E2.md) | Analytics and performance tracing with Statsig.          |
| Pending   | [E2-F2](./E2-F2.md) | [E2](./E2.md) | Resilience and offline experience foundations.           |
| Pending   | [E2-F3](./E2-F3.md) | [E2](./E2.md) | Authentication and feature-flag guardrails with Statsig. |
| Pending   | [E2-F4](./E2-F4.md) | [E2](./E2.md) | Delivery health instrumentation.                         |
| Pending   | [E2-F5](./E2-F5.md) | [E2](./E2.md) | Sentry monitoring for errors, releases, and performance. |

## Stories

| Status    | Story                     | Feature             | Epic          | Description                                                                |
| --------- | ------------------------- | ------------------- | ------------- | -------------------------------------------------------------------------- |
| Completed | [E1-F1-S1](./E1-F1-S1.md) | [E1-F1](./E1-F1.md) | [E1](./E1.md) | Initialize Vite + Vue 3 + TypeScript PWA scaffold with Vuetify.            |
| Completed | [E1-F1-S2](./E1-F1-S2.md) | [E1-F1](./E1-F1.md) | [E1](./E1.md) | Configure Vite/TypeScript project settings, path aliases, env handling.    |
| Completed | [E1-F2-S1](./E1-F2-S1.md) | [E1-F2](./E1-F2.md) | [E1](./E1.md) | ESLint + Stylelint + Prettier compatibility setup.                         |
| Completed | [E1-F2-S2](./E1-F2-S2.md) | [E1-F2](./E1-F2.md) | [E1](./E1.md) | Prettier standards and workflow automation.                                |
| Completed | [E1-F2-S3](./E1-F2-S3.md) | [E1-F2](./E1-F2.md) | [E1](./E1.md) | npm scripts and CI-friendly workflows.                                     |
| Completed | [E1-F3-S1](./E1-F3-S1.md) | [E1-F3](./E1-F3.md) | [E1](./E1.md) | Vitest unit testing foundation.                                            |
| Completed | [E1-F3-S2](./E1-F3-S2.md) | [E1-F3](./E1-F3.md) | [E1](./E1.md) | Cypress end-to-end testing boilerplate.                                    |
| Completed | [E1-F4-S1](./E1-F4-S1.md) | [E1-F4](./E1-F4.md) | [E1](./E1.md) | Pinia state management scaffold.                                           |
| Completed | [E1-F4-S2](./E1-F4-S2.md) | [E1-F4](./E1-F4.md) | [E1](./E1.md) | Vue Router routing foundation.                                             |
| Completed | [E1-F4-S3](./E1-F4-S3.md) | [E1-F4](./E1-F4.md) | [E1](./E1.md) | Vee-Validate integration and form utilities.                               |
| Completed | [E1-F5-S1](./E1-F5-S1.md) | [E1-F5](./E1-F5.md) | [E1](./E1.md) | Configure Vue I18n for localization.                                       |
| Completed | [E1-F5-S2](./E1-F5-S2.md) | [E1-F5](./E1-F5.md) | [E1](./E1.md) | PWA essentials: manifest and service worker registration.                  |
| Completed | [E1-F6-S1](./E1-F6-S1.md) | [E1-F6](./E1-F6.md) | [E1](./E1.md) | Shared utility libraries with guidance.                                    |
| Pending   | [E2-F1-S1](./E2-F1-S1.md) | [E2-F1](./E2-F1.md) | [E2](./E2.md) | Statsig-powered navigation analytics and performance tracing hooks.        |
| Pending   | [E2-F2-S1](./E2-F2-S1.md) | [E2-F2](./E2-F2.md) | [E2](./E2.md) | Runtime caching strategy for resilient offline support.                    |
| Pending   | [E2-F2-S2](./E2-F2-S2.md) | [E2-F2](./E2-F2.md) | [E2](./E2.md) | User-facing PWA update/offline notifications.                              |
| Pending   | [E2-F3-S1](./E2-F3-S1.md) | [E2-F3](./E2-F3.md) | [E2](./E2.md) | MSAL authentication foundation for Azure AD readiness.                     |
| Pending   | [E2-F3-S2](./E2-F3-S2.md) | [E2-F3](./E2-F3.md) | [E2](./E2.md) | Authentication and feature-flag guardrails with Statsig gating and testing |
| Pending   | [E2-F4-S1](./E2-F4-S1.md) | [E2-F4](./E2-F4.md) | [E2](./E2.md) | CI health instrumentation for bundle size budgets and PWA quality.         |
| Pending   | [E2-F5-S1](./E2-F5-S1.md) | [E2-F5](./E2-F5.md) | [E2](./E2.md) | Sentry integration for error, release, and performance monitoring.         |
