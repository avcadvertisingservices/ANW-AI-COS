import type {
  EvidenceLevel,
} from "../knowledge/types.js";
import type {
  SourceManagerActor,
  SourceManagerActorRole,
} from "./types.js";

export function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

export function optionalEnvironment(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

export function environmentEvidenceLevel(): EvidenceLevel {
  const value = requiredEnvironment("SOURCE_EVIDENCE_LEVEL");

  if (
    value !== "community" &&
    value !== "educational" &&
    value !== "clinical" &&
    value !== "research"
  ) {
    throw new Error(
      "SOURCE_EVIDENCE_LEVEL must be community, educational, clinical, or research.",
    );
  }

  return value;
}

export function environmentActor(): SourceManagerActor {
  const roleValue =
    process.env.SOURCE_ACTOR_ROLE?.trim() || "editorial_reviewer";

  if (
    roleValue !== "editorial_reviewer" &&
    roleValue !== "medical_reviewer" &&
    roleValue !== "administrator"
  ) {
    throw new Error(
      "SOURCE_ACTOR_ROLE must be editorial_reviewer, medical_reviewer, or administrator.",
    );
  }

  return {
    name:
      process.env.SOURCE_ACTOR_NAME?.trim() || "ANW Editorial Team",
    role: roleValue as SourceManagerActorRole,
    email: optionalEnvironment("SOURCE_ACTOR_EMAIL"),
  };
}
