---
title: "Knowledge Source Manager"
documentType: "Module Specification"
version: "1.5.0"
status: "Active"
owner: "AVC Advertising Services"
project: "ANW AI-COS"
category: "Knowledge Governance"
tags:
  - "knowledge"
  - "sources"
  - "medical-safety"
  - "audit"
dependencies:
  - "Knowledge Engine"
  - "Knowledge Review Workflow"
  - "Supabase"
---

# Knowledge Source Manager

## Purpose

The Knowledge Source Manager allows server-side tools to add, update, remove, validate, and audit the sources attached to a Knowledge Engine record.

## Compatibility

The module writes to the existing `knowledge_entries.sources` JSON array. Therefore, the existing Knowledge Review Workflow immediately sees newly added sources without a separate synchronization job.

## Safety Rules

- Every managed source requires a title, publisher, public URL, and evidence level.
- Duplicate source IDs and canonicalized URLs are blocked.
- Tracking parameters are removed from stored URLs.
- Private or local URLs are blocked.
- Example domains are permitted for tests but produce a production warning.
- Editing an approved or in-review entry resets it to `draft` and clears previous reviewer information.
- Every add, update, and remove action creates an immutable audit event.

## Workflow

```text
Draft knowledge entry
        ↓
Add and validate sources
        ↓
Review source collection
        ↓
Submit through Knowledge Review Workflow
        ↓
Medical approval
        ↓
AI Content Engine
```

## CLI Commands

- `source:demo` — free in-memory test.
- `source:check-topic` — read-only inspection of a Supabase topic.
- `source:add` — add one validated source from environment variables.
- `source:update` — update one source.
- `source:remove` — remove one source.

All Supabase write commands are server-side and require the protected local `.env` configuration.
