import { describe, expect, it } from "vitest";
import { createCarouselDemoContentBundle } from "../../src/modules/carousel/demo-fixture.js";
import { CarouselProductionEngine } from "../../src/modules/carousel/engine.js";

describe("Carousel production validation", () => {
  it("flags long body copy without silently deleting medical content", () => {
    const bundle = createCarouselDemoContentBundle();
    const firstSlide = bundle.carousel?.slides[2];

    if (!firstSlide) throw new Error("Fixture slide missing.");

    firstSlide.body = Array.from({ length: 90 }, () => "education").join(" ");

    const productionPackage = new CarouselProductionEngine().create({
      contentBundle: bundle,
      aspectRatio: "9:16",
    });

    expect(productionPackage.slides[2]?.body).toBe(firstSlide.body);
    expect(productionPackage.slides[2]?.copyReviewRequired).toBe(true);
    expect(
      productionPackage.quality.issues.some(
        (item) => item.code === "CAROUSEL_BODY_COPY_LONG" && item.slideNumber === 3,
      ),
    ).toBe(true);
  });
});
