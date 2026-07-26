import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../core/database/database.types.js";

export interface SupabaseEnvironment {
  url: string;
  serviceRoleKey: string;
}

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    );
  }

  return value;
}

export function readSupabaseEnvironment(): SupabaseEnvironment {
  return {
    url: requireEnvironmentVariable("SUPABASE_URL"),
    serviceRoleKey: requireEnvironmentVariable(
      "SUPABASE_SERVICE_ROLE_KEY",
    ),
  };
}

export function createSupabaseAdminClient(
  environment: SupabaseEnvironment = readSupabaseEnvironment(),
): SupabaseClient<Database> {
  return createClient<Database>(
    environment.url,
    environment.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
}
