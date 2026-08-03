import {
  decideMedicalReview,
} from "../app/medical-reviews/review-actions";

type MedicalReviewDecisionFormProps = {
  reviewRequestId: string;
  knowledgeEntryId: string;
  knowledgeSlug: string | null;
  knowledgeTitle: string;
  reviewerName: string | null;
};

export default function MedicalReviewDecisionForm({
  reviewRequestId,
  knowledgeEntryId,
  knowledgeSlug,
  knowledgeTitle,
  reviewerName,
}: MedicalReviewDecisionFormProps) {
  return (
    <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
          Medical Review Decision
        </p>

        <h4 className="mt-2 text-lg font-bold text-violet-950">
          Record the reviewer’s decision
        </h4>

        <p className="mt-2 text-sm leading-6 text-violet-900">
          Complete the medical review for{" "}
          <strong>{knowledgeTitle}</strong>.
          Every decision requires notes and creates
          a permanent audit event.
        </p>

        <div className="mt-4 rounded-xl bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Assigned reviewer
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {reviewerName ?? "Reviewer unavailable"}
          </p>
        </div>
      </div>

      <form
        action={decideMedicalReview}
        className="mt-5"
      >
        <input
          type="hidden"
          name="reviewRequestId"
          value={reviewRequestId}
        />

        <input
          type="hidden"
          name="knowledgeEntryId"
          value={knowledgeEntryId}
        />

        <input
          type="hidden"
          name="knowledgeSlug"
          value={knowledgeSlug ?? ""}
        />

        <label
          htmlFor={`decisionNotes-${reviewRequestId}`}
          className="text-sm font-semibold text-violet-950"
        >
          Decision notes
          <span className="ml-1 text-red-700">
            *
          </span>
        </label>

        <textarea
          id={`decisionNotes-${reviewRequestId}`}
          name="decisionNotes"
          rows={5}
          required
          minLength={10}
          placeholder="Explain the medical-review decision, corrections required, approval basis, or rejection reason."
          className="mt-2 w-full rounded-xl border border-violet-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#176b52] focus:ring-4 focus:ring-emerald-100"
        />

        <p className="mt-2 text-xs leading-5 text-violet-800">
          Minimum 10 characters. These notes will
          appear in the permanent review timeline.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <button
            type="submit"
            name="decision"
            value="changes_requested"
            className="rounded-xl border border-amber-300 bg-amber-100 px-5 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-200"
          >
            Request Changes
          </button>

          <button
            type="submit"
            name="decision"
            value="approved"
            className="rounded-xl bg-[#0b4d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176b52]"
          >
            Approve
          </button>

          <button
            type="submit"
            name="decision"
            value="rejected"
            className="rounded-xl border border-red-300 bg-red-100 px-5 py-3 text-sm font-semibold text-red-900 transition hover:bg-red-200"
          >
            Reject
          </button>
        </div>

        <div className="mt-5 grid gap-3 text-xs leading-5 text-slate-600 lg:grid-cols-3">
          <div className="rounded-xl bg-white/70 p-4">
            <p className="font-semibold text-amber-900">
              Request Changes
            </p>

            <p className="mt-1">
              Returns the knowledge entry to Draft
              and records required corrections.
            </p>
          </div>

          <div className="rounded-xl bg-white/70 p-4">
            <p className="font-semibold text-emerald-900">
              Approve
            </p>

            <p className="mt-1">
              Marks the knowledge entry Approved
              and records the reviewer and approval
              timestamp.
            </p>
          </div>

          <div className="rounded-xl bg-white/70 p-4">
            <p className="font-semibold text-red-900">
              Reject
            </p>

            <p className="mt-1">
              Closes the review as Rejected and
              returns the knowledge entry to Draft.
            </p>
          </div>
        </div>
      </form>
    </section>
  );
}