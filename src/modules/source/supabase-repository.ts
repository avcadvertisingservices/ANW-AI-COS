import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  EvidenceLevel,
  KnowledgeCategory,
  KnowledgeEntry,
  KnowledgeSource,
  KnowledgeStatus,
} from "../knowledge/types.js";
import { KnowledgeSourceManagerError } from "./errors.js";
import type { KnowledgeSourceManagerRepository } from "./repository.js";
import type {
  KnowledgeSourceEvent,
  SourceManagerActor,
} from "./types.js";

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0
    ? value
    : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function sourceFromJson(value: unknown): KnowledgeSource | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const input = value as Record<string, unknown>;
  const id = stringValue(input.id);
  const title = stringValue(input.title);
  const evidenceLevel = stringValue(input.evidenceLevel) as EvidenceLevel;

  if (!id || !title || !evidenceLevel) return null;

  return {
    id,
    title,
    publisher: optionalString(input.publisher),
    url: optionalString(input.url),
    publicationDate: optionalString(
      input.publicationDate ?? input.publication_date,
    ),
    accessedDate: optionalString(
      input.accessedDate ?? input.accessed_date,
    ),
    evidenceLevel,
  };
}

function knowledgeFromRow(row: Record<string, unknown>): KnowledgeEntry {
  return {
    id: stringValue(row.id),
    slug: stringValue(row.slug),
    title: stringValue(row.title),
    summary: stringValue(row.summary),
    body: stringValue(row.body),
    category: stringValue(row.category, "resource") as KnowledgeCategory,
    status: stringValue(row.status, "draft") as KnowledgeStatus,
    tags: stringArray(row.tags),
    keywords: stringArray(row.keywords),
    aliases: stringArray(row.aliases),
    sources: Array.isArray(row.sources)
      ? row.sources
          .map(sourceFromJson)
          .filter((source): source is KnowledgeSource => Boolean(source))
      : [],
    medicalReviewRequired: Boolean(row.medical_review_required),
    reviewedBy: optionalString(row.reviewed_by),
    reviewedAt: optionalString(row.reviewed_at),
    createdAt: stringValue(row.created_at),
    updatedAt: stringValue(row.updated_at),
    version: stringValue(row.version, "1.0.0"),
  };
}

function actorFromJson(value: unknown): SourceManagerActor {
  const input = (value ?? {}) as Record<string, unknown>;
  const role = stringValue(input.role);

  return {
    name: stringValue(input.name, "Unknown actor"),
    role:
      role === "medical_reviewer" ||
      role === "administrator" ||
      role === "editorial_reviewer"
        ? role
        : "editorial_reviewer",
    userId: optionalString(input.userId),
    email: optionalString(input.email),
  };
}

function eventFromRow(row: Record<string, unknown>): KnowledgeSourceEvent {
  return {
    id: stringValue(row.id),
    knowledgeEntryId: stringValue(row.knowledge_entry_id),
    knowledgeSlug: stringValue(row.knowledge_slug),
    sourceId: stringValue(row.source_id),
    type: row.event_type as KnowledgeSourceEvent["type"],
    actor: actorFromJson(row.actor),
    beforeSource: sourceFromJson(row.before_source) ?? undefined,
    afterSource: sourceFromJson(row.after_source) ?? undefined,
    notes: optionalString(row.notes),
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {},
    createdAt: stringValue(row.created_at),
  };
}

export class SupabaseKnowledgeSourceManagerRepository
  implements KnowledgeSourceManagerRepository
{
  public constructor(private readonly client: SupabaseClient) {}

  private async find(
    field: "id" | "slug",
    value: string,
  ): Promise<KnowledgeEntry | null> {
    const { data, error } = await this.client
      .from("knowledge_entries")
      .select("*")
      .eq(field, value)
      .maybeSingle();

    if (error) {
      throw new KnowledgeSourceManagerError(
        `Failed to read knowledge entry: ${error.message}`,
        "SOURCE_DATABASE_READ_FAILED",
        [],
        error,
      );
    }

    return data ? knowledgeFromRow(data as Record<string, unknown>) : null;
  }

  public getKnowledgeById(id: string): Promise<KnowledgeEntry | null> {
    return this.find("id", id);
  }

  public getKnowledgeBySlug(slug: string): Promise<KnowledgeEntry | null> {
    return this.find("slug", slug);
  }

  public async saveKnowledge(
    entry: KnowledgeEntry,
  ): Promise<KnowledgeEntry> {
    const { data, error } = await this.client
      .from("knowledge_entries")
      .update({
        sources: entry.sources,
        status: entry.status,
        reviewed_by: entry.reviewedBy ?? null,
        reviewed_at: entry.reviewedAt ?? null,
        version: entry.version,
        updated_at: entry.updatedAt,
      })
      .eq("id", entry.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new KnowledgeSourceManagerError(
        `Failed to update knowledge sources: ${error?.message ?? "Unknown database error"}`,
        "SOURCE_DATABASE_UPDATE_FAILED",
        [],
        error,
      );
    }

    return knowledgeFromRow(data as Record<string, unknown>);
  }

  public async addEvent(
    event: KnowledgeSourceEvent,
  ): Promise<KnowledgeSourceEvent> {
    const { data, error } = await this.client
      .from("knowledge_source_events")
      .insert({
        id: event.id,
        knowledge_entry_id: event.knowledgeEntryId,
        knowledge_slug: event.knowledgeSlug,
        source_id: event.sourceId,
        event_type: event.type,
        actor: event.actor,
        before_source: event.beforeSource ?? null,
        after_source: event.afterSource ?? null,
        notes: event.notes ?? null,
        metadata: event.metadata,
        created_at: event.createdAt,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new KnowledgeSourceManagerError(
        `Failed to create knowledge source event: ${error?.message ?? "Unknown database error"}`,
        "SOURCE_EVENT_CREATE_FAILED",
        [],
        error,
      );
    }

    return eventFromRow(data as Record<string, unknown>);
  }

  public async listEvents(
    knowledgeEntryId: string,
  ): Promise<KnowledgeSourceEvent[]> {
    const { data, error } = await this.client
      .from("knowledge_source_events")
      .select("*")
      .eq("knowledge_entry_id", knowledgeEntryId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new KnowledgeSourceManagerError(
        `Failed to list knowledge source events: ${error.message}`,
        "SOURCE_EVENT_LIST_FAILED",
        [],
        error,
      );
    }

    return (data ?? []).map((row: unknown) =>
      eventFromRow(row as Record<string, unknown>),
    );
  }
}
