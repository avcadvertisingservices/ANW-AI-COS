import Link from "next/link";

import AdminSidebar from "../../components/AdminSidebar";

import RecoveryTrackerEmptyState from "../../components/RecoveryTracker/RecoveryTrackerEmptyState";
import RecoveryTrackerHeader from "../../components/RecoveryTracker/RecoveryTrackerHeader";

export const dynamic = "force-dynamic";

export default function RecoveryTrackerPage() {
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
                  RecoveryTracker
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
            <RecoveryTrackerHeader />

            <div className="mt-7">
              <RecoveryTrackerEmptyState />
            </div>

            <p className="mt-6 text-xs text-slate-500">
              Route: /recovery-tracker
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
