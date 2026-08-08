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

export function runRelease(
  options: ReleaseOptions = {},
): void {
  if (
    options.check === true &&
    options.plan === true
  ) {
    throw new Error(
      "Use either --check or --plan, not both.",
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
    "Available safe release commands:",
  );
  console.log("");

  console.log(
    "npm run dev -- release --check",
  );

  console.log(
    "npm run dev -- release --plan",
  );

  console.log("");

  console.log(
    "--check validates release readiness.",
  );

  console.log(
    "--plan previews the release process.",
  );

  console.log("");

  console.log(
    "Neither command creates commits, tags, pushes, or file changes.",
  );

  console.log("");
}

function runReleasePlan(): void {
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

  const version =
    readPackageVersion(
      packagePath,
    );

  const releaseTag =
    `anw-cli-v${version}`;

  console.log("");
  console.log(
    "ANW AI-COS Release Plan",
  );
  console.log(
    "=======================",
  );
  console.log("");

  console.log(
    `Repository: ${projectRoot}`,
  );

  console.log(
    `Version: ${version}`,
  );

  console.log(
    `Proposed tag: ${releaseTag}`,
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
    "8. Push the release tag to origin.",
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
    "Future tag command:",
  );

  console.log("");

  console.log(
    `git tag -a ${releaseTag} -m "ANW CLI v${version}"`,
  );

  console.log("");

  console.log(
    "Future push command:",
  );

  console.log("");

  console.log(
    `git push origin ${releaseTag}`,
  );

  console.log("");

  console.log(
    "Safety status:",
  );

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

  console.log("");
  console.log(
    "ANW AI-COS Release Check",
  );
  console.log(
    "========================",
  );
  console.log("");

  console.log(
    `Repository: ${projectRoot}`,
  );
  console.log("");

  const packageVersion =
    readPackageVersion(
      packagePath,
    );

  const releaseTag =
    `anw-cli-v${packageVersion}`;

  const checks: ReleaseCheck[] =
    [];

  checks.push(
    checkGitWorkingTree(
      projectRoot,
    ),
  );

  checks.push({
    label:
      "CLI package version",
    status: "pass",
    detail: packageVersion,
  });

  checks.push(
    checkReadmeVersion(
      readmePath,
      packageVersion,
      releaseTag,
    ),
  );

  checks.push(
    checkChangelogVersion(
      changelogPath,
      packageVersion,
      releaseTag,
    ),
  );

  checks.push(
    checkReleaseTagAvailable(
      projectRoot,
      releaseTag,
    ),
  );

  printChecks(
    checks,
  );

  const failures =
    checks.filter(
      (check) =>
        check.status === "fail",
    );

  if (
    failures.length > 0
  ) {
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

  const previousExitCode =
    process.exitCode;

  process.exitCode = 0;

  validateRepository();

  const validationExitCode =
    process.exitCode ?? 0;

  if (
    validationExitCode !== 0
  ) {
    console.log("");

    console.error(
      "Release check failed because repository validation failed.",
    );

    console.log("");

    process.exitCode = 1;

    return;
  }

  process.exitCode =
    previousExitCode ?? 0;

  console.log("");

  console.log(
    "ANW Release Check Summary",
  );

  console.log(
    "=========================",
  );

  console.log("");

  console.log(
    `✓ Version: ${packageVersion}`,
  );

  console.log(
    `✓ Release tag available: ${releaseTag}`,
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