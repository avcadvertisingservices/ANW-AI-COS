import { createCarouselDemoContentBundle } from "./demo-fixture.js";
import { createCarouselProductionEngine } from "./factory.js";
import { writeCarouselProductionPackage } from "./writer.js";

async function main(): Promise<void> {
  const engine = createCarouselProductionEngine();
  const productionPackage = engine.create({
    contentBundle: createCarouselDemoContentBundle(),
    aspectRatio: "9:16",
    platforms: ["facebook", "instagram"],
    version: 1,
  });

  const files = await writeCarouselProductionPackage(productionPackage);

  console.log({
    packageId: productionPackage.id,
    slides: productionPackage.slides.length,
    aspectRatio: productionPackage.aspectRatio,
    canvas: `${productionPackage.canvas.width}x${productionPackage.canvas.height}`,
    structuralValidation: productionPackage.quality.passedStructuralValidation,
    readyForDesign: productionPackage.quality.readyForDesign,
    requiresHumanReview: productionPackage.quality.requiresHumanReview,
    errorCount: productionPackage.quality.errorCount,
    warningCount: productionPackage.quality.warningCount,
    outputDirectory: files.outputDirectory,
    canvaCsvPath: files.canvaCsvPath,
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
