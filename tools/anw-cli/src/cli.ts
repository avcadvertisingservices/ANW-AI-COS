#!/usr/bin/env node

import { Command } from "commander";

import {
  createComponent,
} from "./commands/component.js";

import {
  createFeature,
} from "./commands/feature.js";

import {
  createModule,
} from "./commands/module.js";

const program = new Command();

program
  .name("anw")
  .description(
    "Developer CLI for the ANW AI Content Operating System.",
  )
  .version("0.1.0");

program
  .command("hello")
  .description("Test the ANW CLI")
  .action(() => {
    console.log("");
    console.log(
      "Welcome to the ANW AI-COS CLI!",
    );
    console.log("You Are Not Alone.");
    console.log("");
  });

program
  .command("module")
  .description(
    "Create a new ANW domain module.",
  )
  .argument(
    "<name>",
    "Module name, such as patients",
  )
  .option(
    "--force",
    "Overwrite generated files",
    false,
  )
  .action(
    (
      name: string,
      options: {
        force?: boolean;
      },
    ) => {
      try {
        createModule(name, options);
      } catch (error) {
        handleCommandError(
          "create module",
          error,
        );
      }
    },
  );

program
  .command("component")
  .description(
    "Create a branded ANW React component.",
  )
  .argument(
    "<name>",
    "Component name, such as EvidenceSummaryCard",
  )
  .option(
    "--force",
    "Overwrite the existing component",
    false,
  )
  .action(
    (
      name: string,
      options: {
        force?: boolean;
      },
    ) => {
      try {
        createComponent(
          name,
          options,
        );
      } catch (error) {
        handleCommandError(
          "create component",
          error,
        );
      }
    },
  );

program
  .command("feature")
  .description(
    "Create a complete ANW feature.",
  )
  .argument(
    "<name>",
    "Feature name, such as recovery-tracker",
  )
  .option(
    "--force",
    "Overwrite generated feature files",
    false,
  )
  .action(
    (
      name: string,
      options: {
        force?: boolean;
      },
    ) => {
      try {
        createFeature(
          name,
          options,
        );
      } catch (error) {
        handleCommandError(
          "create feature",
          error,
        );
      }
    },
  );

program.parse();

function handleCommandError(
  action: string,
  error: unknown,
): void {
  const message =
    error instanceof Error
      ? error.message
      : "Unknown CLI error.";

  console.error("");
  console.error(
    `Unable to ${action}: ${message}`,
  );
  console.error("");

  process.exitCode = 1;
}