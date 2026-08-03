import {
  submitKnowledgeForReview,
} from "../app/knowledge/review-actions";

type SubmitForReviewFormProps = {
  entryId: string;
  slug: string;
  title: string;
  knowledgeStatus: string;
  reviewStatus: string | null;
};

const activeStatuses = new Set([
  "draft",
  "submitted",
  "in_review",
  "changes_requested",
]);

export default function SubmitForReviewForm({
  entryId,
  slug,
  title,
  knowledgeStatus,
  reviewStatus,
}: SubmitForReviewFormProps) {
  const normalizedReviewStatus =
    reviewStatus
      ?.trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_") ??
    null;

  const hasActiveReview =
    normalizedReviewStatus !== null &&
    activeStatuses.has(
      normalizedReviewStatus,
    );

  const normalizedKnowledgeStatus =
    knowledgeStatus
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

  const cannotSubmit =
    hasActiveReview ||
    normalizedKnowledgeStatus ===
      "approved" ||
    normalizedKnowledgeStatus ===
      "archived";

  if (hasActiveReview) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <p className="font-semibold text-blue-900">
          Medical review already active
        </p>

        <p className="mt-2 text-sm leading-6 text-blue-800">
          This knowledge entry already has an
          active review request with status{" "}
          <strong>
            {formatLabel(
              normalizedReviewStatus ??
                "submitted",
            )}
          </strong>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      action={
        submitKnowledgeForReview
      }
      className="rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-sm lg:p-8"
    >
      <input
        type="hidden"
        name="entryId"
        value={entryId}
      />

      <input
        type="hidden"
        name="slug"
        value={slug}
      />

      <input
        type="hidden"
        name="title"
        value={title}
      />

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b52]">
        Medical Governance
      </p>

      <h3 className="mt-2 text-2xl font-bold">
        Submit for Medical Review
      </h3>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
        Submitting creates a formal review request,
        records an audit event, and changes the
        knowledge status to Submitted.
      </p>

      <label
        htmlFor="submissionNotes"
        className="mt-6 block text-sm font-semibold text-slate-800"
      >
        Submission notes
      </label>

      <textarea
        id="submissionNotes"
        name="submissionNotes"
        rows={4}
        defaultValue="This knowledge entry is ready for formal medical review."
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#176b52] focus:ring-4 focus:ring-emerald-100"
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          The request will appear in Medical
          Reviews after submission.
        </p>

        <button
          type="submit"
          disabled={cannotSubmit}
          className="rounded-xl bg-[#0b4d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176b52] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit for Medical Review
        </button>
      </div>
    </form>
  );
}

function formatLabel(
  value: string,
): string {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}