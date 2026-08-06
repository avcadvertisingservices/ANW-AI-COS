"use client";

import {
  useEffect,
} from "react";

type RecoveryTrackerErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function RecoveryTrackerError({
  error,
  reset,
}: RecoveryTrackerErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#f6f2e8] p-8 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
          RecoveryTracker Error
        </p>

        <h1 className="mt-2 text-2xl font-bold">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {error.message}
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-xl bg-[#0b4d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176b52]"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
