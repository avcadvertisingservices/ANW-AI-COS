import { logger } from "../logger/index.js";
import { AppError } from "./app-error.js";

export function handleFatalError(error: unknown): never {
  if (error instanceof AppError) {
    logger.error(error.message, {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    });
  } else if (error instanceof Error) {
    logger.error(error.message, { name: error.name, stack: error.stack });
  } else {
    logger.error("Unknown fatal error", { error });
  }

  process.exit(1);
}
