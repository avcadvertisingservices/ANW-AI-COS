---
title: "System Architecture"
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
# 03 — System Architecture

## Components

### Public Layer
WordPress, Elementor, SEO, analytics, lead capture.

### Application Layer
Next.js private dashboard, authentication, approval queues, reporting.

### Data Layer
Supabase PostgreSQL, Authentication, Storage where appropriate, Row Level Security.

### Automation Layer
Make.com scenarios; Google Apps Script only for Google Workspace connector tasks.

### Media Layer
Google Drive as primary media library; metadata stored in Supabase.

### AI Layer
Topic intelligence, research assistance, content generation, SEO, repurposing, comment classification, draft replies.

### Source-Control Layer
GitHub for code, migrations, prompts, workflows, and technical documentation.

## Core Flow
Signals → topic scoring → research → content generation → founder review → approval → drafts → publishing → analytics → repurposing → knowledge gaps.

## Tool Responsibilities
- GitHub: technical truth
- Notion: project management
- Supabase: operational truth
- Google Drive: media files
- WordPress: public knowledge
- Make.com: orchestration
