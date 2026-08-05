import {
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";

import {
  join,
  resolve,
} from "node:path";

type CreateModuleOptions = {
  force?: boolean;
};

export function createModule(
  rawName: string,
  options: CreateModuleOptions = {},
): void {
  const moduleName = toKebabCase(rawName);

  if (!moduleName) {
    throw new Error(
      "A valid module name is required.",
    );
  }

  const projectRoot =
    findProjectRoot(process.cwd());

  const moduleRoot = join(
    projectRoot,
    "src",
    "modules",
    moduleName,
  );

  if (
    existsSync(moduleRoot) &&
    !options.force
  ) {
    throw new Error(
      `Module already exists: ${moduleRoot}`,
    );
  }

  mkdirSync(moduleRoot, {
    recursive: true,
  });

  mkdirSync(
    join(moduleRoot, "tests"),
    {
      recursive: true,
    },
  );

  mkdirSync(
    join(moduleRoot, "docs"),
    {
      recursive: true,
    },
  );

  const pascalName =
    toPascalCase(moduleName);

  const files: Record<
    string,
    string
  > = {
    "README.md": createReadme(
      pascalName,
      moduleName,
    ),

    "types.ts": createTypes(
      pascalName,
    ),

    "repository.ts":
      createRepository(pascalName),

    "service.ts":
      createService(pascalName),

    "validation.ts":
      createValidation(pascalName),

    "errors.ts":
      createErrors(pascalName),

    "factory.ts":
      createFactory(pascalName),

    "demo.ts":
      createDemo(pascalName),

    "index.ts":
      createIndex(),

    "tests/README.md":
      createTestsReadme(pascalName),

    "docs/README.md":
      createDocsReadme(pascalName),
  };

  for (const [relativePath, content] of
    Object.entries(files)) {
    const filePath = join(
      moduleRoot,
      relativePath,
    );

    if (
      existsSync(filePath) &&
      !options.force
    ) {
      continue;
    }

    writeFileSync(
      filePath,
      content,
      "utf8",
    );
  }

  console.log("");
  console.log(
    "ANW module created successfully.",
  );
  console.log("");
  console.log(`Name: ${pascalName}`);
  console.log(
    `Path: src/modules/${moduleName}`,
  );
  console.log("");
}

function findProjectRoot(
  startDirectory: string,
): string {
  let currentDirectory =
    resolve(startDirectory);

  while (true) {
    const srcModulesPath = join(
      currentDirectory,
      "src",
      "modules",
    );

    if (existsSync(srcModulesPath)) {
      return currentDirectory;
    }

    const parentDirectory = resolve(
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
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function toPascalCase(
  value: string,
): string {
  return value
    .split("-")
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join("");
}

function createReadme(
  pascalName: string,
  moduleName: string,
): string {
  return `# ${pascalName} Module

## Purpose

Describe why the ${pascalName} module exists.

## Responsibilities

- Define ${pascalName} domain types.
- Provide repository contracts.
- Implement business services.
- Validate module inputs.
- Expose a stable public API.

## Module Path

\`src/modules/${moduleName}\`

## Status

Draft
`;
}

function createTypes(
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

function createRepository(
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

function createService(
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
}
`;
}

function createValidation(
  pascalName: string,
): string {
  return `export function validate${pascalName}Id(
  value: string,
): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(
      "${pascalName} ID is required.",
    );
  }

  return normalized;
}
`;
}

function createErrors(
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

function createFactory(
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

function createDemo(
  pascalName: string,
): string {
  return `export function run${pascalName}Demo(): void {
  console.log(
    "${pascalName} module demo.",
  );
}
`;
}

function createIndex(): string {
  return `export * from "./errors.js";
export * from "./factory.js";
export * from "./repository.js";
export * from "./service.js";
export * from "./types.js";
export * from "./validation.js";
`;
}

function createTestsReadme(
  pascalName: string,
): string {
  return `# ${pascalName} Tests

Add unit and integration tests for this module here.
`;
}

function createDocsReadme(
  pascalName: string,
): string {
  return `# ${pascalName} Documentation

Document architecture, workflows, dependencies, and usage here.
`;
}