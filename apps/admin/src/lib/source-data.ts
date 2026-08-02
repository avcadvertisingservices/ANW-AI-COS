import "server-only";

import { createAdminClient } from "./supabase/admin";

export type SourceManagerRecord = {
  id: string;
  title: string;
  organization: string | null;
  publisher: string | null;
  url: string | null;
  status: string;
  eventType: string;
  knowledgeEntryId: string;
  knowledgeSlug: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  isRemoved: boolean;
  hasValidUrl: boolean;
};

export type SourceManagerData = {
  activeSources: SourceManagerRecord[];
  removedSources: SourceManagerRecord[];
  totalEvents: number;
  errorMessage: string | null;
};

type SourceEventRow = {
  id: string;
  knowledge_entry_id: string | null;
  knowledge_slug: string | null;
  source_id: string | null;
  event_type: string | null;
  after_source: unknown;
  before_source: unknown;
  created_at: string | null;
};

export async function getSourceManagerData(): Promise<SourceManagerData> {
  const supabase = createAdminClient();

  const result = await supabase
    .from("knowledge_source_events")
    .select(
      [
        "id",
        "knowledge_entry_id",
        "knowledge_slug",
        "source_id",
        "event_type",
        "after_source",
        "before_source",
        "created_at",
      ].join(","),
    )
    .order("created_at", { ascending: false });

  if (result.error) {
    return {
      activeSources: [],
      removedSources: [],
      totalEvents: 0,
      errorMessage: result.error.message,
    };
  }

  const events = (result.data ?? []) as SourceEventRow[];

  const latestEventBySource = new Map<string, SourceEventRow>();

  for (const event of events) {
    if (!event.source_id) {
      continue;
    }

    const compositeKey =
      (event.knowledge_entry_id ?? "unknown-entry") +
      "::" +
      event.source_id;

    if (!latestEventBySource.has(compositeKey)) {
      latestEventBySource.set(compositeKey, event);
    }
  }

  const records = Array.from(latestEventBySource.values()).map(
    normalizeSourceEvent,
  );

  const activeSources = records
    .filter((source) => !source.isRemoved)
    .sort(compareSources);

  const removedSources = records
    .filter((source) => source.isRemoved)
    .sort(compareSources);

  return {
    activeSources,
    removedSources,
    totalEvents: events.length,
    errorMessage: null,
  };
}

function normalizeSourceEvent(
  event: SourceEventRow,
): SourceManagerRecord {
  const eventType = event.event_type ?? "source_updated";

  const normalizedEventType = eventType.toLowerCase();

  const isRemoved =
    normalizedEventType === "source_removed" ||
    normalizedEventType === "source_deleted";

  const sourceData = isRemoved
    ? readObject(event.before_source)
    : readObject(event.after_source);

  const sourceId = event.source_id ?? "unknown-source";

  const url =
    readString(sourceData.url) ??
    readString(sourceData.sourceUrl) ??
    readString(sourceData.source_url) ??
    null;

  return {
    id: sourceId,
    title:
      readString(sourceData.title) ??
      readString(sourceData.name) ??
      formatSourceId(sourceId),

    organization:
      readString(sourceData.organization) ??
      readString(sourceData.organisation) ??
      null,

    publisher:
      readString(sourceData.publisher) ??
      readString(sourceData.provider) ??
      null,

    url,

    status:
      readString(sourceData.status) ??
      (isRemoved ? "removed" : "active"),

    eventType,

    knowledgeEntryId:
      event.knowledge_entry_id ??
      "Unknown knowledge entry",

    knowledgeSlug:
      event.knowledge_slug,

    createdAt:
      readString(sourceData.createdAt) ??
      readString(sourceData.created_at) ??
      event.created_at,

    updatedAt:
      readString(sourceData.updatedAt) ??
      readString(sourceData.updated_at) ??
      event.created_at,

    isRemoved,

    hasValidUrl: isValidHttpUrl(url),
  };
}

function compareSources(
  first: SourceManagerRecord,
  second: SourceManagerRecord,
): number {
  return first.title.localeCompare(second.title);
}

function readObject(
  value: unknown,
): Record<string, unknown> {
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

function readString(
  value: unknown,
): string | null {
  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    return value.trim();
  }

  return null;
}

function isValidHttpUrl(
  value: string | null,
): boolean {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

function formatSourceId(
  sourceId: string,
): string {
  return sourceId
    .replace(/^source\./, "")
    .split(/[._-]/)
    .filter(Boolean)
    .map((word) => {
      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}