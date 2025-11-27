# Guide to Designing a High-Quality `AGENTS.md` for AI Coding Agents

_A comprehensive best-practices reference_

---

## Overview

`AGENTS.md` is the primary instruction document that OpenAI Codex and
similar AI coding agents automatically read when interacting with your
repository.\
It acts as a **system prompt at the repo level**, defining:

- How agents should **behave**\
- What **rules & constraints** they must follow\
- How they should **interpret project structure**\
- What internal **architecture conventions** exist\
- Which **commands** and **tools** are canonical\
- Which files/folders are **off-limits**\
- What requires **human confirmation**

A well-crafted `AGENTS.md` drastically improves reliability, reduces
hallucination, enforces consistency, and ensures that AI agents navigate
your repo safely.

This guide provides a complete checklist of best practices and
recommended content structure.

---

# 1. Purpose & Philosophy of `AGENTS.md`

### Core Intent

`AGENTS.md` should be:

- **Authoritative**
- **Operational**
- **Machine-friendly**
- **Human-readable**

### What It Must Explain

- This file is for **AI coding agents**.
- Global rules may be overridden by:
  - `AGENTS.override.md`
  - Directory-specific `AGENTS.md`
- **Closest file wins** for instruction precedence.

---

# 2. Recommended Structure of the Root `AGENTS.md`

A strong `AGENTS.md` typically includes:

1.  Purpose & Scope\
2.  Project Overview\
3.  Repository Layout\
4.  Development Commands\
5.  Testing & Definition of Done\
6.  Code Style & Architecture Conventions\
7.  Localization & i18n Rules\
8.  Security, Privacy & Safety Constraints\
9.  Restricted / Dangerous Areas\
10. Pull Request & Collaboration Guidelines\
11. When to Ask for Human Confirmation\
12. Instruction Style Best Practices\
13. Maintenance Strategy\
14. Template for a Root-Level `AGENTS.md`

---

# 3. Project Overview Best Practices

Include:

- Project mission, domain, audience\
- Real tech stack\
- High-level architecture (components, routing, state mgmt., services,
  testing)\
- Non-goals

---

# 4. Repository Layout Best Practices

Provide a short directory map and rules for where code goes.

---

# 5. Development Environment & Commands

Canonical examples:

    npm install
    npm run watch
    npm run build
    npm run preview
    npm run lint
    npm run test
    npm run test:e2e

Avoid alternatives.

---

# 6. Testing & Definition of Done

### Definition of Done

- Unit tests updated\
- All tests green\
- ESLint & Prettier clean\
- No missing i18n keys

### Additional

- TypeScript clean (if applicable)\
- No console errors

---

# 7. Code Style & Component Conventions

- PascalCase SFCs\
- Kebab-case directories\
- Prefix patterns: Base*, The*\
- No hardcoded strings (use i18n)\
- Descriptive variable names\
- Vuetify tooltip standards\
- Commit messages use Conventional Commits

---

# 8. Localization & i18n Rules

Summaries from `_DOC/standards/i18n-key-naming-standard.md`:

- Semantic, stable IDs\
- `feature.section.purpose_optional`\
- Dot-separated, snake_case\
- Depth ≤ 3\
- ICU for variables & plurals\
- Both locales must be updated\
- Reuse keys only if meaning identical\
- Keys are stable IDs; rename only if meaning changes

---

# 9. Security, Privacy & Safety

- No logging PII\
- No committing secrets\
- `.env.example` for guidance\
- Avoid unsafe command generation

---

# 10. Restricted / Dangerous Areas

- Auto-generated folders\
- Critical domain logic\
- CI/CD configuration\
- Shared architecture components\
- Schema or migration code\
- High-risk areas require human approval

---

# 11. Pull Request & Collaboration Guidelines

- Branch naming\
- Conventional commits\
- Required checks (tests, lint, type)\
- Update documentation when needed\
- Ask for review for architecture changes

---

# 12. Instruction Style Best Practices

- Use bullet lists\
- Use headings\
- Avoid contradictions\
- Include examples\
- Keep text concise\
- Prefer imperative voice

---

# 13. Maintenance Strategy

- Keep AGENTS.md updated with architecture changes\
- Review periodically\
- Treat it as high-value documentation\
- Use overrides for temporary rules

---

# 14. Template for a Root-Level `AGENTS.md`

Example skeleton:

    # AGENTS.md

    ## Purpose & Scope
    ...

    ## Project Overview
    ...

    ## Repository Layout
    ...

    ## Development Commands
    ...

    ## Testing & Definition of Done
    ...

    ## Code Style & Architecture Conventions
    ...

    ## Localization & i18n Rules
    ...

    ## Security & Privacy Constraints
    ...

    ## Restricted / Dangerous Areas
    ...

    ## Collaboration & PR Guidelines
    ...

    ## When to Ask for Human Review
    ...

---

# Final Notes

A strong AGENTS.md is:

- Clear\
- Structured\
- Aligned with the repo\
- Safe\
- Concise\
- Actionable

Use this guide as your primary reference for creating and maintaining
AGENTS.md files.
