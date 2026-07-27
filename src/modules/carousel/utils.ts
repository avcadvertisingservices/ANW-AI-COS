export function slugifyCarouselValue(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "carousel";
}

export function countWords(value: string): number {
  const normalized = value.trim();
  if (!normalized) return 0;
  return normalized.split(/\s+/).length;
}

export function normalizeCarouselText(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

export function buildCarouselFilename(input: {
  topic: string;
  slideNumber: number;
  version: number;
  aspectRatio: string;
}): string {
  const date = new Date().toISOString().slice(0, 10);
  const slide = String(input.slideNumber).padStart(2, "0");
  const version = String(input.version).padStart(2, "0");
  const ratio = input.aspectRatio.replace(":", "x");
  return `${date}_ANW_Carousel_${slugifyCarouselValue(input.topic)}_${ratio}_S${slide}_v${version}.png`;
}

export function escapeCsvCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}
