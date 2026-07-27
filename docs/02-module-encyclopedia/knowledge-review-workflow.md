---
title: "Knowledge Review and Approval Workflow"
documentType: "Module Specification"
version: "1.4.0"
status: "Active"
owner: "AVC Advertising Services"
project: "ANW AI-COS"
category: "Knowledge Governance"
tags:
  - "knowledge"
  - "medical-review"
  - "approval"
  - "audit-trail"
dependencies:
  - "Knowledge Engine"
  - "Supabase"
---

# Knowledge Review and Approval Workflow

## Purpose

This module prevents unreviewed medical knowledge from entering the AI Content Engine. It provides a controlled lifecycle from draft review request through human approval, with an immutable event history.

## Workflow

```text
Draft Request
    ↓
Policy Validation
    ↓
Submitted
    ↓
In Review
    ├── Changes Requested → Resubmitted
    ├── Rejected
    └── Approved → knowledge_entries.status = approved
```

## Medical Approval Rules

A medical entry requires:

- meaningful title, summary, and body content;
- at least two named sources;
- valid source URLs;
- a medical reviewer or administrator for final approval;
- human review notes;
- a complete audit trail.

## Security

Review tables use Row Level Security and are server-only in v1.4.0. The Supabase Secret key remains in the local or deployed server environment and must never be exposed to browsers, GitHub, screenshots, or client-side code.

## Content Engine Integration

The existing Content Engine continues to retrieve `approved` knowledge only. Approving a review request updates the corresponding Knowledge Engine entry with:

- `status = approved`
- `reviewed_by`
- `reviewed_at`

This means topics such as `one-sided-hearing-loss` remain blocked until their evidence and human review requirements are satisfied.
