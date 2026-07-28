import { describe, expect, it } from "vitest";
import {
  canonicalizeSourceUrl,
  evaluateKnowledgeSource,
  evaluateSourceCollection,
} from "../../src/modules/source/policy.js";

const validSource = {
  id: "source.valid",
  title: "Clinical information page",
  publisher: "Example Health Publisher",
  url: "https://health.example.edu/page?utm_source=test#section",
  evidenceLevel: "clinical" as const,
};

describe("Knowledge source policy", () => {
  it("normalizes a public URL and removes tracking parameters", () => {
    const result = canonicalizeSourceUrl(validSource.url);

    expect(result.error).toBeUndefined();
    expect(result.normalizedUrl).toBe("https://health.example.edu/page");
  });

  it("rejects private URLs", () => {
    const report = evaluateKnowledgeSource({
      ...validSource,
      url: "http://localhost/private",
    });

    expect(report.valid).toBe(false);
    expect(report.errors).toContain(
      "Source URL must point to a public website.",
    );
  });

  it("detects duplicate URLs in a collection", () => {
    const report = evaluateSourceCollection([
      validSource,
      {
        ...validSource,
        id: "source.duplicate",
        url: "https://health.example.edu/page/",
      },
    ]);

    expect(report.valid).toBe(false);
    expect(report.duplicateUrls).toHaveLength(1);
  });
});
