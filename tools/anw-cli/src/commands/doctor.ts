import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";

import {
  basename,
  join,
  relative,
  resolve,
} from "node:path";

import {
  spawnSync,
} from "node:child_process";

type DoctorResult = {
  label: string;
  status:
    | "pass"
    | "warning"
    | "fail";
  detail?: string;
};

const ROUTE_FILE_NAMES =
  new Set([
    "page.tsx",
    "layout.tsx",
    "loading.tsx",
    "error.tsx",
  ]);

export function runDoctor(): void {
  const projectRoot =
    findProjectRoot(
      process.cwd(),
    );

  const adminAppRoot = join(
    projectRoot,
    "apps",
    "admin",
    "src",
    "app",
  );

  const cliRoot = join(
    projectRoot,
    "tools",
    "anw-cli",
  );

  const results: DoctorResult[] =
    [];

  results.push({
    label: "ANW project root",
    status: "pass",
    detail: projectRoot,
  });

  results.push(
    checkRequiredPath(
      adminAppRoot,
      "Admin App Router",
    ),
  );

  results.push(
    checkRequiredPath(
      cliRoot,
      "ANW CLI directory",
    ),
  );

  results.push(
    checkRequiredPath(
      join(
        cliRoot,
        "package.json",
      ),
      "CLI package.json",
    ),
  );

  results.push(
    checkRequiredPath(
      join(
        cliRoot,
        "tsconfig.json",
      ),
      "CLI TypeScript configuration",
    ),
  );

  if (
    existsSync(adminAppRoot)
  ) {
    results.push(
      ...inspectRouteFiles(
        projectRoot,
        adminAppRoot,
      ),
    );
  }

  results.push(
    checkGitWorkingTree(
      projectRoot,
    ),
  );

  printReport(results);

  const failureCount =
    results.filter(
      (result) =>
        result.status === "fail",
    ).length;

  const warningCount =
    results.filter(
      (result) =>
        result.status ===
        "warning",
    ).length;

  console.log("");

  if (failureCount > 0) {
    console.error(
      `Doctor found ${failureCount} critical problem${
        failureCount === 1
          ? ""
          : "s"
      }.`,
    );

    process.exitCode = 1;

    return;
  }

  if (warningCount > 0) {
    console.log(
      `Doctor completed with ${warningCount} warning${
        warningCount === 1
          ? ""
          : "s"
      }.`,
    );

    return;
  }

  console.log(
    "No critical problems detected.",
  );
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

function checkRequiredPath(
  path: string,
  label: string,
): DoctorResult {
  if (existsSync(path)) {
    return {
      label,
      status: "pass",
    };
  }

  return {
    label,
    status: "fail",
    detail: `Missing: ${path}`,
  };
}

function inspectRouteFiles(
  projectRoot: string,
  appRoot: string,
): DoctorResult[] {
  const routeFiles =
    collectRouteFiles(appRoot);

  const results:
    DoctorResult[] = [];

  if (
    routeFiles.length === 0
  ) {
    return [
      {
        label:
          "Admin route files",
        status: "warning",
        detail:
          "No App Router files were found.",
      },
    ];
  }

  const emptyFiles:
    string[] = [];

  const missingDefaultExports:
    string[] = [];

  const invalidErrorBoundaries:
    string[] = [];

  for (
    const filePath
    of routeFiles
  ) {
    const relativePath =
      normalizeRelativePath(
        projectRoot,
        filePath,
      );

    const content =
      readFileSync(
        filePath,
        "utf8",
      );

    const trimmedContent =
      content.trim();

    if (!trimmedContent) {
      emptyFiles.push(
        relativePath,
      );

      continue;
    }

    if (
      !hasDefaultExport(
        trimmedContent,
      )
    ) {
      missingDefaultExports.push(
        relativePath,
      );
    }

    if (
      basename(filePath) ===
        "error.tsx" &&
      !hasUseClientDirective(
        trimmedContent,
      )
    ) {
      invalidErrorBoundaries.push(
        relativePath,
      );
    }
  }

  if (
    emptyFiles.length === 0
  ) {
    results.push({
      label:
        "Empty App Router files",
      status: "pass",
    });
  } else {
    results.push({
      label:
        "Empty App Router files",
      status: "fail",
      detail:
        formatFileList(
          emptyFiles,
        ),
    });
  }

  if (
    missingDefaultExports.length ===
    0
  ) {
    results.push({
      label:
        "App Router default exports",
      status: "pass",
    });
  } else {
    results.push({
      label:
        "App Router default exports",
      status: "fail",
      detail:
        formatFileList(
          missingDefaultExports,
        ),
    });
  }

  if (
    invalidErrorBoundaries.length ===
    0
  ) {
    results.push({
      label:
        "Client error boundaries",
      status: "pass",
    });
  } else {
    results.push({
      label:
        "Client error boundaries",
      status: "fail",
      detail:
        `The following error.tsx files need a top-level "use client" directive:\n${formatFileList(
          invalidErrorBoundaries,
        )}`,
    });
  }

  results.push({
    label:
      "Admin route inventory",
    status: "pass",
    detail: `${routeFiles.length} route file${
      routeFiles.length === 1
        ? ""
        : "s"
    } inspected`,
  });

  return results;
}

function collectRouteFiles(
  directoryPath: string,
): string[] {
  const routeFiles:
    string[] = [];

  const entries = readdirSync(
    directoryPath,
    {
      withFileTypes: true,
    },
  );

  for (
    const entry
    of entries
  ) {
    const entryPath = join(
      directoryPath,
      entry.name,
    );

    if (
      entry.isDirectory()
    ) {
      routeFiles.push(
        ...collectRouteFiles(
          entryPath,
        ),
      );

      continue;
    }

    if (
      entry.isFile() &&
      ROUTE_FILE_NAMES.has(
        entry.name,
      )
    ) {
      routeFiles.push(
        entryPath,
      );
    }
  }

  return routeFiles.sort();
}

function hasDefaultExport(
  content: string,
): boolean {
  return (
    /\bexport\s+default\b/.test(
      content,
    ) ||
    /\bexport\s*\{\s*[^}]*\bas\s+default\b[^}]*\}/.test(
      content,
    )
  );
}

function hasUseClientDirective(
  content: string,
): boolean {
  const withoutComments =
    content
      .replace(
        /^#!.*(?:\r?\n|$)/,
        "",
      )
      .replace(
        /^\s*\/\*[\s\S]*?\*\/\s*/,
        "",
      )
      .replace(
        /^(?:\s*\/\/.*\r?\n)*/,
        "",
      )
      .trimStart();

  return (
    withoutComments.startsWith(
      '"use client";',
    ) ||
    withoutComments.startsWith(
      "'use client';",
    ) ||
    withoutComments.startsWith(
      '"use client"',
    ) ||
    withoutComments.startsWith(
      "'use client'",
    )
  );
}

function checkGitWorkingTree(
  projectRoot: string,
): DoctorResult {
  const gitCommand =
    process.platform === "win32"
      ? "git.exe"
      : "git";

  const result = spawnSync(
    gitCommand,
    [
      "status",
      "--porcelain",
    ],
    {
      cwd: projectRoot,
      encoding: "utf8",
      shell: false,
    },
  );

  if (result.error) {
    return {
      label:
        "Git working tree",
      status: "warning",
      detail:
        result.error.message,
    };
  }

  if (result.status !== 0) {
    return {
      label:
        "Git working tree",
      status: "warning",
      detail:
        result.stderr.trim() ||
        "Git status could not be read.",
    };
  }

  const output =
    result.stdout.trim();

  if (!output) {
    return {
      label:
        "Git working tree",
      status: "pass",
      detail:
        "Working tree clean",
    };
  }

  const changedFiles =
    output.split(/\r?\n/);

  return {
    label:
      "Git working tree",
    status: "warning",
    detail: `${
      changedFiles.length
    } uncommitted change${
      changedFiles.length === 1
        ? ""
        : "s"
    } detected`,
  };
}

function normalizeRelativePath(
  projectRoot: string,
  filePath: string,
): string {
  return relative(
    projectRoot,
    filePath,
  ).replace(/\\/g, "/");
}

function formatFileList(
  files: string[],
): string {
  return files
    .map(
      (file) =>
        `- ${file}`,
    )
    .join("\n");
}

function printReport(
  results: DoctorResult[],
): void {
  console.log("");
  console.log(
    "ANW AI-COS Doctor",
  );
  console.log(
    "=================",
  );
  console.log("");

  for (
    const result
    of results
  ) {
    const symbol =
      result.status === "pass"
        ? "✓"
        : result.status ===
            "warning"
          ? "!"
          : "✗";

    console.log(
      `${symbol} ${result.label}`,
    );

    if (result.detail) {
      const detailLines =
        result.detail.split(
          /\r?\n/,
        );

      for (
        const detailLine
        of detailLines
      ) {
        console.log(
          `  ${detailLine}`,
        );
      }
    }
  }
}