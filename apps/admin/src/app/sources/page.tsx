import Link from "next/link";

import {
  getSourceManagerData,
  type SourceManagerRecord,
} from "../../lib/source-data";

export const dynamic = "force-dynamic";

export default async function SourceManagerPage() {
  const sourceData = await getSourceManagerData();

  return (
    <main className="min-h-screen bg-[#f6f2e8] text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <section className="min-w-0 flex-1">
          <header className="border-b border-emerald-950/10 bg-white/80 px-6 py-5 lg:px-10">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#176b52]">
                  ANW AI Content Operating System
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  Source Manager
                </h1>
              </div>

              <Link
                href="/"
                className="rounded-xl border border-emerald-900/15 bg-white px-4 py-2 text-sm font-semibold text-[#0b4d3b]"
              >
                Dashboard
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
            <section className="rounded-3xl bg-[#0b4d3b] px-7 py-8 text-white shadow-lg lg:px-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Evidence Registry
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Knowledge Source Manager
              </h2>

              <p className="mt-4 max-w-3xl leading-7 text-emerald-50">
                Review active medical references, linked
                knowledge topics, source URLs and historical
                removals.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <StatPill
                  label="Active sources"
                  value={sourceData.activeSources.length}
                />

                <StatPill
                  label="Removed sources"
                  value={sourceData.removedSources.length}
                />

                <StatPill
                  label="Source events"
                  value={sourceData.totalEvents}
                />
              </div>
            </section>

            {sourceData.errorMessage ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-semibold text-red-900">
                  Source Manager error
                </p>

                <p className="mt-2 break-words text-sm text-red-800">
                  {sourceData.errorMessage}
                </p>
              </div>
            ) : null}

            {!sourceData.errorMessage ? (
              <>
                <SourceSection
                  eyebrow="Current evidence"
                  title="Active Sources"
                  badge={`${sourceData.activeSources.length} active`}
                  sources={sourceData.activeSources}
                  emptyTitle="No active sources"
                  emptyMessage="No active source records were found."
                />

                <SourceSection
                  eyebrow="Historical audit"
                  title="Removed Sources"
                  badge={`${sourceData.removedSources.length} removed`}
                  sources={sourceData.removedSources}
                  emptyTitle="No removed sources"
                  emptyMessage="There are currently no removed source records."
                />
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminSidebar() {
  return (
    <aside className="hidden w-72 flex-col bg-[#0b4d3b] text-white lg:flex">
      <div className="border-b border-white/15 px-7 py-8">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
          🎗️
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
          Acoustic Neuroma Warrior
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          ANW AI-COS
        </h2>

        <p className="mt-2 text-sm text-emerald-100">
          Admin Portal
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        <SidebarLink
          href="/"
          icon="🏠"
          label="Dashboard"
        />

        <SidebarLink
          href="/knowledge"
          icon="📚"
          label="Knowledge Library"
        />

        <SidebarLink
          href="/sources"
          icon="🔗"
          label="Source Manager"
          active
        />

        <SidebarPlaceholder
          icon="🩺"
          label="Medical Reviews"
        />

        <SidebarPlaceholder
          icon="🤖"
          label="Content Factory"
        />

        <SidebarPlaceholder
          icon="🎨"
          label="Carousel Builder"
        />

        <SidebarPlaceholder
          icon="📅"
          label="Publishing"
        />

        <SidebarPlaceholder
          icon="⚙️"
          label="Settings"
        />
      </nav>

      <div className="border-t border-white/15 p-6">
        <p className="text-sm font-semibold">
          You Are Not Alone.
        </p>

        <p className="mt-1 text-xs leading-5 text-emerald-100">
          Trusted education, compassionate support and practical
          resources.
        </p>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0b4d3b]"
          : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-emerald-50 transition hover:bg-white/10"
      }
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function SidebarPlaceholder({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-emerald-50/70">
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </div>
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
              key={`${source.knowledgeEntryId}::${source.id}`}
              source={source}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center">
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
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#176b52]">
            {source.organization ??
              source.publisher ??
              "Registered source"}
          </p>

          <h3 className="mt-2 text-lg font-bold leading-7">
            {source.title}
          </h3>

          <p className="mt-2 break-all text-xs text-slate-500">
            {source.id}
          </p>
        </div>

        <StatusBadge source={source} />
      </div>

      <dl className="mt-6 space-y-4 rounded-xl bg-slate-50 p-4">
        <DetailRow
          label="Knowledge Entry"
          value={source.knowledgeEntryId}
        />

        <DetailRow
          label="Latest Event"
          value={formatStatus(source.eventType)}
        />

        <DetailRow
          label="Status"
          value={formatStatus(source.status)}
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

      {!source.hasValidUrl ? (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Missing or invalid source URL
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {source.hasValidUrl && source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-[#0b4d3b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#176b52]"
          >
            Open Source
          </a>
        ) : null}

        {source.knowledgeSlug ? (
          <Link
            href={
              "/knowledge/" +
              encodeURIComponent(source.knowledgeSlug)
            }
            className="rounded-xl border border-emerald-900/15 bg-white px-4 py-2 text-sm font-semibold text-[#0b4d3b] transition hover:bg-emerald-50"
          >
            Open Topic
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function StatusBadge({
  source,
}: {
  source: SourceManagerRecord;
}) {
  if (source.isRemoved) {
    return (
      <span className="rounded-full bg-slate-300 px-3 py-1 text-xs font-semibold text-slate-800">
        Removed
      </span>
    );
  }

  if (!source.hasValidUrl) {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
        Needs Attention
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
      Active
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

      <dd className="break-all text-sm font-medium text-slate-800">
        {value}
      </dd>
    </div>
  );
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .filter(Boolean)
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function formatDateTime(value: string): string {
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