import Link from "next/link";

import { getKnowledgeLibraryData } from "../../lib/knowledge-data";

export const dynamic = "force-dynamic";

export default async function KnowledgeLibraryPage() {
  const libraryData = await getKnowledgeLibraryData();

  return (
    <main className="min-h-screen bg-[#f6f2e8] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col bg-[#0b4d3b] text-white lg:flex">
          <div className="border-b border-white/15 px-7 py-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
              🎗️
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
              Acoustic Neuroma Warrior
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              ANW AI-COS
            </h1>

            <p className="mt-2 text-sm text-emerald-100">
              Admin Portal
            </p>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-emerald-50 transition hover:bg-white/10"
            >
              <span aria-hidden="true">🏠</span>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/knowledge"
              className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0b4d3b]"
            >
              <span aria-hidden="true">📚</span>
              <span>Knowledge Library</span>
            </Link>

            <SidebarPlaceholder icon="🔗" label="Source Manager" />
            <SidebarPlaceholder icon="🩺" label="Medical Reviews" />
            <SidebarPlaceholder icon="🤖" label="Content Factory" />
            <SidebarPlaceholder icon="🎨" label="Carousel Builder" />
            <SidebarPlaceholder icon="📅" label="Publishing" />
            <SidebarPlaceholder icon="⚙️" label="Settings" />
          </nav>

          <div className="border-t border-white/15 p-6">
            <p className="text-sm font-semibold">
              You Are Not Alone.
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-100">
              Trusted education, compassionate support and practical resources.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="border-b border-emerald-950/10 bg-white/80 px-6 py-5 lg:px-10">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#176b52]">
                  ANW AI Content Operating System
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  Knowledge Library
                </h1>
              </div>

              <Link
                href="/"
                className="rounded-xl border border-emerald-900/15 bg-white px-4 py-2 text-sm font-semibold text-[#0b4d3b] shadow-sm transition hover:bg-emerald-50"
              >
                Dashboard
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
            <section className="rounded-3xl bg-[#0b4d3b] px-7 py-8 text-white shadow-lg lg:px-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Trusted Knowledge
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Acoustic Neuroma Knowledge Library
              </h2>

              <p className="mt-4 max-w-3xl leading-7 text-emerald-50">
                Review structured knowledge entries, medical sources and
                approval workflows.
              </p>

              <div className="mt-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
                {libraryData.entries.length} knowledge entries
              </div>
            </section>

            {libraryData.errorMessage ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-semibold text-red-900">
                  Knowledge Library error
                </p>

                <p className="mt-2 break-words text-sm text-red-800">
                  {libraryData.errorMessage}
                </p>
              </div>
            ) : null}

            {!libraryData.errorMessage &&
            libraryData.entries.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <p className="font-semibold text-slate-800">
                  No knowledge entries found
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  No records are currently available in Supabase.
                </p>
              </div>
            ) : null}

            <section className="mt-7 grid gap-5 xl:grid-cols-2">
              {libraryData.entries.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-2xl border border-emerald-950/10 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#176b52]">
                        {entry.category}
                      </p>

                      <h2 className="mt-2 text-xl font-bold">
                        {entry.title}
                      </h2>

                      <p className="mt-2 break-all text-sm text-slate-500">
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

                  <p className="mt-5 text-sm leading-6 text-slate-600">
                    {entry.summary ||
                      "No summary has been added yet."}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Sources
                      </p>

                      <p className="mt-2 text-2xl font-bold text-[#0b4d3b]">
                        {entry.sourceCount}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Review
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-800">
                        {formatStatus(
                          entry.reviewStatus ??
                            "not_submitted",
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                    <p className="text-xs text-slate-500">
                      {entry.updatedAt
                        ? "Updated " + formatDate(entry.updatedAt)
                        : "Update date unavailable"}
                    </p>

                    <Link
                      href={
                        "/knowledge/" +
                        encodeURIComponent(entry.slug)
                      }
                      className="rounded-xl bg-[#0b4d3b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#176b52]"
                    >
                      Open Topic
                    </Link>
                  </div>
                </article>
              ))}
            </section>
          </div>
        </section>
      </div>
    </main>
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

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = status.toLowerCase();

  let classes = "bg-slate-100 text-slate-700";

  if (normalized === "approved") {
    classes = "bg-emerald-100 text-emerald-800";
  } else if (
    normalized === "in_review" ||
    normalized === "submitted"
  ) {
    classes = "bg-blue-100 text-blue-800";
  } else if (normalized === "changes_requested") {
    classes = "bg-amber-100 text-amber-800";
  } else if (normalized === "rejected") {
    classes = "bg-red-100 text-red-800";
  }

  return (
    <span
      className={
        "rounded-full px-3 py-1 text-xs font-semibold " +
        classes
      }
    >
      {formatStatus(status)}
    </span>
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

function formatDate(value: string): string {
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