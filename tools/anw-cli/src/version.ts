import {
  readFileSync,
} from "node:fs";

import {
  dirname,
  resolve,
} from "node:path";

import {
  fileURLToPath,
} from "node:url";

type PackageJson = {
  version?: unknown;
};

const currentFilePath =
  fileURLToPath(
    import.meta.url,
  );

const currentDirectory =
  dirname(
    currentFilePath,
  );

const packagePath =
  resolve(
    currentDirectory,
    "..",
    "package.json",
  );

const packageContents =
  readFileSync(
    packagePath,
    "utf8",
  );

const packageData =
  JSON.parse(
    packageContents,
  ) as PackageJson;

if (
  typeof packageData.version !==
  "string"
) {
  throw new Error(
    "Unable to determine ANW CLI version from package.json.",
  );
}

const normalizedVersion =
  packageData.version.trim();

if (
  normalizedVersion.length === 0
) {
  throw new Error(
    "ANW CLI package.json contains an empty version.",
  );
}

export const cliVersion =
  normalizedVersion;