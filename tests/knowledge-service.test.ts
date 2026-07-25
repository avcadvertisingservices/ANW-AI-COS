import assert from "node:assert/strict";
import test from "node:test";
import {
  createKnowledgeService,
  type KnowledgeRecord,
} from "../src/modules/knowledge/index.js";

const now = new Date().toISOString();

const records: KnowledgeRecord[] = [
  {
    id: "approved-001",
    slug: "approved-record",
    title: "Approved Knowledge Record",
    summary: "Searchable approved content",
    body: "A safe test record",
    category: "glossary",
    tags: ["search"],
    status: "approved",
    medicalReviewRequired: false,
    sourceIds: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "draft-001",
    slug: "draft-record",
    title: "Draft Knowledge Record",
    summary: "Searchable draft content",
    body: "A safe draft test record",
    category: "glossary",
    tags: ["search"],
    status: "draft",
    medicalReviewRequired: true,
    sourceIds: [],
    createdAt: now,
    updatedAt: now,
  },
];

test("approved search excludes draft records", async () => {
  const service = createKnowledgeService(records);
  const results = await service.searchApproved({ text: "searchable" });

  assert.equal(results.length, 1);
  assert.equal(results[0]?.record.id, "approved-001");
});
