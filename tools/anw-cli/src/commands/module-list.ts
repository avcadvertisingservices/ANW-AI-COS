import {
  existsSync,
  readdirSync,
  statSync,
} from "node:fs";

import {
  join,
  relative,
  resolve,
} from "node:path";

export type ModuleInventoryItem = {
  name: string;
  path: string;
};

export function listModules(): void {
  const projectRoot =
    findProjectRoot(
      process.cwd(),
    );

  const modules =
    discoverModules(
      projectRoot,
    );

  console.log("");
  console.log(
    "# ANW AI-COS Modules",
  );
  console.log("");

  console.log(
    `Repository: ${projectRoot}`,
  );

  console.log("");

  if (
    modules.length === 0
  ) {
    console.log(
      "No ANW modules were discovered.",
    );

    console.log("");

    console.log(
      "Checked standard ANW module locations.",
    );

    console.log(
      "No files were changed.",
    );

    console.log("");

    return;
  }

  console.log(
    `Modules found: ${modules.length}`,
  );

  console.log("");

  for (
    const module
    of modules
  ) {
    console.log(
      `- ${module.name}`,
    );

    console.log(
      `  ${module.path}`,
    );
  }

  console.log("");

  console.log(
    "Module inventory complete.",
  );

  console.log(
    "No files were changed.",
  );

  console.log("");
}

export function discoverModules(
  projectRoot: string,
): ModuleInventoryItem[] {
  const candidateDirectories =
    getModuleDirectories(
      projectRoot,
    );

  const discovered =
    new Map<
      string,
      ModuleInventoryItem
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

    const modules =
      readModuleDirectories(
        projectRoot,
        directory,
      );

    for (
      const module
      of modules
    ) {
      const key =
        module.path.toLowerCase();

      if (
        !discovered.has(
          key,
        )
      ) {
        discovered.set(
          key,
          module,
        );
      }
    }
  }

  return Array.from(
    discovered.values(),
  ).sort(
    (
      left,
      right,
    ) =>
      left.name.localeCompare(
        right.name,
      ),
  );
}

function getModuleDirectories(
  projectRoot: string,
): string[] {
  return [
    join(
      projectRoot,
      "apps",
      "admin",
      "src",
      "modules",
    ),

    join(
      projectRoot,
      "apps",
      "admin",
      "modules",
    ),

    join(
      projectRoot,
      "src",
      "modules",
    ),

    join(
      projectRoot,
      "modules",
    ),

    join(
      projectRoot,
      "packages",
      "modules",
    ),
  ];
}

function readModuleDirectories(
  projectRoot: string,
  modulesDirectory: string,
): ModuleInventoryItem[] {
  let entries;

  try {
    entries =
      readdirSync(
        modulesDirectory,
        {
          withFileTypes: true,
          encoding: "utf8",
        },
      );
  } catch {
    return [];
  }

  const modules:
    ModuleInventoryItem[] =
    [];

  for (
    const entry
    of entries
  ) {
    if (
      !entry.isDirectory()
    ) {
      continue;
    }

    if (
      shouldIgnoreDirectory(
        entry.name,
      )
    ) {
      continue;
    }

    const fullPath =
      join(
        modulesDirectory,
        entry.name,
      );

    if (
      !isDirectory(
        fullPath,
      )
    ) {
      continue;
    }

    modules.push({
      name:
        entry.name,

      path:
        normalizeDisplayPath(
          relative(
            projectRoot,
            fullPath,
          ),
        ),
    });
  }

  return modules;
}

function shouldIgnoreDirectory(
  name: string,
): boolean {
  const ignored =
    new Set([
      ".git",
      ".next",
      ".turbo",
      "dist",
      "node_modules",
      "__tests__",
      "tests",
    ]);

  return ignored.has(
    name.toLowerCase(),
  );
}

function isDirectory(
  path: string,
): boolean {
  try {
    return statSync(
      path,
    ).isDirectory();
  } catch {
    return false;
  }
}

function normalizeDisplayPath(
  path: string,
): string {
  return path.replace(
    /\\/g,
    "/",
  );
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