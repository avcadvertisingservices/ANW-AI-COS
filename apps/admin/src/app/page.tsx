import Link from "next/link";

import { getDashboardData } from "../lib/dashboard-data";

const navigationItems = [
  {
    name: "Dashboard",
    icon: "🏠",
    href: "/",
    active: true,
  },
  {
    name: "Knowledge Library",
    icon: "📚",
    href: "/knowledge",
    active: false,
  },
];

const upcomingNavigationItems = [
  { name: "Source Manager", icon: "🔗" },
  { name: "Medical Reviews", icon: "🩺" },
  { name: "Content Factory", icon: "🤖" },
  { name: "Carousel Builder", icon: "🎨" },
  { name: "Publishing", icon: "📅" },
  { name: "Settings", icon: "⚙️" },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dashboardData = await getDashboardData();

  const reviewTitle = dashboardData.activeReview?.knowledgeSlug
    ? formatSlug(dashboardData.activeReview.knowledgeSlug)
    : "No Active Review";

  const reviewStatus =
    dashboardData.activeReview?.status ?? "none";

  const statistics = [
    {
      label: "Knowledge Topics",
      value: dashboardData.knowledgeTopicCount.toString(),
      detail: "Stored knowledge entries",
    },
    {
      label: "Registered Sources",
      value: dashboardData.sourceCount.toString(),
      detail: "Knowledge source records",
    },
    {
      label: "Submitted Reviews",
      value: dashboardData.submittedReviewCount.toString(),
      detail: "Awaiting medical review",
    },
    {
      label: "System Release",
      value: "v1.5.0",
      detail: "Knowledge Source Manager",
    },
  ];

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
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.active
                    ? "flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-left text-sm font-semibold text-[#0b4d3b]"
                    : "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-emerald-50 transition hover:bg-white/10"
                }
              >
                <span aria-hidden="true">
                  {item.icon}
                </span>

                <span>{item.name}</span>
              </Link>
            ))}

            {upcomingNavigationItems.map((item) => (
              <div
                key={item.name}
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-emerald-50/70"
                title="Coming soon"
              >
                <span aria-hidden="true">
                  {item.icon}
                </span>

                <span>{item.name}</span>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/15 p-6">
            <p className="text-sm font-semibold">
              You Are Not Alone.
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-100">
              Trusted education, compassionate support and
              practical resources.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="border-b border-emerald-950/10 bg-white/80 px-6 py-5 backdrop-blur lg:px-10">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#176b52]">
                  ANW AI Content Operating System
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  Executive Dashboard
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0b4d3b] font-bold text-white">
                AC
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
            {dashboardData.errorMessage ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-semibold text-red-900">
                  Supabase connection error
                </p>

                <p className="mt-2 break-words text-sm text-red-800">
                  {dashboardData.errorMessage}
                </p>
              </div>
            ) : (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-800">
                  Connected to ANW AI-COS Production
                </p>
              </div>
            )}

            <section className="rounded-3xl bg-[#0b4d3b] px-7 py-8 text-white shadow-lg lg:px-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Admin Portal Foundation
              </p>

              <h3 className="mt-3 max-w-3xl text-3xl font-bold leading-tight lg:text-4xl">
                Welcome to the control center of the Acoustic
                Neuroma Warrior Content Operating System.
              </h3>

              <p className="mt-4 max-w-3xl leading-7 text-emerald-50">
                Manage trusted knowledge, medical sources and
                review workflows from one secure workspace.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
                  Portal milestone: v2.0.0-alpha.1
                </span>

                <Link
                  href="/knowledge"
                  className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0b4d3b] transition hover:bg-emerald-50"
                >
                  Open Knowledge Library
                </Link>
              </div>
            </section>

            <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {statistics.map((statistic) => (
                <article
                  key={statistic.label}
                  className="rounded-2xl border border-emerald-950/10 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm font-medium text-slate-500">
                    {statistic.label}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-[#0b4d3b]">
                    {statistic.value}
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    {statistic.detail}
                  </p>
                </article>
              ))}
            </section>

            <section className="mt-8 rounded-2xl border border-emerald-950/10 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#176b52]">
                    Current workflow
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    {reviewTitle}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest active medical review request
                  </p>
                </div>

                <span
                  className={getReviewStatusClass(
                    reviewStatus,
                  )}
                >
                  {formatStatus(reviewStatus)}
                </span>
              </div>

              {dashboardData.activeReview ? (
                <>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Knowledge Entry
                      </p>

                      <p className="mt-2 break-all text-sm font-medium">
                        {
                          dashboardData.activeReview
                            .knowledgeEntryId
                        }
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Review Request ID
                      </p>

                      <p className="mt-2 break-all text-sm font-medium">
                        {dashboardData.activeReview.id}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-900">
                        Medical approval required
                      </p>

                      <p className="mt-1 text-sm leading-6 text-amber-800">
                        Content generation remains locked until
                        a genuine medical reviewer approves this
                        knowledge entry.
                      </p>
                    </div>

                    {dashboardData.activeReview.knowledgeSlug ? (
                      <Link
                        href={
                          "/knowledge/" +
                          encodeURIComponent(
                            dashboardData.activeReview
                              .knowledgeSlug,
                          )
                        }
                        className="rounded-xl bg-[#0b4d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176b52]"
                      >
                        Open Current Topic
                      </Link>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="font-semibold">
                    No active review request
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    There are currently no draft, submitted,
                    in-review or changes-requested records.
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word: string) => {
      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}

function formatStatus(status: string): string {
  if (status === "none") {
    return "No Active Review";
  }

  return status
    .split("_")
    .filter(Boolean)
    .map((word: string) => {
      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}

function getReviewStatusClass(
  status: string,
): string {
  const baseClass =
    "inline-flex rounded-full px-3 py-1 text-xs font-semibold";

  switch (status) {
    case "submitted":
      return (
        baseClass +
        " bg-blue-100 text-blue-800"
      );

    case "in_review":
      return (
        baseClass +
        " bg-violet-100 text-violet-800"
      );

    case "changes_requested":
      return (
        baseClass +
        " bg-amber-100 text-amber-800"
      );

    case "approved":
      return (
        baseClass +
        " bg-emerald-100 text-emerald-800"
      );

    case "rejected":
      return (
        baseClass +
        " bg-red-100 text-red-800"
      );

    default:
      return (
        baseClass +
        " bg-slate-100 text-slate-700"
      );
  }
}