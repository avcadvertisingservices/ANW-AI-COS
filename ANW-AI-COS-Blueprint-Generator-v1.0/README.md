# ANW AI-COS Blueprint Generator v1.0

This pack installs the documentation infrastructure for **ANW AI-COS Enterprise Edition**.

## What it creates

- Governance and Constitution documents
- Enterprise Blueprint
- Module Encyclopedia
- ADR Library
- Engineering, API, Database, Workflow, Testing, Operations, and Release handbooks
- Standard templates and review checklists
- AI-friendly metadata
- Generator commands for new modules and ADRs
- Documentation validation

## Install

Copy this pack into the root of the `ANW-AI-COS` repository, then run:

```bash
npm install
npm run docs:init
npm run docs:check
```

## Create a new module document

```bash
npm run docs:module -- "Carousel Engine" content
```

## Create a new ADR

```bash
npm run docs:adr -- "Standard Carousel Format"
```

## Documentation principles

1. Documentation first.
2. Human safety first.
3. Medical content requires review.
4. GitHub is the source of truth.
5. Every major architectural decision receives an ADR.
6. Every engine receives a module specification.
7. Documentation changes are reviewed with code changes.
