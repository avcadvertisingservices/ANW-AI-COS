export default function SourceDetailsPage() {
  return (
    <main className="min-h-screen bg-[#f6f2e8] px-8 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b52]">
          ANW AI-COS
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Source Details
        </h1>

        <p className="mt-4 text-slate-600">
          This page will display a knowledge source and its associated
          metadata.
        </p>
      </div>
    </main>
  );
}