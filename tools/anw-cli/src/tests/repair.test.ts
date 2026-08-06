import assert from "node:assert/strict";

import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";

import {
  tmpdir,
} from "node:os";

import {
  join,
} from "node:path";

import {
  spawnSync,
} from "node:child_process";

import {
  test,
} from "node:test";

import {
  repairRepository,
} from "../commands/repair.js";

type CapturedConsole = {
  logs: string[];
  errors: string[];
};

test(
  "repair dry-run detects problems without changing files",
  {
    concurrency: false,
  },
  () => {
    const originalDirectory =
      process.cwd();

    const originalExitCode =
      process.exitCode;

    const fixtureRoot =
      createBrokenFixture();

    const manualReviewRoot = join(
      fixtureRoot,
      "apps",
      "admin",
      "src",
      "app",
      "manual-review",
    );

    /*
     * This test focuses only on automatic,
     * repairable problems.
     */
    rmSync(
      manualReviewRoot,
      {
        recursive: true,
        force: true,
      },
    );

    const emptyPagePath = join(
      fixtureRoot,
      "apps",
      "admin",
      "src",
      "app",
      "broken-page",
      "page.tsx",
    );

    const emptyLoadingPath = join(
      fixtureRoot,
      "apps",
      "admin",
      "src",
      "app",
      "broken-page",
      "loading.tsx",
    );

    const errorPath = join(
      fixtureRoot,
      "apps",
      "admin",
      "src",
      "app",
      "broken-page",
      "error.tsx",
    );

    const originalPage =
      readFileSync(
        emptyPagePath,
        "utf8",
      );

    const originalLoading =
      readFileSync(
        emptyLoadingPath,
        "utf8",
      );

    const originalError =
      readFileSync(
        errorPath,
        "utf8",
      );

    try {
      process.chdir(
        fixtureRoot,
      );

      process.exitCode = 0;

      const captured =
        captureConsole(() => {
          repairRepository();
        });

      const output = [
        ...captured.logs,
        ...captured.errors,
      ].join("\n");

      assert.match(
        output,
        /ANW AI-COS Route Repair/,
      );

      assert.match(
        output,
        /Mode: DRY RUN/,
      );

      assert.match(
        output,
        /Proposed safe repairs/,
      );

      assert.match(
        output,
        /Replace empty page\.tsx/,
      );

      assert.match(
        output,
        /Replace empty loading\.tsx/,
      );

      assert.match(
        output,
        /Add missing "use client" directive/,
      );

      assert.match(
        output,
        /Dry run complete\. No files were changed\./,
      );

      assert.equal(
        readFileSync(
          emptyPagePath,
          "utf8",
        ),
        originalPage,
      );

      assert.equal(
        readFileSync(
          emptyLoadingPath,
          "utf8",
        ),
        originalLoading,
      );

      assert.equal(
        readFileSync(
          errorPath,
          "utf8",
        ),
        originalError,
      );

      assert.equal(
        process.exitCode,
        0,
      );
    } finally {
      process.exitCode =
        originalExitCode;

      process.chdir(
        originalDirectory,
      );

      rmSync(
        fixtureRoot,
        {
          recursive: true,
          force: true,
        },
      );
    }
  },
);

test(
  "repair write mode safely repairs supported route problems",
  {
    concurrency: false,
  },
  () => {
    const originalDirectory =
      process.cwd();

    const originalExitCode =
      process.exitCode;

    const fixtureRoot =
      createBrokenFixture();

    const manualReviewRoot = join(
      fixtureRoot,
      "apps",
      "admin",
      "src",
      "app",
      "manual-review",
    );

    /*
     * Remove the manual-review fixture so
     * this test verifies a fully successful
     * automatic repair.
     */
    rmSync(
      manualReviewRoot,
      {
        recursive: true,
        force: true,
      },
    );

    const pagePath = join(
      fixtureRoot,
      "apps",
      "admin",
      "src",
      "app",
      "broken-page",
      "page.tsx",
    );

    const loadingPath = join(
      fixtureRoot,
      "apps",
      "admin",
      "src",
      "app",
      "broken-page",
      "loading.tsx",
    );

    const errorPath = join(
      fixtureRoot,
      "apps",
      "admin",
      "src",
      "app",
      "broken-page",
      "error.tsx",
    );

    const healthyPagePath = join(
      fixtureRoot,
      "apps",
      "admin",
      "src",
      "app",
      "healthy-page",
      "page.tsx",
    );

    const healthyPageBefore =
      readFileSync(
        healthyPagePath,
        "utf8",
      );

    try {
      process.chdir(
        fixtureRoot,
      );

      process.exitCode = 0;

      const captured =
        captureConsole(() => {
          repairRepository({
            write: true,
          });
        });

      const output = [
        ...captured.logs,
        ...captured.errors,
      ].join("\n");

      assert.match(
        output,
        /Mode: WRITE/,
      );

      assert.match(
        output,
        /3 safe repairs applied\./,
      );

      assert.match(
        output,
        /All detected route problems were repaired\./,
      );

      const repairedPage =
        readFileSync(
          pagePath,
          "utf8",
        );

      const repairedLoading =
        readFileSync(
          loadingPath,
          "utf8",
        );

      const repairedError =
        readFileSync(
          errorPath,
          "utf8",
        );

      assert.match(
        repairedPage,
        /export default function BrokenPagePage/,
      );

      assert.match(
        repairedPage,
        /safely restored by the ANW CLI Repair command/,
      );

      assert.match(
        repairedLoading,
        /export default function BrokenPageLoading/,
      );

      assert.match(
        repairedError,
        /^"use client";/,
      );

      assert.match(
        repairedError,
        /export default function BrokenError/,
      );

      assert.equal(
        readFileSync(
          healthyPagePath,
          "utf8",
        ),
        healthyPageBefore,
      );

      assert.equal(
        process.exitCode,
        0,
      );
    } finally {
      process.exitCode =
        originalExitCode;

      process.chdir(
        originalDirectory,
      );

      rmSync(
        fixtureRoot,
        {
          recursive: true,
          force: true,
        },
      );
    }
  },
);

test(
  "repair reports non-empty files missing a default export for manual review",
  {
    concurrency: false,
  },
  () => {
    const originalDirectory =
      process.cwd();

    const originalExitCode =
      process.exitCode;

    const fixtureRoot =
      createBrokenFixture();

    const brokenRouteRoot = join(
      fixtureRoot,
      "apps",
      "admin",
      "src",
      "app",
      "broken-page",
    );

    /*
     * Remove automatically repairable files
     * so this test focuses only on manual review.
     */
    rmSync(
      brokenRouteRoot,
      {
        recursive: true,
        force: true,
      },
    );

    const manualPagePath = join(
      fixtureRoot,
      "apps",
      "admin",
      "src",
      "app",
      "manual-review",
      "page.tsx",
    );

    const originalContent =
      readFileSync(
        manualPagePath,
        "utf8",
      );

    try {
      process.chdir(
        fixtureRoot,
      );

      process.exitCode = 0;

      const captured =
        captureConsole(() => {
          repairRepository({
            write: true,
          });
        });

      const output = [
        ...captured.logs,
        ...captured.errors,
      ].join("\n");

      assert.match(
        output,
        /Manual review required/,
      );

      assert.match(
        output,
        /Non-empty route file is missing a default export/,
      );

      assert.match(
        output,
        /These non-empty files were not overwritten/,
      );

      assert.match(
        output,
        /Some files still require manual review/,
      );

      assert.equal(
        readFileSync(
          manualPagePath,
          "utf8",
        ),
        originalContent,
      );

      assert.equal(
        process.exitCode,
        1,
      );
    } finally {
      process.exitCode =
        originalExitCode;

      process.chdir(
        originalDirectory,
      );

      rmSync(
        fixtureRoot,
        {
          recursive: true,
          force: true,
        },
      );
    }
  },
);

function createBrokenFixture(): string {
  const fixtureRoot =
    mkdtempSync(
      join(
        tmpdir(),
        "anw-repair-test-",
      ),
    );

  const appRoot = join(
    fixtureRoot,
    "apps",
    "admin",
    "src",
    "app",
  );

  const brokenRouteRoot = join(
    appRoot,
    "broken-page",
  );

  const healthyRouteRoot = join(
    appRoot,
    "healthy-page",
  );

  const manualRouteRoot = join(
    appRoot,
    "manual-review",
  );

  mkdirSync(
    brokenRouteRoot,
    {
      recursive: true,
    },
  );

  mkdirSync(
    healthyRouteRoot,
    {
      recursive: true,
    },
  );

  mkdirSync(
    manualRouteRoot,
    {
      recursive: true,
    },
  );

  mkdirSync(
    join(
      fixtureRoot,
      "tools",
      "anw-cli",
    ),
    {
      recursive: true,
    },
  );

  writeFileSync(
    join(
      fixtureRoot,
      "tools",
      "anw-cli",
      "package.json",
    ),
    JSON.stringify(
      {
        name:
          "@anw/anw-cli-repair-test",
        private: true,
      },
      null,
      2,
    ),
    "utf8",
  );

  writeFileSync(
    join(
      brokenRouteRoot,
      "page.tsx",
    ),
    "",
    "utf8",
  );

  writeFileSync(
    join(
      brokenRouteRoot,
      "loading.tsx",
    ),
    "   \n",
    "utf8",
  );

  writeFileSync(
    join(
      brokenRouteRoot,
      "error.tsx",
    ),
    `export default function BrokenError() {
  return <main>Error</main>;
}
`,
    "utf8",
  );

  writeFileSync(
    join(
      healthyRouteRoot,
      "page.tsx",
    ),
    `export default function HealthyPage() {
  return <main>Healthy route</main>;
}
`,
    "utf8",
  );

  writeFileSync(
    join(
      manualRouteRoot,
      "page.tsx",
    ),
    `export function ManualReviewPage() {
  return <main>Manual review</main>;
}
`,
    "utf8",
  );

  initializeGitRepository(
    fixtureRoot,
  );

  return fixtureRoot;
}

function initializeGitRepository(
  fixtureRoot: string,
): void {
  runGit(
    fixtureRoot,
    [
      "init",
    ],
  );

  runGit(
    fixtureRoot,
    [
      "config",
      "user.name",
      "ANW Repair Tests",
    ],
  );

  runGit(
    fixtureRoot,
    [
      "config",
      "user.email",
      "anw-repair-tests@example.com",
    ],
  );

  runGit(
    fixtureRoot,
    [
      "add",
      ".",
    ],
  );

  runGit(
    fixtureRoot,
    [
      "commit",
      "-m",
      "repair test fixture",
    ],
  );
}

function runGit(
  cwd: string,
  argumentsList: string[],
): void {
  const gitCommand =
    process.platform === "win32"
      ? "git.exe"
      : "git";

  const result = spawnSync(
    gitCommand,
    argumentsList,
    {
      cwd,
      encoding: "utf8",
      shell: false,
    },
  );

  if (
    result.error ||
    result.status !== 0
  ) {
    throw new Error(
      result.error?.message ||
        result.stderr ||
        "Git fixture command failed.",
    );
  }
}

function captureConsole(
  action: () => void,
): CapturedConsole {
  const logs: string[] = [];
  const errors: string[] = [];

  const originalLog =
    console.log;

  const originalError =
    console.error;

  console.log = (
    ...values: unknown[]
  ) => {
    logs.push(
      values
        .map(String)
        .join(" "),
    );
  };

  console.error = (
    ...values: unknown[]
  ) => {
    errors.push(
      values
        .map(String)
        .join(" "),
    );
  };

  try {
    action();
  } finally {
    console.log =
      originalLog;

    console.error =
      originalError;
  }

  return {
    logs,
    errors,
  };
}