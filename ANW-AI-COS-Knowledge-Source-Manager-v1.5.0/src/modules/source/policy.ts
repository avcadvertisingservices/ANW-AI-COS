import type {
  KnowledgeCategory,
  KnowledgeSource,
} from "../knowledge/types.js";
import type {
  KnowledgeSourceInput,
  SourceCollectionPolicyReport,
  SourcePolicyReport,
} from "./types.js";

const MEDICAL_CATEGORIES = new Set<KnowledgeCategory>([
  "medical-fact",
  "symptom",
  "diagnosis",
  "treatment",
  "recovery",
  "research",
]);

const TEST_DOMAINS = new Set([
  "example.com",
  "example.net",
  "example.org",
]);

const PRIVATE_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);

function validDate(value: string | undefined): boolean {
  if (!value) return true;
  return !Number.isNaN(Date.parse(value));
}

function futureDate(value: string | undefined): boolean {
  if (!value || !validDate(value)) return false;
  const date = new Date(value).getTime();
  return date > Date.now() + 86_400_000;
}

export function canonicalizeSourceUrl(value: string): {
  normalizedUrl?: string;
  domain?: string;
  error?: string;
} {
  const trimmed = value.trim();

  if (!trimmed) {
    return { error: "Source URL is required." };
  }

  let parsed: URL;

  try {
    parsed = new URL(trimmed);
  } catch {
    return { error: "Source URL must be a valid absolute URL." };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { error: "Source URL must use http or https." };
  }

  if (parsed.username || parsed.password) {
    return { error: "Source URL must not contain embedded credentials." };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    PRIVATE_HOSTS.has(hostname) ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    return { error: "Source URL must point to a public website." };
  }

  parsed.hostname = hostname;
  parsed.hash = "";

  const trackingParameters = [
    "fbclid",
    "gclid",
    "mc_cid",
    "mc_eid",
  ];

  const parameterNames: string[] = [];
  parsed.searchParams.forEach((_value, key) => {
    parameterNames.push(key);
  });

  for (const parameter of parameterNames) {
    if (
      parameter.toLowerCase().startsWith("utm_") ||
      trackingParameters.includes(parameter.toLowerCase())
    ) {
      parsed.searchParams.delete(parameter);
    }
  }

  parsed.searchParams.sort();

  if (parsed.pathname.length > 1) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  }

  return {
    normalizedUrl: parsed.toString(),
    domain: hostname,
  };
}

export function evaluateKnowledgeSource(
  source: KnowledgeSourceInput | KnowledgeSource,
  category?: KnowledgeCategory,
): SourcePolicyReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (source.title.trim().length < 5) {
    errors.push("Source title must contain at least 5 characters.");
  }

  if ((source.publisher?.trim().length ?? 0) < 3) {
    errors.push("Source publisher must contain at least 3 characters.");
  }

  const urlResult = canonicalizeSourceUrl(source.url ?? "");

  if (urlResult.error) {
    errors.push(urlResult.error);
  }

  if (urlResult.normalizedUrl?.startsWith("http://")) {
    warnings.push("HTTPS is preferred when the publisher provides it.");
  }

  if (urlResult.domain && TEST_DOMAINS.has(urlResult.domain)) {
    warnings.push(
      "This is a reserved example domain and must not be used as a production medical source.",
    );
  }

  if (!validDate(source.publicationDate)) {
    errors.push("Publication date must be a valid date when provided.");
  } else if (futureDate(source.publicationDate)) {
    errors.push("Publication date cannot be in the future.");
  }

  if (!validDate(source.accessedDate)) {
    errors.push("Accessed date must be a valid date when provided.");
  } else if (futureDate(source.accessedDate)) {
    errors.push("Accessed date cannot be in the future.");
  }

  if (
    category &&
    MEDICAL_CATEGORIES.has(category) &&
    source.evidenceLevel === "community"
  ) {
    warnings.push(
      "A community source may provide lived experience, but it should not be counted as the only support for a medical claim.",
    );
  }

  return {
    valid: errors.length === 0,
    normalizedUrl: urlResult.normalizedUrl,
    domain: urlResult.domain,
    errors,
    warnings,
  };
}

export function evaluateSourceCollection(
  sources: KnowledgeSource[],
  category?: KnowledgeCategory,
): SourceCollectionPolicyReport {
  const idCounts = new Map<string, number>();
  const urlCounts = new Map<string, number>();

  const sourceReports = sources.map((source) => {
    idCounts.set(source.id, (idCounts.get(source.id) ?? 0) + 1);

    const report = evaluateKnowledgeSource(source, category);
    const normalizedUrl = report.normalizedUrl?.toLowerCase();

    if (normalizedUrl) {
      urlCounts.set(
        normalizedUrl,
        (urlCounts.get(normalizedUrl) ?? 0) + 1,
      );
    }

    return {
      sourceId: source.id,
      title: source.title,
      report,
    };
  });

  const duplicateSourceIds = [...idCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => id);

  const duplicateUrls = [...urlCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([url]) => url);

  const errors = sourceReports.flatMap(({ sourceId, report }) =>
    report.errors.map((error) => `${sourceId}: ${error}`),
  );

  const warnings = sourceReports.flatMap(({ sourceId, report }) =>
    report.warnings.map((warning) => `${sourceId}: ${warning}`),
  );

  if (duplicateSourceIds.length > 0) {
    errors.push(
      `Duplicate source IDs detected: ${duplicateSourceIds.join(", ")}.`,
    );
  }

  if (duplicateUrls.length > 0) {
    errors.push(
      `Duplicate source URLs detected: ${duplicateUrls.join(", ")}.`,
    );
  }

  return {
    valid: errors.length === 0,
    sourceCount: sources.length,
    validSourceCount: sourceReports.filter(({ report }) => report.valid)
      .length,
    duplicateSourceIds,
    duplicateUrls,
    errors,
    warnings,
    sourceReports,
  };
}
