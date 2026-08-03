import {
  startMedicalReview,
} from "../app/medical-reviews/review-actions";

type StartMedicalReviewFormProps = {
  reviewRequestId: string;
  knowledgeEntryId: string;
  knowledgeSlug: string | null;
  knowledgeTitle: string;
};

export default function StartMedicalReviewForm({
  reviewRequestId,
  knowledgeEntryId,
  knowledgeSlug,
  knowledgeTitle,
}: StartMedicalReviewFormProps) {
  return (
    <form
      action={startMedicalReview}
      className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5"
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

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
          Reviewer Assignment
        </p>

        <h4 className="mt-2 text-lg font-bold text-blue-950">
          Assign Reviewer and Start Review
        </h4>

        <p className="mt-2 text-sm leading-6 text-blue-900">
          Assign a real medical reviewer to{" "}
          <strong>{knowledgeTitle}</strong>.
          Starting the review changes the request
          status to In Review and adds an immutable
          Review Started event.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Field
          label="Reviewer name"
          name="reviewerName"
          required
        >
          <input
            id={`reviewerName-${reviewRequestId}`}
            name="reviewerName"
            required
            autoComplete="name"
            className={inputClasses}
            placeholder="Dr. Jane Smith"
          />
        </Field>

        <Field
          label="Reviewer role"
          name="reviewerRole"
          required
        >
          <input
            id={`reviewerRole-${reviewRequestId}`}
            name="reviewerRole"
            required
            defaultValue="Medical Reviewer"
            className={inputClasses}
            placeholder="Medical Reviewer"
          />
        </Field>

        <Field
          label="Reviewer email"
          name="reviewerEmail"
        >
          <input
            id={`reviewerEmail-${reviewRequestId}`}
            name="reviewerEmail"
            type="email"
            autoComplete="email"
            className={inputClasses}
            placeholder="reviewer@example.com"
          />
        </Field>

        <div className="lg:col-span-2">
          <Field
            label="Review-start notes"
            name="reviewNotes"
          >
            <textarea
              id={`reviewNotes-${reviewRequestId}`}
              name="reviewNotes"
              rows={4}
              defaultValue="Formal medical review started."
              className={inputClasses}
            />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs leading-5 text-blue-800">
          Do not use a placeholder name. The
          reviewer identity will be preserved in
          the audit timeline.
        </p>

        <button
          type="submit"
          className="rounded-xl bg-[#0b4d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176b52]"
        >
          Assign and Start Review
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  required = false,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-blue-950"
      >
        {label}

        {required ? (
          <span className="ml-1 text-red-700">
            *
          </span>
        ) : null}
      </label>

      <div className="mt-2">
        {children}
      </div>
    </div>
  );
}

const inputClasses =
  "w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#176b52] focus:ring-4 focus:ring-emerald-100";