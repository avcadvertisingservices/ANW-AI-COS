import { describe, expect, it } from "vitest";
import { createCarouselDemoContentBundle } from "../../src/modules/carousel/demo-fixture.js";
import { CarouselProductionEngine } from "../../src/modules/carousel/engine.js";

describe("CarouselProductionEngine", () => {
  it("creates a design-ready ten-slide 9:16 package", () => {
    const engine = new CarouselProductionEngine();
    const productionPackage = engine.create({
      contentBundle: createCarouselDemoContentBundle(),
      aspectRatio: "9:16",
      platforms: ["facebook", "instagram"],
      version: 1,
    });

    expect(productionPackage.slides).toHaveLength(10);
    expect(productionPackage.canvas.width).toBe(1080);
    expect(productionPackage.canvas.height).toBe(1920);
    expect(productionPackage.slides[0]?.layout).toBe("hero");
    expect(productionPackage.slides.at(-1)?.layout).toBe("call-to-action");
    expect(productionPackage.quality.errorCount).toBe(0);
    expect(productionPackage.quality.readyForDesign).toBe(true);
    expect(productionPackage.quality.requiresHumanReview).toBe(true);
    expect(productionPackage.slides[0]?.productionImagePrompt).toContain("Acoustic Neuroma Warrior");
    expect(productionPackage.slides[0]?.filename).toMatch(/_S01_v01\.png$/);
  });

  it("rejects a bundle without carousel content", () => {
    const engine = new CarouselProductionEngine();
    const bundle = createCarouselDemoContentBundle();
    bundle.carousel = null;

    expect(() => engine.create({ contentBundle: bundle })).toThrow(
      "The content bundle does not contain carousel content.",
    );
  });
});
