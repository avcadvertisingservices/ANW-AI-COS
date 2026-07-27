import {
  InMemoryKnowledgeApprovalGateway,
  InMemoryKnowledgeReviewRepository,
} from "./in-memory.js";
import { KnowledgeReviewService } from "./service.js";
import type {
  KnowledgeRecordSnapshot,
  ReviewActor,
} from "./types.js";

async function main(): Promise<void> {
  const entry: KnowledgeRecordSnapshot = {
    id: "knowledge.demo.hearing",
    slug: "one-sided-hearing-loss",
    title: "One-Sided Hearing Loss",
    summary:
      "One-sided hearing loss affects hearing in one ear and can influence everyday listening experiences.",
    body:
      "Approved educational content can explain sound-localization challenges, speech understanding in noisy settings, and listening effort without diagnosing any individual. Personal concerns and treatment decisions should be discussed with a qualified healthcare professional.",
    category: "symptom",
    status: "draft",
    tags: ["hearing loss", "acoustic neuroma"],
    keywords: ["one-sided hearing loss", "unilateral hearing loss"],
    aliases: ["single-sided hearing loss"],
    sources: [
      {
        title: "Clinical source one",
        url: "https://example.org/clinical-source-one",
        publisher: "Example Medical Publisher",
      },
      {
        title: "Clinical source two",
        url: "https://example.org/clinical-source-two",
        publisher: "Example Medical Publisher",
      },
    ],
    medicalReviewRequired: true,
    version: "1.0.0",
  };

  const requester: ReviewActor = {
    name: "ANW Editorial Team",
    role: "editorial_reviewer",
  };

  const reviewer: ReviewActor = {
    name: "Demo Medical Reviewer",
    role: "medical_reviewer",
  };

  const reviewRepository =
    new InMemoryKnowledgeReviewRepository();
  const knowledgeGateway =
    new InMemoryKnowledgeApprovalGateway([entry]);
  const service = new KnowledgeReviewService(
    reviewRepository,
    knowledgeGateway,
  );

  const draft = await service.createDraft({
    knowledgeEntryId: entry.id,
    requestedBy: requester,
    submissionNotes: "Ready for medical review.",
  });

  const submitted = await service.submit(
    draft.id,
    requester,
    "Sources and educational wording are ready for review.",
  );

  const inReview = await service.startReview(submitted.id, {
    reviewer,
    notes: "Beginning medical and evidence review.",
  });

  const approved = await service.approve(inReview.id, {
    reviewer,
    notes: "Approved after reviewing the wording and both listed sources.",
  });

  const events = await service.listEvents(draft.id);

  console.log({
    reviewRequestId: approved.request.id,
    requestStatus: approved.request.status,
    knowledgeStatus: approved.knowledgeEntry.status,
    reviewedBy: approved.knowledgeEntry.reviewedBy,
    requiresMedicalReviewer:
      approved.request.policyReport.requiresMedicalReviewer,
    sourceCount: approved.request.policyReport.sourceCount,
    eventCount: events.length,
    events: events.map((event) => event.type),
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
