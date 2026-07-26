import type {
  KnowledgeEntry,
  KnowledgeQuery,
  KnowledgeSearchResult,
} from "./types.js";

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
}

function entrySearchText(entry: KnowledgeEntry): string {
  return normalize(
    [
      entry.title,
      entry.summary,
      entry.body,
      ...entry.tags,
      ...entry.keywords,
      ...entry.aliases,
    ].join(" "),
  );
}

export function searchKnowledgeEntries(
  entries: KnowledgeEntry[],
  query: KnowledgeQuery,
): KnowledgeSearchResult[] {
  const terms = tokenize(query.text ?? "");

  const filtered = entries.filter((entry) => {
    if (query.category && entry.category !== query.category) {
      return false;
    }

    if (query.status && entry.status !== query.status) {
      return false;
    }

    if (query.approvedOnly && entry.status !== "approved") {
      return false;
    }

    if (
      query.tags &&
      query.tags.length > 0 &&
      !query.tags.every((tag) => entry.tags.includes(tag))
    ) {
      return false;
    }

    return true;
  });

  const results = filtered.map((entry) => {
    const searchText = entrySearchText(entry);
    const matchedTerms = terms.filter((term) =>
      searchText.includes(term),
    );

    let score = matchedTerms.length;

    for (const term of matchedTerms) {
      if (normalize(entry.title).includes(term)) {
        score += 5;
      }

      if (entry.keywords.some((keyword) =>
        normalize(keyword).includes(term),
      )) {
        score += 3;
      }

      if (entry.tags.some((tag) =>
        normalize(tag).includes(term),
      )) {
        score += 2;
      }
    }

    return {
      entry,
      score,
      matchedTerms,
    };
  });

  const visible = terms.length
    ? results.filter((result) => result.score > 0)
    : results;

  return visible
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.entry.title.localeCompare(b.entry.title);
    })
    .slice(0, query.limit ?? 20);
}
