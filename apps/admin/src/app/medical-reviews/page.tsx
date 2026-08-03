import Link from "next/link";

import AdminSidebar from "../../components/AdminSidebar";
import MedicalReviewDecisionForm from "../../components/MedicalReviewDecisionForm";
import StartMedicalReviewForm from "../../components/StartMedicalReviewForm";

import {
  getMedicalReviewData,
  type MedicalReviewEvent,
  type MedicalReviewRecord,
} from "../../lib/review-data";

export const dynamic = "force-dynamic";

type MedicalReviewsPageProps = {
  searchParams: Promise<{
    reviewStarted?: string;
    reviewError?: string;
    reviewId?: string;
    decisionSaved?: string;
    decisionError?: string;
    decision?: string;
  }>;
};

export default async function MedicalReviewsPage({
  searchParams,
}: MedicalReviewsPageProps) {
  const query = await searchParams;
  const reviewData =
    await getMedicalReviewData();

  const showReviewStartedMessage =
    query.reviewStarted === "1";

  const reviewError =
    typeof query.reviewError === "string"
      ? query.reviewError
      : null;

  const showDecisionSavedMessage =
    query.decisionSaved === "1";

  const decisionError =
    typeof query.decisionError === "string"
      ? query.decisionError
      : null;

  const savedDecision =
    typeof query.decision === "string"
      ? query.decision
      : null;

  return (
    <main className="min-h-screen bg-[#f6f2e8] text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <section className="min-w-0 flex-1">
          <header className="border-b border-emerald-950/10 bg-white/80 px-6 py-5 lg:px-10">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#176b52]">
                  ANW AI Content Operating System
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  Medical Reviews
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
            {showReviewStartedMessage ? (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
                <p className="font-semibold">
                  Medical review started successfully.
                </p>

                <p className="mt-1 text-sm">
                  The reviewer was assigned and a
                  Review Started audit event was
                  created.
                </p>
              </div>
            ) : null}

            {reviewError ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
                <p className="font-semibold">
                  Unable to start medical review
                </p>

                <p className="mt-1 break-words text-sm">
                  {reviewError}
                </p>
              </div>
            ) : null}

            {showDecisionSavedMessage ? (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
                <p className="font-semibold">
                  Medical-review decision saved
                  successfully.
                </p>

                <p className="mt-1 text-sm">
                  Decision:{" "}
                  <strong>
                    {formatStatus(
                      savedDecision ??
                        "completed",
                    )}
                  </strong>
                  . The knowledge entry and audit
                  timeline were updated.
                </p>
              </div>
            ) : null}

            {decisionError ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
                <p className="font-semibold">
                  Unable to save medical-review
                  decision
                </p>

                <p className="mt-1 break-words text-sm">
                  {decisionError}
                </p>
              </div>
            ) : null}

            <section className="rounded-3xl bg-[#0b4d3b] px-7 py-8 text-white shadow-lg lg:px-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Clinical Governance
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Knowledge Review Center
              </h2>

              <p className="mt-4 max-w-3xl leading-7 text-emerald-50">
                Review medical-approval requests,
                reviewer assignments, decisions,
                notes, and complete audit histories.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <StatPill
                  label="Total"
                  value={reviewData.counts.total}
                />

                <StatPill
                  label="Submitted"
                  value={
                    reviewData.counts.submitted
                  }
                />

                <StatPill
                  label="In review"
                  value={
                    reviewData.counts.inReview
                  }
                />

                <StatPill
                  label="Changes requested"
                  value={
                    reviewData.counts
                      .changesRequested
                  }
                />

                <StatPill
                  label="Approved"
                  value={
                    reviewData.counts.approved
                  }
                />

                <StatPill
                  label="Rejected"
                  value={
                    reviewData.counts.rejected
                  }
                />
              </div>
            </section>

            {reviewData.errorMessage ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-semibold text-red-900">
                  Medical Reviews error
                </p>

                <p className="mt-2 break-words text-sm text-red-800">
                  {reviewData.errorMessage}
                </p>
              </div>
            ) : null}

            {!reviewData.errorMessage ? (
              <>
                <ReviewSection
                  eyebrow="Action required"
                  title="Active Reviews"
                  badge={`${reviewData.activeReviews.length} active`}
                  reviews={
                    reviewData.activeReviews
                  }
                  emptyTitle="No active reviews"
                  emptyMessage="There are currently no draft, submitted, in-review, or changes-requested reviews."
                />

                <ReviewSection
                  eyebrow="Decision history"
                  title="Completed Reviews"
                  badge={`${reviewData.completedReviews.length} completed`}
                  reviews={
                    reviewData.completedReviews
                  }
                  emptyTitle="No completed reviews"
                  emptyMessage="There are currently no approved, rejected, or cancelled review requests."
                />
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function ReviewSection({
  eyebrow,
  title,
  badge,
  reviews,
  emptyTitle,
  emptyMessage,
}: {
  eyebrow: string;
  title: string;
  badge: string;
  reviews: MedicalReviewRecord[];
  emptyTitle: string;
  emptyMessage: string;
}) {
  return (
    <section className="mt-9">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#176b52]">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {title}
          </h2>
        </div>

        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          {badge}
        </span>
      </div>

      {reviews.length > 0 ? (
        <div className="mt-5 space-y-5">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="font-semibold text-slate-800">
            {emptyTitle}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {emptyMessage}
          </p>
        </div>
      )}
    </section>
  );
}

function ReviewCard({
  review,
}: {
  review: MedicalReviewRecord;
}) {
  return (
    <article className="rounded-2xl border border-emerald-950/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#176b52]">
            Knowledge Review
          </p>

          <h3 className="mt-2 text-xl font-bold">
            {review.knowledgeTitle}
          </h3>

          <p className="mt-2 break-all text-xs text-slate-500">
            {review.id}
          </p>
        </div>

        <StatusBadge
          status={review.status}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Knowledge Entry
          </p>

          <p className="mt-2 break-all text-sm font-medium">
            {review.knowledgeEntryId}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Assigned Reviewer
          </p>

          <p className="mt-2 text-sm font-semibold">
            {review.assignedReviewerName ??
              "Not assigned"}
          </p>

          {review.assignedReviewerRole ? (
            <p className="mt-1 text-xs text-slate-500">
              {formatStatus(
                review.assignedReviewerRole,
              )}
            </p>
          ) : null}

          {review.assignedReviewerEmail ? (
            <p className="mt-1 break-all text-xs text-slate-500">
              {review.assignedReviewerEmail}
            </p>
          ) : null}
        </div>
      </div>

      {review.submissionNotes ? (
        <NoteBox
          title="Submission Notes"
          value={review.submissionNotes}
        />
      ) : null}

      {review.reviewNotes ? (
        <NoteBox
          title="Review Notes"
          value={review.reviewNotes}
        />
      ) : null}

      {review.hasPlaceholderReviewer ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-900">
            Placeholder reviewer detected
          </p>

          <p className="mt-1 text-sm leading-6 text-red-800">
            This historical review contains a test
            or placeholder reviewer identity. It
            must not be treated as genuine medical
            approval.
          </p>
        </div>
      ) : null}

      {review.status === "submitted" ? (
        <StartMedicalReviewForm
          reviewRequestId={review.id}
          knowledgeEntryId={
            review.knowledgeEntryId
          }
          knowledgeSlug={
            review.knowledgeSlug
          }
          knowledgeTitle={
            review.knowledgeTitle
          }
        />
      ) : null}

      {review.status === "in_review" ? (
        <MedicalReviewDecisionForm
          reviewRequestId={review.id}
          knowledgeEntryId={
            review.knowledgeEntryId
          }
          knowledgeSlug={
            review.knowledgeSlug
          }
          knowledgeTitle={
            review.knowledgeTitle
          }
          reviewerName={
            review.assignedReviewerName
          }
        />
      ) : null}

      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="font-bold">
            Review Timeline
          </h4>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {review.events.length} events
          </span>
        </div>

        {review.events.length > 0 ? (
          <div className="mt-4 space-y-3">
            {review.events.map(
              (event, index) => (
                <ReviewEventRow
                  key={event.id}
                  event={event}
                  isLatest={index === 0}
                />
              ),
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              No review events were found.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
        <p className="text-xs text-slate-500">
          Created{" "}
          {review.createdAt
            ? formatDateTime(
                review.createdAt,
              )
            : "date unavailable"}
        </p>

        {review.knowledgeSlug ? (
          <Link
            href={`/knowledge/${encodeURIComponent(
              review.knowledgeSlug,
            )}`}
            className="rounded-xl bg-[#0b4d3b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#176b52]"
          >
            Open Topic
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function ReviewEventRow({
  event,
  isLatest,
}: {
  event: MedicalReviewEvent;
  isLatest: boolean;
}) {
  return (
    <div
      className={
        event.isPlaceholderActor
          ? "rounded-xl border border-red-200 bg-red-50 p-4"
          : "rounded-xl border border-slate-200 bg-slate-50 p-4"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">
              {formatStatus(
                event.eventType,
              )}
            </p>

            {isLatest ? (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                Latest
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-slate-600">
            {event.actorName}

            {event.actorRole
              ? ` · ${formatStatus(
                  event.actorRole,
                )}`
              : ""}
          </p>

          {event.actorEmail ? (
            <p className="mt-1 break-all text-xs text-slate-500">
              {event.actorEmail}
            </p>
          ) : null}
        </div>

        <time className="text-xs text-slate-500">
          {event.createdAt
            ? formatDateTime(
                event.createdAt,
              )
            : "Time unavailable"}
        </time>
      </div>

      {event.notes ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {event.notes}
        </p>
      ) : null}
    </div>
  );
}

function NoteBox({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="mt-5 rounded-xl bg-[#f6f2e8] p-5">
      <p className="text-sm font-semibold">
        {title}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  let classes =
    "bg-slate-100 text-slate-700";

  if (status === "approved") {
    classes =
      "bg-emerald-100 text-emerald-800";
  } else if (status === "submitted") {
    classes =
      "bg-blue-100 text-blue-800";
  } else if (status === "in_review") {
    classes =
      "bg-violet-100 text-violet-800";
  } else if (
    status === "changes_requested"
  ) {
    classes =
      "bg-amber-100 text-amber-800";
  } else if (status === "rejected") {
    classes =
      "bg-red-100 text-red-800";
  } else if (status === "cancelled") {
    classes =
      "bg-slate-200 text-slate-700";
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function StatPill({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
      {label}: {value}
    </span>
  );
}

function formatStatus(
  status: string,
): string {
  return status
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function formatDateTime(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}