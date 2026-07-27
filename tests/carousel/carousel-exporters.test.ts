import { describe, expect, it } from "vitest";
import { createCarouselDemoContentBundle } from "../../src/modules/carousel/demo-fixture.js";
import { CarouselProductionEngine } from "../../src/modules/carousel/engine.js";
import {
  carouselPackageToCanvaCsv,
  carouselPackageToStoryboardMarkdown,
} from "../../src/modules/carousel/exporters.js";

describe("Carousel exporters", () => {
  it("creates a Canva bulk-create CSV", () => {
    const productionPackage = new CarouselProductionEngine().create({
      contentBundle: createCarouselDemoContentBundle(),
    });

    const csv = carouselPackageToCanvaCsv(productionPackage);

    expect(csv).toContain('"slide_number"');
    expect(csv).toContain('"productionImagePrompt"'.replace("productionImagePrompt", "image_prompt"));
    expect(csv.split("\n")).toHaveLength(11);
  });

  it("creates a storyboard with every slide", () => {
    const productionPackage = new CarouselProductionEngine().create({
      contentBundle: createCarouselDemoContentBundle(),
    });

    const markdown = carouselPackageToStoryboardMarkdown(productionPackage);

    expect(markdown).toContain("## Slide 1");
    expect(markdown).toContain("## Slide 10");
    expect(markdown).toContain("You Are Not Alone");
  });
});
