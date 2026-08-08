import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
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

type InventoryItem = {
  name: string;
  path: string;
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

type ProjectJsonReport = {
  repository: string;
  branch: string;
  workingTree: {
    status: WorkingTreeState;
    changes: number;
  };
  latestCommit: string;
  cli: {
    version: string;
    latestReleaseTag: string;
  };
  architecture: {
    modules: number;
    features: number;
    components: number;
    routes: number;
  };
  health: ProjectHealth;
};

export type ProjectOptions = {
  status?: boolean;
  inventory?: boolean;
  report?: boolean;
  json?: boolean;
  output?: string;
};

export function runProject(
  options: ProjectOptions = {},
): void {
  const selectedModes =
    [
      options.status,
      options.inventory,
      options.report,
    ].filter(Boolean).length;

  if (
    selectedModes > 1
  ) {
    throw new Error(
      "Choose only one project mode: --status, --inventory, or --report.",
    );
  }

  if (
    options.json === true &&
    options.report !== true
  ) {
    throw new Error(
      "--json can only be used together with --report.",
    );
  }

  if (
    options.output !== undefined &&
    options.report !== true
  ) {
    throw new Error(
      "--output can only be used together with --report.",
    );
  }

  if (
    options.output !== undefined &&
    options.output.trim().length === 0
  ) {
    throw new Error(
      "--output requires a non-empty file path.",
    );
  }

  if (
    options.status === true
  ) {
    runProjectStatus();
    return;
  }

  if (
    options.inventory === true
  ) {
    runProjectInventory();
    return;
  }

  if (
    options.report === true
  ) {
    runProjectReportMode(
      options,
    );
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
    "Available commands:",
  );
  console.log("");

  console.log(
    "npm run dev -- project --status",
  );

  console.log(
    "npm run dev -- project --inventory",
  );

  console.log(
    "npm run dev -- project --report",
  );

  console.log(
    "npm run dev -- project --report --json",
  );

  console.log(
    "npm run dev -- project --report --output docs/project-report.md",
  );

  console.log(
    "npm run dev -- project --report --json --output docs/project-report.json",
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

  console.log(
    `Working tree: ${formatWorkingTree(
      status,
    )}`,
  );

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

function runProjectInventory(): void {
  const projectRoot =
    findProjectRoot(
      process.cwd(),
    );

  const modules =
    discoverModules(
      projectRoot,
    );

  const features =
    discoverFeatures(
      projectRoot,
    );

  const components =
    discoverComponents(
      projectRoot,
    );

  const routes =
    discoverRoutes(
      projectRoot,
    );

  console.log("");
  console.log(
    "# ANW AI-COS Project Inventory",
  );
  console.log("");

  console.log(
    `Repository: ${projectRoot}`,
  );
  console.log("");

  printInventorySection(
    "Modules",
    modules,
  );

  printInventorySection(
    "Features",
    features,
  );

  printInventorySection(
    "Components",
    components,
  );

  printInventorySection(
    "Routes",
    routes,
  );

  console.log(
    "Project inventory inspection complete.",
  );

  console.log(
    "No files were changed.",
  );
  console.log("");
}

function runProjectReportMode(
  options: ProjectOptions,
): void {
  const projectRoot =
    findProjectRoot(
      process.cwd(),
    );

  const status =
    collectProjectStatus(
      projectRoot,
    );

  const content =
    options.json === true
      ? buildJsonReport(
          status,
        )
      : buildMarkdownReport(
          status,
        );

  if (
    options.output !== undefined
  ) {
    writeReportFile(
      projectRoot,
      options.output,
      content,
      options.json === true
        ? "JSON"
        : "Markdown",
    );

    return;
  }

  console.log(
    content,
  );
}

function buildMarkdownReport(
  status: ProjectStatus,
): string {
  const lines = [
    "# ANW AI-COS Project Report",
    "",
    `Repository: ${status.projectRoot}`,
    "",
    "## Repository",
    "",
    `Branch: ${status.branch}`,
    `Working tree: ${formatWorkingTree(status)}`,
    `Latest commit: ${status.latestCommit}`,
    "",
    "## CLI Release",
    "",
    `Version: ${status.cliVersion}`,
    `Latest release tag: ${status.latestReleaseTag}`,
    "",
    "## Architecture",
    "",
    `Modules: ${status.moduleCount}`,
    `Features: ${status.featureCount}`,
    `Components: ${status.componentCount}`,
    `Routes: ${status.routeCount}`,
    "",
    "## Health",
    "",
    `Overall status: ${status.overallStatus}`,
    "",
    status.overallStatus ===
    "HEALTHY"
      ? "The ANW AI-COS repository structure is available and readable."
      : "One or more project status checks require attention.",
    "",
    "Project report generation complete.",
    "No files were changed.",
  ];

  return lines.join(
    "\n",
  );
}

function buildJsonReport(
  status: ProjectStatus,
): string {
  const report:
    ProjectJsonReport = {
      repository:
        status.projectRoot,

      branch:
        status.branch,

      workingTree: {
        status:
          status.workingTree,

        changes:
          status.workingTreeChanges,
      },

      latestCommit:
        status.latestCommit,

      cli: {
        version:
          status.cliVersion,

        latestReleaseTag:
          status.latestReleaseTag,
      },

      architecture: {
        modules:
          status.moduleCount,

        features:
          status.featureCount,

        components:
          status.componentCount,

        routes:
          status.routeCount,
      },

      health:
        status.overallStatus,
    };

  return JSON.stringify(
    report,
    null,
    2,
  );
}

function writeReportFile(
  projectRoot: string,
  requestedPath: string,
  content: string,
  format: "Markdown" | "JSON",
): void {
  const trimmedPath =
    requestedPath.trim();

  const outputPath =
    isAbsolute(
      trimmedPath,
    )
      ? resolve(
          trimmedPath,
        )
      : resolve(
          projectRoot,
          trimmedPath,
        );

  const outputDirectory =
    dirname(
      outputPath,
    );

  mkdirSync(
    outputDirectory,
    {
      recursive: true,
    },
  );

  writeFileSync(
    outputPath,
    `${content}\n`,
    "utf8",
  );

  console.log("");
  console.log(
    "# ANW AI-COS Project Report",
  );
  console.log("");

  console.log(
    `Format: ${format}`,
  );

  console.log(
    `Output: ${outputPath}`,
  );

  console.log("");

  console.log(
    "Project report written successfully.",
  );

  console.log("");
}

function formatWorkingTree(
  status: ProjectStatus,
): string {
  if (
    status.workingTree !==
    "DIRTY"
  ) {
    return status.workingTree;
  }

  return `DIRTY (${status.workingTreeChanges} ${
    status.workingTreeChanges === 1
      ? "change"
      : "changes"
  })`;
}

function printInventorySection(
  title: string,
  items: InventoryItem[],
): void {
  console.log(
    `## ${title}`,
  );
  console.log("");

  console.log(
    `${title} found: ${items.length}`,
  );
  console.log("");

  if (
    items.length === 0
  ) {
    console.log(
      `No ${title.toLowerCase()} were discovered.`,
    );

    console.log("");
    return;
  }

  for (
    const item
    of items
  ) {
    console.log(
      `- ${item.name}`,
    );

    console.log(
      `  ${item.path}`,
    );
  }

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

  const routes =
    discoverRoutes(
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

  const components =
    discoverComponents(
      projectRoot,
    );

  const overallStatus =
    determineOverallHealth({
      branch,
      workingTree,
      latestCommit,
      cliVersion,
      routeCount:
        routes.length,
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

    routeCount:
      routes.length,

    moduleCount:
      modules.length,

    featureCount:
      features.length,

    componentCount:
      components.length,

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
    input.routeCount ===
      0
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

function discoverComponents(
  projectRoot: string,
): InventoryItem[] {
  const candidateDirectories = [
    join(
      projectRoot,
      "apps",
      "admin",
      "src",
      "components",
    ),

    join(
      projectRoot,
      "src",
      "components",
    ),

    join(
      projectRoot,
      "components",
    ),
  ];

  const discovered =
    new Map<
      string,
      InventoryItem
    >();

  for (
    const directory
    of candidateDirectories
  ) {
    if (
      !existsSync(
        directory,
      )
    ) {
      continue;
    }

    const files =
      walkFiles(
        directory,
      ).filter(
        (filePath) =>
          /\.(tsx?|jsx?)$/i.test(
            filePath,
          ),
      );

    for (
      const filePath
      of files
    ) {
      const relativePath =
        normalizeDisplayPath(
          relative(
            projectRoot,
            filePath,
          ),
        );

      const key =
        relativePath.toLowerCase();

      if (
        discovered.has(
          key,
        )
      ) {
        continue;
      }

      discovered.set(
        key,
        {
          name:
            basename(
              filePath,
            ),

          path:
            relativePath,
        },
      );
    }
  }

  return Array.from(
    discovered.values(),
  ).sort(
    (
      left,
      right,
    ) =>
      left.path.localeCompare(
        right.path,
      ),
  );
}

function discoverRoutes(
  projectRoot: string,
): InventoryItem[] {
  const appDirectory =
    findAdminAppDirectory(
      projectRoot,
    );

  if (
    appDirectory ===
    undefined
  ) {
    return [];
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

  return walkFiles(
    appDirectory,
  )
    .filter(
      (filePath) =>
        routeFileNames.has(
          basename(
            filePath,
          ),
        ),
    )
    .map(
      (filePath) => ({
        name:
          getRouteDisplayName(
            appDirectory,
            filePath,
          ),

        path:
          normalizeDisplayPath(
            relative(
              projectRoot,
              filePath,
            ),
          ),
      }),
    )
    .sort(
      (
        left,
        right,
      ) =>
        left.path.localeCompare(
          right.path,
        ),
    );
}

function getRouteDisplayName(
  appDirectory: string,
  filePath: string,
): string {
  const routePath =
    normalizeDisplayPath(
      relative(
        appDirectory,
        filePath,
      ),
    );

  return routePath.length > 0
    ? routePath
    : basename(
        filePath,
      );
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
          withFileTypes:
            true,

          encoding:
            "utf8",
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

function normalizeDisplayPath(
  path: string,
): string {
  return path.replace(
    /\\/g,
    "/",
  );
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