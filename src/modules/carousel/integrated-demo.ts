import "dotenv/config";
import { createMockContentEngine } from "../content/factory.js";
import { createCarouselProductionEngine } from "./factory.js";
import { writeCarouselProductionPackage } from "./writer.js";

async function main(): Promise<void> {
  const contentEngine = createMockContentEngine();
  const contentBundle = await contentEngine.generate({
    topic: "you are not alone",
    audience: "Acoustic Neuroma patients, survivors, and caregivers",
    formats: ["carousel"],
    tone: "compassionate",
    language: "English",
    carouselSlideCount: 10,
    knowledgeLimit: 5,
  });

  const carouselEngine = createCarouselProductionEngine();
  const productionPackage = carouselEngine.create({
    contentBundle,
    aspectRatio: "9:16",
    platforms: ["facebook", "instagram"],
    version: 1,
  });

  const files = await writeCarouselProductionPackage(productionPackage);

  console.log({
    contentBundleId: contentBundle.id,
    packageId: productionPackage.id,
    slides: productionPackage.slides.length,
    structuralValidation: productionPackage.quality.passedStructuralValidation,
    requiresMedicalReview: productionPackage.quality.requiresMedicalReview,
    errorCount: productionPackage.quality.errorCount,
    warningCount: productionPackage.quality.warningCount,
    outputDirectory: files.outputDirectory,
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
