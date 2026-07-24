# 11 — Coding Standards

- TypeScript preferred; strict typing enabled.
- Small, modular, testable functions.
- Clear naming and documented interfaces.
- Validate external input and handle errors explicitly.
- Never log sensitive data.
- Version APIs and use idempotency for publishing.
- All schema changes use migrations.
- Index foreign keys and common query fields.

## Branches
`feature/...`, `fix/...`, `docs/...`, `release/...`

## Commit Examples
`feat: add topic scoring service`
`docs: update database blueprint`
`fix: prevent duplicate publishing jobs`
