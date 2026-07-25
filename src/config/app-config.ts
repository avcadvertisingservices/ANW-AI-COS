import { loadEnvironment, type Environment } from "../core/environment/index.js";

export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: Environment["nodeEnv"];
  };
  integrations: {
    openAiApiKey?: string;
    supabaseUrl?: string;
    supabaseAnonKey?: string;
  };
}

export function createAppConfig(): Readonly<AppConfig> {
  const environment = loadEnvironment();

  return Object.freeze({
    app: Object.freeze({
      name: environment.appName,
      version: environment.appVersion,
      environment: environment.nodeEnv,
    }),
    integrations: Object.freeze({
      openAiApiKey: environment.openAiApiKey,
      supabaseUrl: environment.supabaseUrl,
      supabaseAnonKey: environment.supabaseAnonKey,
    }),
  });
}
