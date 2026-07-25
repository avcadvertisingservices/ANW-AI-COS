import { Application } from "./app.js";
import { handleFatalError } from "../core/errors/index.js";

async function bootstrap(): Promise<void> {
  const application = new Application();
  await application.start();
}

bootstrap().catch(handleFatalError);
