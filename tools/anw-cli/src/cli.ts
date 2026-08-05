#!/usr/bin/env node

import { Command } from "commander";

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
        const message =
          error instanceof Error
            ? error.message
            : "Unknown CLI error.";

        console.error("");
        console.error(
          `Unable to create module: ${message}`,
        );
        console.error("");

        process.exitCode = 1;
      }
    },
  );

program.parse();