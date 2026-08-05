"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  startMedicalReview,
} from "../app/medical-reviews/review-actions";

type StartMedicalReviewFormProps = {
  reviewRequestId: string;
  knowledgeEntryId: string;
  knowledgeSlug: string | null;
  knowledgeTitle: string;
};

type ReviewStartDraft = {
  reviewerName: string;
  reviewerRole: string;
  reviewerEmail: string;
  reviewNotes: string;
};

const storagePrefix =
  "anw-medical-review-start-draft";

const defaultDraft: ReviewStartDraft = {
  reviewerName: "",
  reviewerRole: "Medical Reviewer",
  reviewerEmail: "",
  reviewNotes:
    "Formal medical review started.",
};

export default function StartMedicalReviewForm({
  reviewRequestId,
  knowledgeEntryId,
  knowledgeSlug,
  knowledgeTitle,
}: StartMedicalReviewFormProps) {
  const storageKey =
    `${storagePrefix}-${reviewRequestId}`;

  const [
    formValues,
    setFormValues,
  ] = useState<ReviewStartDraft>(
    defaultDraft,
  );

  const [
    hasLoadedDraft,
    setHasLoadedDraft,
  ] = useState(false);

  useEffect(() => {
    try {
      const savedDraft =
        window.sessionStorage.getItem(
          storageKey,
        );

      if (savedDraft) {
        const parsedDraft =
          JSON.parse(
            savedDraft,
          ) as Partial<ReviewStartDraft>;

        setFormValues({
          reviewerName:
            typeof parsedDraft.reviewerName ===
            "string"
              ? parsedDraft.reviewerName
              : "",

          reviewerRole:
            typeof parsedDraft.reviewerRole ===
              "string" &&
            parsedDraft.reviewerRole.trim()
              .length > 0
              ? parsedDraft.reviewerRole
              : "Medical Reviewer",

          reviewerEmail:
            typeof parsedDraft.reviewerEmail ===
            "string"
              ? parsedDraft.reviewerEmail
              : "",

          reviewNotes:
            typeof parsedDraft.reviewNotes ===
              "string" &&
            parsedDraft.reviewNotes.trim()
              .length > 0
              ? parsedDraft.reviewNotes
              : "Formal medical review started.",
        });
      }
    } catch {
      setFormValues(defaultDraft);
    } finally {
      setHasLoadedDraft(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoadedDraft) {
      return;
    }

    try {
      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify(formValues),
      );
    } catch {
      // The form remains usable when storage
      // is unavailable.
    }
  }, [
    formValues,
    hasLoadedDraft,
    storageKey,
  ]);

  function updateField(
    field: keyof ReviewStartDraft,
    value: string,
  ) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  const reviewerNameIsValid =
    formValues.reviewerName.trim().length >=
    2;

  const reviewerRoleIsValid =
    formValues.reviewerRole.trim().length >=
    2;

  const canSubmit =
    reviewerNameIsValid &&
    reviewerRoleIsValid;

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
          inputId={`reviewerName-${reviewRequestId}`}
          required
        >
          <input
            id={`reviewerName-${reviewRequestId}`}
            name="reviewerName"
            required
            minLength={2}
            autoComplete="name"
            value={formValues.reviewerName}
            onChange={(event) => {
              updateField(
                "reviewerName",
                event.target.value,
              );
            }}
            className={inputClasses}
            placeholder="Dr. Jane Smith"
          />
        </Field>

        <Field
          label="Reviewer role"
          inputId={`reviewerRole-${reviewRequestId}`}
          required
        >
          <input
            id={`reviewerRole-${reviewRequestId}`}
            name="reviewerRole"
            required
            minLength={2}
            value={formValues.reviewerRole}
            onChange={(event) => {
              updateField(
                "reviewerRole",
                event.target.value,
              );
            }}
            className={inputClasses}
            placeholder="Medical Reviewer"
          />
        </Field>

        <Field
          label="Reviewer email"
          inputId={`reviewerEmail-${reviewRequestId}`}
        >
          <input
            id={`reviewerEmail-${reviewRequestId}`}
            name="reviewerEmail"
            type="email"
            autoComplete="email"
            value={formValues.reviewerEmail}
            onChange={(event) => {
              updateField(
                "reviewerEmail",
                event.target.value,
              );
            }}
            className={inputClasses}
            placeholder="reviewer@example.com"
          />
        </Field>

        <div className="lg:col-span-2">
          <Field
            label="Review-start notes"
            inputId={`reviewNotes-${reviewRequestId}`}
          >
            <textarea
              id={`reviewNotes-${reviewRequestId}`}
              name="reviewNotes"
              rows={4}
              value={formValues.reviewNotes}
              onChange={(event) => {
                updateField(
                  "reviewNotes",
                  event.target.value,
                );
              }}
              className={inputClasses}
              placeholder="Add notes about the start of this medical-review cycle."
            />
          </Field>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs leading-5 text-blue-800">
              The reviewer identity and these notes
              will be recorded in the permanent
              audit timeline.
            </p>

            <p className="text-xs font-medium text-blue-700">
              {
                formValues.reviewNotes.trim()
                  .length
              }{" "}
              characters
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          Use a genuine reviewer identity
        </p>

        <p className="mt-1 text-xs leading-5 text-amber-800">
          Do not enter values such as “Reviewer
          Name,” “Test Reviewer,” “Placeholder,” or
          “Your Medical Reviewer Name.” Placeholder
          reviewers cannot record a medical-review
          decision.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs leading-5 text-blue-800">
          <p>
            Reviewer name:{" "}
            <strong>
              {reviewerNameIsValid
                ? "Ready"
                : "Required"}
            </strong>
          </p>

          <p>
            Reviewer role:{" "}
            <strong>
              {reviewerRoleIsValid
                ? "Ready"
                : "Required"}
            </strong>
          </p>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-[#0b4d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176b52] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Assign and Start Review
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  inputId,
  required = false,
  children,
}: {
  label: string;
  inputId: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={inputId}
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