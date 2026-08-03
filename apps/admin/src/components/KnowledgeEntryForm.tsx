"use client";

import {
  useActionState,
  useMemo,
  useState,
} from "react";

import type {
  KnowledgeEntryActionState,
} from "../app/knowledge/action-state";

export type KnowledgeEntryFormValues = {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  status: string;
  tags: string[];
  keywords: string[];
  aliases: string[];
  sources: unknown[];
  medicalReviewRequired: boolean;
  version: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
};

type KnowledgeEntryFormProps = {
  mode: "create" | "edit";

  action: (
    previousState: KnowledgeEntryActionState,
    formData: FormData,
  ) => Promise<KnowledgeEntryActionState>;

  initialState: KnowledgeEntryActionState;
  initialValues?: KnowledgeEntryFormValues;
};

const emptyValues: KnowledgeEntryFormValues = {
  slug: "",
  title: "",
  summary: "",
  body: "",
  category: "symptom",
  status: "draft",
  tags: [],
  keywords: [],
  aliases: [],
  sources: [],
  medicalReviewRequired: true,
  version: "1.0.0",
};

export default function KnowledgeEntryForm({
  mode,
  action,
  initialState,
  initialValues,
}: KnowledgeEntryFormProps) {
  const values = initialValues ?? emptyValues;

  const [state, formAction, isPending] =
    useActionState(action, initialState);

  const [title, setTitle] = useState(
    values.title,
  );

  const [slug, setSlug] = useState(
    values.slug,
  );

  const [
    slugManuallyEdited,
    setSlugManuallyEdited,
  ] = useState(mode === "edit");

  const sourcesJson = useMemo(
    () =>
      JSON.stringify(
        values.sources,
        null,
        2,
      ),
    [values.sources],
  );

  function handleTitleChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const nextTitle = event.target.value;

    setTitle(nextTitle);

    if (!slugManuallyEdited) {
      setSlug(createSlug(nextTitle));
    }
  }

  return (
    <form
      action={formAction}
      className="space-y-7"
    >
      {values.id ? (
        <input
          type="hidden"
          name="entryId"
          value={values.id}
        />
      ) : null}

      {values.reviewedBy ? (
        <input
          type="hidden"
          name="reviewedBy"
          value={values.reviewedBy}
        />
      ) : null}

      {values.reviewedAt ? (
        <input
          type="hidden"
          name="reviewedAt"
          value={values.reviewedAt}
        />
      ) : null}

      {state.message ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-900">
            Unable to save entry
          </p>

          <p className="mt-1 text-sm text-red-800">
            {state.message}
          </p>
        </div>
      ) : null}

      <section className="grid gap-6 rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-sm lg:grid-cols-2">
        <Field
          label="Title"
          name="title"
          error={state.fieldErrors.title}
        >
          <input
            id="title"
            name="title"
            value={title}
            onChange={handleTitleChange}
            className={inputClasses}
            placeholder="Example: Understanding Balance Problems"
          />
        </Field>

        <Field
          label="Slug"
          name="slug"
          error={state.fieldErrors.slug}
          description="Used in the page URL. Lowercase letters, numbers, and hyphens only."
        >
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugManuallyEdited(true);

              setSlug(
                createSlug(
                  event.target.value,
                ),
              );
            }}
            className={inputClasses}
            placeholder="understanding-balance-problems"
          />
        </Field>

        <Field
          label="Category"
          name="category"
          error={state.fieldErrors.category}
        >
          <select
            id="category"
            name="category"
            defaultValue={values.category}
            className={inputClasses}
          >
            <option value="medical-fact">
              Medical Fact
            </option>

            <option value="symptom">
              Symptom
            </option>

            <option value="diagnosis">
              Diagnosis
            </option>

            <option value="treatment">
              Treatment
            </option>

            <option value="recovery">
              Recovery
            </option>

            <option value="faq">
              FAQ
            </option>

            <option value="survivor-story">
              Survivor Story
            </option>

            <option value="research">
              Research
            </option>

            <option value="glossary">
              Glossary
            </option>

            <option value="resource">
              Resource
            </option>
          </select>
        </Field>

        <Field
          label="Status"
          name="status"
          error={state.fieldErrors.status}
        >
          <select
            id="status"
            name="status"
            defaultValue={values.status}
            className={inputClasses}
          >
            <option value="draft">
              Draft
            </option>

            <option value="submitted">
              Submitted
            </option>

            <option value="in_review">
              In Review
            </option>

            <option value="changes_requested">
              Changes Requested
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="archived">
              Archived
            </option>
          </select>
        </Field>

        <Field
          label="Version"
          name="version"
          error={state.fieldErrors.version}
          description="Use semantic versioning, such as 1.0.0."
        >
          <input
            id="version"
            name="version"
            defaultValue={values.version}
            className={inputClasses}
            placeholder="1.0.0"
          />
        </Field>

        <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <input
            id="medicalReviewRequired"
            name="medicalReviewRequired"
            type="checkbox"
            defaultChecked={
              values.medicalReviewRequired
            }
            className="h-5 w-5 rounded border-slate-300 text-[#0b4d3b]"
          />

          <label
            htmlFor="medicalReviewRequired"
            className="ml-3"
          >
            <span className="block font-semibold text-slate-900">
              Medical review required
            </span>

            <span className="block text-sm text-slate-500">
              Keep enabled for medically
              sensitive content.
            </span>
          </label>
        </div>

        <div className="lg:col-span-2">
          <Field
            label="Summary"
            name="summary"
            error={state.fieldErrors.summary}
          >
            <textarea
              id="summary"
              name="summary"
              defaultValue={values.summary}
              rows={4}
              className={inputClasses}
              placeholder="A concise educational summary."
            />
          </Field>
        </div>

        <div className="lg:col-span-2">
          <Field
            label="Body"
            name="body"
            error={state.fieldErrors.body}
          >
            <textarea
              id="body"
              name="body"
              defaultValue={values.body}
              rows={14}
              className={inputClasses}
              placeholder="Enter the full structured knowledge content."
            />
          </Field>
        </div>

        <Field
          label="Tags"
          name="tags"
          description="Separate multiple values with commas."
        >
          <input
            id="tags"
            name="tags"
            defaultValue={
              values.tags.join(", ")
            }
            className={inputClasses}
            placeholder="hearing loss, symptom, diagnosis"
          />
        </Field>

        <Field
          label="Keywords"
          name="keywords"
          description="Separate multiple values with commas."
        >
          <input
            id="keywords"
            name="keywords"
            defaultValue={
              values.keywords.join(", ")
            }
            className={inputClasses}
            placeholder="unilateral hearing loss, acoustic neuroma"
          />
        </Field>

        <div className="lg:col-span-2">
          <Field
            label="Aliases"
            name="aliases"
            description="Alternative names, separated with commas."
          >
            <input
              id="aliases"
              name="aliases"
              defaultValue={
                values.aliases.join(", ")
              }
              className={inputClasses}
              placeholder="vestibular schwannoma, AN"
            />
          </Field>
        </div>

        <div className="lg:col-span-2">
          <Field
            label="Embedded sources JSON"
            name="sources"
            error={state.fieldErrors.sources}
            description='Use a JSON array. Example: [{"title":"NHS","url":"https://..."}]'
          >
            <textarea
              id="sources"
              name="sources"
              defaultValue={sourcesJson}
              rows={8}
              spellCheck={false}
              className={`${inputClasses} font-mono text-sm`}
            />
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <a
          href="/knowledge"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </a>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[#0b4d3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176b52] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Saving..."
            : mode === "create"
              ? "Create Knowledge Entry"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  description,
  error,
  children,
}: {
  label: string;
  name: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-slate-800"
      >
        {label}
      </label>

      {description ? (
        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      ) : null}

      <div className="mt-2">
        {children}
      </div>

      {error ? (
        <p className="mt-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClasses =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#176b52] focus:ring-4 focus:ring-emerald-100";

function createSlug(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}