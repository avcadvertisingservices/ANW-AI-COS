import Link from "next/link";

import AdminSidebar from "../../components/AdminSidebar";

import {
  getSourceManagerData,
  type SourceManagerRecord,
} from "../../lib/source-data";

export const dynamic = "force-dynamic";

export default async function SourceManagerPage() {
  const sourceData =
    await getSourceManagerData();

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
                  Evidence Library
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
                  href="/"
                  className="rounded-xl bg-[#0b4d3b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#176b52]"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
            <section className="rounded-3xl bg-[#0b4d3b] px-7 py-8 text-white shadow-lg lg:px-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Clinical Governance
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Medical Evidence Registry
              </h2>

              <p className="mt-4 max-w-3xl leading-7 text-emerald-50">
                Manage research papers, medical
                guidance, hospital references,
                government sources, citations, and
                verification records connected to
                the ANW knowledge library.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <StatPill
                  label="Total evidence"
                  value={
                    sourceData.allSources
                      .length
                  }
                />

                <StatPill
                  label="Verified"
                  value={
                    sourceData
                      .verifiedSources
                      .length
                  }
                />

                <StatPill
                  label="Needs verification"
                  value={
                    sourceData
                      .unverifiedSources
                      .length
                  }
                />

                <StatPill
                  label="Linked topics"
                  value={
                    sourceData
                      .linkedKnowledgeEntries
                  }
                />
              </div>
            </section>

            {sourceData.errorMessage ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-semibold text-red-900">
                  Evidence Library error
                </p>

                <p className="mt-2 break-words text-sm text-red-800">
                  {
                    sourceData.errorMessage
                  }
                </p>
              </div>
            ) : null}

            {!sourceData.errorMessage ? (
              <>
                <SourceSection
                  eyebrow="Trusted evidence"
                  title="Verified Evidence"
                  badge={`${sourceData.verifiedSources.length} verified`}
                  sources={
                    sourceData.verifiedSources
                  }
                  emptyTitle="No verified evidence yet"
                  emptyMessage="Evidence records will appear here after they are verified."
                />

                <SourceSection
                  eyebrow="Governance queue"
                  title="Needs Verification"
                  badge={`${sourceData.unverifiedSources.length} pending`}
                  sources={
                    sourceData.unverifiedSources
                  }
                  emptyTitle="No evidence awaiting verification"
                  emptyMessage="All registered evidence sources are currently verified."
                />
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function SourceSection({
  eyebrow,
  title,
  badge,
  sources,
  emptyTitle,
  emptyMessage,
}: {
  eyebrow: string;
  title: string;
  badge: string;
  sources: SourceManagerRecord[];
  emptyTitle: string;
  emptyMessage: string;
}) {
  return (
    <section className="mt-9">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#176b52]">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {title}
          </h2>
        </div>

        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          {badge}
        </span>
      </div>

      {sources.length > 0 ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          {sources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-slate-800">
            {emptyTitle}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {emptyMessage}
          </p>
        </div>
      )}
    </section>
  );
}

function SourceCard({
  source,
}: {
  source: SourceManagerRecord;
}) {
  return (
    <article className="rounded-2xl border border-emerald-950/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
              {formatLabel(
                source.sourceType,
              )}
            </span>

            {source.evidenceLevel ? (
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">
                {source.evidenceLevel}
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 text-lg font-bold leading-7 text-slate-900">
            {source.title}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {source.organization ??
              source.journal ??
              "Organization unavailable"}
          </p>
        </div>

        <VerificationBadge
          verified={source.verified}
        />
      </div>

      <dl className="mt-6 space-y-4 rounded-xl bg-slate-50 p-4">
        <DetailRow
          label="Knowledge Topic"
          value={
            source.knowledgeTitle ??
            source.knowledgeEntryId
          }
        />

        <DetailRow
          label="Authors"
          value={
            source.authors ??
            "Not provided"
          }
        />

        <DetailRow
          label="Journal"
          value={
            source.journal ??
            "Not provided"
          }
        />

        <DetailRow
          label="Publication"
          value={
            source.publicationDate
              ? formatDate(
                  source.publicationDate,
                )
              : "Not provided"
          }
        />

        <DetailRow
          label="DOI"
          value={
            source.doi ??
            "Not provided"
          }
        />

        <DetailRow
          label="PMID"
          value={
            source.pmid ??
            "Not provided"
          }
        />

        <DetailRow
          label="Updated"
          value={
            source.updatedAt
              ? formatDateTime(
                  source.updatedAt,
                )
              : "Unavailable"
          }
        />
      </dl>

      {source.citation ? (
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Citation
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {source.citation}
          </p>
        </div>
      ) : null}

      {source.notes ? (
        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Evidence Notes
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-900">
            {source.notes}
          </p>
        </div>
      ) : null}

      {!source.hasValidUrl ? (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Missing or invalid source URL
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            Add a valid HTTP or HTTPS URL
            before final evidence
            verification.
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {source.hasValidUrl &&
        source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-[#0b4d3b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#176b52]"
          >
            Open Evidence
          </a>
        ) : null}

        {source.knowledgeSlug ? (
          <Link
            href={`/knowledge/${encodeURIComponent(
              source.knowledgeSlug,
            )}`}
            className="rounded-xl border border-emerald-900/15 bg-white px-4 py-2 text-sm font-semibold text-[#0b4d3b] transition hover:bg-emerald-50"
          >
            Open Knowledge Topic
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function VerificationBadge({
  verified,
}: {
  verified: boolean;
}) {
  if (verified) {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
        Verified
      </span>
    );
  }

  return (
    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
      Needs Verification
    </span>
  );
}

function StatPill({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
      {label}: {value}
    </span>
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
    <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
      <dt className="text-sm font-semibold text-slate-500">
        {label}
      </dt>

      <dd className="break-words text-sm font-medium text-slate-800">
        {value}
      </dd>
    </div>
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

function formatDate(
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
    },
  ).format(date);
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