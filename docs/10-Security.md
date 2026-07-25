---
title: "Security"
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
# 10 — Security Model

## Principles
Least privilege, privacy by design, data minimization, defense in depth, secure defaults, auditable approvals, and separation of public/private data.

## Controls
- MFA on GitHub, WordPress, Supabase, Google, Make.com, and Notion
- Protected `main` branch
- Environment variables for secrets
- Supabase Row Level Security
- Separate development and production credentials
- Backups, logging, audit trails
- Restricted service-role keys
- Consent tracking for community stories and media
- No private medical details in public repositories

## Data Classes
Public, Internal, Confidential, Sensitive Community Data.

## Medical Safety
Medical educational content requires appropriate sources and disclaimers. The system must not diagnose, prescribe, or present AI text as individualized medical advice.
