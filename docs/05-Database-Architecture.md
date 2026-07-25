---
title: "Database Architecture"
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
# 05 — Database Architecture

Supabase PostgreSQL is the master operational database.

## Initial Tables

### topics
`id, title, slug, summary, source_type, source_reference, category_id, priority_score, opportunity_score, status, created_at, updated_at`

### content_items
`id, topic_id, content_type, title, body, hook, call_to_action, platform, status, version, approved_by, approved_at, created_at, updated_at`

### content_sources
`id, topic_id, source_name, source_url, source_type, trust_level, notes, retrieved_at`

### assets
`id, content_item_id, asset_type, drive_file_id, storage_url, filename, rights_status, consent_status, metadata, created_at`

### publishing_jobs
`id, content_item_id, platform, destination, scheduled_at, published_at, status, external_post_id, external_url, error_message`

### analytics
`id, publishing_job_id, views, reach, watch_time_seconds, reactions, comments, shares, saves, clicks, followers_gained, revenue, currency, captured_at`

### community_questions
`id, source_platform, external_reference, question_text, category_id, sensitivity_level, status, topic_created_id, created_at`

### reply_drafts
`id, community_question_id, reply_text, risk_level, requires_human_approval, status, approved_at`

### knowledge_items
`id, title, content, knowledge_type, source_reference, review_status, medical_review_required, last_reviewed_at`

### categories
`id, name, slug, parent_id, description`

## Relationships
A topic has many content items and sources. A content item has many assets and publishing jobs. A publishing job has many analytics snapshots. Community questions can create topics and reply drafts.

## Security
Use Row Level Security, role-based access, audit fields, and least-privilege service accounts.
