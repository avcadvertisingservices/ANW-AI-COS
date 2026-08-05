import {
  resubmitKnowledgeForReview,
} from "../app/knowledge/review-actions";

type ResubmitForReviewFormProps = {
  entryId: string;
  slug: string;
  title: string;
  knowledgeStatus: string;
  reviewStatus: string | null;
};

export default function ResubmitForReviewForm({
  entryId,
  slug,
  title,
  knowledgeStatus,
  reviewStatus,
}: ResubmitForReviewFormProps) {
  const normalizedKnowledgeStatus =
    normalizeStatus(knowledgeStatus);

  const normalizedReviewStatus =
    reviewStatus
      ? normalizeStatus(reviewStatus)
      : null;

  const canResubmit =
    normalizedKnowledgeStatus === "draft" &&
    normalizedReviewStatus ===
      "changes_requested";

  if (!canResubmit) {
    return null;
  }

  return (
    <form
      action={resubmitKnowledgeForReview}
      className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm lg:p-8"
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

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
        Corrections Completed
      </p>

      <h3 className="mt-2 text-2xl font-bold text-amber-950">
        Resubmit for Medical Review
      </h3>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-amber-900">
        This entry previously received a
        Changes Requested decision. Confirm that
        the requested corrections were completed
        before returning it to the medical-review
        queue.
      </p>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-white/70 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Knowledge status
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {formatLabel(
                normalizedKnowledgeStatus,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Review status
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {formatLabel(
                normalizedReviewStatus ??
                  "not_submitted",
              )}
            </p>
          </div>
        </div>
      </div>

      <label
        htmlFor={`resubmissionNotes-${entryId}`}
        className="mt-6 block text-sm font-semibold text-amber-950"
      >
        Resubmission notes
        <span className="ml-1 text-red-700">
          *
        </span>
      </label>

      <textarea
        id={`resubmissionNotes-${entryId}`}
        name="resubmissionNotes"
        rows={5}
        required
        minLength={10}
        defaultValue="The requested corrections have been completed. This knowledge entry is ready for another medical review."
        className="mt-2 w-full rounded-xl border border-amber-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#176b52] focus:ring-4 focus:ring-emerald-100"
      />

      <p className="mt-2 text-xs leading-5 text-amber-800">
        These notes will be saved in the permanent
        audit timeline as a Resubmitted event.
      </p>

      <div className="mt-5 rounded-2xl bg-white/70 p-4 text-sm leading-6 text-slate-700">
        <p className="font-semibold text-slate-900">
          What happens after resubmission
        </p>

        <p className="mt-2">
          The existing review request will return
          to Submitted, the knowledge entry will
          return to Review, and the assigned
          reviewer will remain linked to the
          request.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs leading-5 text-amber-800">
          The reviewer must start the new review
          cycle again before recording another
          decision.
        </p>

        <button
          type="submit"
          className="rounded-xl bg-[#0b4d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176b52]"
        >
          Resubmit for Medical Review
        </button>
      </div>
    </form>
  );
}

function normalizeStatus(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
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