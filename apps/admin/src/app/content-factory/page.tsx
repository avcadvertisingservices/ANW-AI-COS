import Link from "next/link";

import AdminSidebar from "../../components/AdminSidebar";

export const dynamic = "force-dynamic";

export default function ContentFactoryPage() {
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
                  Content Factory
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
                Create with purpose
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                ANW Content Factory
              </h2>

              <p className="mt-4 max-w-3xl leading-7 text-emerald-50">
                Create compassionate, educational, and survivor-led content
                for the Acoustic Neuroma Warrior community.
              </p>
            </section>

            <div className="mt-7 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
              <section className="rounded-3xl border border-emerald-950/10 bg-white p-7 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b52]">
                  Content Generator
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  Build a new content asset
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  The generation form, platform selection, audience settings,
                  evidence sources, and approval workflow will appear here.
                </p>

                <div className="mt-6 rounded-2xl border border-dashed border-emerald-900/20 bg-emerald-50/50 p-6">
                  <p className="text-sm font-semibold text-[#0b4d3b]">
                    Content Factory foundation is ready.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Connect the existing ContentGenerationForm component to
                    this page during the next implementation step.
                  </p>
                </div>
              </section>

              <aside className="rounded-3xl border border-emerald-950/10 bg-white p-7 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b52]">
                  ANW Standards
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  Every asset should be
                </h3>

                <div className="mt-5 space-y-3 text-sm text-slate-700">
                  <p className="rounded-xl bg-[#f6f2e8] px-4 py-3">
                    Compassionate and survivor-led
                  </p>

                  <p className="rounded-xl bg-[#f6f2e8] px-4 py-3">
                    Educational and evidence-aware
                  </p>

                  <p className="rounded-xl bg-[#f6f2e8] px-4 py-3">
                    Clear, practical, and supportive
                  </p>

                  <p className="rounded-xl bg-[#f6f2e8] px-4 py-3">
                    Reviewed before publication
                  </p>
                </div>

                <p className="mt-6 text-sm font-semibold text-[#0b4d3b]">
                  You Are Not Alone.
                </p>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}