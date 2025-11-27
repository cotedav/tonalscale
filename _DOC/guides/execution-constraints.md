# Handling Execution Constraints for Required Checks

This guide clarifies how to treat linting, formatting, and tests when the environment or higher-priority instructions affect command execution.

## When commands must run

- Run `npm run lint` and `npm run format:check` for every change unless a higher-priority instruction (for example, system-level guidance that explicitly forbids executing commands) blocks shell access.
- Prefer running the narrowest relevant test suites, but ensure existing tests remain green.

## When commands cannot run

- If a top-level instruction prohibits command execution (such as a read-only QA review), document that directive in the task response and explain that linting/testing were intentionally skipped.
- If a tooling or OS-level failure genuinely prevents running a command (missing binary, incompatible runtime), describe the failure, link the log, and propose a remediation before merging.

## Reporting expectations

- When skipping required commands, explicitly call out the blocking instruction or runtime failure in the Summary/Testing section so reviewers understand it was not an oversight.
- Include any mitigation steps (e.g., reinstall dependencies, unblock CI) to ensure future runs will pass.
