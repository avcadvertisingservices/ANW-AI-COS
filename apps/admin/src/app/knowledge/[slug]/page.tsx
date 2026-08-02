import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getKnowledgeEntryBySlug,
  type KnowledgeReviewEvent,
  type KnowledgeSource,
} from "../../../lib/knowledge-data";

export const dynamic = "force-dynamic";

type KnowledgeDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function KnowledgeDetailsPage({
  params,
}: KnowledgeDetailsPageProps) {
  const { slug } = await params;

  const result =
    await getKnowledgeEntryBySlug(slug);

  if (!result.entry && !result.errorMessage) {
    notFound();
  }

  const entry = result.entry;

  return (
    <main className="min-h-screen bg-[#f6f2e8] text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
        <Link
          href="/knowledge"
          className="inline-flex rounded-xl border border-emerald-900/15 bg-white px-4 py-2 text-sm font-semibold text-[#0b4d3b] shadow-sm transition hover:bg-emerald-50"
        >
          ← Back to Knowledge Library
        </Link>

        {result.errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-900">
              Unable to load topic
            </p>

            <p className="mt-2 break-words text-sm text-red-800">
              {result.errorMessage}
            </p>
          </div>
        ) : null}

        {entry ? (
          <>
            <section className="mt-6 rounded-3xl bg-[#0b4d3b] px-7 py-8 text-white shadow-lg lg:px-10">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-100">
                {entry.category}
              </p>

              <h1 className="mt-3 text-3xl font-bold lg:text-4xl">
                {entry.title}
              </h1>

              <p className="mt-3 break-all text-sm text-emerald-100">
                {entry.slug}
              </p>
            </section>

            <section className="mt-6 rounded-3xl border border-emerald-950/10 bg-white p-8 shadow-sm lg:p-10">
              <div className="grid gap-4 sm:grid-cols-3">
                <InfoCard
                  label="Knowledge Status"
                  value={formatStatus(
                    entry.knowledgeStatus,
                  )}
                />

                <InfoCard
                  label="Review Status"
                  value={formatStatus(
                    entry.reviewStatus ??
                      "not_submitted",
                  )}
                />

                <InfoCard
                  label="Active Sources"
                  value={entry.sourceCount.toString()}
                />
              </div>

              <section className="mt-8 rounded-2xl bg-[#f6f2e8] p-6">
                <h2 className="text-lg font-bold">
                  Summary
                </h2>

                <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">
                  {entry.summary ||
                    "No summary has been added yet."}
                </p>
              </section>

              {entry.body ? (
                <section className="mt-6 rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-lg font-bold">
                    Knowledge Content
                  </h2>

                  <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">
                    {entry.body}
                  </p>
                </section>
              ) : null}

              <section className="mt-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#176b52]">
                      Evidence and references
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      Registered Sources
                    </h2>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {entry.sources.length} active
                  </span>
                </div>

                {entry.sources.length > 0 ? (
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    {entry.sources.map((source) => (
                      <SourceCard
                        key={source.id}
                        source={source}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <p className="font-semibold text-amber-900">
                      No active sources registered
                    </p>

                    <p className="mt-2 text-sm leading-6 text-amber-800">
                      This entry needs authoritative sources
                      before it can become eligible for medical
                      approval.
                    </p>
                  </div>
                )}
              </section>

              <section className="mt-8">
                <div>
                  <p className="text-sm font-medium text-[#176b52]">
                    Audit trail
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Review Timeline
                  </h2>
                </div>

                {entry.reviewEvents.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {entry.reviewEvents.map(
                      (event, index) => (
                        <ReviewEventCard
                          key={event.id}
                          event={event}
                          isLatest={index === 0}
                        />
                      ),
                    )}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="font-semibold text-slate-800">
                      No review history
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      This knowledge entry has not yet entered
                      the formal review workflow.
                    </p>
                  </div>
                )}
              </section>

              <section className="mt-8 rounded-2xl bg-slate-50 p-6">
                <h2 className="text-lg font-bold">
                  Topic Information
                </h2>

                <dl className="mt-4 space-y-4">
                  <DetailRow
                    label="Knowledge ID"
                    value={entry.id}
                  />

                  <DetailRow
                    label="Slug"
                    value={entry.slug}
                  />

                  <DetailRow
                    label="Category"
                    value={entry.category}
                  />

                  <DetailRow
                    label="Last Updated"
                    value={
                      entry.updatedAt
                        ? formatDate(entry.updatedAt)
                        : "Unavailable"
                    }
                  />
                </dl>
              </section>

              {entry.reviewStatus === "approved" ? (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="font-semibold text-emerald-900">
                    Approved knowledge
                  </p>

                  <p className="mt-2 text-sm leading-6 text-emerald-800">
                    This topic is eligible for approved content
                    workflows.
                  </p>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="font-semibold text-amber-900">
                    Medical approval required
                  </p>

                  <p className="mt-2 text-sm leading-6 text-amber-800">
                    This topic remains unavailable to the
                    medical Content Engine until a genuine
                    medical reviewer approves it.
                  </p>
                </div>
              )}

              {containsPlaceholderReviewer(
                entry.reviewEvents,
              ) ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5">
                  <p className="font-semibold text-red-900">
                    Test reviewer records detected
                  </p>

                  <p className="mt-2 text-sm leading-6 text-red-800">
                    Some historical review events contain
                    placeholder reviewer identities. These
                    events remain visible for audit purposes,
                    but they must not be treated as genuine
                    medical review or approval.
                  </p>
                </div>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

function SourceCard({
  source,
}: {
  source: KnowledgeSource;
}) {
  return (
    <article className="rounded-2xl border border-emerald-950/10 bg-slate-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#176b52]">
            {source.organization ??
              source.publisher ??
              "Registered source"}
          </p>

          <h3 className="mt-2 font-bold leading-6">
            {source.title}
          </h3>
        </div>

        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          {formatStatus(source.status)}
        </span>
      </div>

      <dl className="mt-5 space-y-3">
        <DetailRow
          label="Source ID"
          value={source.id}
        />

        <DetailRow
          label="Latest Event"
          value={formatStatus(source.eventType)}
        />

        <DetailRow
          label="Updated"
          value={
            source.updatedAt
              ? formatDateTime(source.updatedAt)
              : "Unavailable"
          }
        />
      </dl>

      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex rounded-xl bg-[#0b4d3b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#176b52]"
        >
          Open Source
        </a>
      ) : (
        <p className="mt-5 text-sm text-slate-500">
          No source URL was stored in this event.
        </p>
      )}
    </article>
  );
}

function ReviewEventCard({
  event,
  isLatest,
}: {
  event: KnowledgeReviewEvent;
  isLatest: boolean;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">
              {formatStatus(event.eventType)}
            </h3>

            {isLatest ? (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                Latest
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-slate-600">
            {event.actorName}
            {event.actorRole
              ? " · " +
                formatStatus(event.actorRole)
              : ""}
          </p>
        </div>

        <time className="text-xs font-medium text-slate-500">
          {event.createdAt
            ? formatDateTime(event.createdAt)
            : "Time unavailable"}
        </time>
      </div>

      {event.notes ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-sm leading-6 text-slate-700">
            {event.notes}
          </p>
        </div>
      ) : null}

      <p className="mt-4 break-all text-xs text-slate-400">
        Request: {event.reviewRequestId}
      </p>
    </article>
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
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-[#0b4d3b]">
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
      <dt className="text-sm font-semibold text-slate-500">
        {label}
      </dt>

      <dd className="break-all text-sm font-medium text-slate-800">
        {value}
      </dd>
    </div>
  );
}

function containsPlaceholderReviewer(
  events: KnowledgeReviewEvent[],
): boolean {
  const placeholderTerms = [
    "real medical reviewer",
    "your medical reviewer",
    "reviewer name",
    "your me",
  ];

  return events.some((event) => {
    const normalized =
      event.actorName.toLowerCase();

    return placeholderTerms.some((term) =>
      normalized.includes(term),
    );
  });
}

function formatStatus(
  status: string,
): string {
  return status
    .split("_")
    .filter(Boolean)
    .map((word) => {
      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDateTime(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}