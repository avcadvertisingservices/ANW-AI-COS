import { createAppConfig, type AppConfig } from "../config/index.js";
import { logger, type Logger } from "../core/logger/index.js";

export class Application {
  private readonly config: Readonly<AppConfig>;
  private readonly log: Logger;

  constructor() {
    this.config = createAppConfig();
    this.log = logger;
  }

  public async start(): Promise<void> {
    this.log.info("ANW AI-COS application starting", {
      appName: this.config.app.name,
      version: this.config.app.version,
      environment: this.config.app.environment,
    });

    this.log.info("Integration configuration status", {
      openAiConfigured: Boolean(this.config.integrations.openAiApiKey),
      supabaseConfigured: Boolean(
        this.config.integrations.supabaseUrl &&
        this.config.integrations.supabaseAnonKey,
      ),
    });

    this.log.info("ANW AI-COS application initialized successfully");
  }
}
