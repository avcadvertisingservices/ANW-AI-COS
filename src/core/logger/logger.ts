export type LogLevel = "debug" | "info" | "warn" | "error";
export interface LogContext { [key: string]: unknown; }

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

function writeLog(level: LogLevel, message: string, context?: LogContext): void {
  const output = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ? { context } : {}),
  });

  if (level === "error") return console.error(output);
  if (level === "warn") return console.warn(output);
  console.log(output);
}

export const logger: Logger = Object.freeze({
  debug: (message, context) => writeLog("debug", message, context),
  info: (message, context) => writeLog("info", message, context),
  warn: (message, context) => writeLog("warn", message, context),
  error: (message, context) => writeLog("error", message, context),
});
