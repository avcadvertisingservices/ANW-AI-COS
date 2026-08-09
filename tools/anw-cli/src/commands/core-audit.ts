import {
  existsSync,
  readdirSync,
} from "node:fs";

import {
  dirname,
  join,
  resolve,
} from "node:path";

import {
  cliVersion,
} from "../version.js";

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

type FoundationMilestone = {
  version: string;
  name: string;
  status: "COMPLETE";
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

const FOUNDATION_MILESTONES: FoundationMilestone[] = [
  {
    version: "v0.43",
    name: "Content System Status",
    status: "COMPLETE",
  },
  {
    version: "v0.44",
    name: "Content Model / Taxonomy",
    status: "COMPLETE",
  },
  {
    version: "v0.45",
    name: "Recovery Library Registry",
    status: "COMPLETE",
  },
  {
    version: "v0.46",
    name: "Content Workflow",
    status: "COMPLETE",
  },
  {
    version: "v0.47",
    name: "Brand + Safety Rules",
    status: "COMPLETE",
  },
  {
    version: "v0.48",
    name: "Website Integration Contract",
    status: "COMPLETE",
  },
  {
    version: "v0.49",
    name: "Core Audit + Documentation Map",
    status: "COMPLETE",
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

  const results =
    collectCoreAuditResults(
      cliRoot,
      repositoryRoot,
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

  printAuditResults(
    results,
  );

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

export function runFoundation(): void {
  const cliRoot =
    resolveCliRoot(
      process.cwd(),
    );

  const repositoryRoot =
    resolveRepositoryRoot(
      cliRoot,
    );

  const results =
    collectCoreAuditResults(
      cliRoot,
      repositoryRoot,
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

  const isFoundationRelease =
    cliVersion ===
    "0.50.0";

  console.log("");

  console.log(
    "# ANW AI-COS Core Foundation v1",
  );

  console.log("");

  console.log(
    "Foundation milestone: v0.50.0",
  );

  console.log(
    `Current CLI version: ${cliVersion}`,
  );

  console.log(
    "Mode: READ ONLY",
  );

  console.log("");

  console.log(
    "## Foundation Milestones",
  );

  console.log("");

  FOUNDATION_MILESTONES.forEach(
    (
      milestone,
      index,
    ) => {
      console.log(
        `${index + 1}. ${milestone.version} ${milestone.name}`,
      );

      console.log(
        `   Status: ${milestone.status}`,
      );

      console.log("");
    },
  );

  console.log(
    "8. v0.50 ANW AI-COS Core Foundation v1",
  );

  console.log(
    `   Status: ${
      isFoundationRelease
        ? "FROZEN"
        : "RELEASE CANDIDATE"
    }`,
  );

  console.log("");

  console.log(
    "## Foundation Capabilities",
  );

  console.log("");

  console.log(
    "✓ Project health and architecture inspection",
  );

  console.log(
    "✓ Project reports and JSON reporting",
  );

  console.log(
    "✓ Project snapshots and history",
  );

  console.log(
    "✓ Project comparison and latest-snapshot comparison",
  );

  console.log(
    "✓ Controlled release workflow",
  );

  console.log(
    "✓ Automated release certification",
  );

  console.log(
    "✓ Content system status",
  );

  console.log(
    "✓ Canonical content taxonomy",
  );

  console.log(
    "✓ Recovery Library registry",
  );

  console.log(
    "✓ Human-approved content workflow",
  );

  console.log(
    "✓ Brand and safety rules",
  );

  console.log(
    "✓ Website integration contract",
  );

  console.log(
    "✓ Core audit and documentation map",
  );

  console.log("");

  console.log(
    "## Foundation Health",
  );

  console.log("");

  printAuditResults(
    results,
  );

  console.log(
    "## Freeze Policy",
  );

  console.log("");

  console.log(
    "1. The Core Foundation v1 architecture is considered stable after v0.50.0 release certification.",
  );

  console.log(
    "2. New CLI features are not added merely because they are convenient or interesting.",
  );

  console.log(
    "3. Core changes after the freeze require a clear website, reliability, safety, or integration need.",
  );

  console.log(
    "4. Existing release, validation, content, project, and safety contracts should remain backward compatible where practical.",
  );

  console.log(
    "5. Product development now moves from foundation-building to user-facing website implementation.",
  );

  console.log("");

  console.log(
    "## Foundation Summary",
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
      `Foundation status: ${
        isFoundationRelease
          ? "FROZEN"
          : "READY FOR v0.50.0 RELEASE"
      }`,
    );
  } else {
    console.log(
      "Foundation status: ATTENTION REQUIRED",
    );
  }

  console.log("");

  console.log(
    "Next phase: ANW Website Phase 1",
  );

  console.log("");

  console.log(
    "Website focus:",
  );

  console.log(
    "- Public website foundation",
  );

  console.log(
    "- Journey-based navigation",
  );

  console.log(
    "- Recovery Library",
  );

  console.log(
    "- Core patient education pages",
  );

  console.log(
    "- Starter Guide funnel",
  );

  console.log(
    "- Survivor story and trust experience",
  );

  console.log("");

  console.log(
    "Foundation inspection complete.",
  );

  console.log(
    "No files were changed.",
  );

  console.log("");
}

function collectCoreAuditResults(
  cliRoot: string,
  repositoryRoot: string,
): AuditResult[] {
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
      "Core audit system",
      "src/commands/core-audit.ts",
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

  return results;
}

function printAuditResults(
  results: AuditResult[],
): void {
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