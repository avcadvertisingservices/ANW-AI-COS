import {
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";

import {
  basename,
  dirname,
  join,
  relative,
  resolve,
} from "node:path";

export type RepairOptions = {
  write?: boolean;
};

type RepairAction =
  | {
      kind: "replace-empty";
      filePath: string;
      relativePath: string;
      content: string;
      description: string;
    }
  | {
      kind: "add-use-client";
      filePath: string;
      relativePath: string;
      content: string;
      description: string;
    };

type ManualProblem = {
  filePath: string;
  relativePath: string;
  description: string;
};

type RepairScanResult = {
  actions: RepairAction[];
  manualProblems: ManualProblem[];
  inspectedFileCount: number;
};

const ROUTE_FILE_NAMES = new Set([
  "page.tsx",
  "layout.tsx",
  "loading.tsx",
  "error.tsx",
]);

export function repairRepository(
  options: RepairOptions = {},
): void {
  const projectRoot =
    findProjectRoot(process.cwd());

  const appRoot = join(
    projectRoot,
    "apps",
    "admin",
    "src",
    "app",
  );

  if (!existsSync(appRoot)) {
    throw new Error(
      `Admin App Router directory was not found: ${appRoot}`,
    );
  }

  const scanResult =
    scanRepository(
      projectRoot,
      appRoot,
    );

  printHeader(
    options.write === true,
  );

  console.log(
    `Inspected ${scanResult.inspectedFileCount} route file${
      scanResult.inspectedFileCount === 1
        ? ""
        : "s"
    }.`,
  );

  console.log("");

  if (
    scanResult.actions.length === 0 &&
    scanResult.manualProblems.length === 0
  ) {
    console.log(
      "✓ No repairable route problems detected.",
    );

    console.log("");
    console.log(
      "Repository routes are healthy.",
    );

    return;
  }

  if (
    scanResult.actions.length > 0
  ) {
    printRepairActions(
      scanResult.actions,
      options.write === true,
    );
  } else {
    console.log(
      "✓ No automatic repairs are required.",
    );
  }

  if (
    scanResult.manualProblems.length > 0
  ) {
    console.log("");
    printManualProblems(
      scanResult.manualProblems,
    );
  }

  console.log("");

  if (options.write !== true) {
    if (
      scanResult.actions.length > 0
    ) {
      console.log(
        "Dry run complete. No files were changed.",
      );

      console.log("");
      console.log(
        "Apply the safe repairs with:",
      );

      console.log("");
      console.log(
        "npm run dev -- repair --write",
      );
    } else {
      console.log(
        "Dry run complete. No automatic changes are available.",
      );
    }

    if (
      scanResult.manualProblems.length > 0
    ) {
      process.exitCode = 1;
    }

    return;
  }

  applyRepairActions(
    scanResult.actions,
  );

  console.log(
    `${scanResult.actions.length} safe repair${
      scanResult.actions.length === 1
        ? ""
        : "s"
    } applied.`,
  );

  if (
    scanResult.manualProblems.length > 0
  ) {
    console.log("");
    console.log(
      "Some files still require manual review.",
    );

    process.exitCode = 1;

    return;
  }

  console.log("");
  console.log(
    "All detected route problems were repaired.",
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

function scanRepository(
  projectRoot: string,
  appRoot: string,
): RepairScanResult {
  const routeFiles =
    collectRouteFiles(appRoot);

  const actions: RepairAction[] =
    [];

  const manualProblems:
    ManualProblem[] = [];

  for (
    const filePath
    of routeFiles
  ) {
    const relativePath =
      normalizeRelativePath(
        projectRoot,
        filePath,
      );

    const fileName =
      basename(filePath);

    const content =
      readFileSync(
        filePath,
        "utf8",
      );

    const trimmedContent =
      content.trim();

    if (!trimmedContent) {
      actions.push({
        kind: "replace-empty",
        filePath,
        relativePath,
        content:
          createEmptyFileReplacement(
            filePath,
            fileName,
          ),
        description:
          `Replace empty ${fileName}`,
      });

      continue;
    }

    if (
      fileName === "error.tsx" &&
      !hasUseClientDirective(
        content,
      )
    ) {
      actions.push({
        kind: "add-use-client",
        filePath,
        relativePath,
        content:
          addUseClientDirective(
            content,
          ),
        description:
          'Add missing "use client" directive',
      });
    }

    if (
      !hasDefaultExport(
        content,
      )
    ) {
      manualProblems.push({
        filePath,
        relativePath,
        description:
          "Non-empty route file is missing a default export.",
      });
    }
  }

  return {
    actions:
      deduplicateRepairActions(
        actions,
      ),
    manualProblems,
    inspectedFileCount:
      routeFiles.length,
  };
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

    if (entry.isDirectory()) {
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

function createEmptyFileReplacement(
  filePath: string,
  fileName: string,
): string {
  const routeName =
    createRouteName(filePath);

  const componentName =
    toPascalCase(routeName);

  switch (fileName) {
    case "page.tsx":
      return createPageCode(
        componentName,
        routeName,
      );

    case "layout.tsx":
      return createLayoutCode(
        componentName,
      );

    case "loading.tsx":
      return createLoadingCode(
        componentName,
      );

    case "error.tsx":
      return createErrorCode(
        componentName,
      );

    default:
      throw new Error(
        `Unsupported route file: ${fileName}`,
      );
  }
}

function createRouteName(
  filePath: string,
): string {
  const routeDirectory =
    dirname(filePath);

  const segment =
    basename(routeDirectory);

  const normalizedSegment =
    segment
      .replace(
        /^\((.*)\)$/,
        "$1",
      )
      .replace(
        /^\[(?:\.\.\.)?(.*)\]$/,
        "$1",
      )
      .replace(
        /^\[\[(?:\.\.\.)?(.*)\]\]$/,
        "$1",
      )
      .trim();

  return (
    normalizedSegment ||
    "ANW"
  );
}

function toPascalCase(
  value: string,
): string {
  const normalized =
    value
      .replace(
        /([a-z0-9])([A-Z])/g,
        "$1 $2",
      )
      .split(
        /[^A-Za-z0-9]+/,
      )
      .filter(Boolean)
      .map((part) => {
        return (
          part
            .charAt(0)
            .toUpperCase() +
          part
            .slice(1)
            .toLowerCase()
        );
      })
      .join("");

  return normalized || "ANW";
}

function createPageCode(
  componentName: string,
  routeName: string,
): string {
  return `export default function ${componentName}Page() {
  return (
    <main className="min-h-screen bg-[#f6f2e8] px-8 py-10 text-slate-900">
      <section className="mx-auto max-w-5xl rounded-3xl border border-emerald-950/10 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b52]">
          ANW AI-COS
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          ${formatDisplayName(routeName)}
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          This route was safely restored by the ANW CLI Repair command.
          Replace this placeholder with the intended page content.
        </p>
      </section>
    </main>
  );
}
`;
}

function createLayoutCode(
  componentName: string,
): string {
  return `import type {
  ReactNode,
} from "react";

type ${componentName}LayoutProps = {
  children: ReactNode;
};

export default function ${componentName}Layout({
  children,
}: ${componentName}LayoutProps) {
  return children;
}
`;
}

function createLoadingCode(
  componentName: string,
): string {
  return `export default function ${componentName}Loading() {
  return (
    <main className="min-h-screen bg-[#f6f2e8] px-8 py-10">
      <section className="mx-auto max-w-5xl animate-pulse rounded-3xl border border-emerald-950/10 bg-white p-8 shadow-sm">
        <div className="h-4 w-32 rounded bg-emerald-200" />

        <div className="mt-6 h-9 w-64 rounded bg-slate-200" />

        <div className="mt-6 space-y-3">
          <div className="h-4 rounded bg-slate-200" />
          <div className="h-4 rounded bg-slate-200" />
          <div className="h-4 w-3/4 rounded bg-slate-200" />
        </div>
      </section>
    </main>
  );
}
`;
}

function createErrorCode(
  componentName: string,
): string {
  return `"use client";

import {
  useEffect,
} from "react";

type ${componentName}ErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ${componentName}Error({
  error,
  reset,
}: ${componentName}ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#f6f2e8] px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
          ANW Route Error
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          Something went wrong
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-600">
          {error.message}
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-7 rounded-xl bg-[#0b4d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176b52]"
        >
          Try Again
        </button>
      </section>
    </main>
  );
}
`;
}

function formatDisplayName(
  value: string,
): string {
  return value
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1 $2",
    )
    .replace(
      /[-_]+/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
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
  const withoutLeadingComments =
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
    withoutLeadingComments.startsWith(
      '"use client";',
    ) ||
    withoutLeadingComments.startsWith(
      "'use client';",
    ) ||
    withoutLeadingComments.startsWith(
      '"use client"',
    ) ||
    withoutLeadingComments.startsWith(
      "'use client'",
    )
  );
}

function addUseClientDirective(
  content: string,
): string {
  const normalizedContent =
    content.replace(
      /^\uFEFF/,
      "",
    );

  return `"use client";

${normalizedContent.trimStart()}`;
}

function deduplicateRepairActions(
  actions: RepairAction[],
): RepairAction[] {
  const actionMap =
    new Map<
      string,
      RepairAction
    >();

  for (const action of actions) {
    const existingAction =
      actionMap.get(
        action.filePath,
      );

    if (
      !existingAction ||
      action.kind ===
        "replace-empty"
    ) {
      actionMap.set(
        action.filePath,
        action,
      );
    }
  }

  return Array.from(
    actionMap.values(),
  ).sort((left, right) => {
    return left.relativePath.localeCompare(
      right.relativePath,
    );
  });
}

function applyRepairActions(
  actions: RepairAction[],
): void {
  for (const action of actions) {
    writeFileSync(
      action.filePath,
      action.content,
      {
        encoding: "utf8",
      },
    );
  }
}

function printHeader(
  writeMode: boolean,
): void {
  console.log("");
  console.log(
    "ANW AI-COS Route Repair",
  );

  console.log(
    "=======================",
  );

  console.log("");

  console.log(
    writeMode
      ? "Mode: WRITE"
      : "Mode: DRY RUN",
  );

  console.log("");
}

function printRepairActions(
  actions: RepairAction[],
  writeMode: boolean,
): void {
  const verb =
    writeMode
      ? "Applying"
      : "Proposed";

  console.log(
    `${verb} safe repair${
      actions.length === 1
        ? ""
        : "s"
    }:`,
  );

  console.log("");

  for (const action of actions) {
    console.log(
      `${
        writeMode
          ? "✓"
          : "-"
      } ${action.relativePath}`,
    );

    console.log(
      `  ${action.description}`,
    );
  }
}

function printManualProblems(
  problems: ManualProblem[],
): void {
  console.log(
    "Manual review required:",
  );

  console.log("");

  for (const problem of problems) {
    console.log(
      `! ${problem.relativePath}`,
    );

    console.log(
      `  ${problem.description}`,
    );
  }

  console.log("");
  console.log(
    "These non-empty files were not overwritten.",
  );
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