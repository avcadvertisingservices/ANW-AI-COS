import {
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";

import {
  join,
  relative,
  resolve,
  sep,
} from "node:path";

export type CreatePageOptions = {
  force?: boolean;
};

export function createPage(
  rawName: string,
  options: CreatePageOptions = {},
): void {
  const routeName =
    toRoutePath(rawName);

  if (!routeName) {
    throw new Error(
      "A valid page name is required.",
    );
  }

  const projectRoot =
    findProjectRoot(process.cwd());

  const pageName =
    toPascalCase(routeName);

  const appRoot = join(
    projectRoot,
    "apps",
    "admin",
    "src",
    "app",
  );

  const componentsRoot = join(
    projectRoot,
    "apps",
    "admin",
    "src",
    "components",
  );

  const routeRoot = join(
    appRoot,
    ...routeName.split("/"),
  );

  const pagePath = join(
    routeRoot,
    "page.tsx",
  );

  const loadingPath = join(
    routeRoot,
    "loading.tsx",
  );

  const errorPath = join(
    routeRoot,
    "error.tsx",
  );

  if (
    existsSync(pagePath) &&
    options.force !== true
  ) {
    throw new Error(
      `Page already exists: ${pagePath}`,
    );
  }

  mkdirSync(routeRoot, {
    recursive: true,
  });

  const componentsImportPath =
    createImportPath(
      routeRoot,
      componentsRoot,
    );

  writeGeneratedFile(
    pagePath,
    createPageCode(
      pageName,
      routeName,
      componentsImportPath,
    ),
    options.force === true,
  );

  writeGeneratedFile(
    loadingPath,
    createLoadingCode(pageName),
    options.force === true,
  );

  writeGeneratedFile(
    errorPath,
    createErrorCode(pageName),
    options.force === true,
  );

  console.log("");
  console.log(
    "ANW page created successfully.",
  );
  console.log("");
  console.log(`Name: ${pageName}`);
  console.log(`Route: /${routeName}`);
  console.log(
    `Path: apps/admin/src/app/${routeName}/page.tsx`,
  );
  console.log("");
}

function findProjectRoot(
  startDirectory: string,
): string {
  let currentDirectory =
    resolve(startDirectory);

  while (true) {
    const adminAppPath = join(
      currentDirectory,
      "apps",
      "admin",
      "src",
      "app",
    );

    const cliPath = join(
      currentDirectory,
      "tools",
      "anw-cli",
    );

    if (
      existsSync(adminAppPath) &&
      existsSync(cliPath)
    ) {
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

function toRoutePath(
  value: string,
): string {
  return value
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .map(toKebabCase)
    .filter(Boolean)
    .join("/");
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
      /[^A-Za-z0-9[\]]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )
    .toLowerCase();
}

function toPascalCase(
  routeName: string,
): string {
  const finalSegment =
    routeName
      .split("/")
      .filter(Boolean)
      .at(-1) ?? "Page";

  const cleanedSegment =
    finalSegment.replace(
      /^\[|\]$/g,
      "",
    );

  return cleanedSegment
    .split("-")
    .filter(Boolean)
    .map((part) => {
      return (
        part.charAt(0).toUpperCase() +
        part.slice(1)
      );
    })
    .join("");
}

function createImportPath(
  fromDirectory: string,
  targetDirectory: string,
): string {
  let importPath = relative(
    fromDirectory,
    targetDirectory,
  )
    .split(sep)
    .join("/");

  if (
    !importPath.startsWith(".")
  ) {
    importPath = `./${importPath}`;
  }

  return importPath;
}

function createPageCode(
  pageName: string,
  routeName: string,
  componentsImportPath: string,
): string {
  return `import Link from "next/link";

import AdminSidebar from "${componentsImportPath}/AdminSidebar";

export const dynamic = "force-dynamic";

export default function ${pageName}Page() {
  return (
    <main className="min-h-screen bg-[#f6f2e8] text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <section className="min-w-0 flex-1">
          <header className="border-b border-emerald-950/10 bg-white/80 px-6 py-5 lg:px-10">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#176b52]">
                  ANW AI Content Operating System
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                  ${pageName}
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
            <section className="rounded-3xl bg-[#0b4d3b] px-7 py-8 text-white shadow-lg lg:px-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
                ANW Platform Page
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                ${pageName}
              </h2>

              <p className="mt-4 max-w-3xl leading-7 text-emerald-50">
                Replace this placeholder with the purpose, data, and workflow
                for the ${pageName} page.
              </p>
            </section>

            <section className="mt-7 rounded-3xl border border-emerald-950/10 bg-white p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b52]">
                Page Ready
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Start building ${pageName}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Add components, server data, actions, validation, and tests
                for this route.
              </p>

              <p className="mt-6 text-xs text-slate-500">
                Route: /${routeName}
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
`;
}

function createLoadingCode(
  pageName: string,
): string {
  return `export default function ${pageName}Loading() {
  return (
    <main className="min-h-screen bg-[#f6f2e8] px-8 py-10">
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
  pageName: string,
): string {
  return `"use client";

import {
  useEffect,
} from "react";

type ${pageName}ErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ${pageName}Error({
  error,
  reset,
}: ${pageName}ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#f6f2e8] px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
          ${pageName} Error
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