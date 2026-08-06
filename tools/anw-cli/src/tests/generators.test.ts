import assert from "node:assert/strict";

import {
  existsSync,
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
  createComponent,
} from "../commands/component.js";

import {
  runDoctor,
} from "../commands/doctor.js";

import {
  createFeature,
} from "../commands/feature.js";

import {
  createModule,
} from "../commands/module.js";

import {
  createPage,
} from "../commands/page.js";

type CapturedConsole = {
  logs: string[];
  errors: string[];
};

test(
  "ANW generators create protected, build-ready files",
  {
    concurrency: false,
  },
  () => {
    const originalDirectory =
      process.cwd();

    const fixtureRoot =
      createFixtureProject();

    try {
      process.chdir(fixtureRoot);

      silenceConsole(() => {
        createComponent(
          "Evidence Test Card",
        );
      });

      const componentPath = join(
        fixtureRoot,
        "apps",
        "admin",
        "src",
        "components",
        "EvidenceTestCard.tsx",
      );

      assert.equal(
        existsSync(componentPath),
        true,
      );

      assert.match(
        readFileSync(
          componentPath,
          "utf8",
        ),
        /export default function EvidenceTestCard/,
      );

      assert.throws(
        () => {
          silenceConsole(() => {
            createComponent(
              "Evidence Test Card",
            );
          });
        },
        /Component already exists/,
      );

      silenceConsole(() => {
        createModule(
          "patient journey",
        );
      });

      const moduleRoot = join(
        fixtureRoot,
        "src",
        "modules",
        "patient-journey",
      );

      assert.equal(
        existsSync(
          join(
            moduleRoot,
            "README.md",
          ),
        ),
        true,
      );

      assert.equal(
        existsSync(
          join(
            moduleRoot,
            "service.ts",
          ),
        ),
        true,
      );

      assert.equal(
        existsSync(
          join(
            moduleRoot,
            "repository.ts",
          ),
        ),
        true,
      );

      assert.throws(
        () => {
          silenceConsole(() => {
            createModule(
              "patient journey",
            );
          });
        },
        /Module already exists/,
      );

      silenceConsole(() => {
        createPage(
          "evidence-test-dashboard",
        );
      });

      const pageRoot = join(
        fixtureRoot,
        "apps",
        "admin",
        "src",
        "app",
        "evidence-test-dashboard",
      );

      assert.equal(
        existsSync(
          join(
            pageRoot,
            "page.tsx",
          ),
        ),
        true,
      );

      assert.equal(
        existsSync(
          join(
            pageRoot,
            "loading.tsx",
          ),
        ),
        true,
      );

      assert.equal(
        existsSync(
          join(
            pageRoot,
            "error.tsx",
          ),
        ),
        true,
      );

      const pageErrorCode =
        readFileSync(
          join(
            pageRoot,
            "error.tsx",
          ),
          "utf8",
        );

      assert.match(
        pageErrorCode,
        /^"use client";/,
      );

      assert.throws(
        () => {
          silenceConsole(() => {
            createPage(
              "evidence-test-dashboard",
            );
          });
        },
        /Page already exists/,
      );

      silenceConsole(() => {
        createFeature(
          "recovery-test-tracker",
        );
      });

      const featureRouteRoot = join(
        fixtureRoot,
        "apps",
        "admin",
        "src",
        "app",
        "recovery-test-tracker",
      );

      const featureModuleRoot = join(
        fixtureRoot,
        "src",
        "modules",
        "recovery-test-tracker",
      );

      const featureComponentRoot =
        join(
          fixtureRoot,
          "apps",
          "admin",
          "src",
          "components",
          "RecoveryTestTracker",
        );

      assert.equal(
        existsSync(
          join(
            featureRouteRoot,
            "page.tsx",
          ),
        ),
        true,
      );

      assert.equal(
        existsSync(
          join(
            featureRouteRoot,
            "error.tsx",
          ),
        ),
        true,
      );

      assert.equal(
        existsSync(
          join(
            featureModuleRoot,
            "factory.ts",
          ),
        ),
        true,
      );

      assert.equal(
        existsSync(
          join(
            featureComponentRoot,
            "RecoveryTestTrackerHeader.tsx",
          ),
        ),
        true,
      );

      assert.throws(
        () => {
          silenceConsole(() => {
            createFeature(
              "recovery-test-tracker",
            );
          });
        },
        /Feature route already exists|Feature module already exists/,
      );
    } finally {
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
  "ANW Doctor approves a clean repository fixture",
  {
    concurrency: false,
  },
  () => {
    const originalDirectory =
      process.cwd();

    const fixtureRoot =
      createFixtureProject();

    try {
      createDoctorRouteFiles(
        fixtureRoot,
      );

      initializeGitRepository(
        fixtureRoot,
      );

      process.chdir(fixtureRoot);

      process.exitCode = 0;

      const captured =
        captureConsole(() => {
          runDoctor();
        });

      const output = [
        ...captured.logs,
        ...captured.errors,
      ].join("\n");

      assert.match(
        output,
        /ANW AI-COS Doctor/,
      );

      assert.match(
        output,
        /Empty App Router files/,
      );

      assert.match(
        output,
        /App Router default exports/,
      );

      assert.match(
        output,
        /Client error boundaries/,
      );

      assert.match(
        output,
        /Working tree clean/,
      );

      assert.match(
        output,
        /No critical problems detected/,
      );

      assert.equal(
        process.exitCode,
        0,
      );
    } finally {
      process.exitCode = 0;

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

function createFixtureProject(): string {
  const fixtureRoot =
    mkdtempSync(
      join(
        tmpdir(),
        "anw-cli-test-",
      ),
    );

  mkdirSync(
    join(
      fixtureRoot,
      "apps",
      "admin",
      "src",
      "app",
    ),
    {
      recursive: true,
    },
  );

  mkdirSync(
    join(
      fixtureRoot,
      "apps",
      "admin",
      "src",
      "components",
    ),
    {
      recursive: true,
    },
  );

  mkdirSync(
    join(
      fixtureRoot,
      "src",
      "modules",
    ),
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
        name: "@anw/anw-cli-test",
        private: true,
      },
      null,
      2,
    ),
    "utf8",
  );

  writeFileSync(
    join(
      fixtureRoot,
      "tools",
      "anw-cli",
      "tsconfig.json",
    ),
    JSON.stringify(
      {
        compilerOptions: {
          strict: true,
        },
      },
      null,
      2,
    ),
    "utf8",
  );

  return fixtureRoot;
}

function createDoctorRouteFiles(
  fixtureRoot: string,
): void {
  const appRoot = join(
    fixtureRoot,
    "apps",
    "admin",
    "src",
    "app",
  );

  writeFileSync(
    join(
      appRoot,
      "page.tsx",
    ),
    `export default function HomePage() {
  return <main>ANW</main>;
}
`,
    "utf8",
  );

  writeFileSync(
    join(
      appRoot,
      "loading.tsx",
    ),
    `export default function Loading() {
  return <main>Loading</main>;
}
`,
    "utf8",
  );

  writeFileSync(
    join(
      appRoot,
      "error.tsx",
    ),
    `"use client";

export default function ErrorPage() {
  return <main>Error</main>;
}
`,
    "utf8",
  );
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
      "ANW CLI Tests",
    ],
  );

  runGit(
    fixtureRoot,
    [
      "config",
      "user.email",
      "anw-cli-tests@example.com",
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
      "test fixture",
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
        "Git test command failed.",
    );
  }
}

function silenceConsole(
  action: () => void,
): void {
  captureConsole(action);
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