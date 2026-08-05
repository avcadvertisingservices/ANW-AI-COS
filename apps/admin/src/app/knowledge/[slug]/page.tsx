import Link from "next/link";
import { notFound } from "next/navigation";

import AdminSidebar from "../../../components/AdminSidebar";
import ResubmitForReviewForm from "../../../components/ResubmitForReviewForm";
import SubmitForReviewForm from "../../../components/SubmitForReviewForm";

import {
  getKnowledgeEntryBySlug,
} from "../../../lib/knowledge-data";

export const dynamic = "force-dynamic";

type KnowledgeEntryPageProps = {
  params: Promise<{
    slug: string;
  }>;

  searchParams: Promise<{
    created?: string;
    updated?: string;
    reviewSubmitted?: string;
    reviewResubmitted?: string;
    reviewError?: string;
    resubmitError?: string;
  }>;
};

export default async function KnowledgeEntryPage({
  params,
  searchParams,
}: KnowledgeEntryPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const entry =
    await getKnowledgeEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  const showCreatedMessage =
    query.created === "1";

  const showUpdatedMessage =
    query.updated === "1";

  const showReviewSubmittedMessage =
    query.reviewSubmitted === "1";

  const showReviewResubmittedMessage =
    query.reviewResubmitted === "1";

  const reviewError =
    typeof query.reviewError === "string"
      ? query.reviewError
      : null;

  const resubmitError =
    typeof query.resubmitError === "string"
      ? query.resubmitError
      : null;

  return (
    <main className="min-h-screen bg-[#f6f2e8] text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <section className="min-w-0 flex-1">
          <header className="border-b border-emerald-950/10 bg-white/80 px-6 py-5 lg:px-10">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#176b52]">
                  ANW AI Content Operating System
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  Knowledge Entry
                </h1>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/knowledge"
                  className="rounded-xl border border-emerald-900/15 bg-white px-4 py-2 text-sm font-semibold text-[#0b4d3b] shadow-sm transition hover:bg-emerald-50"
                >
                  Knowledge Library
                </Link>

                <Link
                  href={`/knowledge/${encodeURIComponent(
                    entry.slug,
                  )}/edit`}
                  className="rounded-xl bg-[#0b4d3b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#176b52]"
                >
                  Edit Entry
                </Link>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
            {showCreatedMessage ? (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                <p className="font-semibold">
                  Knowledge entry created
                  successfully.
                </p>
              </div>
            ) : null}

            {showUpdatedMessage ? (
              <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
                <p className="font-semibold">
                  Knowledge entry updated
                  successfully.
                </p>
              </div>
            ) : null}

            {showReviewSubmittedMessage ? (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                <p className="font-semibold">
                  Knowledge entry submitted for
                  medical review.
                </p>

                <p className="mt-1 text-sm">
                  The review request and its first
                  audit event were created
                  successfully.
                </p>
              </div>
            ) : null}

            {showReviewResubmittedMessage ? (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                <p className="font-semibold">
                  Knowledge entry resubmitted
                  successfully.
                </p>

                <p className="mt-1 text-sm">
                  The existing medical-review
                  request was returned to Submitted
                  and a Resubmitted audit event was
                  created.
                </p>
              </div>
            ) : null}

            {reviewError ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
                <p className="font-semibold">
                  Unable to submit for medical
                  review
                </p>

                <p className="mt-1 break-words text-sm">
                  {reviewError}
                </p>
              </div>
            ) : null}

            {resubmitError ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
                <p className="font-semibold">
                  Unable to resubmit for medical
                  review
                </p>

                <p className="mt-1 break-words text-sm">
                  {resubmitError}
                </p>
              </div>
            ) : null}

            <section className="rounded-3xl bg-[#0b4d3b] px-7 py-8 text-white shadow-lg lg:px-10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
                    {formatLabel(
                      entry.category,
                    )}
                  </p>

                  <h2 className="mt-3 text-3xl font-bold lg:text-4xl">
                    {entry.title}
                  </h2>

                  <p className="mt-3 break-all text-sm text-emerald-100">
                    {entry.slug}
                  </p>
                </div>

                <StatusBadge
                  status={
                    entry.reviewStatus ??
                    entry.knowledgeStatus
                  }
                />
              </div>

              <p className="mt-6 max-w-4xl text-base leading-7 text-emerald-50">
                {entry.summary ||
                  "No summary has been added yet."}
              </p>
            </section>

            <section className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard
                label="Knowledge Status"
                value={formatLabel(
                  entry.knowledgeStatus,
                )}
              />

              <InfoCard
                label="Review Status"
                value={formatLabel(
                  entry.reviewStatus ??
                    "not_submitted",
                )}
              />

              <InfoCard
                label="Sources"
                value={String(
                  entry.sourceCount,
                )}
              />

              <InfoCard
                label="Reviewer"
                value={
                  entry.reviewerName ??
                  "Not assigned"
                }
              />
            </section>

            <section className="mt-7 rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-sm lg:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b52]">
                Knowledge Content
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Full Entry
              </h3>

              <div className="mt-6 whitespace-pre-wrap text-base leading-8 text-slate-700">
                {entry.body ||
                  "No body content has been added yet."}
              </div>
            </section>

            <section className="mt-7 rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-sm lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b52]">
                    Evidence
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    Sources
                  </h3>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-[#0b4d3b]">
                  {entry.sourceCount} total
                </span>
              </div>

              {entry.sources.length ===
              0 ? (
                <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-600">
                    No active sources are linked
                    to this entry yet.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {entry.sources.map(
                    (source) => (
                      <article
                        key={source.id}
                        className="rounded-2xl border border-slate-200 p-5"
                      >
                        <p className="font-semibold text-slate-900">
                          {source.title}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          {source.organization ??
                            source.publisher ??
                            "Organization unavailable"}
                        </p>

                        {source.url ? (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex text-sm font-semibold text-[#176b52] hover:underline"
                          >
                            Open Source
                          </a>
                        ) : null}
                      </article>
                    ),
                  )}
                </div>
              )}
            </section>

            <section className="mt-7 rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-sm lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b52]">
                    Governance
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    Review Timeline
                  </h3>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {
                    entry.reviewTimeline
                      .length
                  }{" "}
                  events
                </span>
              </div>

              {entry.reviewTimeline
                .length === 0 ? (
                <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-600">
                    This entry has not yet entered
                    the medical-review workflow.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {entry.reviewTimeline.map(
                    (event) => (
                      <article
                        key={event.id}
                        className="rounded-2xl border border-slate-200 p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {formatLabel(
                                event.eventType,
                              )}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {event.actorName}

                              {event.actorRole
                                ? ` · ${event.actorRole}`
                                : ""}
                            </p>

                            {event.actorEmail ? (
                              <p className="mt-1 text-xs text-slate-400">
                                {
                                  event.actorEmail
                                }
                              </p>
                            ) : null}
                          </div>

                          <p className="text-xs text-slate-500">
                            {event.createdAt
                              ? formatDateTime(
                                  event.createdAt,
                                )
                              : "Date unavailable"}
                          </p>
                        </div>

                        {event.notes ? (
                          <p className="mt-4 text-sm leading-6 text-slate-600">
                            {event.notes}
                          </p>
                        ) : null}

                        {event.isPlaceholderActor ? (
                          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                            Placeholder reviewer
                            detected.
                          </p>
                        ) : null}
                      </article>
                    ),
                  )}
                </div>
              )}
            </section>

            <div className="mt-7 space-y-6">
              <SubmitForReviewForm
                entryId={entry.id}
                slug={entry.slug}
                title={entry.title}
                knowledgeStatus={
                  entry.knowledgeStatus
                }
                reviewStatus={
                  entry.reviewStatus
                }
              />

              <ResubmitForReviewForm
                entryId={entry.id}
                slug={entry.slug}
                title={entry.title}
                knowledgeStatus={
                  entry.knowledgeStatus
                }
                reviewStatus={
                  entry.reviewStatus
                }
              />
            </div>

            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <Link
                href="/knowledge"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Library
              </Link>

              <Link
                href={`/knowledge/${encodeURIComponent(
                  entry.slug,
                )}/edit`}
                className="rounded-xl bg-[#0b4d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176b52]"
              >
                Edit Knowledge Entry
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-lg font-bold text-[#0b4d3b]">
        {value}
      </p>
    </article>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = status
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  let classes =
    "bg-white/15 text-white";

  if (normalized === "approved") {
    classes =
      "bg-emerald-100 text-emerald-800";
  } else if (
    normalized === "submitted" ||
    normalized === "in_review"
  ) {
    classes =
      "bg-blue-100 text-blue-800";
  } else if (
    normalized ===
    "changes_requested"
  ) {
    classes =
      "bg-amber-100 text-amber-800";
  } else if (
    normalized === "rejected"
  ) {
    classes =
      "bg-red-100 text-red-800";
  } else if (
    normalized === "cancelled"
  ) {
    classes =
      "bg-slate-200 text-slate-700";
  }

  return (
    <span
      className={`rounded-full px-4 py-2 text-sm font-semibold ${classes}`}
    >
      {formatLabel(status)}
    </span>
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

function formatDateTime(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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