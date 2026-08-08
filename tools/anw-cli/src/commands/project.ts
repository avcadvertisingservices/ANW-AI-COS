import {
  existsSync,
  readdirSync,
  readFileSync,
} from "node:fs";

import {
  basename,
  join,
  resolve,
} from "node:path";

import {
  spawnSync,
} from "node:child_process";

import {
  discoverFeatures,
} from "./feature-list.js";

import {
  discoverModules,
} from "./module-list.js";

type GitResult = {
  status: number | null;
  stdout: string;
  stderr: string;
  error: Error | undefined;
};

type WorkingTreeState =
  | "CLEAN"
  | "DIRTY"
  | "UNKNOWN";

type ProjectHealth =
  | "HEALTHY"
  | "ATTENTION REQUIRED";

type WorkingTreeResult = {
  state: WorkingTreeState;
  changes: number;
};

type ProjectStatus = {
  projectRoot: string;
  branch: string;
  workingTree: WorkingTreeState;
  workingTreeChanges: number;
  latestCommit: string;
  cliVersion: string;
  latestReleaseTag: string;
  routeCount: number;
  moduleCount: number;
  featureCount: number;
  componentCount: number;
  overallStatus: ProjectHealth;
};

export type ProjectOptions = {
  status?: boolean;
};

export function runProject(
  options: ProjectOptions = {},
): void {
  if (
    options.status === true
  ) {
    runProjectStatus();
    return;
  }

  printProjectHelp();
}

function printProjectHelp(): void {
  console.log("");
  console.log(
    "# ANW AI-COS Project",
  );
  console.log("");

  console.log(
    "Available command:",
  );

  console.log("");

  console.log(
    "npm run dev -- project --status",
  );

  console.log("");

  console.log(
    "No project changes were made.",
  );

  console.log("");
}

function runProjectStatus(): void {
  const projectRoot =
    findProjectRoot(
      process.cwd(),
    );

  const status =
    collectProjectStatus(
      projectRoot,
    );

  console.log("");
  console.log(
    "# ANW AI-COS Project Status",
  );
  console.log("");

  console.log(
    `Repository: ${status.projectRoot}`,
  );

  console.log("");

  console.log(
    "## Repository",
  );
  console.log("");

  console.log(
    `Branch: ${status.branch}`,
  );

  if (
    status.workingTree ===
    "DIRTY"
  ) {
    console.log(
      `Working tree: DIRTY (${status.workingTreeChanges} ${
        status.workingTreeChanges === 1
          ? "change"
          : "changes"
      })`,
    );
  } else {
    console.log(
      `Working tree: ${status.workingTree}`,
    );
  }

  console.log(
    `Latest commit: ${status.latestCommit}`,
  );

  console.log("");

  console.log(
    "## ANW CLI",
  );
  console.log("");

  console.log(
    `Version: ${status.cliVersion}`,
  );

  console.log(
    `Latest release tag: ${status.latestReleaseTag}`,
  );

  console.log("");

  console.log(
    "## Admin Application",
  );
  console.log("");

  console.log(
    `App Router files: ${status.routeCount}`,
  );

  console.log("");

  console.log(
    "## Architecture Inventory",
  );
  console.log("");

  console.log(
    `Modules: ${status.moduleCount}`,
  );

  console.log(
    `Features: ${status.featureCount}`,
  );

  console.log(
    `Components: ${status.componentCount}`,
  );

  console.log("");

  console.log(
    "## Overall Health",
  );
  console.log("");

  console.log(
    `Status: ${status.overallStatus}`,
  );

  console.log("");

  console.log(
    "Project status inspection complete.",
  );

  console.log(
    "No changes were made.",
  );

  console.log("");
}

function collectProjectStatus(
  projectRoot: string,
): ProjectStatus {
  const branch =
    getCurrentBranch(
      projectRoot,
    );

  const workingTree =
    getWorkingTreeStatus(
      projectRoot,
    );

  const latestCommit =
    getLatestCommit(
      projectRoot,
    );

  const cliVersion =
    getCliVersion(
      projectRoot,
    );

  const latestReleaseTag =
    getLatestReleaseTag(
      projectRoot,
    );

  const routeCount =
    countRouteFiles(
      projectRoot,
    );

  const modules =
    discoverModules(
      projectRoot,
    );

  const features =
    discoverFeatures(
      projectRoot,
    );

  const componentCount =
    countSourceFiles(
      join(
        projectRoot,
        "apps",
        "admin",
        "src",
        "components",
      ),
    );

  const overallStatus =
    determineOverallHealth({
      branch,
      workingTree,
      latestCommit,
      cliVersion,
      routeCount,
    });

  return {
    projectRoot,
    branch,
    workingTree:
      workingTree.state,
    workingTreeChanges:
      workingTree.changes,
    latestCommit,
    cliVersion,
    latestReleaseTag,
    routeCount,
    moduleCount:
      modules.length,
    featureCount:
      features.length,
    componentCount,
    overallStatus,
  };
}

function determineOverallHealth(
  input: {
    branch: string;
    workingTree: WorkingTreeResult;
    latestCommit: string;
    cliVersion: string;
    routeCount: number;
  },
): ProjectHealth {
  if (
    input.branch ===
      "UNKNOWN" ||
    input.workingTree.state ===
      "UNKNOWN" ||
    input.latestCommit ===
      "UNKNOWN" ||
    input.cliVersion ===
      "UNKNOWN" ||
    input.routeCount === 0
  ) {
    return "ATTENTION REQUIRED";
  }

  return "HEALTHY";
}

function findProjectRoot(
  startDirectory: string,
): string {
  let currentDirectory =
    resolve(
      startDirectory,
    );

  while (true) {
    const gitPath =
      join(
        currentDirectory,
        ".git",
      );

    const adminPath =
      join(
        currentDirectory,
        "apps",
        "admin",
      );

    const cliPath =
      join(
        currentDirectory,
        "tools",
        "anw-cli",
      );

    if (
      existsSync(
        gitPath,
      ) &&
      existsSync(
        adminPath,
      ) &&
      existsSync(
        cliPath,
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

function getCurrentBranch(
  projectRoot: string,
): string {
  const result =
    runGit(
      projectRoot,
      [
        "branch",
        "--show-current",
      ],
    );

  if (
    gitCommandSucceeded(
      result,
    ) &&
    result.stdout.length > 0
  ) {
    return result.stdout;
  }

  return "UNKNOWN";
}

function getWorkingTreeStatus(
  projectRoot: string,
): WorkingTreeResult {
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
      state:
        "UNKNOWN",

      changes:
        0,
    };
  }

  const changes =
    splitLines(
      result.stdout,
    );

  return {
    state:
      changes.length === 0
        ? "CLEAN"
        : "DIRTY",

    changes:
      changes.length,
  };
}

function getLatestCommit(
  projectRoot: string,
): string {
  const result =
    runGit(
      projectRoot,
      [
        "log",
        "-1",
        "--format=%h %s",
      ],
    );

  if (
    gitCommandSucceeded(
      result,
    ) &&
    result.stdout.length > 0
  ) {
    return result.stdout;
  }

  return "UNKNOWN";
}

function getCliVersion(
  projectRoot: string,
): string {
  const packagePath =
    join(
      projectRoot,
      "tools",
      "anw-cli",
      "package.json",
    );

  if (
    !existsSync(
      packagePath,
    )
  ) {
    return "UNKNOWN";
  }

  try {
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
      typeof parsedPackage.version ===
        "string" &&
      parsedPackage.version.trim()
    ) {
      return parsedPackage.version.trim();
    }
  } catch {
    return "UNKNOWN";
  }

  return "UNKNOWN";
}

function getLatestReleaseTag(
  projectRoot: string,
): string {
  const result =
    runGit(
      projectRoot,
      [
        "tag",
        "--list",
        "anw-cli-v*",
        "--sort=-v:refname",
      ],
    );

  if (
    !gitCommandSucceeded(
      result,
    )
  ) {
    return "UNKNOWN";
  }

  const tags =
    splitLines(
      result.stdout,
    );

  return (
    tags[0] ??
    "NONE"
  );
}

function countRouteFiles(
  projectRoot: string,
): number {
  const appDirectory =
    findAdminAppDirectory(
      projectRoot,
    );

  if (
    appDirectory ===
    undefined
  ) {
    return 0;
  }

  const routeFileNames =
    new Set<string>([
      "page.tsx",
      "page.ts",
      "layout.tsx",
      "layout.ts",
      "loading.tsx",
      "loading.ts",
      "error.tsx",
      "error.ts",
      "not-found.tsx",
      "not-found.ts",
      "route.ts",
      "route.tsx",
    ]);

  const files =
    walkFiles(
      appDirectory,
    );

  return files.filter(
    (filePath) =>
      routeFileNames.has(
        basename(
          filePath,
        ),
      ),
  ).length;
}

function findAdminAppDirectory(
  projectRoot: string,
): string | undefined {
  const candidates = [
    join(
      projectRoot,
      "apps",
      "admin",
      "app",
    ),

    join(
      projectRoot,
      "apps",
      "admin",
      "src",
      "app",
    ),
  ];

  return candidates.find(
    (candidate) =>
      existsSync(
        candidate,
      ),
  );
}

function countSourceFiles(
  directory: string,
): number {
  if (
    !existsSync(
      directory,
    )
  ) {
    return 0;
  }

  const files =
    walkFiles(
      directory,
    );

  return files.filter(
    (filePath) =>
      /\.(tsx?|jsx?)$/i.test(
        filePath,
      ),
  ).length;
}

function walkFiles(
  directory: string,
): string[] {
  if (
    !existsSync(
      directory,
    )
  ) {
    return [];
  }

  const files: string[] =
    [];

  let entries;

  try {
    entries =
      readdirSync(
        directory,
        {
          withFileTypes: true,
          encoding: "utf8",
        },
      );
  } catch {
    return [];
  }

  for (
    const entry
    of entries
  ) {
    const fullPath =
      join(
        directory,
        entry.name,
      );

    if (
      entry.isDirectory()
    ) {
      files.push(
        ...walkFiles(
          fullPath,
        ),
      );

      continue;
    }

    if (
      entry.isFile()
    ) {
      files.push(
        fullPath,
      );
    }
  }

  return files;
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
    .filter(
      (line) =>
        line.length > 0,
    );
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
        encoding:
          "utf8",
        shell:
          false,
      },
    );

  return {
    status:
      result.status,

    stdout:
      String(
        result.stdout ??
          "",
      ).trim(),

    stderr:
      String(
        result.stderr ??
          "",
      ).trim(),

    error:
      result.error,
  };
}

function gitCommandSucceeded(
  result: GitResult,
): boolean {
  return (
    result.error ===
      undefined &&
    result.status ===
      0
  );
}