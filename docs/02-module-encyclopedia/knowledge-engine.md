---
title: "Knowledge Engine"
documentType: "Module Specification"
version: "1.0.0"
status: "Active"
owner: "AVC Advertising Services"
project: "ANW AI-COS"
category: "Knowledge"
tags:
  - "knowledge"
  - "medical-safety"
  - "retrieval"
dependencies: []
relatedDocuments:
  - "../00-governance/medical-safety-policy.md"
relatedADR:
  - "../03-architecture-decisions/ADR-003-human-review.md"
---

# Knowledge Engine

## Executive Summary

The Knowledge Engine is the controlled information layer for ANW AI-COS. It stores structured facts, symptoms, treatment information, recovery education, FAQs, survivor stories, research references, glossary entries, and resources.

## Core Responsibilities

- Store structured knowledge entries.
- Track source metadata and evidence level.
- Enforce medical-review requirements.
- Search by text, tags, status, and category.
- Prevent duplicate identifiers and slugs.
- Provide approved knowledge to future content engines.
- Preserve draft, review, approved, and archived states.

## Safety Rule

Medical entries must never be treated as publishable merely because they exist in the repository. Entries marked `medicalReviewRequired: true` require reviewer metadata before they can be approved.

## Initial Storage

Version 1.0 uses an in-memory repository for testing and architecture validation. A future Supabase repository will implement the same `KnowledgeRepository` interface.

## Public API

```ts
const service = new KnowledgeService(repository);

await service.create(entry);
await service.getById(id);
await service.getBySlug(slug);
await service.search(query);
await service.approve({ id, reviewedBy });
await service.archive(id);
```

## Future Roadmap

- Supabase repository
- database migrations
- citation verification
- source freshness checks
- semantic embeddings
- AI retrieval
- multilingual knowledge
- reviewer workflow
- content provenance
