import { describe, expect, it } from "vitest";
import {
  createKnowledgeEntry,
  validateKnowledgeEntry,
} from "../../src/modules/knowledge/index.js";

describe("Knowledge validation", () => {
  it("accepts a valid draft entry", () => {
    const entry = createKnowledgeEntry({
      id: "knowledge.test.entry",
      slug: "test-entry",
      title: "Test Entry",
      summary: "This is a valid test summary.",
      body: "This is a valid test body containing enough detail.",
      category: "medical-fact",
    });

    expect(() => validateKnowledgeEntry(entry)).not.toThrow();
  });

  it("rejects approved medical knowledge without review metadata", () => {
    const entry = createKnowledgeEntry({
      id: "knowledge.test.approved",
      slug: "approved-entry",
      title: "Approved Entry",
      summary: "This is a valid approved summary.",
      body: "This is a valid approved body containing enough detail.",
      category: "medical-fact",
      status: "approved",
      medicalReviewRequired: true,
    });

    expect(() => validateKnowledgeEntry(entry)).toThrow(
      "Approved medical knowledge requires reviewedBy and reviewedAt.",
    );
  });
});
