import { createClient } from "@supabase/supabase-js";

import { KnowledgeService } from "./service.js";
import { SupabaseKnowledgeRepository } from "./supabase-repository.js";

/**
 * Reads and validates the Supabase configuration.
 *
 * Supported server key names:
 * - SUPABASE_SECRET_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * SUPABASE_SECRET_KEY is preferred for new Supabase projects.
 */
function getSupabaseConfiguration(): {
  supabaseUrl: string;
  supabaseSecretKey: string;
} {
  const supabaseUrl =
    process.env.SUPABASE_URL?.trim() ?? "";

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "";

  if (!supabaseUrl) {
    throw new Error(
      [
        "SUPABASE_URL is missing.",
        "Open the local .env file and add:",
        "SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co",
      ].join("\n"),
    );
  }

  if (
    !supabaseUrl.startsWith("https://") ||
    !supabaseUrl.includes(".supabase.co")
  ) {
    throw new Error(
      [
        "SUPABASE_URL is invalid.",
        "It should look like:",
        "https://YOUR_PROJECT_REF.supabase.co",
      ].join("\n"),
    );
  }

  if (!supabaseSecretKey) {
    throw new Error(
      [
        "A Supabase server key is missing.",
        "Add one of these to your local .env file:",
        "SUPABASE_SECRET_KEY=your_real_secret_key",
        "or",
        "SUPABASE_SERVICE_ROLE_KEY=your_real_service_role_key",
      ].join("\n"),
    );
  }

  const placeholderValues = [
    "your_real_secret_key",
    "your_supabase_secret_key",
    "your_service_role_key",
    "your_real_service_role_key",
    "your_project_ref",
    "replace_me",
    "placeholder",
  ];

  const normalizedKey =
    supabaseSecretKey.toLowerCase();

  const containsPlaceholder =
    placeholderValues.some((placeholder) =>
      normalizedKey.includes(placeholder),
    );

  if (containsPlaceholder) {
    throw new Error(
      [
        "The Supabase key is still a placeholder.",
        "Replace it with the real Secret key from your ANW Supabase project.",
        "Do not paste that key into chat or GitHub.",
      ].join("\n"),
    );
  }

  const looksLikeNewSecretKey =
    supabaseSecretKey.startsWith("sb_secret_");

  const looksLikeLegacyJwt =
    supabaseSecretKey.startsWith("eyJ");

  if (
    !looksLikeNewSecretKey &&
    !looksLikeLegacyJwt
  ) {
    throw new Error(
      [
        "The Supabase server key has an unexpected format.",
        "Use either:",
        "- a new Supabase Secret key beginning with sb_secret_",
        "- or a legacy service_role JWT beginning with eyJ",
      ].join("\n"),
    );
  }

  return {
    supabaseUrl,
    supabaseSecretKey,
  };
}

/**
 * Creates the server-side Supabase client.
 *
 * This client is intended only for trusted backend code.
 * It must never be included in browser-side JavaScript.
 */
export function createSupabaseServerClient() {
  const {
    supabaseUrl,
    supabaseSecretKey,
  } = getSupabaseConfiguration();

  return createClient(
    supabaseUrl,
    supabaseSecretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },

      global: {
        headers: {
          "x-application-name": "ANW-AI-COS",
        },
      },
    },
  );
}

/**
 * Creates the complete Supabase-backed Knowledge Service.
 */
export function createSupabaseKnowledgeService(): KnowledgeService {
  const supabaseClient =
    createSupabaseServerClient();

  const repository =
    new SupabaseKnowledgeRepository(
      supabaseClient,
    );

  return new KnowledgeService(repository);
}