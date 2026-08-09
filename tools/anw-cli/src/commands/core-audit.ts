import {
  existsSync,
  readdirSync,
} from "node:fs";

import {
  dirname,
  join,
  resolve,
} from "node:path";

type AuditResult = {
  name: string;
  status: "PASS" | "ATTENTION";
  detail: string;
};

type CoreFoundationArea = {
  name: string;
  milestone: string;
  command: string;
  sourceFile: string;
};

const CORE_FOUNDATION_AREAS: CoreFoundationArea[] = [
  {
    name: "Content System Status",
    milestone: "v0.43",
    command:
      "npm run dev -- content --status",
    sourceFile:
      "src/commands/content.ts",
  },
  {
    name: "Content Taxonomy",
    milestone: "v0.44",
    command:
      "npm run dev -- content --taxonomy",
    sourceFile:
      "src/commands/content.ts",
  },
  {
    name: "Recovery Library Registry",
    milestone: "v0.45",
    command:
      "npm run dev -- content --recovery-library",
    sourceFile:
      "src/commands/content.ts",
  },
  {
    name: "Content Workflow",
    milestone: "v0.46",
    command:
      "npm run dev -- content --workflow",
    sourceFile:
      "src/commands/content.ts",
  },
  {
    name: "Brand + Safety Rules",
    milestone: "v0.47",
    command:
      "npm run dev -- content --brand-rules",
    sourceFile:
      "src/commands/content.ts",
  },
  {
    name: "Website Integration Contract",
    milestone: "v0.48",
    command:
      "npm run dev -- content --website-contract",
    sourceFile:
      "src/commands/content.ts",
  },
];

export function runCoreAudit(): void {
  const cliRoot =
    resolveCliRoot(
      process.cwd(),
    );

  const repositoryRoot =
    resolveRepositoryRoot(
      cliRoot,
    );

  const results: AuditResult[] = [];

  results.push(
    inspectFile(
      cliRoot,
      "CLI entry point",
      "src/cli.ts",
    ),
  );

  results.push(
    inspectFile(
      cliRoot,
      "Content system",
      "src/commands/content.ts",
    ),
  );

  results.push(
    inspectFile(
      cliRoot,
      "Project inspection system",
      "src/commands/project.ts",
    ),
  );

  results.push(
    inspectFile(
      cliRoot,
      "Release system",
      "src/commands/release.ts",
    ),
  );

  results.push(
    inspectFile(
      cliRoot,
      "Validation system",
      "src/commands/validate.ts",
    ),
  );

  results.push(
    inspectDirectory(
      repositoryRoot,
      "Documentation directory",
      "docs",
    ),
  );

  results.push(
    inspectDirectory(
      repositoryRoot,
      "Snapshot storage",
      "docs/snapshots",
    ),
  );

  const passed =
    results.filter(
      (result) =>
        result.status ===
        "PASS",
    ).length;

  const attention =
    results.length -
    passed;

  console.log("");

  console.log(
    "# ANW AI-COS Core Audit",
  );

  console.log("");

  console.log(
    "Milestone: v0.49 Core Audit + Documentation",
  );

  console.log(
    "Mode: READ ONLY",
  );

  console.log("");

  console.log(
    "## Foundation",
  );

  console.log("");

  for (
    const area
    of CORE_FOUNDATION_AREAS
  ) {
    console.log(
      `✓ ${area.milestone} ${area.name}`,
    );

    console.log(
      `  Command: ${area.command}`,
    );

    console.log(
      `  Source: ${area.sourceFile}`,
    );

    console.log("");
  }

  console.log(
    "## Repository Audit",
  );

  console.log("");

  for (
    const result
    of results
  ) {
    const symbol =
      result.status ===
      "PASS"
        ? "✓"
        : "!";

    console.log(
      `${symbol} ${result.name}: ${result.status}`,
    );

    console.log(
      `  ${result.detail}`,
    );

    console.log("");
  }

  console.log(
    "## Documentation Map",
  );

  console.log("");

  console.log(
    "Content model:",
  );

  console.log(
    "  content --taxonomy",
  );

  console.log(
    "Recovery architecture:",
  );

  console.log(
    "  content --recovery-library",
  );

  console.log(
    "Publishing lifecycle:",
  );

  console.log(
    "  content --workflow",
  );

  console.log(
    "Brand and medical safety:",
  );

  console.log(
    "  content --brand-rules",
  );

  console.log(
    "Website data contract:",
  );

  console.log(
    "  content --website-contract",
  );

  console.log(
    "Project architecture:",
  );

  console.log(
    "  project --status / --inventory / --report",
  );

  console.log(
    "Project history:",
  );

  console.log(
    "  project --snapshot / --snapshot-history / --compare-latest",
  );

  console.log(
    "Release readiness:",
  );

  console.log(
    "  validate / release --check",
  );

  console.log("");

  console.log(
    "## Audit Summary",
  );

  console.log("");

  console.log(
    `Checks: ${results.length}`,
  );

  console.log(
    `Passed: ${passed}`,
  );

  console.log(
    `Attention: ${attention}`,
  );

  console.log("");

  if (
    attention === 0
  ) {
    console.log(
      "Core foundation status: READY FOR FOUNDATION FREEZE",
    );
  } else {
    console.log(
      "Core foundation status: ATTENTION REQUIRED",
    );
  }

  console.log("");

  console.log(
    "v0.50 target:",
  );

  console.log(
    "ANW AI-COS Core Foundation v1 / FOUNDATION FREEZE",
  );

  console.log("");

  console.log(
    "Core audit inspection complete.",
  );

  console.log(
    "No files were changed.",
  );

  console.log("");
}

function inspectFile(
  root: string,
  name: string,
  relativePath: string,
): AuditResult {
  const absolutePath =
    join(
      root,
      ...relativePath.split("/"),
    );

  if (
    existsSync(
      absolutePath,
    )
  ) {
    return {
      name,
      status: "PASS",
      detail:
        `${relativePath} exists.`,
    };
  }

  return {
    name,
    status: "ATTENTION",
    detail:
      `${relativePath} was not found.`,
  };
}

function inspectDirectory(
  root: string,
  name: string,
  relativePath: string,
): AuditResult {
  const absolutePath =
    join(
      root,
      ...relativePath.split("/"),
    );

  if (
    !existsSync(
      absolutePath,
    )
  ) {
    return {
      name,
      status: "ATTENTION",
      detail:
        `${relativePath} was not found.`,
    };
  }

  try {
    const items =
      readdirSync(
        absolutePath,
      );

    return {
      name,
      status: "PASS",
      detail:
        `${relativePath} exists (${items.length} item${items.length === 1 ? "" : "s"}).`,
    };
  } catch {
    return {
      name,
      status: "ATTENTION",
      detail:
        `${relativePath} exists but could not be inspected.`,
    };
  }
}

function resolveCliRoot(
  startDirectory: string,
): string {
  let current =
    resolve(
      startDirectory,
    );

  while (true) {
    const packagePath =
      join(
        current,
        "package.json",
      );

    const cliPath =
      join(
        current,
        "src",
        "cli.ts",
      );

    if (
      existsSync(
        packagePath,
      ) &&
      existsSync(
        cliPath,
      )
    ) {
      return current;
    }

    const parent =
      dirname(
        current,
      );

    if (
      parent ===
      current
    ) {
      throw new Error(
        "Unable to locate the ANW CLI root.",
      );
    }

    current =
      parent;
  }
}

function resolveRepositoryRoot(
  cliRoot: string,
): string {
  let current =
    cliRoot;

  while (true) {
    const gitDirectory =
      join(
        current,
        ".git",
      );

    if (
      existsSync(
        gitDirectory,
      )
    ) {
      return current;
    }

    const parent =
      dirname(
        current,
      );

    if (
      parent ===
      current
    ) {
      throw new Error(
        "Unable to locate the ANW AI-COS repository root.",
      );
    }

    current =
      parent;
  }
}