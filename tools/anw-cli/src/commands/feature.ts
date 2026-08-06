import {
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";

import {
  join,
  resolve,
} from "node:path";

export type CreateFeatureOptions = {
  force?: boolean;
};

export function createFeature(
  rawName: string,
  options: CreateFeatureOptions = {},
): void {
  const featureName =
    toKebabCase(rawName);

  if (!featureName) {
    throw new Error(
      "A valid feature name is required.",
    );
  }

  const projectRoot =
    findProjectRoot(process.cwd());

  const pascalName =
    toPascalCase(featureName);

  const routeRoot = join(
    projectRoot,
    "apps",
    "admin",
    "src",
    "app",
    featureName,
  );

  const componentRoot = join(
    projectRoot,
    "apps",
    "admin",
    "src",
    "components",
    pascalName,
  );

  const moduleRoot = join(
    projectRoot,
    "src",
    "modules",
    featureName,
  );

  const blueprintRoot = join(
    projectRoot,
    "blueprint",
    "06_Modules",
    pascalName,
  );

  const pagePath = join(
    routeRoot,
    "page.tsx",
  );

  const moduleReadmePath = join(
    moduleRoot,
    "README.md",
  );

  if (options.force !== true) {
    if (existsSync(pagePath)) {
      throw new Error(
        `Feature route already exists: ${pagePath}`,
      );
    }

    if (
      existsSync(moduleReadmePath)
    ) {
      throw new Error(
        `Feature module already exists: ${moduleReadmePath}`,
      );
    }
  }

  createDirectory(routeRoot);
  createDirectory(componentRoot);
  createDirectory(moduleRoot);

  createDirectory(
    join(moduleRoot, "docs"),
  );

  createDirectory(
    join(moduleRoot, "tests"),
  );

  createDirectory(blueprintRoot);

  const generatedFiles: Array<{
    path: string;
    content: string;
  }> = [
    {
      path: join(
        routeRoot,
        "page.tsx",
      ),
      content: createPageCode(
        pascalName,
        featureName,
      ),
    },
    {
      path: join(
        routeRoot,
        "loading.tsx",
      ),
      content:
        createLoadingCode(
          pascalName,
        ),
    },
    {
      path: join(
        routeRoot,
        "error.tsx",
      ),
      content:
        createErrorCode(
          pascalName,
        ),
    },
    {
      path: join(
        routeRoot,
        "actions.ts",
      ),
      content:
        createActionsCode(
          pascalName,
          featureName,
        ),
    },
    {
      path: join(
        componentRoot,
        `${pascalName}Header.tsx`,
      ),
      content:
        createHeaderCode(
          pascalName,
        ),
    },
    {
      path: join(
        componentRoot,
        `${pascalName}EmptyState.tsx`,
      ),
      content:
        createEmptyStateCode(
          pascalName,
        ),
    },
    {
      path: join(
        moduleRoot,
        "README.md",
      ),
      content:
        createModuleReadme(
          pascalName,
          featureName,
        ),
    },
    {
      path: join(
        moduleRoot,
        "types.ts",
      ),
      content:
        createTypesCode(
          pascalName,
        ),
    },
    {
      path: join(
        moduleRoot,
        "repository.ts",
      ),
      content:
        createRepositoryCode(
          pascalName,
        ),
    },
    {
      path: join(
        moduleRoot,
        "service.ts",
      ),
      content:
        createServiceCode(
          pascalName,
        ),
    },
    {
      path: join(
        moduleRoot,
        "validation.ts",
      ),
      content:
        createValidationCode(
          pascalName,
        ),
    },
    {
      path: join(
        moduleRoot,
        "errors.ts",
      ),
      content:
        createErrorsCode(
          pascalName,
        ),
    },
    {
      path: join(
        moduleRoot,
        "factory.ts",
      ),
      content:
        createFactoryCode(
          pascalName,
        ),
    },
    {
      path: join(
        moduleRoot,
        "index.ts",
      ),
      content:
        createIndexCode(),
    },
    {
      path: join(
        moduleRoot,
        "docs",
        "README.md",
      ),
      content:
        createDocumentationReadme(
          pascalName,
        ),
    },
    {
      path: join(
        moduleRoot,
        "tests",
        "README.md",
      ),
      content:
        createTestsReadme(
          pascalName,
        ),
    },
    {
      path: join(
        blueprintRoot,
        "README.md",
      ),
      content:
        createBlueprintReadme(
          pascalName,
          featureName,
        ),
    },
  ];

  for (
    const generatedFile
    of generatedFiles
  ) {
    writeGeneratedFile(
      generatedFile.path,
      generatedFile.content,
      options.force === true,
    );
  }

  console.log("");
  console.log(
    "ANW feature created successfully.",
  );
  console.log("");
  console.log(
    `Feature: ${pascalName}`,
  );
  console.log(
    `Route: /${featureName}`,
  );
  console.log(
    `Module: src/modules/${featureName}`,
  );
  console.log(
    `Components: apps/admin/src/components/${pascalName}`,
  );
  console.log(
    `Blueprint: blueprint/06_Modules/${pascalName}`,
  );
  console.log("");
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

    const modulesPath = join(
      currentDirectory,
      "src",
      "modules",
    );

    const cliPath = join(
      currentDirectory,
      "tools",
      "anw-cli",
    );

    if (
      existsSync(adminPath) &&
      existsSync(modulesPath) &&
      existsSync(cliPath)
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

function createDirectory(
  directoryPath: string,
): void {
  mkdirSync(directoryPath, {
    recursive: true,
  });
}

function writeGeneratedFile(
  filePath: string,
  content: string,
  force: boolean,
): void {
  if (
    existsSync(filePath) &&
    !force
  ) {
    return;
  }

  writeFileSync(
    filePath,
    content,
    {
      encoding: "utf8",
    },
  );
}

function toKebabCase(
  value: string,
): string {
  return value
    .trim()
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1-$2",
    )
    .replace(
      /[^A-Za-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )
    .toLowerCase();
}

function toPascalCase(
  value: string,
): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => {
      return (
        part
          .charAt(0)
          .toUpperCase() +
        part.slice(1)
      );
    })
    .join("");
}

function createPageCode(
  pascalName: string,
  featureName: string,
): string {
  return `import Link from "next/link";

import AdminSidebar from "../../components/AdminSidebar";

import ${pascalName}EmptyState from "../../components/${pascalName}/${pascalName}EmptyState";
import ${pascalName}Header from "../../components/${pascalName}/${pascalName}Header";

export const dynamic = "force-dynamic";

export default function ${pascalName}Page() {
  return (
    <main className="min-h-screen bg-[#f6f2e8] text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <section className="min-w-0 flex-1">
          <header className="border-b border-emerald-950/10 bg-white/80 px-6 py-5 lg:px-10">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#176b52]">
                  ANW AI Content Operating System
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  ${pascalName}
                </h1>
              </div>

              <Link
                href="/"
                className="rounded-xl border border-emerald-900/15 bg-white px-4 py-2 text-sm font-semibold text-[#0b4d3b] shadow-sm transition hover:bg-emerald-50"
              >
                Dashboard
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
            <${pascalName}Header />

            <div className="mt-7">
              <${pascalName}EmptyState />
            </div>

            <p className="mt-6 text-xs text-slate-500">
              Route: /${featureName}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
`;
}

function createLoadingCode(
  pascalName: string,
): string {
  return `export default function ${pascalName}Loading() {
  return (
    <main className="min-h-screen bg-[#f6f2e8] p-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-40 rounded-3xl bg-emerald-900/10" />

        <div className="mt-7 h-64 rounded-3xl bg-white" />
      </div>
    </main>
  );
}
`;
}

function createErrorCode(
  pascalName: string,
): string {
  return `"use client";

import {
  useEffect,
} from "react";

type ${pascalName}ErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ${pascalName}Error({
  error,
  reset,
}: ${pascalName}ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#f6f2e8] p-8 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
          ${pascalName} Error
        </p>

        <h1 className="mt-2 text-2xl font-bold">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {error.message}
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-xl bg-[#0b4d3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176b52]"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
`;
}

function createActionsCode(
  pascalName: string,
  featureName: string,
): string {
  return `"use server";

import {
  revalidatePath,
} from "next/cache";

export async function refresh${pascalName}(): Promise<void> {
  revalidatePath("/${featureName}");
}
`;
}

function createHeaderCode(
  pascalName: string,
): string {
  return `export default function ${pascalName}Header() {
  return (
    <section className="rounded-3xl bg-[#0b4d3b] px-7 py-8 text-white shadow-lg lg:px-10">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
        ANW Platform Feature
      </p>

      <h2 className="mt-3 text-3xl font-bold">
        ${pascalName}
      </h2>

      <p className="mt-4 max-w-3xl leading-7 text-emerald-50">
        Replace this description with the purpose and workflow of the ${pascalName} feature.
      </p>
    </section>
  );
}
`;
}

function createEmptyStateCode(
  pascalName: string,
): string {
  return `export default function ${pascalName}EmptyState() {
  return (
    <section className="rounded-3xl border border-emerald-950/10 bg-white p-8 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b52]">
        Getting Started
      </p>

      <h3 className="mt-2 text-2xl font-bold text-slate-900">
        ${pascalName} is ready
      </h3>

      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        Add the feature data, forms, workflows, validation, and business rules here.
      </p>
    </section>
  );
}
`;
}

function createModuleReadme(
  pascalName: string,
  featureName: string,
): string {
  return `# ${pascalName}

## Purpose

Describe why the ${pascalName} feature exists.

## Route

\`/${featureName}\`

## Responsibilities

- Define domain types.
- Validate feature inputs.
- Provide repository contracts.
- Implement business services.
- Expose a stable public API.

## Status

Draft
`;
}

function createTypesCode(
  pascalName: string,
): string {
  return `export type ${pascalName}Id = string;

export type ${pascalName}Record = {
  id: ${pascalName}Id;
  createdAt: string;
  updatedAt: string;
};
`;
}

function createRepositoryCode(
  pascalName: string,
): string {
  return `import type {
  ${pascalName}Id,
  ${pascalName}Record,
} from "./types.js";

export interface ${pascalName}Repository {
  findById(
    id: ${pascalName}Id,
  ): Promise<${pascalName}Record | null>;

  list(): Promise<
    ${pascalName}Record[]
  >;

  save(
    record: ${pascalName}Record,
  ): Promise<${pascalName}Record>;
}
`;
}

function createServiceCode(
  pascalName: string,
): string {
  return `import type {
  ${pascalName}Repository,
} from "./repository.js";

import type {
  ${pascalName}Id,
  ${pascalName}Record,
} from "./types.js";

export class ${pascalName}Service {
  constructor(
    private readonly repository:
      ${pascalName}Repository,
  ) {}

  async getById(
    id: ${pascalName}Id,
  ): Promise<${pascalName}Record | null> {
    return this.repository.findById(id);
  }

  async list(): Promise<
    ${pascalName}Record[]
  > {
    return this.repository.list();
  }

  async save(
    record: ${pascalName}Record,
  ): Promise<${pascalName}Record> {
    return this.repository.save(
      record,
    );
  }
}
`;
}

function createValidationCode(
  pascalName: string,
): string {
  return `export function validate${pascalName}Id(
  value: string,
): string {
  const normalized =
    value.trim();

  if (!normalized) {
    throw new Error(
      "${pascalName} ID is required.",
    );
  }

  return normalized;
}
`;
}

function createErrorsCode(
  pascalName: string,
): string {
  return `export class ${pascalName}NotFoundError extends Error {
  constructor(id: string) {
    super(
      "${pascalName} record not found: " +
        id,
    );

    this.name =
      "${pascalName}NotFoundError";
  }
}
`;
}

function createFactoryCode(
  pascalName: string,
): string {
  return `import type {
  ${pascalName}Repository,
} from "./repository.js";

import {
  ${pascalName}Service,
} from "./service.js";

export function create${pascalName}Service(
  repository: ${pascalName}Repository,
): ${pascalName}Service {
  return new ${pascalName}Service(
    repository,
  );
}
`;
}

function createIndexCode(): string {
  return `export * from "./errors.js";
export * from "./factory.js";
export * from "./repository.js";
export * from "./service.js";
export * from "./types.js";
export * from "./validation.js";
`;
}

function createDocumentationReadme(
  pascalName: string,
): string {
  return `# ${pascalName} Documentation

Document the architecture, workflows, dependencies, configuration, inputs, outputs, errors, logging, and operational requirements here.
`;
}

function createTestsReadme(
  pascalName: string,
): string {
  return `# ${pascalName} Tests

Add unit, integration, and acceptance tests for the ${pascalName} feature here.
`;
}

function createBlueprintReadme(
  pascalName: string,
  featureName: string,
): string {
  return `# ${pascalName} Blueprint

## Route

\`/${featureName}\`

## Purpose

Define the business purpose of this feature.

## Users

Define who uses this feature.

## Workflow

Document the complete information flow.

## Database

Document tables, relationships, constraints, and ownership.

## Security

Document permissions, validation, audit requirements, and sensitive-data handling.

## AI

Document how approved AI systems may use this feature.

## Testing

Document unit, integration, certification, and release requirements.

## Status

Draft
`;
}