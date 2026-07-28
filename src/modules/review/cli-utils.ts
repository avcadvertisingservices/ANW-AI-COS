import type {
  ReviewActor,
  ReviewerRole,
} from "./types.js";

const validReviewerRoles = new Set<ReviewerRole>([
  "medical_reviewer",
  "editorial_reviewer",
  "administrator",
]);

export function requiredEnvironmentValue(
  name: string,
): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    );
  }

  return value;
}

export function optionalEnvironmentValue(
  name: string,
): string | undefined {
  const value = process.env[name]?.trim();

  return value || undefined;
}

export function parseReviewerRole(
  value: string,
  variableName: string,
): ReviewerRole {
  if (
    validReviewerRoles.has(
      value as ReviewerRole,
    )
  ) {
    return value as ReviewerRole;
  }

  throw new Error(
    [
      `${variableName} is invalid: ${value}`,
      "Allowed values:",
      "- medical_reviewer",
      "- editorial_reviewer",
      "- administrator",
    ].join("\n"),
  );
}

export function createActorFromEnvironment(
  prefix: "REVIEW_ACTOR" | "REVIEWER",
  defaultRole?: ReviewerRole,
): ReviewActor {
  const name = requiredEnvironmentValue(
    `${prefix}_NAME`,
  );

  const roleValue =
    optionalEnvironmentValue(
      `${prefix}_ROLE`,
    ) ?? defaultRole;

  if (!roleValue) {
    throw new Error(
      `Missing required environment variable: ${prefix}_ROLE`,
    );
  }

  const role = parseReviewerRole(
    roleValue,
    `${prefix}_ROLE`,
  );

  return {
    name,
    role,
    email: optionalEnvironmentValue(
      `${prefix}_EMAIL`,
    ),
    userId: optionalEnvironmentValue(
      `${prefix}_USER_ID`,
    ),
  };
}

export function requireMinimumLength(
  value: string,
  minimumLength: number,
  fieldName: string,
): string {
  const normalized = value.trim();

  if (normalized.length < minimumLength) {
    throw new Error(
      `${fieldName} must contain at least ${minimumLength} characters.`,
    );
  }

  return normalized;
}