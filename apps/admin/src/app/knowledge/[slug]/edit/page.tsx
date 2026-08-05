import Link from "next/link";
import { notFound } from "next/navigation";

import AdminSidebar from "../../../../components/AdminSidebar";
import KnowledgeEntryForm from "../../../../components/KnowledgeEntryForm";

import { getKnowledgeEntryBySlug } from "../../../../lib/knowledge-data";

import { updateKnowledgeEntry } from "../../actions";

import { initialKnowledgeEntryActionState } from "../../action-state";

export const dynamic = "force-dynamic";

type EditKnowledgeEntryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type EditableKnowledgeFields = {
  medicalReviewRequired?: boolean | null;
  version?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
};

export default async function EditKnowledgeEntryPage({
  params,
}: EditKnowledgeEntryPageProps) {
  const { slug } = await params;

  const decodedSlug = decodeURIComponent(slug);

  const entry = await getKnowledgeEntryBySlug(
    decodedSlug,
  );

  if (!entry) {
    notFound();
  }

  /*
   * KnowledgeLibraryEntry currently exposes the
   * fields needed by the public topic page, but
   * some edit-only fields may not yet be included
   * in its TypeScript type.
   */
  const editableEntry =
    entry as typeof entry &
      EditableKnowledgeFields;

  return (
    <main className="min-h-screen bg-[#f6f2e8] text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <section className="min-w-0 flex-1">
          <header className="border-b border-emerald-950/10 bg-white/80 px-6 py-5 lg:px-10">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
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

          <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
            <section className="mb-6 rounded-3xl bg-[#0b4d3b] px-7 py-7 text-white shadow-lg lg:px-9">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Edit Record
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                {entry.title}
              </h2>

              <p className="mt-3 break-all text-sm text-emerald-100">
                {entry.slug}
              </p>
            </section>

            <KnowledgeEntryForm
              action={updateKnowledgeEntry}
              initialState={
                initialKnowledgeEntryActionState
              }
              mode="edit"
              submitLabel="Save Changes"
              initialValues={{
                /*
                 * Required hidden identifier for
                 * updateKnowledgeEntry.
                 */
                id: entry.id,

                slug: entry.slug,
                title: entry.title,

                summary: entry.summary ?? "",
                body: entry.body ?? "",

                category:
                  entry.category ?? "resource",

                status:
                  entry.knowledgeStatus ??
                  "draft",

                /*
                 * KnowledgeLibraryEntry does not
                 * currently expose these raw arrays.
                 * Empty arrays prevent TypeScript
                 * errors until the data model is
                 * expanded.
                 */
                tags: [],
                keywords: [],
                aliases: [],
                sources: [],

                medicalReviewRequired:
                  editableEntry
                    .medicalReviewRequired ??
                  true,

                version:
                  editableEntry.version ??
                  "1.0.0",

                reviewedBy:
                  editableEntry.reviewedBy ??
                  null,

                reviewedAt:
                  editableEntry.reviewedAt ??
                  null,
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}