"use client";

import { useEffect } from "react";

type ContentFactoryErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ContentFactoryError({
  error,
  reset,
}: ContentFactoryErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#f6f2e8] px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
          Content Factory Error
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          Something went wrong
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-600">
          The Content Factory could not complete this request. Please try
          again.
        </p>

        {error.message ? (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">
              {error.message}
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={reset}
          className="mt-7 rounded-xl bg-[#0b4d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176b52]"
        >
          Try Again
        </button>
      </section>
    </main>
  );
}