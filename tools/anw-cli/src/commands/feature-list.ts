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

export type FeatureInventoryItem = {
  name: string;
  path: string;
};

export function listFeatures(): void {
  const projectRoot =
    findProjectRoot(
      process.cwd(),
    );

  const features =
    discoverFeatures(
      projectRoot,
    );

  console.log("");
  console.log(
    "# ANW AI-COS Features",
  );
  console.log("");

  console.log(
    `Repository: ${projectRoot}`,
  );

  console.log("");

  if (
    features.length === 0
  ) {
    console.log(
      "No ANW features were discovered.",
    );

    console.log("");

    console.log(
      "Checked standard ANW feature locations.",
    );

    console.log(
      "No files were changed.",
    );

    console.log("");

    return;
  }

  console.log(
    `Features found: ${features.length}`,
  );

  console.log("");

  for (
    const feature
    of features
  ) {
    console.log(
      `- ${feature.name}`,
    );

    console.log(
      `  ${feature.path}`,
    );
  }

  console.log("");

  console.log(
    "Feature inventory complete.",
  );

  console.log(
    "No files were changed.",
  );

  console.log("");
}

export function discoverFeatures(
  projectRoot: string,
): FeatureInventoryItem[] {
  const candidateDirectories =
    getFeatureDirectories(
      projectRoot,
    );

  const discovered =
    new Map<
      string,
      FeatureInventoryItem
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

    const features =
      readFeatureDirectories(
        projectRoot,
        directory,
      );

    for (
      const feature
      of features
    ) {
      const key =
        feature.path.toLowerCase();

      if (
        !discovered.has(
          key,
        )
      ) {
        discovered.set(
          key,
          feature,
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

function getFeatureDirectories(
  projectRoot: string,
): string[] {
  return [
    join(
      projectRoot,
      "apps",
      "admin",
      "src",
      "features",
    ),

    join(
      projectRoot,
      "apps",
      "admin",
      "features",
    ),

    join(
      projectRoot,
      "src",
      "features",
    ),

    join(
      projectRoot,
      "features",
    ),

    join(
      projectRoot,
      "packages",
      "features",
    ),
  ];
}

function readFeatureDirectories(
  projectRoot: string,
  featuresDirectory: string,
): FeatureInventoryItem[] {
  let entries;

  try {
    entries =
      readdirSync(
        featuresDirectory,
        {
          withFileTypes: true,
          encoding: "utf8",
        },
      );
  } catch {
    return [];
  }

  const features:
    FeatureInventoryItem[] =
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
        featuresDirectory,
        entry.name,
      );

    if (
      !isDirectory(
        fullPath,
      )
    ) {
      continue;
    }

    features.push({
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

  return features;
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