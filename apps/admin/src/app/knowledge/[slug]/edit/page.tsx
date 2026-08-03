import Link from "next/link";
import { notFound } from "next/navigation";

import AdminSidebar from "../../../../components/AdminSidebar";
import KnowledgeEntryForm from "../../../../components/KnowledgeEntryForm";

import {
  getKnowledgeLibraryData,
} from "../../../../lib/knowledge-data";

import {
  initialKnowledgeEntryActionState,
} from "../../action-state";

import {
  updateKnowledgeEntry,
} from "../../actions";

export const dynamic = "force-dynamic";

type EditKnowledgeEntryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EditKnowledgeEntryPage({
  params,
}: EditKnowledgeEntryPageProps) {
  const { slug } = await params;

  const decodedSlug = decodeURIComponent(slug)
    .trim()
    .toLowerCase();

  const libraryData = await getKnowledgeLibraryData();

  const entry =
    libraryData.entries.find(
      (item) =>
        item.slug.trim().toLowerCase() === decodedSlug,
    ) ?? null;

  if (!entry) {
    notFound();
  }

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
                  Edit Knowledge Entry
                </h1>
              </div>

              <Link
                href={`/knowledge/${encodeURIComponent(
                  entry.slug,
                )}`}
                className="rounded-xl border border-emerald-900/15 bg-white px-4 py-2 text-sm font-semibold text-[#0b4d3b] shadow-sm transition hover:bg-emerald-50"
              >
                View Entry
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
            <section className="mb-7 rounded-3xl bg-[#0b4d3b] px-7 py-8 text-white shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Edit Record
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                {entry.title}
              </h2>

              <p className="mt-3 break-all text-emerald-50">
                {entry.slug}
              </p>
            </section>

            <KnowledgeEntryForm
              mode="edit"
              action={updateKnowledgeEntry}
              initialState={initialKnowledgeEntryActionState}
              initialValues={{
                id: entry.id,
                slug: entry.slug,
                title: entry.title,
                summary: entry.summary ?? "",
                body: entry.body ?? "",
                category: entry.category,
                status: entry.knowledgeStatus,
                tags: [],
                keywords: [],
                aliases: [],
                sources: entry.sources,
                medicalReviewRequired: true,
                version: "1.0.0",
                reviewedBy: entry.reviewerName,
                reviewedAt: null,
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}