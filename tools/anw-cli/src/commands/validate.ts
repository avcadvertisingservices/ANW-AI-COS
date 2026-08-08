import {
  spawnSync,
} from "node:child_process";

import {
  existsSync,
} from "node:fs";

import {
  join,
  resolve,
} from "node:path";

type ValidationStep = {
  label: string;
  arguments: string[];
};

export function validateRepository(): void {
  const projectRoot =
    findProjectRoot(
      process.cwd(),
    );

  const cliRoot = join(
    projectRoot,
    "tools",
    "anw-cli",
  );

  const steps: ValidationStep[] = [
    {
      label:
        "CLI TypeScript type-check",
      arguments: [
        "run",
        "typecheck",
      ],
    },
    {
      label:
        "CLI automated tests",
      arguments: [
        "test",
      ],
    },
    {
      label:
        "CLI production build",
      arguments: [
        "run",
        "build",
      ],
    },
    {
      label:
        "ANW repository Doctor",
      arguments: [
        "run",
        "dev",
        "--",
        "doctor",
      ],
    },
    {
      label:
        "ANW route repair dry-run",
      arguments: [
        "run",
        "dev",
        "--",
        "repair",
      ],
    },
  ];

  console.log("");
  console.log(
    "ANW AI-COS Validation",
  );
  console.log(
    "=====================",
  );
  console.log("");

  console.log(
    `Repository: ${projectRoot}`,
  );

  console.log(
    `CLI: ${cliRoot}`,
  );

  console.log("");

  let passedSteps = 0;

  for (
    const [
      index,
      step,
    ] of steps.entries()
  ) {
    console.log(
      `[${index + 1}/${steps.length}] ${step.label}`,
    );

    console.log(
      "----------------------------------------",
    );

    const result =
      runNpmCommand(
        cliRoot,
        step.arguments,
      );

    console.log("");

    if (result.error) {
      console.error(
        `✗ ${step.label} could not start.`,
      );

      console.error(
        result.error.message,
      );

      console.log("");

      printFailureSummary(
        passedSteps,
        steps.length,
        step.label,
      );

      process.exitCode = 1;

      return;
    }

    if (result.status !== 0) {
      console.error(
        `✗ ${step.label} failed.`,
      );

      console.log("");

      printFailureSummary(
        passedSteps,
        steps.length,
        step.label,
      );

      process.exitCode = 1;

      return;
    }

    passedSteps += 1;

    console.log(
      `✓ ${step.label} passed.`,
    );

    console.log("");
  }

  console.log(
    "ANW Validation Summary",
  );

  console.log(
    "======================",
  );

  console.log("");

  console.log(
    `✓ ${passedSteps}/${steps.length} certification steps passed.`,
  );

  console.log("");

  console.log(
    "Repository certification successful.",
  );

  console.log(
    "ANW AI-COS is ready for the next release step.",
  );

  console.log("");
}

function runNpmCommand(
  cwd: string,
  argumentsList: string[],
): ReturnType<typeof spawnSync> {
  const npmExecPath =
    process.env.npm_execpath;

  /*
   * When the ANW CLI is launched with npm,
   * npm_execpath points to npm-cli.js.
   *
   * Running that script through the current
   * Node executable avoids Windows npm.cmd
   * spawnSync EINVAL errors.
   */
  if (
    npmExecPath &&
    existsSync(npmExecPath)
  ) {
    return spawnSync(
      process.execPath,
      [
        npmExecPath,
        ...argumentsList,
      ],
      {
        cwd,
        stdio: "inherit",
        shell: false,
      },
    );
  }

  /*
   * Windows fallback.
   *
   * Invoke npm through cmd.exe instead of
   * spawning npm.cmd directly.
   */
  if (
    process.platform === "win32"
  ) {
    const commandInterpreter =
      process.env.ComSpec ||
      "C:\\Windows\\System32\\cmd.exe";

    const command =
      [
        "npm",
        ...argumentsList,
      ]
        .map(quoteWindowsArgument)
        .join(" ");

    return spawnSync(
      commandInterpreter,
      [
        "/d",
        "/s",
        "/c",
        command,
      ],
      {
        cwd,
        stdio: "inherit",
        shell: false,
      },
    );
  }

  /*
   * Unix/Linux/macOS fallback.
   */
  return spawnSync(
    "npm",
    argumentsList,
    {
      cwd,
      stdio: "inherit",
      shell: false,
    },
  );
}

function quoteWindowsArgument(
  value: string,
): string {
  if (
    /^[A-Za-z0-9_./:@=-]+$/.test(
      value,
    )
  ) {
    return value;
  }

  return `"${value.replace(
    /"/g,
    '\\"',
  )}"`;
}

function findProjectRoot(
  startDirectory: string,
): string {
  let currentDirectory =
    resolve(startDirectory);

  while (true) {
    const adminPath = join(
      currentDirectory,
      "apps",
      "admin",
    );

    const cliPath = join(
      currentDirectory,
      "tools",
      "anw-cli",
    );

    const gitPath = join(
      currentDirectory,
      ".git",
    );

    if (
      existsSync(adminPath) &&
      existsSync(cliPath) &&
      existsSync(gitPath)
    ) {
      return currentDirectory;
    }

    const parentDirectory =
      resolve(
        currentDirectory,
        "..",
      );

    if (
      parentDirectory ===
      currentDirectory
    ) {
      break;
    }

    currentDirectory =
      parentDirectory;
  }

  throw new Error(
    "ANW project root could not be found. Run the command from inside the ANW-AI-COS repository.",
  );
}

function printFailureSummary(
  passedSteps: number,
  totalSteps: number,
  failedStep: string,
): void {
  console.log(
    "ANW Validation Summary",
  );

  console.log(
    "======================",
  );

  console.log("");

  console.log(
    `Passed: ${passedSteps}/${totalSteps}`,
  );

  console.log(
    `Failed step: ${failedStep}`,
  );

  console.log("");

  console.log(
    "Certification stopped. Fix the reported problem before releasing.",
  );

  console.log("");
}