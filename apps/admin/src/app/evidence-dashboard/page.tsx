import Link from "next/link";

import AdminSidebar from "../../components/AdminSidebar";

export const dynamic = "force-dynamic";

export default function EvidenceDashboardPage() {
  return (
    <main className="min-h-screen bg-[#f6f2e8] text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <section className="min-w-0 flex-1">
          <header className="border-b border-emerald-950/10 bg-white/80 px-6 py-5 lg:px-10">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#176b52]">
                  ANW AI Content Operating System
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                  EvidenceDashboard
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
                ANW Platform Page
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                EvidenceDashboard
              </h2>

              <p className="mt-4 max-w-3xl leading-7 text-emerald-50">
                Replace this placeholder with the purpose, data, and workflow
                for the EvidenceDashboard page.
              </p>
            </section>

            <section className="mt-7 rounded-3xl border border-emerald-950/10 bg-white p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b52]">
                Page Ready
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Start building EvidenceDashboard
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Add components, server data, actions, validation, and tests
                for this route.
              </p>

              <p className="mt-6 text-xs text-slate-500">
                Route: /evidence-dashboard
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
