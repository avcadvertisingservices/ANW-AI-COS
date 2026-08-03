import Link from "next/link";

import AdminSidebar from "../../../components/AdminSidebar";
import KnowledgeEntryForm from "../../../components/KnowledgeEntryForm";

import {
  initialKnowledgeEntryActionState,
} from "../action-state";

import {
  createKnowledgeEntry,
} from "../actions";

export const dynamic = "force-dynamic";

export default function NewKnowledgeEntryPage() {
  return (
    <main className="min-h-screen bg-[#f6f2e8] text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <section className="min-w-0 flex-1">
          <header className="border-b border-emerald-950/10 bg-white/80 px-6 py-5 lg:px-10">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#176b52]">
                  Knowledge Governance
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  Create Knowledge Entry
                </h1>
              </div>

              <Link
                href="/knowledge"
                className="rounded-xl border border-emerald-900/15 bg-white px-4 py-2 text-sm font-semibold text-[#0b4d3b] shadow-sm transition hover:bg-emerald-50"
              >
                Knowledge Library
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
            <section className="mb-7 rounded-3xl bg-[#0b4d3b] px-7 py-8 text-white shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Trusted Knowledge
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Add a structured knowledge record
              </h2>

              <p className="mt-4 max-w-3xl leading-7 text-emerald-50">
                New records begin as drafts and can later move
                through medical review and approval.
              </p>
            </section>

            <KnowledgeEntryForm
              mode="create"
              action={createKnowledgeEntry}
              initialState={initialKnowledgeEntryActionState}
            />
          </div>
        </section>
      </div>
    </main>
  );
}