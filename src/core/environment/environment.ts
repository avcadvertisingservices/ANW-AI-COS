import "dotenv/config";
import { requireEnvironmentVariables } from "./validation.js";

export type NodeEnvironment = "development" | "test" | "production";

export interface Environment {
  appName: string;
  appVersion: string;
  nodeEnv: NodeEnvironment;
  openAiApiKey?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

function normalizeNodeEnvironment(value: string | undefined): NodeEnvironment {
  return value === "production" || value === "test" ? value : "development";
}

export function loadEnvironment(): Environment {
  requireEnvironmentVariables(process.env, ["APP_NAME", "APP_VERSION", "NODE_ENV"]);

  return Object.freeze({
    appName: process.env.APP_NAME!.trim(),
    appVersion: process.env.APP_VERSION!.trim(),
    nodeEnv: normalizeNodeEnvironment(process.env.NODE_ENV),
    openAiApiKey: process.env.OPENAI_API_KEY?.trim() || undefined,
    supabaseUrl: process.env.SUPABASE_URL?.trim() || undefined,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY?.trim() || undefined,
  });
}
