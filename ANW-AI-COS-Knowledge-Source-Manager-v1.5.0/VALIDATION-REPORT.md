# Validation Report — Knowledge Source Manager v1.5.0

## Validation completed

- Strict TypeScript compilation: PASS
- NodeNext module resolution: PASS
- In-memory demo execution: PASS
- URL canonicalization assertion: PASS
- Private URL rejection assertion: PASS
- Approved-entry review reset assertion: PASS
- Duplicate URL rejection assertion: PASS

## Demo result

```text
entryStatus: draft
sourceCount: 2
validSourceCount: 2
collectionValid: true
firstMutationResetReview: true
reviewedByCleared: true
version: 1.0.2
eventCount: 2
warningCount: 2
```

The two warnings are expected because the demo uses reserved `example.org` test URLs. These fixture URLs must not be used as production medical sources.

## Repository compatibility checked

The module uses the existing ANW AI-COS `KnowledgeEntry` and `KnowledgeSource` fields:

- `knowledge_entries.sources`
- `status`
- `reviewed_by`
- `reviewed_at`
- `version`
- `updated_at`

The migration adds only the immutable `knowledge_source_events` audit table.
