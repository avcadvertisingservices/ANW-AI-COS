import "dotenv/config";

import {
  createSupabaseKnowledgeReviewService,
} from "./factory.js";

import {
  createActorFromEnvironment,
  requiredEnvironmentValue,
  requireMinimumLength,
} from "./cli-utils.js";

const requiredAttestation =
  "I CONFIRM I COMPLETED THE REQUIRED REVIEW";

async function main(): Promise<void> {
  const reviewRequestId =
    requiredEnvironmentValue(
      "REVIEW_REQUEST_ID",
    );

  const reviewer =
    createActorFromEnvironment(
      "REVIEWER",
    );

  const notes =
    requireMinimumLength(
      requiredEnvironmentValue(
        "REVIEW_NOTES",
      ),
      10,
      "REVIEW_NOTES",
    );

  const attestation =
    requiredEnvironmentValue(
      "REVIEWER_ATTESTATION",
    );

  if (attestation !== requiredAttestation) {
    throw new Error(
      [
        "Approval attestation is missing or incorrect.",
        "After the real human review is complete, set:",
        `REVIEWER_ATTESTATION=${requiredAttestation}`,
      ].join("\n"),
    );
  }

  const service =
    createSupabaseKnowledgeReviewService();

  const existing =
    await service.getRequest(
      reviewRequestId,
    );

  if (!existing) {
    throw new Error(
      `Review request ${reviewRequestId} was not found.`,
    );
  }

  if (
    existing.assignedReviewer?.name &&
    existing.assignedReviewer.name !==
      reviewer.name
  ) {
    throw new Error(
      [
        "The approval reviewer does not match the assigned reviewer.",
        `Assigned: ${existing.assignedReviewer.name}`,
        `Provided: ${reviewer.name}`,
      ].join("\n"),
    );
  }

  const result =
    await service.approve(
      reviewRequestId,
      {
        reviewer,
        notes,
      },
    );

  const events =
    await service.listEvents(
      reviewRequestId,
    );

  console.log({
    reviewRequestId:
      result.request.id,
    requestStatus:
      result.request.status,
    knowledgeEntryId:
      result.knowledgeEntry.id,
    knowledgeSlug:
      result.knowledgeEntry.slug,
    knowledgeStatus:
      result.knowledgeEntry.status,
    reviewedBy:
      result.knowledgeEntry.reviewedBy,
    reviewedAt:
      result.knowledgeEntry.reviewedAt,
    reviewerRole:
      result.request.assignedReviewer
        ?.role,
    eventCount: events.length,
    events: events.map(
      (event) => event.type,
    ),
    nextAction:
      "Run npm run review:check-topic, then test content generation.",
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});