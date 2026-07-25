# Sprint 06 — Knowledge Engine v1.0

## Purpose

The Knowledge Engine creates a controlled, searchable source of truth for ANW AI-COS.

## Included

- Typed knowledge records and sources
- Draft/review/approved/archive lifecycle
- Medical-review safeguard
- Repository abstraction
- In-memory repository for development and tests
- Search, category, tag, and status filtering
- JSON dataset loader
- Automated tests
- Safe data template

## Safety boundary

This sprint does not add medical claims. It provides the system that will hold content after sourcing and review.

Medical education must remain separate from:
- Personal stories
- Community comments
- AI-generated drafts
- Unverified summaries

Only approved knowledge should be available to public-content generators.

## Next planned integration

The in-memory repository will later be replaced with a Supabase repository using the same interface.
