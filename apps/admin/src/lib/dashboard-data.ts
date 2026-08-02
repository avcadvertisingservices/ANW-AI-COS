import "server-only";

import { getKnowledgeLibraryData } from "./knowledge-data";
import { getMedicalReviewData } from "./review-data";

export type DashboardActiveReview = {
  id: string;
  knowledgeEntryId: string;
  knowledgeSlug: string | null;
  status: string;
  reviewerName: string | null;
  updatedAt: string | null;
};

export type DashboardData = {
  knowledgeTopicCount: number;
  sourceCount: number;
  submittedReviewCount: number;
  activeReview: DashboardActiveReview | null;
  errorMessage: string | null;
};

export async function getDashboardData(): Promise<DashboardData> {
  const [knowledgeData, reviewData] = await Promise.all([
    getKnowledgeLibraryData(),
    getMedicalReviewData(),
  ]);

  const errors = [
    knowledgeData.errorMessage,
    reviewData.errorMessage,
  ].filter(
    (message): message is string =>
      typeof message === "string" &&
      message.trim().length > 0,
  );

  if (errors.length > 0) {
    return {
      knowledgeTopicCount: 0,
      sourceCount: 0,
      submittedReviewCount: 0,
      activeReview: null,
      errorMessage: errors.join(" | "),
    };
  }

  const sourceCount = knowledgeData.entries.reduce(
    (total, entry) => {
      return total + entry.sourceCount;
    },
    0,
  );

  const activeReviewRecord =
    findPriorityActiveReview(
      reviewData.activeReviews,
    );

  const activeReview: DashboardActiveReview | null =
    activeReviewRecord
      ? {
          id: activeReviewRecord.id,
          knowledgeEntryId:
            activeReviewRecord.knowledgeEntryId,
          knowledgeSlug:
            activeReviewRecord.knowledgeSlug,
          status:
            activeReviewRecord.status,
          reviewerName:
            activeReviewRecord.assignedReviewerName,
          updatedAt:
            activeReviewRecord.updatedAt ??
            activeReviewRecord.createdAt,
        }
      : null;

  return {
    knowledgeTopicCount:
      knowledgeData.entries.length,

    sourceCount,

    submittedReviewCount:
      reviewData.counts.submitted,

    activeReview,

    errorMessage: null,
  };
}

function findPriorityActiveReview<
  T extends {
    status: string;
    updatedAt: string | null;
    createdAt: string | null;
  },
>(reviews: T[]): T | null {
  if (reviews.length === 0) {
    return null;
  }

  const statusPriority: Record<string, number> = {
    changes_requested: 1,
    in_review: 2,
    submitted: 3,
    draft: 4,
  };

  const sortedReviews = [...reviews].sort(
    (first, second) => {
      const firstPriority =
        statusPriority[first.status] ?? 99;

      const secondPriority =
        statusPriority[second.status] ?? 99;

      if (firstPriority !== secondPriority) {
        return firstPriority - secondPriority;
      }

      const firstDate = getTimestamp(
        first.updatedAt ??
          first.createdAt,
      );

      const secondDate = getTimestamp(
        second.updatedAt ??
          second.createdAt,
      );

      return secondDate - firstDate;
    },
  );

  return sortedReviews[0] ?? null;
}

function getTimestamp(
  value: string | null,
): number {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}