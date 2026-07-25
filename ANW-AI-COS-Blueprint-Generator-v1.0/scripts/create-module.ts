import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const [name, category = "general"] = process.argv.slice(2);

if (!name) {
  console.error('Usage: npm run docs:module -- "Module Name" category');
  process.exit(1);
}

const slug = slugify(name);
const date = new Date().toISOString().slice(0, 10);
const targetDir = path.resolve("docs/02-module-encyclopedia");
const targetFile = path.join(targetDir, `${slug}.md`);

const content = `---
title: ${name}
documentType: Module Specification
version: 1.0.0
status: Draft
owner: AVC Advertising Services
project: ANW AI-COS
created: ${date}
lastUpdated: ${date}
nextReview:
category: ${category}
tags:
  - module
  - ${slug}
dependencies: []
relatedDocuments: []
relatedADR: []
---

# ${name}

## 1. Executive Summary
## 2. Purpose
## 3. Responsibilities
## 4. Scope
## 5. Functional Requirements
## 6. Non-Functional Requirements
## 7. Inputs
## 8. Outputs
## 9. Public API
## 10. Internal Components
## 11. Dependencies
## 12. Configuration
## 13. Error Handling
## 14. Logging and Observability
## 15. Security and Privacy
## 16. Performance
## 17. Testing
## 18. Examples
## 19. Future Roadmap
## 20. Revision History
`;

await mkdir(targetDir, { recursive: true });
await writeFile(targetFile, content, { encoding: "utf8", flag: "wx" });
console.log(`Created ${targetFile}`);
