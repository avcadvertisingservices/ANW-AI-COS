#!/usr/bin/env node

import {
  Command,
} from "commander";

import {
  createComponent,
} from "./commands/component.js";

import {
  runDoctor,
} from "./commands/doctor.js";

import {
  createFeature,
} from "./commands/feature.js";

import {
  createModule,
} from "./commands/module.js";

import {
  createPage,
} from "./commands/page.js";

import {
  repairRepository,
} from "./commands/repair.js";

import {
  runRelease,
} from "./commands/release.js";

import {
  validateRepository,
} from "./commands/validate.js";

const program =
  new Command();

program
  .name("anw")
  .description(
    "Developer CLI for the ANW AI Content Operating System.",
  )
  .version("0.6.0");

program
  .command("hello")
  .description(
    "Test the ANW CLI.",
  )
  .action(() => {
    console.log("");

    console.log(
      "Welcome to the ANW AI-COS CLI!",
    );

    console.log(
      "You Are Not Alone.",
    );

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
        createModule(
          name,
          options,
        );
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

program
  .command("page")
  .description(
    "Create a branded ANW admin page.",
  )
  .argument(
    "<name>",
    "Route name, such as evidence-dashboard",
  )
  .option(
    "--force",
    "Overwrite generated page files",
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
        createPage(
          name,
          options,
        );
      } catch (error) {
        handleCommandError(
          "create page",
          error,
        );
      }
    },
  );

program
  .command("doctor")
  .description(
    "Inspect the ANW repository for common development problems.",
  )
  .action(() => {
    try {
      runDoctor();
    } catch (error) {
      handleCommandError(
        "run repository doctor",
        error,
      );
    }
  });

program
  .command("repair")
  .description(
    "Inspect and safely repair supported App Router problems.",
  )
  .option(
    "--write",
    "Apply safe repairs. Without this option the command performs a dry run.",
    false,
  )
  .action(
    (
      options: {
        write?: boolean;
      },
    ) => {
      try {
        repairRepository(
          options,
        );
      } catch (error) {
        handleCommandError(
          "repair repository routes",
          error,
        );
      }
    },
  );

program
  .command("validate")
  .description(
    "Run the complete ANW CLI certification workflow.",
  )
  .action(() => {
    try {
      validateRepository();
    } catch (error) {
      handleCommandError(
        "validate repository",
        error,
      );
    }
  });

program
  .command("release")
  .description(
    "Inspect and plan ANW CLI releases.",
  )
  .option(
    "--check",
    "Run safe release-readiness checks without changing anything.",
    false,
  )
  .option(
    "--plan",
    "Preview the release process without changing anything.",
    false,
  )
  .action(
    (
      options: {
        check?: boolean;
        plan?: boolean;
      },
    ) => {
      try {
        runRelease(
          options,
        );
      } catch (error) {
        handleCommandError(
          "inspect release readiness",
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