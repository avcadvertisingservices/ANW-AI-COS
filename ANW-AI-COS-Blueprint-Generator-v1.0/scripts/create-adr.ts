import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const [title] = process.argv.slice(2);

if (!title) {
  console.error('Usage: npm run docs:adr -- "Decision Title"');
  process.exit(1);
}

const targetDir = path.resolve("docs/03-architecture-decisions");
await mkdir(targetDir, { recursive: true });

const files = await readdir(targetDir);
const numbers = files
  .map((file) => file.match(/^ADR-(\d{3})-/)?.[1])
  .filter((value): value is string => Boolean(value))
  .map(Number);

const next = String((numbers.length ? Math.max(...numbers) : 0) + 1).padStart(3, "0");
const date = new Date().toISOString().slice(0, 10);
const targetFile = path.join(targetDir, `ADR-${next}-${slugify(title)}.md`);

const content = `---
title: ADR-${next}: ${title}
documentType: Architecture Decision Record
version: 1.0.0
status: Draft
owner: AVC Advertising Services
project: ANW AI-COS
created: ${date}
lastUpdated: ${date}
category: Decision
tags:
  - adr
  - architecture-decision
dependencies: []
relatedDocuments: []
relatedADR: []
---

# ADR-${next}: ${title}

## Status

Proposed

## Context

## Decision

## Alternatives Considered

## Consequences

### Positive

### Negative

## Risks

## Review Date

## Related Modules

## Related Documents
`;

await writeFile(targetFile, content, { encoding: "utf8", flag: "wx" });
console.log(`Created ${targetFile}`);
