# Backlog naming and INVEST standard

## Naming scheme

We use four levels to organize work:

- **Epic** – `E<number>`
- **Feature** – `E<number>-F<number>` (features are numbered within their epic)
- **Story** – `E<number>-F<number>-S<number>` (stories are numbered within their feature)
- **Task (optional)** – `E<number>-F<number>-S<number>-T<number>` (tasks are numbered within their story)

Example: `E1-F2-S3-T1` is task 1 under story 3 of feature 2 in epic 1.

## Authoring guidelines

- Choose the right level (epic, feature, story, or task) based on scope, dependencies, and user request complexity.
- When creating a new backlog item, title it with the correct identifier and include links to its parent item(s).
- Keep numbering sequential within each parent level; avoid reusing identifiers after renames.
- Structure acceptance criteria and scope to follow INVEST best practices (independent, negotiable, valuable, estimable, small, testable).
- Update the backlog index and parent files (epic/feature/story) when adding or renaming items so hierarchy and status stay consistent.
