import {
  existsSync,
  readFileSync,
} from "node:fs";

import {
  join,
  resolve,
} from "node:path";

import {
  spawnSync,
} from "node:child_process";

import {
  validateRepository,
} from "./validate.js";

export type ReleaseOptions = {
  check?: boolean;
  plan?: boolean;
  execute?: boolean;
  confirm?: boolean;
};

type ReleaseCheck = {
  label: string;
  status: "pass" | "fail";
  detail?: string;
};

type GitResult = {
  status: number | null;
  stdout: string;
  stderr: string;
  error: Error | undefined;
};

type ReleaseContext = {
  projectRoot: string;
  cliRoot: string;
  packagePath: string;
  readmePath: string;
  changelogPath: string;
  version: string;
  releaseTag: string;
};

export function runRelease(
  options: ReleaseOptions = {},
): void {
  const selectedModes = [
    options.check === true,
    options.plan === true,
    options.execute === true,
  ].filter(Boolean).length;

  if (selectedModes > 1) {
    throw new Error(
      "Use only one release mode at a time: --check, --plan, or --execute.",
    );
  }

  if (
    options.confirm === true &&
    options.execute !== true
  ) {
    throw new Error(
      "--confirm can only be used together with --execute.",
    );
  }

  if (options.plan === true) {
    runReleasePlan();
    return;
  }

  if (options.check === true) {
    runReleaseCheck();
    return;
  }

  if (options.execute === true) {
    runReleaseExecute(
      options,
    );
    return;
  }

  printReleaseHelp();
}

function printReleaseHelp(): void {
  console.log("");
  console.log(
    "ANW AI-COS Release",
  );
  console.log(
    "==================",
  );
  console.log("");

  console.log(
    "No release action was performed.",
  );
  console.log("");

  console.log(
    "Available release commands:",
  );
  console.log("");

  console.log(
    "npm run dev -- release --plan",
  );

  console.log(
    "npm run dev -- release --check",
  );

  console.log(
    "npm run dev -- release --execute --confirm",
  );

  console.log("");

  console.log(
    "--plan previews the release workflow.",
  );

  console.log(
    "--check validates release readiness.",
  );

  console.log(
    "--execute performs the controlled tag release.",
  );

  console.log("");

  console.log(
    "--execute requires --confirm.",
  );

  console.log("");
}

function createReleaseContext(): ReleaseContext {
  const projectRoot =
    findProjectRoot(
      process.cwd(),
    );

  const cliRoot = join(
    projectRoot,
    "tools",
    "anw-cli",
  );

  const packagePath = join(
    cliRoot,
    "package.json",
  );

  const readmePath = join(
    cliRoot,
    "README.md",
  );

  const changelogPath = join(
    cliRoot,
    "CHANGELOG.md",
  );

  const version =
    readPackageVersion(
      packagePath,
    );

  const releaseTag =
    `anw-cli-v${version}`;

  return {
    projectRoot,
    cliRoot,
    packagePath,
    readmePath,
    changelogPath,
    version,
    releaseTag,
  };
}

function runReleasePlan(): void {
  const context =
    createReleaseContext();

  console.log("");
  console.log(
    "ANW AI-COS Release Plan",
  );
  console.log(
    "=======================",
  );
  console.log("");

  console.log(
    `Repository: ${context.projectRoot}`,
  );

  console.log(
    `Version: ${context.version}`,
  );

  console.log(
    `Proposed tag: ${context.releaseTag}`,
  );

  console.log("");

  console.log(
    "Planned release workflow:",
  );

  console.log("");

  console.log(
    "1. Confirm the Git working tree is clean.",
  );

  console.log(
    "2. Confirm the CLI package version.",
  );

  console.log(
    "3. Confirm README release metadata.",
  );

  console.log(
    "4. Confirm CHANGELOG release metadata.",
  );

  console.log(
    "5. Confirm the proposed Git tag is available.",
  );

  console.log(
    "6. Run the complete ANW validation workflow.",
  );

  console.log(
    "7. Create the annotated Git release tag.",
  );

  console.log(
    "8. Push only the release tag to origin.",
  );

  console.log("");

  console.log(
    "Release readiness command:",
  );

  console.log("");

  console.log(
    "npm run dev -- release --check",
  );

  console.log("");

  console.log(
    "Controlled release command:",
  );

  console.log("");

  console.log(
    "npm run dev -- release --execute --confirm",
  );

  console.log("");

  console.log(
    "Future tag command:",
  );

  console.log("");

  console.log(
    `git tag -a ${context.releaseTag} -m "ANW CLI v${context.version}"`,
  );

  console.log("");

  console.log(
    "Future push command:",
  );

  console.log("");

  console.log(
    `git push origin ${context.releaseTag}`,
  );

  console.log("");

  console.log(
    "Safety status:",
  );

  console.log("");

  console.log(
    "- No files were changed.",
  );

  console.log(
    "- No commits were created.",
  );

  console.log(
    "- No Git tags were created.",
  );

  console.log(
    "- Nothing was pushed.",
  );

  console.log(
    "- No branches were merged.",
  );

  console.log(
    "- No force push was performed.",
  );

  console.log("");

  console.log(
    "Release plan complete.",
  );

  console.log(
    "No changes were made.",
  );

  console.log("");
}

function runReleaseCheck(): void {
  const context =
    createReleaseContext();

  printReleaseCheckHeader(
    context,
  );

  const checks =
    collectReleaseChecks(
      context,
    );

  printChecks(
    checks,
  );

  if (
    hasCheckFailures(
      checks,
    )
  ) {
    printReleaseFailure(
      checks,
    );

    process.exitCode = 1;
    return;
  }

  console.log("");
  console.log(
    "Static release checks passed.",
  );
  console.log("");

  console.log(
    "Running full ANW validation...",
  );
  console.log("");

  const validationPassed =
    runFullValidation();

  if (
    !validationPassed
  ) {
    console.log("");

    console.error(
      "Release check failed because repository validation failed.",
    );

    console.log("");

    process.exitCode = 1;
    return;
  }

  printReleaseCheckSummary(
    context,
  );

  process.exitCode = 0;
}

function runReleaseExecute(
  options: ReleaseOptions,
): void {
  if (
    options.confirm !== true
  ) {
    console.log("");
    console.error(
      "Release execution blocked.",
    );
    console.error(
      "Use --execute together with --confirm.",
    );
    console.log("");

    console.error(
      "Required command:",
    );
    console.error(
      "npm run dev -- release --execute --confirm",
    );
    console.log("");

    process.exitCode = 1;
    return;
  }

  const context =
    createReleaseContext();

  console.log("");
  console.log(
    "ANW AI-COS Controlled Release",
  );
  console.log(
    "=============================",
  );
  console.log("");

  console.log(
    `Repository: ${context.projectRoot}`,
  );

  console.log(
    `Version: ${context.version}`,
  );

  console.log(
    `Release tag: ${context.releaseTag}`,
  );

  console.log("");

  console.log(
    "Confirmation flag detected.",
  );

  console.log(
    "Beginning mandatory release checks...",
  );

  console.log("");

  const checks =
    collectReleaseChecks(
      context,
    );

  printChecks(
    checks,
  );

  if (
    hasCheckFailures(
      checks,
    )
  ) {
    console.log("");

    console.error(
      "Release execution blocked.",
    );

    console.error(
      "One or more mandatory release checks failed.",
    );

    console.log("");

    console.error(
      "No tag was created.",
    );

    console.error(
      "Nothing was pushed.",
    );

    console.log("");

    process.exitCode = 1;
    return;
  }

  console.log("");

  console.log(
    "Mandatory static checks passed.",
  );

  console.log("");

  console.log(
    "Running full ANW validation before release...",
  );

  console.log("");

  const validationPassed =
    runFullValidation();

  if (
    !validationPassed
  ) {
    console.log("");

    console.error(
      "Release execution blocked because validation failed.",
    );

    console.error(
      "No tag was created.",
    );

    console.error(
      "Nothing was pushed.",
    );

    console.log("");

    process.exitCode = 1;
    return;
  }

  console.log("");
  console.log(
    "All release checks passed.",
  );
  console.log("");

  console.log(
    `Creating annotated tag ${context.releaseTag}...`,
  );

  const tagResult =
    runGit(
      context.projectRoot,
      [
        "tag",
        "-a",
        context.releaseTag,
        "-m",
        `ANW CLI v${context.version}`,
      ],
    );

  if (
    !gitCommandSucceeded(
      tagResult,
    )
  ) {
    console.log("");

    console.error(
      "Unable to create the release tag.",
    );

    printGitFailure(
      tagResult,
    );

    console.log("");

    console.error(
      "Nothing was pushed.",
    );

    console.log("");

    process.exitCode = 1;
    return;
  }

  console.log(
    `Tag created: ${context.releaseTag}`,
  );

  console.log("");

  console.log(
    `Pushing ${context.releaseTag} to origin...`,
  );

  const pushResult =
    runGit(
      context.projectRoot,
      [
        "push",
        "origin",
        context.releaseTag,
      ],
    );

  if (
    !gitCommandSucceeded(
      pushResult,
    )
  ) {
    console.log("");

    console.error(
      "The release tag was created locally, but the push failed.",
    );

    printGitFailure(
      pushResult,
    );

    console.log("");

    console.error(
      `Local tag remains: ${context.releaseTag}`,
    );

    console.error(
      "No force push or automatic rollback was attempted.",
    );

    console.log("");

    process.exitCode = 1;
    return;
  }

  console.log(
    `Tag pushed: ${context.releaseTag}`,
  );

  console.log("");

  console.log(
    "ANW Release Complete",
  );

  console.log(
    "====================",
  );

  console.log("");

  console.log(
    `Version: ${context.version}`,
  );

  console.log(
    `Tag: ${context.releaseTag}`,
  );

  console.log(
    "Remote: origin",
  );

  console.log("");

  console.log(
    "Release execution successful.",
  );

  console.log("");

  console.log(
    "Safety guarantees:",
  );

  console.log("");

  console.log(
    "- No automatic commits were created.",
  );

  console.log(
    "- No branches were merged.",
  );

  console.log(
    "- No source branch was pushed.",
  );

  console.log(
    "- No force push was performed.",
  );

  console.log(
    "- Only the release tag was pushed.",
  );

  console.log("");

  process.exitCode = 0;
}

function printReleaseCheckHeader(
  context: ReleaseContext,
): void {
  console.log("");
  console.log(
    "ANW AI-COS Release Check",
  );
  console.log(
    "========================",
  );
  console.log("");

  console.log(
    `Repository: ${context.projectRoot}`,
  );

  console.log("");
}

function collectReleaseChecks(
  context: ReleaseContext,
): ReleaseCheck[] {
  return [
    checkGitWorkingTree(
      context.projectRoot,
    ),
    {
      label:
        "CLI package version",
      status: "pass",
      detail:
        context.version,
    },
    checkReadmeVersion(
      context.readmePath,
      context.version,
      context.releaseTag,
    ),
    checkChangelogVersion(
      context.changelogPath,
      context.version,
      context.releaseTag,
    ),
    checkReleaseTagAvailable(
      context.projectRoot,
      context.releaseTag,
    ),
  ];
}

function hasCheckFailures(
  checks: ReleaseCheck[],
): boolean {
  return checks.some(
    (check) =>
      check.status === "fail",
  );
}

function printReleaseFailure(
  checks: ReleaseCheck[],
): void {
  const failures =
    checks.filter(
      (check) =>
        check.status === "fail",
    );

  console.log("");

  console.error(
    `Release check failed with ${failures.length} problem${
      failures.length === 1
        ? ""
        : "s"
    }.`,
  );

  console.error(
    "Fix the reported problems before continuing.",
  );

  console.log("");
}

function runFullValidation(): boolean {
  const previousExitCode =
    process.exitCode;

  process.exitCode = 0;

  try {
    validateRepository();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error("");
    console.error(
      `Validation failed: ${message}`,
    );
    console.error("");

    process.exitCode =
      previousExitCode ?? 0;

    return false;
  }

  const validationExitCode =
    process.exitCode ?? 0;

  process.exitCode =
    previousExitCode ?? 0;

  return (
    validationExitCode === 0
  );
}

function printReleaseCheckSummary(
  context: ReleaseContext,
): void {
  console.log("");
  console.log(
    "ANW Release Check Summary",
  );

  console.log(
    "=========================",
  );

  console.log("");

  console.log(
    `✓ Version: ${context.version}`,
  );

  console.log(
    `✓ Release tag available: ${context.releaseTag}`,
  );

  console.log(
    "✓ README version matches",
  );

  console.log(
    "✓ CHANGELOG version matches",
  );

  console.log(
    "✓ Git working tree clean",
  );

  console.log(
    "✓ Full validation passed",
  );

  console.log("");

  console.log(
    "Release candidate is ready.",
  );

  console.log(
    "No files, commits, tags, or remotes were changed.",
  );

  console.log("");
}

function findProjectRoot(
  startDirectory: string,
): string {
  let currentDirectory =
    resolve(
      startDirectory,
    );

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
      existsSync(
        adminPath,
      ) &&
      existsSync(
        cliPath,
      ) &&
      existsSync(
        gitPath,
      )
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

function readPackageVersion(
  packagePath: string,
): string {
  if (
    !existsSync(
      packagePath,
    )
  ) {
    throw new Error(
      `CLI package.json was not found: ${packagePath}`,
    );
  }

  const rawPackage =
    readFileSync(
      packagePath,
      "utf8",
    );

  const parsedPackage =
    JSON.parse(
      rawPackage,
    ) as {
      version?: unknown;
    };

  if (
    typeof parsedPackage.version !==
      "string" ||
    !parsedPackage.version.trim()
  ) {
    throw new Error(
      "CLI package.json does not contain a valid version.",
    );
  }

  return parsedPackage.version.trim();
}

function checkGitWorkingTree(
  projectRoot: string,
): ReleaseCheck {
  const result =
    runGit(
      projectRoot,
      [
        "status",
        "--porcelain",
      ],
    );

  if (
    result.error
  ) {
    return {
      label:
        "Git working tree",
      status: "fail",
      detail:
        result.error.message,
    };
  }

  if (
    result.status !== 0
  ) {
    return {
      label:
        "Git working tree",
      status: "fail",
      detail:
        result.stderr ||
        "Unable to read Git status.",
    };
  }

  if (
    !result.stdout
  ) {
    return {
      label:
        "Git working tree",
      status: "pass",
      detail:
        "Working tree clean",
    };
  }

  const changedFiles =
    result.stdout.split(
      /\r?\n/,
    );

  return {
    label:
      "Git working tree",
    status: "fail",
    detail: `${changedFiles.length} uncommitted change${
      changedFiles.length === 1
        ? ""
        : "s"
    } detected`,
  };
}

function checkReadmeVersion(
  readmePath: string,
  version: string,
  releaseTag: string,
): ReleaseCheck {
  if (
    !existsSync(
      readmePath,
    )
  ) {
    return {
      label:
        "README release metadata",
      status: "fail",
      detail:
        "README.md was not found.",
    };
  }

  const content =
    readFileSync(
      readmePath,
      "utf8",
    );

  const hasVersion =
    content.includes(
      version,
    );

  const hasTag =
    content.includes(
      releaseTag,
    );

  if (
    hasVersion &&
    hasTag
  ) {
    return {
      label:
        "README release metadata",
      status: "pass",
      detail:
        `${version} / ${releaseTag}`,
    };
  }

  return {
    label:
      "README release metadata",
    status: "fail",
    detail:
      `README.md must reference version ${version} and tag ${releaseTag}.`,
  };
}

function checkChangelogVersion(
  changelogPath: string,
  version: string,
  releaseTag: string,
): ReleaseCheck {
  if (
    !existsSync(
      changelogPath,
    )
  ) {
    return {
      label:
        "CHANGELOG release metadata",
      status: "fail",
      detail:
        "CHANGELOG.md was not found.",
    };
  }

  const content =
    readFileSync(
      changelogPath,
      "utf8",
    );

  const versionHeading =
    `## [${version}]`;

  const hasVersion =
    content.includes(
      versionHeading,
    );

  const hasTag =
    content.includes(
      releaseTag,
    );

  if (
    hasVersion &&
    hasTag
  ) {
    return {
      label:
        "CHANGELOG release metadata",
      status: "pass",
      detail:
        `${version} / ${releaseTag}`,
    };
  }

  return {
    label:
      "CHANGELOG release metadata",
    status: "fail",
    detail:
      `CHANGELOG.md must contain ${versionHeading} and ${releaseTag}.`,
  };
}

function checkReleaseTagAvailable(
  projectRoot: string,
  releaseTag: string,
): ReleaseCheck {
  const result =
    runGit(
      projectRoot,
      [
        "tag",
        "--list",
        releaseTag,
      ],
    );

  if (
    result.error
  ) {
    return {
      label:
        "Release tag availability",
      status: "fail",
      detail:
        result.error.message,
    };
  }

  if (
    result.status !== 0
  ) {
    return {
      label:
        "Release tag availability",
      status: "fail",
      detail:
        result.stderr ||
        "Unable to inspect Git tags.",
    };
  }

  if (
    result.stdout ===
    releaseTag
  ) {
    return {
      label:
        "Release tag availability",
      status: "fail",
      detail:
        `Tag already exists: ${releaseTag}`,
    };
  }

  return {
    label:
      "Release tag availability",
    status: "pass",
    detail:
      `${releaseTag} is available`,
  };
}

function runGit(
  cwd: string,
  argumentsList: string[],
): GitResult {
  const gitCommand =
    process.platform ===
    "win32"
      ? "git.exe"
      : "git";

  const result =
    spawnSync(
      gitCommand,
      argumentsList,
      {
        cwd,
        encoding: "utf8",
        shell: false,
      },
    );

  return {
    status:
      result.status,

    stdout:
      String(
        result.stdout ?? "",
      ).trim(),

    stderr:
      String(
        result.stderr ?? "",
      ).trim(),

    error:
      result.error,
  };
}

function gitCommandSucceeded(
  result: GitResult,
): boolean {
  return (
    !result.error &&
    result.status === 0
  );
}

function printGitFailure(
  result: GitResult,
): void {
  if (
    result.error
  ) {
    console.error(
      result.error.message,
    );
  }

  if (
    result.stderr
  ) {
    console.error(
      result.stderr,
    );
  }

  if (
    result.stdout
  ) {
    console.error(
      result.stdout,
    );
  }
}

function printChecks(
  checks: ReleaseCheck[],
): void {
  for (
    const check
    of checks
  ) {
    const symbol =
      check.status ===
      "pass"
        ? "✓"
        : "✗";

    console.log(
      `${symbol} ${check.label}`,
    );

    if (
      check.detail
    ) {
      console.log(
        `  ${check.detail}`,
      );
    }
  }
}