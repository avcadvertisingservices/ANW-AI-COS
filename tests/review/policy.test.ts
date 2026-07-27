import { describe, expect, it } from "vitest";
import { evaluateKnowledgeReviewPolicy } from "../../src/modules/review/policy.js";
import type { KnowledgeRecordSnapshot } from "../../src/modules/review/types.js";

function medicalEntry(
  overrides: Partial<KnowledgeRecordSnapshot> = {},
): KnowledgeRecordSnapshot {
  return {
    id: "knowledge.test",
    slug: "one-sided-hearing-loss",
    title: "One-Sided Hearing Loss",
    summary:
      "One-sided hearing loss affects hearing in one ear and can influence daily listening.",
    body:
      "This educational entry explains the topic in plain language while avoiding diagnosis, prescription, guaranteed outcomes, and individualized medical advice. Personal concerns should be discussed with a qualified healthcare professional.",
    category: "symptom",
    status: "draft",
    tags: ["hearing"],
    keywords: ["one-sided hearing loss"],
    aliases: ["unilateral hearing loss"],
    sources: [],
    medicalReviewRequired: true,
    version: "1.0.0",
    ...overrides,
  };
}

describe("Knowledge review policy", () => {
  it("blocks medical submission when reliable sources are missing", () => {
    const report = evaluateKnowledgeReviewPolicy(medicalEntry());

    expect(report.eligibleForSubmission).toBe(false);
    expect(report.requiresMedicalReviewer).toBe(true);
    expect(report.errors).toContain(
      "This entry requires at least 2 reliable sources before submission.",
    );
  });

  it("allows a sourced medical entry for a medical reviewer", () => {
    const report = evaluateKnowledgeReviewPolicy(
      medicalEntry({
        sources: [
          {
            title: "Source one",
            url: "https://example.org/source-one",
          },
          {
            title: "Source two",
            url: "https://example.org/source-two",
          },
        ],
      }),
      "medical_reviewer",
    );

    expect(report.eligibleForSubmission).toBe(true);
    expect(report.eligibleForApproval).toBe(true);
  });
});
