---
title: "Knowledge Entries Table"
documentType: "Database Specification"
version: "1.1.0"
status: "Active"
owner: "AVC Advertising Services"
project: "ANW AI-COS"
category: "Database"
tags:
  - "supabase"
  - "knowledge"
  - "rls"
dependencies:
  - "Knowledge Engine"
---

# Knowledge Entries Table

## Purpose

`public.knowledge_entries` stores controlled ANW AI-COS knowledge records.

## Security Model

Version 1.1 is server-administration only.

- RLS is enabled.
- `anon` has no table access.
- `authenticated` has no table access.
- Administrative operations use a server-only Supabase service-role client.
- The service-role key must never be included in browser code, public repositories, screenshots, or client environment variables.

## Review Guard

The database rejects an approved medical record unless `reviewed_by` and `reviewed_at` are present.

## Future Security Work

A later release may add authenticated reviewer roles and explicit RLS policies after Supabase Auth and organization membership are implemented.
