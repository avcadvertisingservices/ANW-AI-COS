import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../core/database/database.types.js";
import {
  KnowledgeConflictError,
  KnowledgeError,
} from "./errors.js";
import type {
  KnowledgeEntry,
  KnowledgeRepository,
} from "./types.js";
import { validateKnowledgeEntry } from "./validators.js";
import {
  knowledgeDomainToInsert,
  knowledgeDomainToUpdate,
  knowledgeRowToDomain,
} from "./supabase-mapper.js";

const TABLE_NAME = "knowledge_entries";

function isUniqueViolation(code?: string): boolean {
  return code === "23505";
}

export class SupabaseKnowledgeRepository
  implements KnowledgeRepository
{
  public constructor(
    private readonly client: SupabaseClient<Database>,
  ) {}

  public async add(entry: KnowledgeEntry): Promise<void> {
    validateKnowledgeEntry(entry);

    const { error } = await this.client
      .from(TABLE_NAME)
      .insert(knowledgeDomainToInsert(entry));

    if (error) {
      if (isUniqueViolation(error.code)) {
        throw new KnowledgeConflictError(
          `Knowledge entry "${entry.id}" or slug "${entry.slug}" already exists.`,
        );
      }

      throw new KnowledgeError(
        `Failed to create knowledge entry: ${error.message}`,
        "KNOWLEDGE_DATABASE_INSERT_FAILED",
      );
    }
  }

  public async update(entry: KnowledgeEntry): Promise<void> {
    validateKnowledgeEntry(entry);

    const { data, error } = await this.client
      .from(TABLE_NAME)
      .update(knowledgeDomainToUpdate(entry))
      .eq("id", entry.id)
      .select("id")
      .maybeSingle();

    if (error) {
      if (isUniqueViolation(error.code)) {
        throw new KnowledgeConflictError(
          `Knowledge slug "${entry.slug}" already exists.`,
        );
      }

      throw new KnowledgeError(
        `Failed to update knowledge entry: ${error.message}`,
        "KNOWLEDGE_DATABASE_UPDATE_FAILED",
      );
    }

    if (!data) {
      throw new KnowledgeError(
        `Knowledge entry "${entry.id}" was not found.`,
        "KNOWLEDGE_NOT_FOUND",
      );
    }
  }

  public async getById(
    id: string,
  ): Promise<KnowledgeEntry | null> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new KnowledgeError(
        `Failed to read knowledge entry: ${error.message}`,
        "KNOWLEDGE_DATABASE_READ_FAILED",
      );
    }

    return data ? knowledgeRowToDomain(data) : null;
  }

  public async getBySlug(
    slug: string,
  ): Promise<KnowledgeEntry | null> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new KnowledgeError(
        `Failed to read knowledge slug: ${error.message}`,
        "KNOWLEDGE_DATABASE_READ_FAILED",
      );
    }

    return data ? knowledgeRowToDomain(data) : null;
  }

  public async list(): Promise<KnowledgeEntry[]> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      throw new KnowledgeError(
        `Failed to list knowledge entries: ${error.message}`,
        "KNOWLEDGE_DATABASE_LIST_FAILED",
      );
    }

    return (data ?? []).map(knowledgeRowToDomain);
  }

  public async remove(id: string): Promise<boolean> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new KnowledgeError(
        `Failed to delete knowledge entry: ${error.message}`,
        "KNOWLEDGE_DATABASE_DELETE_FAILED",
      );
    }

    return Boolean(data);
  }
}
