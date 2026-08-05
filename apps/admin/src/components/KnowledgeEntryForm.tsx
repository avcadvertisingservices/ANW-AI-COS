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
  id: string;
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
  reviewedBy: string | null;
  reviewedAt: string | null;
};

type KnowledgeEntryAction = (
  previousState: KnowledgeEntryActionState,
  formData: FormData,
) => Promise<KnowledgeEntryActionState>;

type KnowledgeEntryFormProps = {
  action: KnowledgeEntryAction;
  initialState: KnowledgeEntryActionState;
  initialValues?: Partial<KnowledgeEntryFormValues>;
  mode?: "create" | "edit";
  submitLabel?: string;
};

const defaultValues: KnowledgeEntryFormValues = {
  id: "",
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
  reviewedBy: null,
  reviewedAt: null,
};

const categoryOptions = [
  {
    value: "medical-fact",
    label: "Medical Fact",
  },
  {
    value: "symptom",
    label: "Symptom",
  },
  {
    value: "diagnosis",
    label: "Diagnosis",
  },
  {
    value: "treatment",
    label: "Treatment",
  },
  {
    value: "recovery",
    label: "Recovery",
  },
  {
    value: "faq",
    label: "FAQ",
  },
  {
    value: "survivor-story",
    label: "Survivor Story",
  },
  {
    value: "research",
    label: "Research",
  },
  {
    value: "glossary",
    label: "Glossary",
  },
  {
    value: "resource",
    label: "Resource",
  },
];

const statusOptions = [
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "review",
    label: "Review",
  },
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "archived",
    label: "Archived",
  },
];

export default function KnowledgeEntryForm({
  action,
  initialState,
  initialValues,
  mode = "create",
  submitLabel,
}: KnowledgeEntryFormProps) {
  const values =
    useMemo<KnowledgeEntryFormValues>(
      () => ({
        ...defaultValues,
        ...initialValues,

        tags: Array.isArray(
          initialValues?.tags,
        )
          ? initialValues.tags
          : [],

        keywords: Array.isArray(
          initialValues?.keywords,
        )
          ? initialValues.keywords
          : [],

        aliases: Array.isArray(
          initialValues?.aliases,
        )
          ? initialValues.aliases
          : [],

        sources: Array.isArray(
          initialValues?.sources,
        )
          ? initialValues.sources
          : [],
      }),
      [initialValues],
    );

  const [title, setTitle] = useState(
    values.title,
  );

  const [slug, setSlug] = useState(
    values.slug,
  );

  const [
    slugWasEdited,
    setSlugWasEdited,
  ] = useState(
    values.slug.length > 0,
  );

  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    action,
    initialState,
  );

  const resolvedSubmitLabel =
    submitLabel ??
    (mode === "edit"
      ? "Save Changes"
      : "Create Knowledge Entry");

  function handleTitleChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const nextTitle =
      event.target.value;

    setTitle(nextTitle);

    if (!slugWasEdited) {
      setSlug(
        createSlug(nextTitle),
      );
    }
  }

  function handleSlugChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const nextSlug =
      sanitizeSlug(
        event.target.value,
      );

    setSlug(nextSlug);
    setSlugWasEdited(true);
  }

  function generateSlugFromTitle() {
    setSlug(
      createSlug(title),
    );

    setSlugWasEdited(true);
  }

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-sm lg:p-8"
    >
      {/*
       * Required by updateKnowledgeEntry.
       * The edit page must include entry.id
       * inside initialValues.
       */}
      {values.id ? (
        <input
          type="hidden"
          name="id"
          value={values.id}
        />
      ) : null}

      {state?.message ? (
        <div
          className={
            state.success
              ? "mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
              : "mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900"
          }
        >
          <p className="font-semibold">
            {state.success
              ? "Saved successfully"
              : mode === "edit"
                ? "Unable to update entry"
                : "Unable to save entry"}
          </p>

          <p className="mt-1 break-words text-sm">
            {state.message}
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <FormField
          label="Title"
          htmlFor="title"
          required
          error={getFieldError(
            state,
            "title",
          )}
        >
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={
              handleTitleChange
            }
            required
            autoComplete="off"
            placeholder="Example: Understanding Balance Problems"
            className={inputClasses}
          />
        </FormField>

        <FormField
          label="Slug"
          htmlFor="slug"
          required
          helperText="Used in the page URL. Lowercase letters, numbers, and hyphens only."
          error={getFieldError(
            state,
            "slug",
          )}
        >
          <div className="flex gap-2">
            <input
              id="slug"
              name="slug"
              type="text"
              value={slug}
              onChange={
                handleSlugChange
              }
              required
              autoComplete="off"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              placeholder="understanding-balance-problems"
              className={inputClasses}
            />

            <button
              type="button"
              onClick={
                generateSlugFromTitle
              }
              className="shrink-0 rounded-xl border border-emerald-900/15 bg-white px-4 py-3 text-sm font-semibold text-[#0b4d3b] transition hover:bg-emerald-50"
            >
              Generate
            </button>
          </div>
        </FormField>

        <FormField
          label="Category"
          htmlFor="category"
          required
          error={getFieldError(
            state,
            "category",
          )}
        >
          <select
            id="category"
            name="category"
            defaultValue={
              values.category
            }
            required
            className={inputClasses}
          >
            {categoryOptions.map(
              (option) => (
                <option
                  key={option.value}
                  value={
                    option.value
                  }
                >
                  {option.label}
                </option>
              ),
            )}
          </select>
        </FormField>

        <FormField
          label="Status"
          htmlFor="status"
          required
          error={getFieldError(
            state,
            "status",
          )}
        >
          <select
            id="status"
            name="status"
            defaultValue={
              values.status
            }
            required
            className={inputClasses}
          >
            {statusOptions.map(
              (option) => (
                <option
                  key={option.value}
                  value={
                    option.value
                  }
                >
                  {option.label}
                </option>
              ),
            )}
          </select>
        </FormField>

        <FormField
          label="Version"
          htmlFor="version"
          required
          helperText="Use semantic versioning, such as 1.0.0."
          error={getFieldError(
            state,
            "version",
          )}
        >
          <input
            id="version"
            name="version"
            type="text"
            defaultValue={
              values.version
            }
            required
            autoComplete="off"
            placeholder="1.0.0"
            className={inputClasses}
          />
        </FormField>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="medicalReviewRequired"
              value="true"
              defaultChecked={
                values.medicalReviewRequired
              }
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0b4d3b] focus:ring-[#176b52]"
            />

            <span>
              <span className="block text-sm font-semibold text-slate-900">
                Medical review
                required
              </span>

              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Keep enabled for
                medically sensitive
                content.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5">
        <FormField
          label="Summary"
          htmlFor="summary"
          required
          error={getFieldError(
            state,
            "summary",
          )}
        >
          <textarea
            id="summary"
            name="summary"
            rows={4}
            defaultValue={
              values.summary
            }
            required
            placeholder="A concise educational summary."
            className={
              textareaClasses
            }
          />
        </FormField>
      </div>

      <div className="mt-5">
        <FormField
          label="Body"
          htmlFor="body"
          required
          helperText="Enter the full structured knowledge content."
          error={getFieldError(
            state,
            "body",
          )}
        >
          {/*
           * Keep this field uncontrolled.
           * defaultValue prevents text from
           * disappearing during rerenders.
           */}
          <textarea
            id="body"
            name="body"
            rows={14}
            defaultValue={
              values.body
            }
            required
            placeholder="Enter the full structured knowledge content."
            className={
              textareaClasses
            }
          />
        </FormField>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <FormField
          label="Tags"
          htmlFor="tags"
          helperText="Separate values with commas."
          error={getFieldError(
            state,
            "tags",
          )}
        >
          <input
            id="tags"
            name="tags"
            type="text"
            defaultValue={values.tags.join(
              ", ",
            )}
            autoComplete="off"
            placeholder="hearing loss, balance, recovery"
            className={inputClasses}
          />
        </FormField>

        <FormField
          label="Keywords"
          htmlFor="keywords"
          helperText="Separate values with commas."
          error={getFieldError(
            state,
            "keywords",
          )}
        >
          <input
            id="keywords"
            name="keywords"
            type="text"
            defaultValue={values.keywords.join(
              ", ",
            )}
            autoComplete="off"
            placeholder="acoustic neuroma, vestibular schwannoma"
            className={inputClasses}
          />
        </FormField>

        <FormField
          label="Aliases"
          htmlFor="aliases"
          helperText="Separate values with commas."
          error={getFieldError(
            state,
            "aliases",
          )}
        >
          <input
            id="aliases"
            name="aliases"
            type="text"
            defaultValue={values.aliases.join(
              ", ",
            )}
            autoComplete="off"
            placeholder="AN, vestibular schwannoma"
            className={inputClasses}
          />
        </FormField>
      </div>

      <div className="mt-5">
        <FormField
          label="Sources"
          htmlFor="sources"
          helperText="Enter a valid JSON array. Leave [] when no sources are linked."
          error={getFieldError(
            state,
            "sources",
          )}
        >
          <textarea
            id="sources"
            name="sources"
            rows={8}
            defaultValue={formatSources(
              values.sources,
            )}
            spellCheck={false}
            className={`${textareaClasses} font-mono text-sm`}
          />
        </FormField>
      </div>

      {mode === "edit" &&
      values.reviewedBy ? (
        <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Medical Review Record
          </p>

          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reviewed by
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {
                  values.reviewedBy
                }
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reviewed at
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {values.reviewedAt
                  ? formatDateTime(
                      values.reviewedAt,
                    )
                  : "Date unavailable"}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
        <p className="text-xs leading-5 text-slate-500">
          Required fields are marked
          with an asterisk. New
          records should begin as
          Draft.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[#0b4d3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176b52] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "Saving…"
            : resolvedSubmitLabel}
        </button>
      </div>
    </form>
  );
}

function FormField({
  label,
  htmlFor,
  required = false,
  helperText,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  helperText?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-slate-800"
      >
        {label}

        {required ? (
          <span className="ml-1 text-red-700">
            *
          </span>
        ) : null}
      </label>

      {helperText ? (
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {helperText}
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

function getFieldError(
  state: KnowledgeEntryActionState,
  fieldName: string,
): string | null {
  const fieldErrors =
    "fieldErrors" in state
      ? state.fieldErrors
      : null;

  if (
    !fieldErrors ||
    typeof fieldErrors !==
      "object"
  ) {
    return null;
  }

  const error = (
    fieldErrors as Record<
      string,
      unknown
    >
  )[fieldName];

  if (typeof error === "string") {
    return error;
  }

  if (
    Array.isArray(error) &&
    typeof error[0] === "string"
  ) {
    return error[0];
  }

  return null;
}

function createSlug(
  value: string,
): string {
  return value
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )
    .replace(
      /-{2,}/g,
      "-",
    );
}

function sanitizeSlug(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9-]/g,
      "-",
    )
    .replace(
      /-{2,}/g,
      "-",
    )
    .replace(
      /^-+/g,
      "",
    );
}

function formatSources(
  sources: unknown[],
): string {
  try {
    return JSON.stringify(
      sources,
      null,
      2,
    );
  } catch {
    return "[]";
  }
}

function formatDateTime(
  value: string,
): string {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}

const inputClasses =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#176b52] focus:ring-4 focus:ring-emerald-100";

const textareaClasses =
  "w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#176b52] focus:ring-4 focus:ring-emerald-100";