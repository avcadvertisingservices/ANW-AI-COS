import "server-only";

import { createAdminClient } from "./supabase/admin";

export type SourceManagerRecord = {
  id: string;
  knowledgeEntryId: string;
  knowledgeSlug: string | null;
  knowledgeTitle: string | null;

  sourceType: string;
  title: string;
  authors: string | null;
  organization: string | null;
  publicationDate: string | null;
  journal: string | null;
  doi: string | null;
  pmid: string | null;
  url: string | null;
  citation: string | null;
  evidenceLevel: string | null;
  notes: string | null;

  verified: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  hasValidUrl: boolean;
};

export type SourceManagerData = {
  allSources: SourceManagerRecord[];
  verifiedSources: SourceManagerRecord[];
  unverifiedSources: SourceManagerRecord[];
  linkedKnowledgeEntries: number;
  errorMessage: string | null;
};

type KnowledgeSourceRow = {
  id: string;
  knowledge_entry_id: string;
  source_type: string;
  title: string;
  authors: string | null;
  organization: string | null;
  publication_date: string | null;
  journal: string | null;
  doi: string | null;
  pmid: string | null;
  url: string | null;
  citation: string | null;
  evidence_level: string | null;
  notes: string | null;
  verified: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type KnowledgeEntryRow = {
  id: string;
  slug: string | null;
  title: string | null;
};

export async function getSourceManagerData(): Promise<SourceManagerData> {
  const supabase = createAdminClient();

  const sourceResult = await supabase
    .from("knowledge_sources")
    .select(
      "id,knowledge_entry_id,source_type,title,authors,organization,publication_date,journal,doi,pmid,url,citation,evidence_level,notes,verified,created_at,updated_at",
    )
    .order("updated_at", {
      ascending: false,
    });

  if (sourceResult.error) {
    return createErrorResult(
      sourceResult.error.message,
    );
  }

  const sourceRows =
    (sourceResult.data ??
      []) as unknown as KnowledgeSourceRow[];

  const knowledgeEntryIds = Array.from(
    new Set(
      sourceRows
        .map(
          (source) =>
            source.knowledge_entry_id,
        )
        .filter(Boolean),
    ),
  );

  const knowledgeEntryMap = new Map<
    string,
    KnowledgeEntryRow
  >();

  if (knowledgeEntryIds.length > 0) {
    const knowledgeResult = await supabase
      .from("knowledge_entries")
      .select("id,slug,title")
      .in("id", knowledgeEntryIds);

    if (knowledgeResult.error) {
      return createErrorResult(
        knowledgeResult.error.message,
      );
    }

    const knowledgeRows =
      (knowledgeResult.data ??
        []) as unknown as KnowledgeEntryRow[];

    for (const entry of knowledgeRows) {
      knowledgeEntryMap.set(
        entry.id,
        entry,
      );
    }
  }

  const allSources = sourceRows
    .map((source) => {
      const knowledgeEntry =
        knowledgeEntryMap.get(
          source.knowledge_entry_id,
        );

      return normalizeSource(
        source,
        knowledgeEntry,
      );
    })
    .sort(compareSources);

  const verifiedSources =
    allSources.filter(
      (source) => source.verified,
    );

  const unverifiedSources =
    allSources.filter(
      (source) => !source.verified,
    );

  const linkedKnowledgeEntries =
    new Set(
      allSources.map(
        (source) =>
          source.knowledgeEntryId,
      ),
    ).size;

  return {
    allSources,
    verifiedSources,
    unverifiedSources,
    linkedKnowledgeEntries,
    errorMessage: null,
  };
}

function normalizeSource(
  source: KnowledgeSourceRow,
  knowledgeEntry:
    | KnowledgeEntryRow
    | undefined,
): SourceManagerRecord {
  const url =
    readNullableString(source.url);

  return {
    id: source.id,

    knowledgeEntryId:
      source.knowledge_entry_id,

    knowledgeSlug:
      readNullableString(
        knowledgeEntry?.slug,
      ),

    knowledgeTitle:
      readNullableString(
        knowledgeEntry?.title,
      ),

    sourceType:
      readNullableString(
        source.source_type,
      ) ?? "Other",

    title:
      readNullableString(
        source.title,
      ) ?? "Untitled evidence source",

    authors:
      readNullableString(
        source.authors,
      ),

    organization:
      readNullableString(
        source.organization,
      ),

    publicationDate:
      readNullableString(
        source.publication_date,
      ),

    journal:
      readNullableString(
        source.journal,
      ),

    doi:
      readNullableString(
        source.doi,
      ),

    pmid:
      readNullableString(
        source.pmid,
      ),

    url,

    citation:
      readNullableString(
        source.citation,
      ),

    evidenceLevel:
      readNullableString(
        source.evidence_level,
      ),

    notes:
      readNullableString(
        source.notes,
      ),

    verified:
      source.verified === true,

    createdAt:
      readNullableString(
        source.created_at,
      ),

    updatedAt:
      readNullableString(
        source.updated_at,
      ),

    hasValidUrl:
      isValidHttpUrl(url),
  };
}

function createErrorResult(
  message: string,
): SourceManagerData {
  return {
    allSources: [],
    verifiedSources: [],
    unverifiedSources: [],
    linkedKnowledgeEntries: 0,
    errorMessage: message,
  };
}

function compareSources(
  first: SourceManagerRecord,
  second: SourceManagerRecord,
): number {
  if (
    first.verified !== second.verified
  ) {
    return first.verified ? -1 : 1;
  }

  return first.title.localeCompare(
    second.title,
  );
}

function readNullableString(
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