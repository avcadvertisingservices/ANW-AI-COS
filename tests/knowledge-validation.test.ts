import assert from "node:assert/strict";
import test from "node:test";
import {
  KnowledgeValidationError,
  validateKnowledgeRecord,
  type KnowledgeRecord,
} from "../src/modules/knowledge/index.js";

function makeRecord(overrides: Partial<KnowledgeRecord> = {}): KnowledgeRecord {
  const now = new Date().toISOString();

  return {
    id: "record-001",
    slug: "record-001",
    title: "Test Record",
    summary: "Summary",
    body: "Body",
    category: "faq",
    tags: [],
    status: "draft",
    medicalReviewRequired: true,
    sourceIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

test("valid draft record passes validation", () => {
  assert.doesNotThrow(() => validateKnowledgeRecord(makeRecord()));
});

test("approved record cannot require medical review", () => {
  assert.throws(
    () =>
      validateKnowledgeRecord(
        makeRecord({ status: "approved", medicalReviewRequired: true }),
      ),
    KnowledgeValidationError,
  );
});
