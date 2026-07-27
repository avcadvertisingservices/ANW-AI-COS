import type {
  KnowledgeApprovalGateway,
  KnowledgeReviewRepository,
} from "./repository.js";
import type {
  KnowledgeRecordSnapshot,
  KnowledgeReviewEvent,
  KnowledgeReviewRequest,
} from "./types.js";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class InMemoryKnowledgeReviewRepository
  implements KnowledgeReviewRepository
{
  private readonly requests = new Map<
    string,
    KnowledgeReviewRequest
  >();

  private readonly events: KnowledgeReviewEvent[] = [];

  public async createRequest(
    request: KnowledgeReviewRequest,
  ): Promise<KnowledgeReviewRequest> {
    this.requests.set(request.id, clone(request));
    return clone(request);
  }

  public async getRequest(
    id: string,
  ): Promise<KnowledgeReviewRequest | null> {
    const request = this.requests.get(id);
    return request ? clone(request) : null;
  }

  public async updateRequest(
    request: KnowledgeReviewRequest,
  ): Promise<KnowledgeReviewRequest> {
    this.requests.set(request.id, clone(request));
    return clone(request);
  }

  public async addEvent(
    event: KnowledgeReviewEvent,
  ): Promise<KnowledgeReviewEvent> {
    this.events.push(clone(event));
    return clone(event);
  }

  public async listEvents(
    reviewRequestId: string,
  ): Promise<KnowledgeReviewEvent[]> {
    return this.events
      .filter(
        (event) => event.reviewRequestId === reviewRequestId,
      )
      .map(clone);
  }
}

export class InMemoryKnowledgeApprovalGateway
  implements KnowledgeApprovalGateway
{
  private readonly entries = new Map<
    string,
    KnowledgeRecordSnapshot
  >();

  public constructor(entries: KnowledgeRecordSnapshot[] = []) {
    for (const entry of entries) {
      this.entries.set(entry.id, clone(entry));
    }
  }

  public async getById(
    id: string,
  ): Promise<KnowledgeRecordSnapshot | null> {
    const entry = this.entries.get(id);
    return entry ? clone(entry) : null;
  }

  public async getBySlug(
    slug: string,
  ): Promise<KnowledgeRecordSnapshot | null> {
    const entry = [...this.entries.values()].find(
      (candidate) => candidate.slug === slug,
    );

    return entry ? clone(entry) : null;
  }

  public async approve(
    id: string,
    reviewerName: string,
    reviewedAt: string,
  ): Promise<KnowledgeRecordSnapshot> {
    const existing = this.entries.get(id);

    if (!existing) {
      throw new Error(`Knowledge entry ${id} was not found.`);
    }

    const approved: KnowledgeRecordSnapshot = {
      ...existing,
      status: "approved",
      reviewedBy: reviewerName,
      reviewedAt,
      updatedAt: reviewedAt,
    };

    this.entries.set(id, clone(approved));
    return clone(approved);
  }
}
