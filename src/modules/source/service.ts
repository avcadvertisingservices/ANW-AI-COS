import { randomUUID } from "node:crypto";
import type {
  KnowledgeEntry,
  KnowledgeSource,
} from "../knowledge/types.js";
import { KnowledgeSourceManagerError } from "./errors.js";
import {
  canonicalizeSourceUrl,
  evaluateKnowledgeSource,
  evaluateSourceCollection,
} from "./policy.js";
import type { KnowledgeSourceManagerRepository } from "./repository.js";
import type {
  AddKnowledgeSourceInput,
  KnowledgeSourceEvent,
  KnowledgeSourceInput,
  KnowledgeSourceMutationResult,
  RemoveKnowledgeSourceInput,
  SourceManagerActor,
  UpdateKnowledgeSourceInput,
} from "./types.js";

function nowIso(): string {
  return new Date().toISOString();
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function bumpPatchVersion(version: string): string {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version.trim());

  if (!match) return "1.0.1";

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);

  return `${major}.${minor}.${patch + 1}`;
}

export class KnowledgeSourceManagerService {
  public constructor(
    private readonly repository: KnowledgeSourceManagerRepository,
  ) {}

  private async requiredEntry(id: string): Promise<KnowledgeEntry> {
    const entry = await this.repository.getKnowledgeById(id);

    if (!entry) {
      throw new KnowledgeSourceManagerError(
        `Knowledge entry ${id} was not found.`,
        "KNOWLEDGE_ENTRY_NOT_FOUND",
      );
    }

    return entry;
  }

  private async requiredEntryBySlug(slug: string): Promise<KnowledgeEntry> {
    const entry = await this.repository.getKnowledgeBySlug(slug);

    if (!entry) {
      throw new KnowledgeSourceManagerError(
        `Knowledge entry with slug ${slug} was not found.`,
        "KNOWLEDGE_ENTRY_NOT_FOUND",
      );
    }

    return entry;
  }

  private ensureMutable(entry: KnowledgeEntry): void {
    if (entry.status === "archived") {
      throw new KnowledgeSourceManagerError(
        "Archived knowledge entries cannot be modified.",
        "KNOWLEDGE_ENTRY_ARCHIVED",
      );
    }
  }

  private prepareSource(
    input: KnowledgeSourceInput,
    entry: KnowledgeEntry,
    existingId?: string,
  ): KnowledgeSource {
    const sourceId = existingId ?? input.id?.trim() ?? `source.${randomUUID()}`;
    const report = evaluateKnowledgeSource(input, entry.category);

    if (!report.valid || !report.normalizedUrl) {
      throw new KnowledgeSourceManagerError(
        "Knowledge source did not pass validation.",
        "SOURCE_POLICY_FAILED",
        report.errors,
      );
    }

    return {
      id: sourceId,
      title: input.title.trim(),
      publisher: input.publisher.trim(),
      url: report.normalizedUrl,
      publicationDate: input.publicationDate?.trim() || undefined,
      accessedDate: input.accessedDate?.trim() || todayDate(),
      evidenceLevel: input.evidenceLevel,
    };
  }

  private updatedEntry(
    entry: KnowledgeEntry,
    sources: KnowledgeSource[],
    timestamp: string,
  ): { entry: KnowledgeEntry; reviewReset: boolean } {
    const reviewReset =
      entry.status === "approved" || entry.status === "review";

    return {
      reviewReset,
      entry: {
        ...entry,
        sources,
        status: reviewReset ? "draft" : entry.status,
        reviewedBy: reviewReset ? undefined : entry.reviewedBy,
        reviewedAt: reviewReset ? undefined : entry.reviewedAt,
        updatedAt: timestamp,
        version: bumpPatchVersion(entry.version),
      },
    };
  }

  private async recordEvent(input: {
    entryBefore: KnowledgeEntry;
    entryAfter: KnowledgeEntry;
    sourceId: string;
    type: KnowledgeSourceEvent["type"];
    actor: SourceManagerActor;
    beforeSource?: KnowledgeSource;
    afterSource?: KnowledgeSource;
    notes?: string;
    reviewReset: boolean;
    timestamp: string;
  }): Promise<KnowledgeSourceEvent> {
    const event: KnowledgeSourceEvent = {
      id: randomUUID(),
      knowledgeEntryId: input.entryAfter.id,
      knowledgeSlug: input.entryAfter.slug,
      sourceId: input.sourceId,
      type: input.type,
      actor: input.actor,
      beforeSource: input.beforeSource,
      afterSource: input.afterSource,
      notes: input.notes?.trim() || undefined,
      metadata: {
        previousStatus: input.entryBefore.status,
        newStatus: input.entryAfter.status,
        previousVersion: input.entryBefore.version,
        newVersion: input.entryAfter.version,
        previousSourceCount: input.entryBefore.sources.length,
        newSourceCount: input.entryAfter.sources.length,
        reviewReset: input.reviewReset,
      },
      createdAt: input.timestamp,
    };

    return this.repository.addEvent(event);
  }

  private duplicateUrl(
    sources: KnowledgeSource[],
    source: KnowledgeSource,
    ignoredSourceId?: string,
  ): boolean {
    const candidate = canonicalizeSourceUrl(source.url ?? "").normalizedUrl;

    return sources.some((existing) => {
      if (ignoredSourceId && existing.id === ignoredSourceId) return false;
      const current = canonicalizeSourceUrl(existing.url ?? "").normalizedUrl;
      return Boolean(candidate && current && candidate === current);
    });
  }

  public async evaluateEntryBySlug(slug: string) {
    const entry = await this.requiredEntryBySlug(slug);

    return {
      entry,
      policy: evaluateSourceCollection(entry.sources, entry.category),
    };
  }

  public async addSource(
    input: AddKnowledgeSourceInput,
  ): Promise<KnowledgeSourceMutationResult> {
    const existing = await this.requiredEntry(input.knowledgeEntryId);
    this.ensureMutable(existing);

    const source = this.prepareSource(input.source, existing);

    if (existing.sources.some((item) => item.id === source.id)) {
      throw new KnowledgeSourceManagerError(
        `Source ID ${source.id} already exists on this knowledge entry.`,
        "SOURCE_ID_CONFLICT",
      );
    }

    if (this.duplicateUrl(existing.sources, source)) {
      throw new KnowledgeSourceManagerError(
        "This source URL is already attached to the knowledge entry.",
        "SOURCE_URL_CONFLICT",
      );
    }

    const timestamp = nowIso();
    const prepared = this.updatedEntry(
      existing,
      [...existing.sources, source],
      timestamp,
    );

    const collectionReport = evaluateSourceCollection(
      prepared.entry.sources,
      prepared.entry.category,
    );

    if (!collectionReport.valid) {
      throw new KnowledgeSourceManagerError(
        "The updated source collection is invalid.",
        "SOURCE_COLLECTION_POLICY_FAILED",
        collectionReport.errors,
      );
    }

    const saved = await this.repository.saveKnowledge(prepared.entry);
    const event = await this.recordEvent({
      entryBefore: existing,
      entryAfter: saved,
      sourceId: source.id,
      type: "source_added",
      actor: input.actor,
      afterSource: source,
      notes: input.notes,
      reviewReset: prepared.reviewReset,
      timestamp,
    });

    return {
      entry: saved,
      event,
      reviewReset: prepared.reviewReset,
    };
  }

  public async addSourceBySlug(
    slug: string,
    source: KnowledgeSourceInput,
    actor: SourceManagerActor,
    notes?: string,
  ): Promise<KnowledgeSourceMutationResult> {
    const entry = await this.requiredEntryBySlug(slug);
    return this.addSource({
      knowledgeEntryId: entry.id,
      source,
      actor,
      notes,
    });
  }

  public async updateSource(
    input: UpdateKnowledgeSourceInput,
  ): Promise<KnowledgeSourceMutationResult> {
    const existing = await this.requiredEntry(input.knowledgeEntryId);
    this.ensureMutable(existing);

    const index = existing.sources.findIndex(
      (source) => source.id === input.sourceId,
    );

    if (index < 0) {
      throw new KnowledgeSourceManagerError(
        `Source ${input.sourceId} was not found.`,
        "SOURCE_NOT_FOUND",
      );
    }

    const beforeSource = existing.sources[index];

    if (!beforeSource) {
      throw new KnowledgeSourceManagerError(
        `Source ${input.sourceId} was not found.`,
        "SOURCE_NOT_FOUND",
      );
    }

    const sourceInput: KnowledgeSourceInput = {
      id: beforeSource.id,
      title: input.changes.title ?? beforeSource.title,
      publisher: input.changes.publisher ?? beforeSource.publisher ?? "",
      url: input.changes.url ?? beforeSource.url ?? "",
      publicationDate:
        input.changes.publicationDate ?? beforeSource.publicationDate,
      accessedDate:
        input.changes.accessedDate ?? beforeSource.accessedDate,
      evidenceLevel:
        input.changes.evidenceLevel ?? beforeSource.evidenceLevel,
    };

    const afterSource = this.prepareSource(
      sourceInput,
      existing,
      beforeSource.id,
    );

    if (
      this.duplicateUrl(
        existing.sources,
        afterSource,
        beforeSource.id,
      )
    ) {
      throw new KnowledgeSourceManagerError(
        "This source URL is already attached to the knowledge entry.",
        "SOURCE_URL_CONFLICT",
      );
    }

    const updatedSources = existing.sources.map((source) =>
      source.id === beforeSource.id ? afterSource : source,
    );

    const timestamp = nowIso();
    const prepared = this.updatedEntry(existing, updatedSources, timestamp);
    const collectionReport = evaluateSourceCollection(
      prepared.entry.sources,
      prepared.entry.category,
    );

    if (!collectionReport.valid) {
      throw new KnowledgeSourceManagerError(
        "The updated source collection is invalid.",
        "SOURCE_COLLECTION_POLICY_FAILED",
        collectionReport.errors,
      );
    }

    const saved = await this.repository.saveKnowledge(prepared.entry);
    const event = await this.recordEvent({
      entryBefore: existing,
      entryAfter: saved,
      sourceId: beforeSource.id,
      type: "source_updated",
      actor: input.actor,
      beforeSource,
      afterSource,
      notes: input.notes,
      reviewReset: prepared.reviewReset,
      timestamp,
    });

    return {
      entry: saved,
      event,
      reviewReset: prepared.reviewReset,
    };
  }

  public async updateSourceBySlug(
    slug: string,
    sourceId: string,
    changes: UpdateKnowledgeSourceInput["changes"],
    actor: SourceManagerActor,
    notes?: string,
  ): Promise<KnowledgeSourceMutationResult> {
    const entry = await this.requiredEntryBySlug(slug);
    return this.updateSource({
      knowledgeEntryId: entry.id,
      sourceId,
      changes,
      actor,
      notes,
    });
  }

  public async removeSource(
    input: RemoveKnowledgeSourceInput,
  ): Promise<KnowledgeSourceMutationResult> {
    const existing = await this.requiredEntry(input.knowledgeEntryId);
    this.ensureMutable(existing);

    const beforeSource = existing.sources.find(
      (source) => source.id === input.sourceId,
    );

    if (!beforeSource) {
      throw new KnowledgeSourceManagerError(
        `Source ${input.sourceId} was not found.`,
        "SOURCE_NOT_FOUND",
      );
    }

    const timestamp = nowIso();
    const prepared = this.updatedEntry(
      existing,
      existing.sources.filter((source) => source.id !== input.sourceId),
      timestamp,
    );

    const saved = await this.repository.saveKnowledge(prepared.entry);
    const event = await this.recordEvent({
      entryBefore: existing,
      entryAfter: saved,
      sourceId: beforeSource.id,
      type: "source_removed",
      actor: input.actor,
      beforeSource,
      notes: input.notes,
      reviewReset: prepared.reviewReset,
      timestamp,
    });

    return {
      entry: saved,
      event,
      reviewReset: prepared.reviewReset,
    };
  }

  public async removeSourceBySlug(
    slug: string,
    sourceId: string,
    actor: SourceManagerActor,
    notes?: string,
  ): Promise<KnowledgeSourceMutationResult> {
    const entry = await this.requiredEntryBySlug(slug);
    return this.removeSource({
      knowledgeEntryId: entry.id,
      sourceId,
      actor,
      notes,
    });
  }

  public listEvents(
    knowledgeEntryId: string,
  ): Promise<KnowledgeSourceEvent[]> {
    return this.repository.listEvents(knowledgeEntryId);
  }
}
