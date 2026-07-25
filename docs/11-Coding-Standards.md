---
title: "Coding Standards"
documentType: Project Documentation
version: 1.0.0
status: Draft
owner: AVC Advertising Services
project: ANW AI-COS
created: 2026-07-26
lastUpdated: 2026-07-26
nextReview:
category: "Docs"
tags:
  - documentation
dependencies: []
relatedDocuments: []
relatedADR: []
---
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
