import { describe, expect, it } from "vitest";
import {
  InMemoryKnowledgeApprovalGateway,
  InMemoryKnowledgeReviewRepository,
} from "../../src/modules/review/in-memory.js";
import { KnowledgeReviewService } from "../../src/modules/review/service.js";
import type {
  KnowledgeRecordSnapshot,
  ReviewActor,
} from "../../src/modules/review/types.js";

const requester: ReviewActor = {
  name: "ANW Editorial Team",
  role: "editorial_reviewer",
};

const medicalReviewer: ReviewActor = {
  name: "Medical Reviewer",
  role: "medical_reviewer",
};

const editorialReviewer: ReviewActor = {
  name: "Editorial Reviewer",
  role: "editorial_reviewer",
};

function sourcedEntry(): KnowledgeRecordSnapshot {
  return {
    id: "knowledge.hearing",
    slug: "one-sided-hearing-loss",
    title: "One-Sided Hearing Loss",
    summary:
      "One-sided hearing loss affects hearing in one ear and can influence daily listening situations.",
    body:
      "This reviewed educational entry explains sound-localization challenges, speech understanding in noise, and listening effort without diagnosing an individual or prescribing a treatment. Personal decisions belong with a qualified healthcare professional.",
    category: "symptom",
    status: "draft",
    tags: ["hearing"],
    keywords: ["one-sided hearing loss"],
    aliases: ["unilateral hearing loss"],
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
    medicalReviewRequired: true,
    version: "1.0.0",
  };
}

function serviceFor(entry: KnowledgeRecordSnapshot) {
  return new KnowledgeReviewService(
    new InMemoryKnowledgeReviewRepository(),
    new InMemoryKnowledgeApprovalGateway([entry]),
  );
}

describe("Knowledge review workflow", () => {
  it("moves a sourced medical entry through approval with an audit trail", async () => {
    const service = serviceFor(sourcedEntry());

    const draft = await service.createDraft({
      knowledgeEntryId: "knowledge.hearing",
      requestedBy: requester,
    });

    const submitted = await service.submit(draft.id, requester);
    const inReview = await service.startReview(submitted.id, {
      reviewer: medicalReviewer,
    });

    const approved = await service.approve(inReview.id, {
      reviewer: medicalReviewer,
      notes: "Approved after reviewing the educational wording and sources.",
    });

    const events = await service.listEvents(draft.id);

    expect(approved.request.status).toBe("approved");
    expect(approved.knowledgeEntry.status).toBe("approved");
    expect(approved.knowledgeEntry.reviewedBy).toBe(
      "Medical Reviewer",
    );
    expect(events.map((event) => event.type)).toEqual([
      "draft_created",
      "submitted",
      "review_started",
      "approved",
    ]);
  });

  it("prevents an editorial reviewer from approving a medical entry", async () => {
    const service = serviceFor(sourcedEntry());
    const draft = await service.createDraft({
      knowledgeEntryId: "knowledge.hearing",
      requestedBy: requester,
    });
    const submitted = await service.submit(draft.id, requester);
    const inReview = await service.startReview(submitted.id, {
      reviewer: editorialReviewer,
    });

    await expect(
      service.approve(inReview.id, {
        reviewer: editorialReviewer,
        notes: "Editorial wording is clear, but this is not a medical approval.",
      }),
    ).rejects.toMatchObject({
      code: "REVIEW_APPROVAL_POLICY_FAILED",
    });
  });
});
