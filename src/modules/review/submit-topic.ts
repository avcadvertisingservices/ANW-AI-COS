import "dotenv/config";

import {
  createSupabaseKnowledgeReviewService,
} from "./factory.js";

import {
  createActorFromEnvironment,
  optionalEnvironmentValue,
  requiredEnvironmentValue,
} from "./cli-utils.js";

async function main(): Promise<void> {
  const topicSlug =
    requiredEnvironmentValue(
      "REVIEW_TOPIC_SLUG",
    );

  const requestedBy =
    createActorFromEnvironment(
      "REVIEW_ACTOR",
      "editorial_reviewer",
    );

  const submissionNotes =
    optionalEnvironmentValue(
      "REVIEW_SUBMISSION_NOTES",
    ) ??
    `Submitting ${topicSlug} for formal knowledge review.`;

  const service =
    createSupabaseKnowledgeReviewService();

  /*
   * Do not pass the editorial requester's role here.
   *
   * Submission eligibility checks the knowledge entry,
   * source requirements, and review requirements.
   * The medical-reviewer role is checked later during
   * the actual approval step.
   */
  const evaluation =
    await service.evaluateBySlug(
      topicSlug,
    );

  if (
    !evaluation.policy.eligibleForSubmission
  ) {
    throw new Error(
      [
        `"${topicSlug}" is not eligible for submission.`,
        ...evaluation.policy.errors,
      ].join("\n"),
    );
  }

  const draft =
    await service.createDraft({
      knowledgeEntryId:
        evaluation.entry.id,

      requestedBy,

      submissionNotes,
    });

  const submitted =
    await service.submit(
      draft.id,
      requestedBy,
      submissionNotes,
    );

  console.log({
    reviewRequestId: submitted.id,

    knowledgeEntryId:
      submitted.knowledgeEntryId,

    knowledgeSlug:
      submitted.knowledgeSlug,

    knowledgeTitle:
      submitted.knowledgeTitle,

    requestStatus:
      submitted.status,

    requestedBy:
      submitted.requestedBy.name,

    requesterRole:
      submitted.requestedBy.role,

    submittedAt:
      submitted.submittedAt,

    sourceCount:
      submitted.policyReport.sourceCount,

    requiresMedicalReviewer:
      submitted.policyReport
        .requiresMedicalReviewer,

    nextAction:
      "Copy reviewRequestId, then run npm run review:start.",
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});