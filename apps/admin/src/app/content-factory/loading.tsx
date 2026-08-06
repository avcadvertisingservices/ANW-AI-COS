export default function ContentFactoryLoading() {
  return (
    <main className="min-h-screen bg-[#f6f2e8] px-8 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm animate-pulse">
        <div className="h-4 w-32 rounded bg-emerald-200" />
        <div className="mt-6 h-8 w-64 rounded bg-slate-200" />
        <div className="mt-6 space-y-3">
          <div className="h-4 rounded bg-slate-200" />
          <div className="h-4 rounded bg-slate-200" />
          <div className="h-4 w-3/4 rounded bg-slate-200" />
        </div>
      </div>
    </main>
  );
}