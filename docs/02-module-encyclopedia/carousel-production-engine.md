---
title: "Carousel Production Engine"
documentType: "Module Specification"
version: "1.0.0"
status: "Active"
owner: "AVC Advertising Services"
project: "ANW AI-COS"
category: "Content Production"
tags:
  - "carousel"
  - "canva"
  - "design-system"
  - "medical-review"
dependencies:
  - "AI Content Engine"
  - "Supabase"
---

# Carousel Production Engine

## Purpose

The Carousel Production Engine converts an AI Content Engine carousel into a design-ready production package without silently rewriting or deleting medical copy.

## Outputs

- Structured JSON manifest
- Canva Bulk Create CSV
- Human-readable storyboard
- Per-slide image-generation prompts
- Per-slide copy JSON
- Consistent image filenames
- Quality and review report

## Supported Formats

- 9:16 — default ANW vertical carousel and reel-slide format
- 4:5 — feed portrait
- 1:1 — square

## Default Brand System

- Dark emerald green, white, cream, and soft sage
- Serif-led titles
- Clean medical iconography
- Official ANW shield logo
- Small acousticneuromawarrior.com branding
- Mission message: You Are Not Alone.

## Safety

The engine does not treat generated medical content as approved. It preserves the source copy, flags text overflow, requires alt text, keeps medical-review indicators, and requires human review before publication.

## Canva Integration Boundary

Version 1.0 creates a Canva Bulk Create CSV and design specifications. Direct Canva API template population is intentionally deferred until the template IDs, field names, and Canva integration method are approved.
