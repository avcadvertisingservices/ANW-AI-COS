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
  status?: boolean;
  history?: boolean;
  plan?: boolean;
  check?: boolean;
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

type ReleaseHistoryEntry = {
  tag: string;
  date: string;
  commit: string;
};

export function runRelease(
  options: ReleaseOptions = {},
): void {
  const selectedModes = [
    options.status === true,
    options.history === true,
    options.plan === true,
    options.check === true,
    options.execute === true,
  ].filter(Boolean).length;

  if (selectedModes > 1) {
    throw new Error(
      "Use only one release mode at a time: --status, --history, --plan, --check, or --execute.",
    );
  }

  if (
    options.confirm === true &&
    options.execute !== true
  ) {
    throw new Error(
      "--confirm can only be used with --execute.",
    );
  }

  if (options.status === true) {
    runReleaseStatus();
    return;
  }

  if (options.history === true) {
    runReleaseHistory();
    return;
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
    runReleaseExecute(options);
    return;
  }

  printReleaseHelp();
}

function createReleaseContext(): ReleaseContext {
  const projectRoot =
    findProjectRoot(
      process.cwd(),
    );

  const cliRoot =
    join(
      projectRoot,
      "tools",
      "anw-cli",
    );

  const packagePath =
    join(
      cliRoot,
      "package.json",
    );

  const readmePath =
    join(
      cliRoot,
      "README.md",
    );

  const changelogPath =
    join(
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

function printReleaseHelp(): void {
  console.log("");
  console.log("ANW AI-COS Release");
  console.log("==================");
  console.log("");

  console.log("Available commands:");
  console.log("");

  console.log(
    "npm run dev -- release --status",
  );

  console.log(
    "npm run dev -- release --history",
  );

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
    "No release action was performed.",
  );

  console.log("");
}

function runReleaseStatus(): void {
  const context =
    createReleaseContext();

  const branchResult =
    runGit(
      context.projectRoot,
      [
        "branch",
        "--show-current",
      ],
    );

  const statusResult =
    runGit(
      context.projectRoot,
      [
        "status",
        "--porcelain",
      ],
    );

  const currentTagResult =
    runGit(
      context.projectRoot,
      [
        "tag",
        "--list",
        context.releaseTag,
      ],
    );

  const tagsResult =
    runGit(
      context.projectRoot,
      [
        "tag",
        "--list",
        "anw-cli-v*",
        "--sort=-v:refname",
      ],
    );

  const remoteResult =
    runGit(
      context.projectRoot,
      [
        "remote",
        "get-url",
        "origin",
      ],
    );

  console.log("");
  console.log(
    "ANW AI-COS Release Status",
  );
  console.log(
    "=========================",
  );
  console.log("");

  console.log(
    `Repository: ${context.projectRoot}`,
  );

  console.log(
    `Package version: ${context.version}`,
  );

  console.log(
    `Expected release tag: ${context.releaseTag}`,
  );

  console.log("");

  console.log(
    `Current branch: ${
      gitCommandSucceeded(branchResult) &&
      branchResult.stdout
        ? branchResult.stdout
        : "UNKNOWN"
    }`,
  );

  if (
    gitCommandSucceeded(
      statusResult,
    )
  ) {
    const changes =
      splitLines(
        statusResult.stdout,
      );

    if (changes.length === 0) {
      console.log(
        "Working tree: CLEAN",
      );
    } else {
      console.log(
        `Working tree: DIRTY (${changes.length} change${
          changes.length === 1
            ? ""
            : "s"
        })`,
      );
    }
  } else {
    console.log(
      "Working tree: UNKNOWN",
    );
  }

  console.log("");

  const released =
    gitCommandSucceeded(
      currentTagResult,
    ) &&
    currentTagResult.stdout ===
      context.releaseTag;

  console.log(
    `Release state: ${
      released
        ? `RELEASED (${context.releaseTag})`
        : `NOT RELEASED (${context.releaseTag})`
    }`,
  );

  console.log("");

  const tags =
    gitCommandSucceeded(
      tagsResult,
    )
      ? splitLines(
          tagsResult.stdout,
        )
      : [];

  if (tags.length > 0) {
    console.log(
      `Latest ANW CLI release: ${tags[0]}`,
    );

    console.log("");

    console.log(
      "Recent ANW CLI releases:",
    );

    console.log("");

    for (
      const tag
      of tags.slice(
        0,
        10,
      )
    ) {
      console.log(
        `- ${tag}`,
      );
    }
  } else {
    console.log(
      "Latest ANW CLI release: NONE",
    );
  }

  console.log("");

  console.log(
    `Origin remote: ${
      gitCommandSucceeded(remoteResult) &&
      remoteResult.stdout
        ? remoteResult.stdout
        : "UNKNOWN"
    }`,
  );

  console.log("");

  console.log(
    "Status inspection complete.",
  );

  console.log(
    "No changes were made.",
  );

  console.log("");

  process.exitCode = 0;
}

function runReleaseHistory(): void {
  const context =
    createReleaseContext();

  const tagsResult =
    runGit(
      context.projectRoot,
      [
        "tag",
        "--list",
        "anw-cli-v*",
        "--sort=-v:refname",
      ],
    );

  const currentTagResult =
    runGit(
      context.projectRoot,
      [
        "tag",
        "--list",
        context.releaseTag,
      ],
    );

  console.log("");
  console.log(
    "ANW AI-COS Release History",
  );
  console.log(
    "==========================",
  );
  console.log("");

  console.log(
    `Current package version: ${context.version}`,
  );

  console.log(
    `Current expected tag: ${context.releaseTag}`,
  );

  const released =
    gitCommandSucceeded(
      currentTagResult,
    ) &&
    currentTagResult.stdout ===
      context.releaseTag;

  console.log(
    `Current release state: ${
      released
        ? "RELEASED"
        : "NOT RELEASED"
    }`,
  );

  console.log("");

  if (
    !gitCommandSucceeded(
      tagsResult,
    )
  ) {
    console.error(
      "Unable to read release history.",
    );

    printGitFailure(
      tagsResult,
    );

    process.exitCode = 1;
    return;
  }

  const tags =
    splitLines(
      tagsResult.stdout,
    );

  if (tags.length === 0) {
    console.log(
      "No ANW CLI release tags found.",
    );

    console.log("");

    console.log(
      "History inspection complete.",
    );

    console.log(
      "No changes were made.",
    );

    console.log("");

    process.exitCode = 0;
    return;
  }

  console.log(
    `Latest release: ${tags[0]}`,
  );

  console.log(
    `Total releases found: ${tags.length}`,
  );

  console.log("");

  console.log(
    "Recent releases:",
  );

  console.log("");

  const entries:
    ReleaseHistoryEntry[] = [];

  for (
    const tag
    of tags.slice(
      0,
      10,
    )
  ) {
    entries.push(
      readReleaseHistoryEntry(
        context.projectRoot,
        tag,
      ),
    );
  }

  for (
    const entry
    of entries
  ) {
    console.log(
      entry.tag,
    );

    console.log(
      `  Date: ${entry.date}`,
    );

    console.log(
      `  Commit: ${entry.commit}`,
    );

    console.log("");
  }

  console.log(
    "Release progression:",
  );

  console.log("");

  for (
    let index = 0;
    index < entries.length;
    index += 1
  ) {
    const entry =
      entries[index];

    if (!entry) {
      continue;
    }

    console.log(
      `${index + 1}. ${entry.tag}`,
    );
  }

  console.log("");

  console.log(
    "History inspection complete.",
  );

  console.log(
    "No changes were made.",
  );

  console.log("");

  process.exitCode = 0;
}

function readReleaseHistoryEntry(
  projectRoot: string,
  tag: string,
): ReleaseHistoryEntry {
  const commitResult =
    runGit(
      projectRoot,
      [
        "rev-list",
        "-n",
        "1",
        tag,
      ],
    );

  const dateResult =
    runGit(
      projectRoot,
      [
        "for-each-ref",
        `refs/tags/${tag}`,
        "--format=%(creatordate:iso-strict)",
      ],
    );

  return {
    tag,

    commit:
      gitCommandSucceeded(
        commitResult,
      ) &&
      commitResult.stdout
        ? commitResult.stdout.slice(
            0,
            12,
          )
        : "UNKNOWN",

    date:
      gitCommandSucceeded(
        dateResult,
      ) &&
      dateResult.stdout
        ? dateResult.stdout
        : "UNKNOWN",
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
    "1. Confirm Git working tree is clean.",
  );

  console.log(
    "2. Confirm CLI package version.",
  );

  console.log(
    "3. Confirm README release metadata.",
  );

  console.log(
    "4. Confirm CHANGELOG release metadata.",
  );

  console.log(
    "5. Confirm release tag availability.",
  );

  console.log(
    "6. Run full ANW validation.",
  );

  console.log(
    "7. Create annotated Git tag.",
  );

  console.log(
    "8. Push only the release tag to origin.",
  );

  console.log("");

  console.log(
    "Release readiness:",
  );

  console.log(
    "npm run dev -- release --check",
  );

  console.log("");

  console.log(
    "Controlled release:",
  );

  console.log(
    "npm run dev -- release --execute --confirm",
  );

  console.log("");

  console.log(
    "Future tag command:",
  );

  console.log(
    `git tag -a ${context.releaseTag} -m "ANW CLI v${context.version}"`,
  );

  console.log("");

  console.log(
    "Future push command:",
  );

  console.log(
    `git push origin ${context.releaseTag}`,
  );

  console.log("");

  console.log(
    "Release plan complete.",
  );

  console.log(
    "No changes were made.",
  );

  console.log("");

  process.exitCode = 0;
}

function runReleaseCheck(): void {
  const context =
    createReleaseContext();

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

  if (
    !runFullValidation()
  ) {
    console.error(
      "Release check failed because validation failed.",
    );

    console.log("");

    process.exitCode = 1;
    return;
  }

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
    "Running full ANW validation before release...",
  );

  console.log("");

  if (
    !runFullValidation()
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
    console.error(
      "Unable to create release tag.",
    );

    printGitFailure(
      tagResult,
    );

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
    console.error(
      "Tag was created locally, but push failed.",
    );

    printGitFailure(
      pushResult,
    );

    console.error(
      `Local tag remains: ${context.releaseTag}`,
    );

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
    !gitCommandSucceeded(
      result,
    )
  ) {
    return {
      label:
        "Git working tree",
      status: "fail",
      detail:
        result.stderr ||
        result.error?.message ||
        "Unable to inspect Git working tree.",
    };
  }

  const changes =
    splitLines(
      result.stdout,
    );

  if (
    changes.length === 0
  ) {
    return {
      label:
        "Git working tree",
      status: "pass",
      detail:
        "Working tree clean",
    };
  }

  return {
    label:
      "Git working tree",
    status: "fail",
    detail:
      `${changes.length} uncommitted change${
        changes.length === 1
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

  if (
    content.includes(
      version,
    ) &&
    content.includes(
      releaseTag,
    )
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

  const heading =
    `## [${version}]`;

  if (
    content.includes(
      heading,
    ) &&
    content.includes(
      releaseTag,
    )
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
      `CHANGELOG.md must contain ${heading} and ${releaseTag}.`,
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
    !gitCommandSucceeded(
      result,
    )
  ) {
    return {
      label:
        "Release tag availability",
      status: "fail",
      detail:
        result.stderr ||
        result.error?.message ||
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

    console.error(
      `Validation failed: ${message}`,
    );

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

function findProjectRoot(
  startDirectory: string,
): string {
  let currentDirectory =
    resolve(
      startDirectory,
    );

  while (true) {
    if (
      existsSync(
        join(
          currentDirectory,
          ".git",
        ),
      ) &&
      existsSync(
        join(
          currentDirectory,
          "apps",
          "admin",
        ),
      ) &&
      existsSync(
        join(
          currentDirectory,
          "tools",
          "anw-cli",
        ),
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
    "ANW project root could not be found.",
  );
}

function readPackageVersion(
  packagePath: string,
): string {
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

function splitLines(
  value: string,
): string[] {
  return value
    .split(
      /\r?\n/,
    )
    .map(
      (line) =>
        line.trim(),
    )
    .filter(Boolean);
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
    result.error === undefined &&
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